export const tileFunctions = {

    // Returns first available action on a tile object.
    getFirstAction: (
        tileObjectId: number // Tile object ID.
    ): string => bot.objects.getTileObjectComposition(tileObjectId).getActions()[0],

    // Returns TileObject using the tile object ID.
    getTileObjectById: (
        tileObjectId: number // Tile object ID
    ): net.runelite.api.TileObject | undefined => {
        const tileObjects = bot.objects.getTileObjectsWithIds([tileObjectId]);
        return tileObjects.find(tileObject => tileObject.getId() === tileObjectId);
    },

    // Returns a boolean depending on whether a tile object matches the `tileName`.
    validateTileName: (
        tileObjectId: number, // Tile object ID to validate.
        tileName: string // Tile name to validate.
    ): boolean => bot.objects.getTileObjectComposition(tileObjectId).getName() == tileName
};