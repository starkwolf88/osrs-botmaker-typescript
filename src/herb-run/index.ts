/** VARIABLES **/
// General
const state = {
    interactionActive: {
        toolLeprechaun: false
    }
};
let timeout = 0;

// NPC ID's
const toolLeprechaunIds = new Set<number>([0, 757, 7757, 12109, 12765]);

// Single Widget ID's
const singleWidgetIds = {
    toolLeprechaun: 8192001
};

// Full widget ID's
const fullWidgetIds = {
    toolLeprechaunWithdraw: {
        spade: [8192010, 1, 57, -1] as const,
        secateurs: [8192011, 1, 57, -1] as const,
        bottomlessBucket: [8192015, 1, 57, -1] as const
    },
    toolLeprechaunDeposit: {
        spade: [8257539, 2, 57, -1] as const,
        secateurs: [8257540, 2, 57, -1] as const,
        bottomlessBucket: [8257544, 1, 57, -1] as const
    }
};

// Item ID's
const bottomlessBucketUltraId = 22997;
const spade = 952;
const herbSeedIds = [
    5291, // Guam Seed
    5292, // Marrentill Seed
    5293, // Tarromin Seed
    5294, // Harralander Seed
    5295, // Ranarr Seed
    5296, // Toadflax Seed
    5297, // Irit Seed
    5298, // Avantoe Seed
    5299, // Kwuarm Seed
    5300, // Snapdragon Seed
    5301, // Cadantine Seed
    5302, // Lantadyme Seed
    5303, // Dwarf Weed Seed
    5304, // Torstol Seed
    30088 // Huasca Seed
];
const herbIds = [
    199, // Grimy Guam Leaf
    201, // Grimy Marrentill
    203, // Grimy Tarromin
    205, // Grimy Harralander
    207, // Grimy Ranarr Weed
	3049, // Grimy Toadflax
	3051, // Grimy Snapdragon
    209, // Grimy Irit Leaf
    211, // Grimy Avantoe
    213, // Grimy Kwuarm
    215, // Grimy Cadantine
    217, // Grimy Dwarf Weed
    219, // Grimy Torstol
    30094, // Grimy Huasca
    249, // Guam Leaf
    251, // Marrentill
    253, // Tarromin
    255, // Harralander
    257, // Ranarr Weed
	2998, // Toadflax
	3000, // Snapdragon
    259, // Irit Leaf
    261, // Avantoe
    263, // Kwuarm
    265, // Cadantine
    267, // Dwarf Weed
    269, // Torstol
    30097 // Huasca
];

// Herb patches
const herbPatches = [
    {
        id: 8150,
        name: 'Falador',
        active: bot.variables.getBooleanVariable('Falador'),
        worldPoint: new net.runelite.api.coords.WorldPoint(3056, 3310, 0),
        composted: false,
        in_progress: false,
        completed: false
    },
    {
        id: 8151,
        name: 'Catherby',
        active: bot.variables.getBooleanVariable('Catherby'),
        worldPoint: new net.runelite.api.coords.WorldPoint(2813, 3465, 0),
        composted: false,
        in_progress: false,
        completed: false,
    },
    {
        id: 8152,
        name: 'Ardougne',
        active: bot.variables.getBooleanVariable('Ardougne'),
        worldPoint: new net.runelite.api.coords.WorldPoint(2672, 3375, 0),
        composted: false,
        in_progress: false,
        completed: false
    },
    {
        id: 8153,
        name: 'Morytania',
        active: bot.variables.getBooleanVariable('Morytania'),
        worldPoint: new net.runelite.api.coords.WorldPoint(3607, 3532, 0),
        composted: false,
        in_progress: false,
        completed: false
    },
    {
        id: 27115,
        name: 'Hosidious',
        active: bot.variables.getBooleanVariable('Hosidious'),
        worldPoint: new net.runelite.api.coords.WorldPoint(1740, 3550, 0),
        composted: false,
        in_progress: false,
        completed: false
    },
    {
        id: 33979,
        name: 'Farming Guild',
        active: bot.variables.getBooleanVariable('Farming Guild'),
        worldPoint: new net.runelite.api.coords.WorldPoint(1240, 3730, 0),
        composted: false,
        in_progress: false,
        completed: false
    },
    {
        id: 50697,
        name: 'Varlamore',
        active: bot.variables.getBooleanVariable('Varlamore'),
        worldPoint: new net.runelite.api.coords.WorldPoint(1583, 3092, 0),
        composted: false,
        in_progress: false,
        completed: false
    }
];


