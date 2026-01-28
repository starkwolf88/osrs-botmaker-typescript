export const tileFunctions = {

    // Returns available action on a tile object.
    getAction: (
        tileObjectId: number, // Tile object ID.
        actionIndexToGet: number
    ): string => bot.objects.getTileObjectComposition(tileObjectId).getActions()[actionIndexToGet],

    // Returns alla ctions on a tile object.
    getAllActions: (
        tileObjectId: number // Tile object ID.
    ): string[] => bot.objects.getTileObjectComposition(tileObjectId).getActions(),

    // Returns TileObject using the tile object ID.
    getTileObjectById: (
        tileObjectId: number // Tile object ID
    ): net.runelite.api.TileObject | undefined => {
        const tileObjects = bot.objects.getTileObjectsWithIds([tileObjectId]);
        return tileObjects.find(tileObject => tileObject.getId() === tileObjectId);
    },

    // Returns an array of TileObjects using the tile object ID's.
    getTileObjectsByIds: (
        tileObjectIds: number[]
    ): net.runelite.api.TileObject[] | undefined => {
        const tileObjects = bot.objects.getTileObjectsWithIds(tileObjectIds);
        return tileObjects.length > 0 ? tileObjects : undefined;
    },

    // Returns a boolean depending on whether a tile object matches the `tileName`.
    validateTileName: (
        tileObjectId: number, // Tile object ID to validate.
        tileName: string // Tile name to validate.
    ): boolean => bot.objects.getTileObjectComposition(tileObjectId).getName() == tileName
};