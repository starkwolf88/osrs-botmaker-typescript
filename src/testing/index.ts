export const onGameTick = () => {
    const widget = client.getWidget(17694736);
    if (widget) {
        bot.printLogMessage('WIDGET SHOWING')
    } else {
        bot.printLogMessage('WIDGET NOT SHOWING')
    }
};
onGameTick();