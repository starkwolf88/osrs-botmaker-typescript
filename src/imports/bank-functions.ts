export const bankFunctions = {

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
    ): boolean => items.some(item => bankFunctions.isQuantityLow(item.id, item.quantity))
};