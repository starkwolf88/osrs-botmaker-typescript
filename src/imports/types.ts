export type State = {

    // Core
    antibanEnabled: boolean;
    antibanTriggered: boolean;
    failure_origin: string,
    debugEnabled: boolean;
    debugFullState: boolean;
    gameTick: number;
    main_state: string;
    scriptName: string;
    stuck_count: number;
    timeout: number;

    // Optional
    scriptInitialised?: boolean;
    sub_state?: string;
    uiCompleted?: boolean;
    useStaminas?: boolean;

    // Item combiner
    itemCombinationData?: ItemCombinationData;
    startDepositAllCompleted?: boolean;
}

export type ItemCombinationData = {
    combined_item_name: string,
    combined_item_id: number,
    deposit_all: boolean,
    items: {
        id: number,
        name: string,
        quantity: number
    }[],
    make_widget_data?: {
        packed_widget_id: number,
        identifier: number;
        opcode: number;
        p0: number
    },
    timeout: number
};

export type LocationCoords = {
    [location: string]: {
        [subLocation: string]: [number, number, number];
    }
};