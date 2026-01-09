export type WidgetEntry = {
    packed_widget_id: number,
    identifier: number,
    opcode: number,
    p0: number
};

export const widgetData = {
    dialogue: {
        mahogany_homes: {
            amy: {
                select_contract: {
                    packed_widget_id: 14352385,
                    identifier: 0,
                    opcode: 0,
                    p0: 0
                }
            }
        }
    }
} as const;