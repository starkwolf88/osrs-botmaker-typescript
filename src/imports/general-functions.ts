export const generalFunctions = {

    // Code to execute after `onEnd()`.
    endScript: (scriptName: string): void => {
        bot.printGameMessage(`Terminating ${scriptName}.`);
        bot.walking.webWalkCancel(); // Cancel any web walking.
        bot.events.unregisterAll(); // Unregister all events.
    }
};