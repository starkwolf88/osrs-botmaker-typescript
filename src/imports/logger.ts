// Type imports
import {State} from './types.js';

export const logger = (
    state: State,
    type: 'all' | 'debug', // Log type
    source: string, // Source of the message,
    message: string, // Message to show in the log.
): void => {
    const logMessage = `[${source}] ${message}`;
    if (type == 'all') bot.printGameMessage(logMessage);
    if (type == 'all' || (type == 'debug' && state.debugEnabled)) bot.printLogMessage(logMessage);
};