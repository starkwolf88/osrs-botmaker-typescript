// Function imports
import {generalFunctions} from './general-functions.js';
import {logger} from './logger.js';
import {timeoutManager} from './timeout-manager.js';

// Type imports
import {State} from './types.js';

// bankFunctions
export const bankFunctions = {

    // Open the bank
    openBank: (
        state: State
    ): boolean => {
        if (!bot.bank.isOpen()) {
            logger(state, 'debug', `bankFunctions.openBank`, 'Opening the bank');
            bot.bank.open();
            timeoutManager.add({
                state,
                conditionFunction: () => bot.bank.isOpen(),
                initialTimeout: 1,
                maxWait: 10,
                onFail: () => generalFunctions.handleFailure(state, 'bankFunctions.openBank', 'Bank is not open after 10 ticks.')
            });
            return false;
        }
        return true;
    },

    // Close the bank
    closeBank: (
        state: State
    ): boolean => {
        if (bot.bank.isOpen()) {
            logger(state, 'debug', `bankFunctions.closeBank`, 'Closing the bank');
            bot.bank.close();
            timeoutManager.add({
                state,
                conditionFunction: () => !bot.bank.isOpen(),
                initialTimeout: 1,
                maxWait: 10,
                onFail: () => generalFunctions.handleFailure(state, 'bankFunctions.closeBank', 'Bank is not closed after 10 ticks.')
            });
            return false;
        }
        return true;
    },
    

    // If the bank is not open, reset to the fallback state.
    requireBankOpen: (
        state: State,
        fallbackState: string,
    ): boolean => {
        if (!bot.bank.isOpen()) {
            state.main_state = fallbackState;
            return false;
        }
        return true;
    },

    // If the bank is not closed, reset to the fallback state.
    requireBankClosed: (
        state: State,
        fallbackState: string,
    ): boolean => {
        if (bot.bank.isOpen()) {
            state.main_state = fallbackState;
            return false;
        }
        return true;
    },

    // Returns a boolean depending on whether the bank item quantity is lower than the specified quantity.
    isQuantityLow: (
        itemId: number, // Item ID of the item to check.
        quantity: number // Quantity to validate against.
    ): boolean => bot.bank.getQuantityOfId(itemId) < quantity,

    // Returns a boolean depending on whether any of the bank item quantities are lower than the specified quantities.
    anyQuantitiyLow: (
        items: {
            id: number; // Item ID of the item to check.
            quantity: number // Quantity to validate against.
        }[]
    ): boolean => items.some(item => bankFunctions.isQuantityLow(item.id, item.quantity)),

    // Withdraw missing items from the bank one at a time using timeoutManager
    withdrawMissingItems: (
        state: State,
        items: {
            id: number;
            quantity: number
        }[],
        failResetState?: string
    ): boolean => {
        for (const item of items) {
            if (!bot.inventory.containsId(item.id)) {
                logger(state, 'debug', 'bankFunctions.withdrawMissingItems', `Withdrawing item ID ${item.id} with quantity ${item.quantity}`);
                bot.bank.withdrawQuantityWithId(item.id, item.quantity);
                timeoutManager.add({
                    state,
                    conditionFunction: () => bot.inventory.containsId(item.id),
                    initialTimeout: 1,
                    maxWait: 10,
                    onFail: () => generalFunctions.handleFailure(state, 'bankFunctions.withdrawMissingItems', `Failed to withdraw item ID ${item.id} after 10 ticks.`, failResetState)
                });
                return true;
            }
        }
        return false;
    },

    // Deposit items if required.
    depositAllItems: (
        state: State,
        itemId: number,
        failResetState?: string
    ): boolean => {
        const currentEmptySlots = bot.inventory.getEmptySlots();
        if (currentEmptySlots == 28) return true; // Return if nothing to deposit.

        // If itemId = 0 for deposit all, or if item ID exists in inventory
        if (!itemId || (itemId && bot.inventory.containsId(itemId))) {
            logger(state, 'debug', 'bankFunctions.depositAllItems', `Depositing ${itemId ? `item ID ${itemId}` : 'all items'}`);
            itemId ? bot.bank.depositAllWithId(itemId) : bot.bank.depositAll();
            timeoutManager.add({
                state,
                conditionFunction: () => currentEmptySlots < bot.inventory.getEmptySlots(),
                initialTimeout: 1,
                maxWait: 10,
                onFail: () => generalFunctions.handleFailure(state, 'bankFunctions.depositAllItems', `Failed to deposit ${itemId ? `item ID ${itemId}` : 'all items'} after 10 ticks.`, failResetState)
            });
            return false;
        }
        return true;
    }
};