import {logger} from './logger.js';
import {timeoutManager} from './timeout-manager.js';

export const bankFunctions = {

    // If the bank is not open, reset to the fallback state.
    requireBankOpen: (
        state: {
            main_state: string,
            debugEnabled: boolean
        },
        fallbackState: string
    ): boolean => {
        if (!bot.bank.isOpen()) {
            state.main_state = fallbackState;
            return false;
        }
        return true;
    },

    // If the bank is not closed, reset to the fallback state.
    requireBankClosed: (
        state: {
            main_state: string,
            debugEnabled: boolean
        },
        fallbackState: string
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
        state: {
            main_state: string,
            debugEnabled: boolean
        },
        items: {
            id: number;
            quantity: number
        }[]
    ): boolean => {
        for (const item of items) {
            if (!bot.inventory.containsId(item.id)) {
                timeoutManager.add({
                    state,
                    conditionFunction: () => bot.inventory.containsId(item.id),
                    action:() => {
                        logger(state, 'debug', 'bankFunctions.withdrawMissingItems', `Withdrawing item ID ${item.id} with quantity ${item.quantity}`);
                        bot.bank.withdrawQuantityWithId(item.id, item.quantity);
                    },
                    maxWait: 10,
                    maxAttempts: 3,
                    retryTimeout: 3,
                    onFail: () => `Failed to withdraw item ID ${item.id} after 3 attempts and 10 ticks.`
                });
                return true;
            }
        }
        return false;
    }
};