// Type imports
import {State} from './types.js';

// Function imports
import {generalFunctions} from './general-functions.js';
import {timeoutManager} from './timeout-manager.js';

// widgetFunctions
export const widgetFunctions = {

    // Returns boolean depending on whether the widget is currently visible.
    widgetExists: (
        widgetId: number // Widget ID to check whether visible.
    ): boolean => Boolean(client.getWidget(widgetId)),

    // Interact with widget.
    interactWithWidget: (
        state: State,
        widgetData: {
            packed_widget_id: number,
            identifier: number,
            opcode: number,
            p0: number
        }
    ): boolean => {

        // Timeout until the widget is visible.
        if (!client.getWidget(widgetData.packed_widget_id)) {
            timeoutManager.add({
                state,
                conditionFunction: () => client.getWidget(widgetData.packed_widget_id) !== null,
                initialTimeout: 1,
                maxWait: 10,
                onFail: () => generalFunctions.handleFailure(state, 'widgetFunctions.interactWithWidget', `Widget ID ${widgetData.packed_widget_id} not visible after 10 ticks`)
            });
            return false;
        }

        // Interact with widget
        bot.widgets.interactSpecifiedWidget(widgetData.packed_widget_id, widgetData.identifier, widgetData.opcode, widgetData.p0);
        return true;
    }
};