// Function imports
import {generalFunctions} from './general-functions.js';
import {logger} from './logger.js';
import {timeoutManager} from './timeout-manager.js';

// Type imports
import {State} from './types.js';

// shopFunctions
export const shopFunctions = {
    closeTimeout: (
        state: State
    ) => {
        logger(state, 'debug', `shopFunctions.closeTimeout`, 'Timeout until shop is closed.');
        timeoutManager.add({
            state,
            conditionFunction: () => !bot.shop.isOpen(),
            initialTimeout: 1,
            maxWait: 10,
            onFail: () => generalFunctions.handleFailure(state, 'shopFunctions.closeTimeout', 'Shop not closed after 10 ticks.')
        });
    },

    openTimeout: (
        state: State
    ) => {
        logger(state, 'debug', `shopFunctions.openTimeout`, 'Timeout until shop is open.');
        timeoutManager.add({
            state,
            conditionFunction: () => bot.shop.isOpen(),
            initialTimeout: 1,
            maxWait: 15,
            onFail: () => generalFunctions.handleFailure(state, 'shopFunctions.openTimeout', 'Shop not open after 15 ticks.')
        });
    }
}