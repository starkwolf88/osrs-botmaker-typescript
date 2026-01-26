export const onGameTick = () => {
    const npcsByNames = bot.npcs.getWithNames(["Dantaera"])
    if (npcsByNames.length > 0) {
        bot.printGameMessage(npcsByNames[0].getName())
    }
};