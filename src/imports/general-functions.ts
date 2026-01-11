export const generalFunctions = {

    // Code to execute after `onEnd()`.
    endScript: (
        state: {
            scriptName: string,
            scriptStopDiscordMessage: boolean
        }
    ): void => {
        bot.printGameMessage(`Terminating ${state.scriptName}.`);
        bot.walking.webWalkCancel(); // Cancel any web walking.
        bot.events.unregisterAll(); // Unregister all events.
        if (state.scriptStopDiscordMessage) bot.notifier.sendMessage(`Script (${state.scriptName}) has terminated.`); // Send discord notification
    }
};