/** MAIN FUNCTIONS */
// onStart()
const onStart = () => bot.printGameMessage('Starting herb run.');

// onGameTick()
const onGameTick = () => {

    // Decrement timeout and return if timeout is greater than 0 or the player is not idle.
    if (timeout > 0 || !bot.localPlayerIdle()) {
        timeout--;
        return;
    }

    // If any herb patch has `in_progress` set to `true`, continue harvesting logic, else handle next herb patch.
    getHerbPatchInProgress() ? harvestingLogic() : handleNextHerbPatch();
};

// onEnd()
const onEnd = () => {
    bot.printGameMessage(`Stopping herb run. Manually stopped.`);
    bot.walking.webWalkCancel(); // Cancel any web walking.
    bot.events.unregisterAll(); // Unregister all events.
};

// terminateBot()
const terminateBot = (terminateMessage: string = '') => {
    bot.printGameMessage(`Stopping herb run. ${terminateMessage}`);
    bot.terminate();
};


/** HERB PATCH FUNCTIONS **/
// getHerbPatchInProgress(): Determine if any of the herb patches are in progress.
const getHerbPatchInProgress = () => herbPatches.find(herbPatch => herbPatch.in_progress) ?? null;

// getHerbPatchState(): Returns the herb patch state of the provided `herbPatch`.
const getHerbPatchState = (herbPatch: typeof herbPatches[number]) => {
    bot.printLogMessage('Execute getHerbPatchState()'); // Logging

    // Complete herb patch if no longer nearby for any reason.
    if (!bot.objects.isNearIds([herbPatch.id], 15)) {
        completeHerbPatch(herbPatch);
        return null;
    }

    // Return state.
    return objectFunctions.tiles.getFirstAction(herbPatch.id);
};

// getRandomHerbPatch(): Returns a random herb patch that is active and hasn't been harvested, or undefined if none exist.
const getRandomHerbPatch = () => {
    bot.printLogMessage('Execute getRandomHerbPatch()'); // Logging

    // Filter patches that are active AND not completed.
    const unharvestedActiveHerbPatches = herbPatches.filter(patch => patch.active && !patch.completed);

    // If any patches exist, pick one randomly.
    if (unharvestedActiveHerbPatches.length > 0) return unharvestedActiveHerbPatches[Math.floor(Math.random() * unharvestedActiveHerbPatches.length)];
};


// handleNextHerbPatch(): 
const handleNextHerbPatch = () => {
    bot.printLogMessage('Execute handleNextHerbPatch()'); // Logging

    // Get a random herb patch where `harvested` is `false`.
    const randomHerbPatchNotHarvested = getRandomHerbPatch();

    // Stop the script if all herb patches have been harvested.
    if (!randomHerbPatchNotHarvested) {
        if (!handleFarmingEquipment(false)) return; // Deposit farming equipment.
        return terminateBot('All herb patches harvested.');
    }

    // Set `in_progress` to `true` against the herb patch.
    randomHerbPatchNotHarvested.in_progress = true;

    // Web walk to the herb patch.
    bot.printGameMessage(`Web walking to ${randomHerbPatchNotHarvested.name} herb patch.`)
    bot.printLogMessage(`Web walking to ${randomHerbPatchNotHarvested.name} herb patch.`)
    bot.walking.webWalkStart(randomHerbPatchNotHarvested.worldPoint);
}

// harvestingLogic()
const harvestingLogic = () => {
    bot.printLogMessage('Execute harvestingLogic()'); // Logging

    // Get herb patch in progress.
    const herbPatchInProgress = getHerbPatchInProgress();
    if (!herbPatchInProgress) return;

    // Determine whether the herb patch is nearby.
    if (bot.objects.isNearIds([herbPatchInProgress.id], 15)) {

        // Withdraw farming equipment if required.
        if (!handleFarmingEquipment(true)) return;
        return interactWithHerbPatch(herbPatchInProgress); // Interact with the herb patch.
    }
}

