// Function imports
import { logger } from './logger.js';

// Type imports
import {State} from './types.js';

// Handle failure and terminate bot.
export const handleFailure = (
    state: State,
    failureKey: string,
    failResetState?: string
) => {
    // Log the failure
    logger(state, 'debug', 'handleFailure', failureKey);

    // Increment consecutive failure count
    state.failureCounts[failureKey] = (state.failureCounts[failureKey] || 0) + 1;

    // Fatal exit if the same failure occurs 3 times consecutively
    if (state.failureCounts[failureKey] >= 3) {
        logger(state, 'all', 'Script', `Fatal error: "${failureKey}" occurred 3x in a row.`);
        bot.terminate();
        return;
    }

    // Reset mainState if requested
    if (failResetState) state.mainState = failResetState;
};