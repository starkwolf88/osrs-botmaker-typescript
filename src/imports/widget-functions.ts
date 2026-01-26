// Type imports
import {State} from './types.js';

// Function imports
import {generalFunctions} from './general-functions.js';
import {timeoutManager} from './timeout-manager.js';

// widgetFunctions
export const widgetFunctions = {

    // Interact widget
    interact: (
        widgetData: {
            packed_widget_id: number,
            identifier: number,
            opcode: number,
            p0: number,
            p1?: number
        }
    ): void => typeof widgetData.p1 === "number" ? bot.widgets.interactSpecifiedWidget(widgetData.packed_widget_id, widgetData.identifier, widgetData.opcode, widgetData.p0, widgetData.p1) : bot.widgets.interactSpecifiedWidget(widgetData.packed_widget_id, widgetData.identifier, widgetData.opcode, widgetData.p0),

    // Returns boolean depending on whether the widget is currently visible.
    widgetExists: (
        widgetData: {
            packed_widget_id: number,
            identifier: number,
            opcode: number,
            p0: number
        },
    ): boolean => Boolean(client.getWidget(widgetData.packed_widget_id)),

    // Timeout until widget is visible and optionally interact.
    widgetTimeout: (
        state: State,
        widgetData: {
            packed_widget_id: number,
            identifier: number,
            opcode: number,
            p0: number
        },
        interactWhenFound?: boolean
    ): boolean => {
        if (!widgetFunctions.widgetExists(widgetData)) {
            timeoutManager.add({
                state,
                conditionFunction: () => widgetFunctions.widgetExists(widgetData) !== null,
                initialTimeout: 1,
                maxWait: 10,
                onFail: () => generalFunctions.handleFailure(state, 'widgetFunctions.widgetTimeout', `Widget ID ${widgetData.packed_widget_id} not visible after 10 ticks`)
            });
            return false;
        }
        interactWhenFound && bot.widgets.interactSpecifiedWidget(widgetData.packed_widget_id, widgetData.identifier, widgetData.opcode, widgetData.p0);
        return true;
    }
};