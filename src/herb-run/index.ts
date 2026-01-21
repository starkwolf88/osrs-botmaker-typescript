// Barbarian farming completed (seed dibbler not supported)
// Start with herb seeds and ultracompost in inventory
// Withdraws bottomless bucket from Tool Leprechaun if ultracompost not in inventory

// Data imports
import {locationCoords} from '../imports/location-coords.js';
import {objectIds} from '../imports/object-ids.js';

// Function imports
import {generalFunctions} from '../imports/general-functions.js';
import {inventoryFunctions} from '../imports/inventory-functions.js';
import {itemIds} from '../imports/item-ids.js';
import {locationFunctions} from '../imports/location-functions.js';
import {logger} from '../imports/logger.js';
import {npcFunctions} from '../imports/npc-functions.js';
import {npcIdGroups} from '../imports/npc-ids.js';
import {utilityFunctions} from '../imports/utility-functions.js';
import {widgetData} from '../imports/widget-data.js';
import {widgetFunctions} from '../imports/widget-functions.js';

// Variables
const state = {

    // Core
    antibanEnabled: true,
    antibanTriggered: false,
    debugEnabled: false,
    debugFullState: false,
    // failureCounts: {},
    failureOrigin: '',
    gameTick: 0,
    // lastFailureKey: '',
    mainState: 'assign_herb_patch',
    scriptName: '[Stark] Herb Run',
    stuckCount: 0,
    timeout: 0,

    // Script specific
    herbPatches: [
        {
            id: objectIds.ardougne.herb_patch,
            name: 'Ardougne',
            enabled: bot.variables.getBooleanVariable('Ardougne'),
            worldPoint: locationFunctions.coordsToWorldPoint(locationCoords.ardougne.herb_patch),
            composted: false,
            inProgress: false,
            completed: false
        },
        {
            id: objectIds.catherby.herb_patch,
            name: 'Catherby',
            enabled: bot.variables.getBooleanVariable('Catherby'),
            worldPoint: locationFunctions.coordsToWorldPoint(locationCoords.catherby.herb_patch),
            composted: false,
            inProgress: false,
            completed: false,
        },
        {
            id: objectIds.falador.herb_patch,
            name: 'Falador',
            enabled: bot.variables.getBooleanVariable('Falador'),
            worldPoint: locationFunctions.coordsToWorldPoint(locationCoords.falador.herb_patch),
            composted: false,
            inProgress: false,
            completed: false
        },
        {
            id: objectIds.farming_guild.herb_patch,
            name: 'Farming Guild',
            enabled: bot.variables.getBooleanVariable('Farming Guild'),
            worldPoint: locationFunctions.coordsToWorldPoint(locationCoords.farming_guild.herb_patch),
            composted: false,
            inProgress: false,
            completed: false
        },
        {
            id: objectIds.hosidious.herb_patch,
            name: 'Hosidious',
            enabled: bot.variables.getBooleanVariable('Hosidious'),
            worldPoint: locationFunctions.coordsToWorldPoint(locationCoords.hosidious.herb_patch),
            composted: false,
            inProgress: false,
            completed: false
        },
        {
            id: objectIds.morytania.herb_patch,
            name: 'Morytania',
            enabled: bot.variables.getBooleanVariable('Morytania'),
            worldPoint: locationFunctions.coordsToWorldPoint(locationCoords.morytania.herb_patch),
            composted: false,
            inProgress: false,
            completed: false
        },
        {
            id: objectIds.varlamore.herb_patch,
            name: 'Varlamore',
            enabled: bot.variables.getBooleanVariable('Varlamore'),
            worldPoint: locationFunctions.coordsToWorldPoint(locationCoords.varlamore.herb_patch),
            composted: false,
            inProgress: false,
            completed: false
        }
    ]
};