// interactWithHerbPatch()
const interactWithHerbPatch = (herbPatch: typeof herbPatches[number]) => {
    bot.printLogMessage('Execute interactWithHerbPatch()'); // Logging

    // Get the herb patch state.
    const herbPatchState = getHerbPatchState(herbPatch);
    bot.printLogMessage(`${herbPatch.name} state: ${herbPatchState}`)
    
    // Get the herb patch TileObject. Skip herb patch if any issues.
    const herbPatchTileObject = objectFunctions.tiles.getTileObjectById(herbPatch.id);
    if (!herbPatchTileObject) return completeHerbPatch(herbPatch);

    // If inventory contains any herbs, note at the tool leprechaun.
    if (bot.inventory.containsAnyIds(herbIds)) {

        // Get tool leprcehaun.
        const toolLeprechaun = getNearestToolLeprechaun();
        if (toolLeprechaun) {

            // Get random herb by ID and use on the tool leprcehaun.
            const herbId = inventoryFunctions.getRandomExistingItemId(herbIds)
            if (herbId) bot.inventory.itemOnNpcWithIds(herbId, toolLeprechaun)
        }

        // Return to re-check next tick if there are more herbs to note.
        return;
    }

    // Rake patch
    if (herbPatchState == 'Rake') bot.objects.interactObject('Herb patch', 'Rake');

    // Clear dead herbs
    if (herbPatchState == 'Clear') {
        bot.objects.interactObject('Dead herbs', 'Clear');
        return timeout = randomInt(8, 10); // Timeout for herbs to clear
    }

    // Cure diseased herbs
    // if (herbPatchState == 'Cure') // TO DO

    // Pick herbs
    if (herbPatchState == 'Pick') bot.objects.interactObject('Herbs', 'Pick');

    // Apply ultra compost
    if (!herbPatchState && !herbPatch.composted) {
        bot.inventory.itemOnObjectWithIds(bottomlessBucketUltraId, herbPatchTileObject);
        herbPatch.composted = true;
        return timeout = randomInt(8, 10); // Timeout for compost to apply
    }

    // Plant seed
    if (!herbPatchState && herbPatch.composted) {

        // Get first herb seed ID in inventory.
        const herbSeedId = inventoryFunctions.getFirstExistingItemId(herbSeedIds);
        if (!herbSeedId) return terminateBot('Ran out of herb seeds.');

        // Plant seed.
        bot.inventory.itemOnObjectWithIds(herbSeedId, herbPatchTileObject);

        // Complete herb patch.
        completeHerbPatch(herbPatch);

        // Timeout for seed to be planted.
        return timeout = randomInt(5, 8);
    }
};

// completeHerbPatch
const completeHerbPatch = (herbPatch: typeof herbPatches[number]) => {
    bot.printLogMessage(`Completing ${herbPatch.name}.`);
    herbPatch.completed = true;
    herbPatch.in_progress = false;
};

// getNearestToolLeprechaun
const getNearestToolLeprechaun = () => {
    bot.printLogMessage('Execute getNearestToolLeprechaun()'); // Logging

    // Get tool leprechaun NPC object.
    let toolLeprechaunFound;
    const toolLeprechauns = bot.npcs.getWithNames(['Tool Leprechaun']);
    if (toolLeprechauns.length > 0) {
        for (const toolLeprechaun of toolLeprechauns) {
            if (toolLeprechaunIds.has(toolLeprechaun.getId())) toolLeprechaunFound = toolLeprechaun;
        }
    }

    // Terminate bot if tool leprechaun not found.
    if (!toolLeprechaunFound) terminateBot('Tool leprechaun could not be found');

    // Return tool leprechaun NPC object.
    return toolLeprechaunFound;
}

