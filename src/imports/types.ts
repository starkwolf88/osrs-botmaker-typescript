export type State = {

    // Core
    antibanEnabled: boolean;
    antibanTriggered: boolean;
    debugEnabled: boolean;
    debugFullState: boolean;
    failureCounts: Record<string, number>;
    gameTick: number;
    scriptName: string;
    timeout: number;

    // Optional
    lastChatMessage?: {
        type: string;
        name: string;
        message: string;
    };
    mainState?: string;
    scriptInitialised?: boolean;
    sub_state?: string;
    uiCompleted?: boolean;
    useStaminas?: boolean;

    // Item Combiner
    itemCombinationData?: ItemCombinationData;
    startDepositAllCompleted?: boolean;

    // Herb Run
    herbPatches?: HerbPatch[];

    // Mahogany Homes
    contract?: Contract;

    // Gold Farmer
    currentTask?: string;
    tasks?: Record<string, boolean>;       
    nextTaskSwitchGameTick?: number;
    taskMinDurationTicks?: number;
    taskMaxDurationTicks?: number;
    itemCombinationState?: string;
    enableGrandExchange?: boolean;
}

export type Contract = {
    id: number;
    name: string;
    location: string;
    worldPoint: net.runelite.api.coords.WorldPoint;
    hotspotIds: number[];
    ladderIds?: {
        lower: number;
        upper: number;
    } | undefined,
    currentFloor: string
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