// Functions
export const onStart = () => logger(state, 'all', 'Script', `Starting ${state.scriptName}.`);
export const onGameTick = () => {

    // Breaks disabled
    bot.breakHandler.setBreakHandlerStatus(false);

    try {
        if (!generalFunctions.gameTick(state)) return;

        // Enable break if not banking, idle, not walking and the `mainState` is `start_state`.
        if (!bot.bank.isBanking() && bot.localPlayerIdle() && !bot.walking.isWebWalking() && state.mainState == 'start_state') bot.breakHandler.setBreakHandlerStatus(true);

        stateManager();
    } catch (error) {
        logger(state, 'all', 'Script', (error as Error).toString());
        bot.terminate();
    }
};
export const onEnd = () => generalFunctions.endScript(state);

const stateManager = () => {
    logger(state, 'debug', `stateManager`, `${state.mainState}`);

    // Determine main state.
    switch(state.mainState) {

        // Starting state of the script. Assign a herb patch. Terminate script if none are found to be harvested.
        case 'assign_herb_patch': {
            const herbPatchNotHarvested = utilityFunctions.getObjectByValues(state.herbPatches, {completed: false, enabled: true});
            if (!herbPatchNotHarvested) throw new Error('All herb patches harvested.');
            herbPatchNotHarvested.inProgress = true;
            state.mainState = 'walk_to_herb_patch';
            break;
        }

        // Walk to the herb patch.
        case 'walk_to_herb_patch': {
            const currentHerbPatch = utilityFunctions.getObjectByValues(state.herbPatches, {inProgress: true});
            if (!currentHerbPatch) {
                generalFunctions.handleFailure(state, `stateManager (${state.mainState})`, 'Could not determine which herb patch is in progress', 'assign_herb_patch');
                break;
            }
            locationFunctions.webWalkTimeout(state, currentHerbPatch.worldPoint, `${currentHerbPatch.name}`, 200);
            state.mainState = 'withdraw_tools';
            break;
        }

        // Withdraw tools from Tool Leprechaun if tools not in inventory.
        case 'withdraw_tools': {
            if (!bot.localPlayerIdle()) break;
            if (!bot.inventory.containsId(itemIds.spade)) {

                // Get Tool Leprechaun.
                const toolLeprechaun = npcFunctions.getClosestNpc(npcIdGroups.tool_leprechaun);
                if (!toolLeprechaun) {
                    generalFunctions.handleFailure(state, `stateManager (${state.mainState})`, 'Could not locate Tool Leprechaun', 'walk_to_herb_patch');
                    break;
                }

                // Interact with Tool Leprechaun and wait for the interface to be visible.
                if (!widgetFunctions.widgetExists(widgetData.farming.tool_leprechaun.withdraw.spade.packed_widget_id)) {
                    bot.npcs.interactSupplied(toolLeprechaun, 'Exchange');
                    if (!widgetFunctions.widgetTimeout(state, widgetData.farming.tool_leprechaun.withdraw.spade)) break;
                }

                // Withdraw tools.
                Object.values(widgetData.farming.tool_leprechaun.withdraw).forEach(w => bot.widgets.interactSpecifiedWidget(w.packed_widget_id, w.identifier, w.opcode, w.p0));
                if (!inventoryFunctions.itemInInventoryTimeout(state, itemIds.spade)) break;
            }

            state.mainState = 'harvest_herb_patch';
            break;
        }

        case 'harvest_herb_patch': {
            const currentHerbPatch = utilityFunctions.getObjectByValues(state.herbPatches, {inProgress: true});
            if (!currentHerbPatch) {
                generalFunctions.handleFailure(state, `stateManager (${state.mainState})`, 'Could not determine which herb patch is in progress.', 'assign_herb_patch');
                break;
            }

            // Check the herb patch is rendered.
            if (!bot.objects.isNearIds([currentHerbPatch.id], 15)) {
                generalFunctions.handleFailure(state, `stateManager (${state.mainState})`, 'Herb patch not rendered. Attempting to walk to herb patch.', 'walk_to_herb_patch');
                break;
            }


            break;
        }

        // Default to start state.
        default: {
            state.mainState = 'start_state';
            break;
        }
    }
};

// // getHerbPatchState(): Returns the herb patch state of the provided `herbPatch`.
// const getHerbPatchState = (herbPatch: typeof herbPatches[number]) => {
//     bot.printLogMessage('Execute getHerbPatchState()'); // Logging

