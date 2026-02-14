// Function imports
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
            failureKey: 'shopFunctions.closeTimeout. Shop not closing'
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
            failureKey: 'shopFunctions.closeTimeout. Shop not opening'
        });
    }
}