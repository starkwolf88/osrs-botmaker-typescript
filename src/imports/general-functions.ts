// Function imports
import {antibanFunctions} from './antiban-functions.js';
import {debugFunctions} from './debug-functions.js';
import {logger} from './logger.js';
import {timeoutManager} from './timeout-manager.js';

// Type imports
import {State} from './types.js';

// generalFunctions
export const generalFunctions = {

    // onGameTick general function.
    gameTick: (state: State): boolean => {
        try {
            logger(state, 'debug', 'onGameTick', `Script game tick ${state.gameTick} -------------------------`);
            state.gameTick++;

            // Debug
            if (state.debugEnabled && state.debugFullState) debugFunctions.stateDebugger(state);

            // Timeout logic
            if (state.timeout > 0) {
                state.timeout--;
                return false;
            }
            timeoutManager.tick();
            if (timeoutManager.isWaiting()) return false;

            // Antiban AFK and break logic
            if (state.antibanEnabled && antibanFunctions.afkTrigger(state)) return false;

            return true;
        } catch (error) {
            const fatalMessage = (error as Error).toString();
            logger(state, 'all', 'Script', fatalMessage);
            generalFunctions.handleFailure(state, 'gameTick', fatalMessage);
            return false;
        }
    },

    // Handle failure.
    handleFailure: (
        state: State,
        failureLocation: string,
        failureMessage: string,
        failResetState?: string
    ) => {
        const failureKey = `${failureLocation} - ${failureMessage}`;
        
        // Log the failure
        logger(state, 'debug', 'handleFailure', failureMessage);

        // Increment consecutive failure count for this exact failure
        state.failureCounts[failureKey] = state.lastFailureKey === failureKey ? (state.failureCounts[failureKey] || 1) + 1 : 1;

        // Remember this failure for next tick
        state.lastFailureKey = failureKey;
        state.failureOrigin = failureKey;

        // Fatal exit if the same failure occurs 3 times consecutively
        if (state.failureCounts[failureKey] >= 3) {
            logger(state, 'all', 'Script', `Fatal error: "${failureKey}" occurred 3x in a row.`);
            bot.terminate();
            return;
        }

        // Reset mainState if requested
        if (failResetState) state.mainState = failResetState;
    },

    // Code to execute after `onEnd()`.
    endScript: (
        state: State
    ): void => {
        bot.breakHandler.setBreakHandlerStatus(false);
        bot.printGameMessage(`Terminating ${state.scriptName}.`);
        bot.walking.webWalkCancel(); // Cancel any web walking.
        bot.events.unregisterAll(); // Unregister all events.
    }
};