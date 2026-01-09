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
        items: {
            itemId: number; // Item ID to check against
            quantity: number // Item quantity to check against
        }[]
    ): boolean => {
        for (const item of items) {
            if (bot.inventory.getQuantityOfId(item.itemId) !== item.quantity) return false;
        }
        return true;
    }
};