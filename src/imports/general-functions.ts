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
    gameTick: (
        state: State
    ): boolean => {
        try {
            logger(state, 'debug', 'onGameTick', `Function start. Script game tick ${state.gameTick}`);
            state.gameTick++;
            if (state.debugEnabled && state.debugFullState) debugFunctions.stateDebugger(state);

            // Script stuck check.
            if (state.stuck_count > 3) throw new Error(`Fatal error with script. Failure origin: ${state.failure_origin}`);

            // Timeout logic.
            if (state.timeout > 0) {
                state.timeout--;
                return false;
            }
            timeoutManager.tick(state);
            if (timeoutManager.isWaiting()) return false;
            state.stuck_count = 0;

            // Antiban AFK and break logic.
            if (state.antibanEnabled && antibanFunctions.afkTrigger(state)) return false;
            return true;
        } catch (error) {
            logger(state, 'all', 'Script', (error as Error).toString());
            bot.terminate();
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
        logger(state, 'debug', 'handleFailure', failureMessage);
        state.failure_origin = `${failureLocation} - ${failureMessage}`
        state.stuck_count++
        if (failResetState) state.main_state = failResetState
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