//     // Complete herb patch if no longer nearby for any reason.
//     if (!bot.objects.isNearIds([herbPatch.id], 15)) {
//         completeHerbPatch(herbPatch);
//         return null;
//     }

//     // Return state.
//     return objectFunctions.tiles.getFirstAction(herbPatch.id);
// };

// // harvestingLogic()
// const harvestingLogic = () => {
//     bot.printLogMessage('Execute harvestingLogic()'); // Logging

//     // Get herb patch in progress.
//     const herbPatchInProgress = getHerbPatchInProgress();
//     if (!herbPatchInProgress) return;

//     // Determine whether the herb patch is nearby.
//     if (bot.objects.isNearIds([herbPatchInProgress.id], 15)) {

//         // Withdraw farming equipment if required.
//         if (!handleFarmingEquipment(true)) return;
//         return interactWithHerbPatch(herbPatchInProgress); // Interact with the herb patch.
//     }
// }

// // interactWithHerbPatch()
// const interactWithHerbPatch = (herbPatch: typeof herbPatches[number]) => {
//     bot.printLogMessage('Execute interactWithHerbPatch()'); // Logging

//     // Get the herb patch state.
//     const herbPatchState = getHerbPatchState(herbPatch);
//     bot.printLogMessage(`${herbPatch.name} state: ${herbPatchState}`)
    
//     // Get the herb patch TileObject. Skip herb patch if any issues.
//     const herbPatchTileObject = objectFunctions.tiles.getTileObjectById(herbPatch.id);
//     if (!herbPatchTileObject) return completeHerbPatch(herbPatch);

//     // If inventory contains any herbs, note at the tool leprechaun.
//     if (bot.inventory.containsAnyIds(herbIds)) {

//         // Get tool leprcehaun.
//         const toolLeprechaun = getNearestToolLeprechaun();
//         if (toolLeprechaun) {

//             // Get random herb by ID and use on the tool leprcehaun.
//             const herbId = inventoryFunctions.getRandomExistingItemId(herbIds)
//             if (herbId) bot.inventory.itemOnNpcWithIds(herbId, toolLeprechaun)
//         }

//         // Return to re-check next tick if there are more herbs to note.
//         return;
//     }

//     // Rake patch
//     if (herbPatchState == 'Rake') bot.objects.interactObject('Herb patch', 'Rake');

//     // Clear dead herbs
//     if (herbPatchState == 'Clear') {
//         bot.objects.interactObject('Dead herbs', 'Clear');
//         return timeout = randomInt(8, 10); // Timeout for herbs to clear
//     }

//     // Cure diseased herbs
//     // if (herbPatchState == 'Cure') // TO DO

//     // Pick herbs
//     if (herbPatchState == 'Pick') bot.objects.interactObject('Herbs', 'Pick');

//     // Apply ultra compost
//     if (!herbPatchState && !herbPatch.composted) {
//         bot.inventory.itemOnObjectWithIds(bottomlessBucketUltraId, herbPatchTileObject);
//         herbPatch.composted = true;
//         return timeout = randomInt(8, 10); // Timeout for compost to apply
//     }

//     // Plant seed
//     if (!herbPatchState && herbPatch.composted) {

//         // Get first herb seed ID in inventory.
//         const herbSeedId = inventoryFunctions.getFirstExistingItemId(herbSeedIds);
//         if (!herbSeedId) return terminateBot('Ran out of herb seeds.');

//         // Plant seed.
//         bot.inventory.itemOnObjectWithIds(herbSeedId, herbPatchTileObject);

//         // Complete herb patch.
//         completeHerbPatch(herbPatch);

//         // Timeout for seed to be planted.
//         return timeout = randomInt(5, 8);
//     }
// };

// // completeHerbPatch
// const completeHerbPatch = (herbPatch: typeof herbPatches[number]) => {
//     bot.printLogMessage(`Completing ${herbPatch.name}.`);
//     herbPatch.completed = true;
//     herbPatch.in_progress = false;
// };