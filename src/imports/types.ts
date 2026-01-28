export type State = {

    // Core
    antibanEnabled: boolean;
    antibanTriggered: boolean;
    failureOrigin: string,
    failureCounts: Record<string, number>,
    debugEnabled: boolean;
    debugFullState: boolean;
    gameTick: number;
    lastFailureKey: string;
    mainState: string;
    scriptName: string;
    timeout: number;

    // Optional
    lastChatMessage?: {
        type: string;
        name: string;
        message: string;
    };
    scriptInitialised?: boolean;
    sub_state?: string;
    uiCompleted?: boolean;
    useStaminas?: boolean;

    // Item Combiner
    itemCombinationData?: ItemCombinationData;
    startDepositAllCompleted?: boolean;

    // Herb Run
    herbPatches?: HerbPatch[]

    // Mahogany Homes
    contract?: Contract
}

export type Contract = {
    id: number;
    name: string;
    location: string;
    worldPoint: net.runelite.api.coords.WorldPoint;
    hotspotIds: number[];
    ladderIds: number[];
    currentFloor: string;
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

export type HerbPatch = {
    id: number;
    name: string;
    enabled: boolean;
    worldPoint: net.runelite.api.coords.WorldPoint;
    inProgress: boolean;
    composted: boolean;
    completed: boolean;
}