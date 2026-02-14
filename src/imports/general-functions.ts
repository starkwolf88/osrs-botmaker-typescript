// Function imports
import {antibanFunctions} from './antiban-functions.js';
import {debugFunctions} from './debug-functions.js';
import { handleFailure } from './failure-handler.js';
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
            handleFailure(state, 'gameTick', fatalMessage);
            return false;
        }
    },

    // Clear failures
    clearFailures: (state: State) => {
        for (const key in state.failureCounts) delete state.failureCounts[key];
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