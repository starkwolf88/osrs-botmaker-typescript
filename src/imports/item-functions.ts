import {itemIds} from './item-ids.js';
import type {RawItemCombinationData} from './item-combination-data.js';

export type MappedItemCombinationData = Omit<RawItemCombinationData, 'items' | 'make_widget_data'> & {
    combined_item_id: number;
    items: (RawItemCombinationData['items'][number] & {id: number})[];
    make_widget_data?: RawItemCombinationData['make_widget_data'];
};

export const itemFunctions = {
    addItemIdsToItemCombination: (
        itemCombination: RawItemCombinationData
    ): MappedItemCombinationData | undefined => {
        const combinedId = itemIds[itemCombination.combined_item as keyof typeof itemIds];
        if (!combinedId) return undefined;

        // Ensure all ingredient IDs exist
        if (!itemCombination.items.every(item => itemIds[item.name as keyof typeof itemIds])) return undefined;

        // Map ingredients to include IDs
        const itemsWithId = itemCombination.items.map(item => ({
            ...item,
            id: itemIds[item.name as keyof typeof itemIds]
        }));

        return {
            ...itemCombination,
            combined_item_id: combinedId,
            items: itemsWithId
        };
    }
};