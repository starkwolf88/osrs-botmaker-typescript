export const widgetFunctions = {

    // Returns boolean depending on whether the widget is currently visible.
    widgetExists: (
        widgetId: number // Widget ID to check whether visible.
    ): boolean => Boolean(client.getWidget(widgetId))
};