// handleFarmingEquipment: Determine if a withdraw or deposit is required and interact with the Tool Leprechaun to do so.
const handleFarmingEquipment = (withdraw: boolean) => {
    bot.printLogMessage(`Execute handleFarmingEquipment() - withdraw: ${withdraw}`); // Logging

    // Determine if a withdraw or deposit is required.
    if ((withdraw && !bot.inventory.containsId(spade)) || (!withdraw && bot.inventory.containsId(spade))) {

        // Get tool leprcehaun and interact.
        if (!state.interactionActive.toolLeprechaun) {
            const toolLeprechaun = getNearestToolLeprechaun();
            if (toolLeprechaun) {
                bot.npcs.interactSupplied(toolLeprechaun, 'Exchange'); // Exchange tool leprechaun.
                state.interactionActive.toolLeprechaun = true; // Set state
                timeout = randomInt(1, 3); // Small timeout after interaction
            }
        }

        // Check the leprechaun interface is open.
        if (client.getWidget(singleWidgetIds.toolLeprechaun)) {

            // Withdraw/deposit Spade, Magic secateurs and Bottomless compost bucket
            if (withdraw) {
                bot.widgets.interactSpecifiedWidget(...fullWidgetIds.toolLeprechaunWithdraw.spade);
                bot.widgets.interactSpecifiedWidget(...fullWidgetIds.toolLeprechaunWithdraw.secateurs);
                bot.widgets.interactSpecifiedWidget(...fullWidgetIds.toolLeprechaunWithdraw.bottomlessBucket);
            } else {
                bot.widgets.interactSpecifiedWidget(...fullWidgetIds.toolLeprechaunDeposit.spade);
                bot.widgets.interactSpecifiedWidget(...fullWidgetIds.toolLeprechaunDeposit.secateurs);
                bot.widgets.interactSpecifiedWidget(...fullWidgetIds.toolLeprechaunDeposit.bottomlessBucket);
            }

            state.interactionActive.toolLeprechaun = false; // Reset state
            timeout = randomInt(1, 3); // Small timeout after withdrawal
            return true; // Return true once withdraw completed
        }

        // Return false if interaction active.
        if (state.interactionActive.toolLeprechaun) return false;
    }

    // Return true if not required.
    return true;
};


/** INVENTORY FUNCTIONS **/
const inventoryFunctions = {

    // Get first existing ID.
    getFirstExistingItemId: (itemIds: number[]) => {
        if (!bot.inventory.containsAnyIds(itemIds)) return null;
        return itemIds.find(itemId => bot.inventory.containsId(itemId)) ?? null;
    },

    // Get random existing ID.
    getRandomExistingItemId: (itemIds: number[]) => {
        if (!bot.inventory.containsAnyIds(itemIds)) return null;

        // Filter to IDs that actually exist in inventory
        const existingItemIds = itemIds.filter(itemId => bot.inventory.containsId(itemId));
        if (existingItemIds.length === 0) return null;

        // Pick one at random
        return existingItemIds[Math.floor(Math.random() * existingItemIds.length)];
    }
};


/** LOCATION FUNCTIONS **/
const locationFunctions = {

    // isWebwalking()
    isWebWalking: () => bot.walking.isWebWalking(),

    // localPlayerDistanceFromWorldPoint(): Returns the number of tiles between the player and a target WorldPoint.
    localPlayerDistanceFromWorldPoint: (targetWorldPoint: net.runelite.api.coords.WorldPoint) => client.getLocalPlayer().getWorldLocation().distanceTo(targetWorldPoint),

    // isPlayerNearWorldPoint(): Checks if the player is within X tile threshold of the target WorldPoint (5 tiles default).
    isPlayerNearWorldPoint: (targetWorldPoint: net.runelite.api.coords.WorldPoint, tileThreshold: number = 5) => locationFunctions.localPlayerDistanceFromWorldPoint(targetWorldPoint) <= tileThreshold
};


/** OBJECT FUNCTIONS **/
const objectFunctions = {
    tiles: {

        // getFirstAction(): Get first available action on a tile object.
        getFirstAction: (tileObjectId: number) => bot.objects.getTileObjectComposition(tileObjectId).getActions()[0],

        // getTileObjectById(): Get TileObject by the tile object ID.
        getTileObjectById: (tileObjectId: number) => {
            const tileObjects = bot.objects.getTileObjectsWithIds([tileObjectId]);
            return tileObjects.find(tileObject => tileObject.getId() == tileObjectId) ?? null;
        },

        // validateTileName(): Validate a tile name by the tile object ID.
        validateTileName: (tileObjectId: number, tileName: string) => bot.objects.getTileObjectComposition(tileObjectId).getName() == tileName
    }
};


/** UTILITY FUNCTIONS **/
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;


// NEEDS REMOVING FROM LIVE CODE
onStart();
onGameTick();
onEnd();
// NEEDS REMOVING FROM LIVE CODE