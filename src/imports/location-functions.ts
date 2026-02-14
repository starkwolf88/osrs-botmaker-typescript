// Function imports
import {logger} from './logger.js';
import {timeoutManager} from './timeout-manager.js';

// Type imports
import {State} from './types.js';

// locationFunctions
export const locationFunctions = {

    // Returns WorldPoint converted from coords.
    coordsToWorldPoint: ([x, y, z]: [number, number, number]): net.runelite.api.coords.WorldPoint => new net.runelite.api.coords.WorldPoint(x, y, z),

    // Returns the number of tiles between the player and a target WorldPoint.
    localPlayerDistanceFromWorldPoint: (
        worldPoint: net.runelite.api.coords.WorldPoint // Target WorldPoint object.
    ): number => client.getLocalPlayer().getWorldLocation().distanceTo(worldPoint),

    // Returns a boolean depending on whether the player within X tile threshold of the target WorldPoint.
    isPlayerNearWorldPoint: (
        worldPoint: net.runelite.api.coords.WorldPoint, // Target WorldPoint object.
        tileThreshold: number = 3 // Tile threshold. Defaults to 3
    ): boolean => locationFunctions.localPlayerDistanceFromWorldPoint(worldPoint) <= tileThreshold,

    // Web walk and timeout until done.
    webWalkTimeout: (
        state: State,
        worldPoint: net.runelite.api.coords.WorldPoint,
        targetDescription: string,
        maxWait: number,
        targetDistance: number = 3
    ): boolean => {
        const isPlayerAtLocation = () => locationFunctions.isPlayerNearWorldPoint(worldPoint, targetDistance)
        if (!isPlayerAtLocation() && !bot.walking.isWebWalking()) {
            logger(state, 'all', 'webWalkTimeout', `Web walking to ${targetDescription}`);
            bot.walking.webWalkStart(worldPoint);
            timeoutManager.add({
                state,
                conditionFunction: () => isPlayerAtLocation(),
                maxWait,
                failureKey: `locationFunctions.webWalkTimeout. Unable to locate player at ${targetDescription}`
            });
            return false;
        }
        logger(state, 'debug', 'webWalkTimeout', `Player is at ${targetDescription}.`);
        return true;
    }
};
