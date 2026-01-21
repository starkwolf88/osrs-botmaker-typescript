// Function imports
import {generalFunctions} from './general-functions.js';
import {logger} from './logger.js';
import {timeoutManager} from './timeout-manager.js';

// Type imports
import {State} from './types.js';

// inventoryFunctions
export const inventoryFunctions = {

    // Returns the first item ID from the inventory that exists within `itemIds`.
    getFirstExistingItemId: (
        itemIds: number[] // Item ID's array to check against.
    ): number | undefined => {
        if (!bot.inventory.containsAnyIds(itemIds)) return undefined;
        return itemIds.find(itemId => bot.inventory.containsId(itemId));
    },

    // Returns a random item ID from the inventory that exists within `itemIds`.
    getRandomExistingItemId: (
        itemIds: number[] // Item ID's array to check against.
    ): number | undefined => {
        if (!bot.inventory.containsAnyIds(itemIds)) return undefined;

        // Filter to ID's those that exist in inventory
        const existingItemIds = itemIds.filter(itemId => bot.inventory.containsId(itemId));
        if (existingItemIds.length === 0) return undefined;

        // Pick one at random
        return existingItemIds[Math.floor(Math.random() * existingItemIds.length)];
    },

    // Returns a boolean depending on whether all quantities matched or not.
    checkQuantitiesMatch: (
        state: State,
        items: {
            itemId: number; // Item ID to check against
            quantity: number // Item quantity to check against
        }[]
    ): boolean => {
        logger(state, 'debug', `checkQuantitiesMatch`, 'Checking inventory item quantities.');
        for (const item of items) {
            if (bot.inventory.getQuantityOfId(item.itemId) !== item.quantity) return false;
        }
        return true;
    },

    // Timeout until item is inventory.
    itemInInventoryTimeout: (
        state: State,
        itemId: number,
        failResetState?: string
    ): boolean => {
        if (!bot.inventory.containsId(itemId)) {
            logger(state, 'debug', 'inventoryFunctions.itemInInventoryTimeout', `Item ID ${itemId} not in the inventory.`);
            timeoutManager.add({
                state,
                conditionFunction: () => bot.inventory.containsId(itemId),
                initialTimeout: 1,
                maxWait: 10,
                onFail: () => generalFunctions.handleFailure(state, 'inventoryFunctions.itemInInventoryTimeout', `Item ID ${itemId} not in inventory after 10 ticks.`, failResetState)
            });
            return false;
        }
        logger(state, 'debug', 'inventoryFunctions.itemInInventoryTimeout', `Item ID ${itemId} is in the inventory.`);
        return true;
    }
};