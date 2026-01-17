// Function imports
import {antibanFunctions} from './antiban-functions.js';
import {debugFunctions} from './debug-functions.js';
import {logger} from './logger.js';
import {timeoutManager} from './timeout-manager.js';

export const generalFunctions = {

    // onGameTick general function.
    gameTick: (
        state: {
            antibanEnabled: boolean,
            antibanTriggered: boolean,
            debugEnabled: boolean,
            debugFullState: boolean,
            gameTick: number,
            timeout: number
        }
    ): boolean => {
        try {
            logger(state, 'debug', 'onGameTick', `Function start. Script game tick ${state.gameTick}`);
            state.gameTick++;
            if (state.debugEnabled && state.debugFullState) debugFunctions.stateDebugger(state);

            // Timeout logic.
            if (state.timeout > 0) {
                state.timeout--;
                return false;
            }
            timeoutManager.tick();
            if (timeoutManager.isWaiting()) return false;

            // Antiban AFK and break logic.
            if (state.antibanEnabled && antibanFunctions.afkTrigger(state)) return false;
            return true;
        } catch (error) {
            logger(state, 'all', 'Script', (error as Error).toString());
            bot.terminate();
            return false;
        }
    },

    // Code to execute after `onEnd()`.
    endScript: (
        state: {
            scriptName: string
        }
    ): void => {
        bot.printGameMessage(`Terminating ${state.scriptName}.`);
        bot.walking.webWalkCancel(); // Cancel any web walking.
        bot.events.unregisterAll(); // Unregister all events.
    }
};