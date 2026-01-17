export const locationFunctions = {

    // Returns the number of tiles between the player and a target WorldPoint.
    localPlayerDistanceFromWorldPoint: (
        worldPoint: net.runelite.api.coords.WorldPoint // Target WorldPoint object.
    ): number => client.getLocalPlayer().getWorldLocation().distanceTo(worldPoint),

    // Returns a boolean depending on whether the player within X tile threshold of the target WorldPoint.
    isPlayerNearWorldPoint: (
        worldPoint: net.runelite.api.coords.WorldPoint, // Target WorldPoint object.
        tileThreshold: number = 3 // Tile threshold. Defaults to 3
    ): boolean => locationFunctions.localPlayerDistanceFromWorldPoint(worldPoint) <= tileThreshold
};
