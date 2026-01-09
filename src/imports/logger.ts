export const logger = (
    type: 'game' | 'log' | 'both', // Log type.
    source: string, // Source of the message,
    message: string, // Message to show in the log.
): void => {
    const logMessage = `[${source}] ${message}`;
    switch (type) {
        case 'game': {
            bot.printGameMessage(logMessage);
            break;
        }
        case 'log': {
            bot.printLogMessage(logMessage);
            break;
        }
        case 'both': {
            bot.printGameMessage(logMessage);
            bot.printLogMessage(logMessage);
            break;
        }
    }
};