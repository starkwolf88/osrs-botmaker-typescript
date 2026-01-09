import {logger} from './logger.js';
import {utilityFunctions} from './utility-functions.js';

export const antibanFunctions = {
    getRandomisedAfkTimeout: (
        min: number = 0,
        max: number = 3,
        triggerChancePercentage: number = 0,
        additionalAfkChancePercentage: number = 0
    ): number => {
        let timeout = 0;
        if (utilityFunctions.randomInt(1, 100) <= triggerChancePercentage) {
            timeout = utilityFunctions.randomInt(min, max);
            if (utilityFunctions.randomInt(1, 100) <= additionalAfkChancePercentage) timeout += utilityFunctions.randomInt(min, max);
        }
        return timeout;
    },

    afkTrigger: (
        state: {
            antibanTriggered: boolean;
            debugEnabled: boolean,
            timeout: number
        }
    ): boolean => {
        if (!state.antibanTriggered) {
            const antibanTimeout = antibanFunctions.getRandomisedAfkTimeout(5, 15, 1, 5) || antibanFunctions.getRandomisedAfkTimeout(1, 5, 1, 5);
            if (antibanTimeout > 0) {
                state.timeout = antibanTimeout;
                state.antibanTriggered = true;
                logger(state, 'all', 'antibanFunctions.afkTrigger', `Random AFK for ${antibanTimeout} ticks.`);
                return true;
            }
        }
        state.antibanTriggered = false;
        return false;
    }
};
