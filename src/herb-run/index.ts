// Data imports
import {locationCoords} from '../imports/location-coords.js';
import {objectIds} from '../imports/object-ids.js';

// Function imports
import {generalFunctions} from '../imports/general-functions.js';
import {inventoryFunctions} from '../imports/inventory-functions.js';
import {itemIdGroups, itemIds} from '../imports/item-ids.js';
import {locationFunctions} from '../imports/location-functions.js';
import {logger} from '../imports/logger.js';
import {npcFunctions} from '../imports/npc-functions.js';
import {npcIdGroups} from '../imports/npc-ids.js';
import {tileFunctions} from '../imports/tile-functions.js';
import {utilityFunctions} from '../imports/utility-functions.js';
import {widgetData} from '../imports/widget-data.js';
import {widgetFunctions} from '../imports/widget-functions.js';

// Type imports
import {HerbPatch} from '../imports/types.js';

// Variables
const state = {

    // Core
    antibanEnabled: true,
    antibanTriggered: false,
    debugEnabled: false,
    debugFullState: false,
    failureCounts: {},
    failureOrigin: '',
    gameTick: 0,
    lastFailureKey: '',
    mainState: 'assign_herb_patch',
    scriptName: '[Stark] Herb Run',
    timeout: 0,

    // Script specific
    herbPatches: [
        {
            id: objectIds.ardougne.herb_patch,
            name: 'Ardougne',
            enabled: bot.variables.getBooleanVariable('Ardougne'),
            worldPoint: locationFunctions.coordsToWorldPoint(locationCoords.ardougne.herb_patch),
            inProgress: false,
            composted: false,
            completed: false
        },
        {
            id: objectIds.catherby.herb_patch,
            name: 'Catherby',
            enabled: bot.variables.getBooleanVariable('Catherby'),
            worldPoint: locationFunctions.coordsToWorldPoint(locationCoords.catherby.herb_patch),
            inProgress: false,
            composted: false,
            completed: false,
        },
        {
            id: objectIds.falador.herb_patch,
            name: 'Falador',
            enabled: bot.variables.getBooleanVariable('Falador'),
            worldPoint: locationFunctions.coordsToWorldPoint(locationCoords.falador.herb_patch),
            inProgress: false,
            composted: false,
            completed: false
        },
        {
            id: objectIds.farming_guild.herb_patch,
            name: 'Farming Guild',
            enabled: bot.variables.getBooleanVariable('Farming Guild'),
            worldPoint: locationFunctions.coordsToWorldPoint(locationCoords.farming_guild.herb_patch),
            inProgress: false,
            composted: false,
            completed: false
        },
        {
            id: objectIds.hosidious.herb_patch,
            name: 'Hosidious',
            enabled: bot.variables.getBooleanVariable('Hosidious'),
            worldPoint: locationFunctions.coordsToWorldPoint(locationCoords.hosidious.herb_patch),
            inProgress: false,
            composted: false,
            completed: false
        },
        {
            id: objectIds.morytania.herb_patch,
            name: 'Morytania',
            enabled: bot.variables.getBooleanVariable('Morytania'),
            worldPoint: locationFunctions.coordsToWorldPoint(locationCoords.morytania.herb_patch),
            inProgress: false,
            composted: false,
            completed: false
        },
        {
            id: objectIds.varlamore.herb_patch,
            name: 'Varlamore',
            enabled: bot.variables.getBooleanVariable('Varlamore'),
            worldPoint: locationFunctions.coordsToWorldPoint(locationCoords.varlamore.herb_patch),
            inProgress: false,
            composted: false,
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

        // Enable break if not banking, idle, not walking and the `mainState` is `assign_herb_patch`.
        if (!bot.bank.isBanking() && bot.localPlayerIdle() && !bot.walking.isWebWalking() && state.mainState == 'assign_herb_patch') bot.breakHandler.setBreakHandlerStatus(true);

        stateManager();
    } catch (error) {
        logger(state, 'all', 'Script', (error as Error).toString());
        bot.terminate();
    }
};
export const onEnd = () => generalFunctions.endScript(state);

const stateManager = () => {
    logger(state, 'debug', `stateManager`, `${state.mainState}`);

    // Drop bucket
    if (!inventoryFunctions.dropItem(state, itemIds.bucket)) return;

    // Determine main state.
    switch(state.mainState) {

        // Starting state of the script. Assign a herb patch. Terminate script if none are found to be harvested.
        case 'assign_herb_patch': {
            const herbPatchNotHarvested = utilityFunctions.getObjectByValues(state.herbPatches, {completed: false, enabled: true});
            if (!herbPatchNotHarvested) {
                if (bot.inventory.containsId(itemIds.spade)) {
                    exchangeToolLeprechaun('deposit');
                    break;
                }
                throw new Error('All herb patches harvested.');
            }
            herbPatchNotHarvested.inProgress = true;
            state.mainState = 'walk_to_herb_patch';
            break;
        }

        // Walk to the herb patch.
        case 'walk_to_herb_patch': {
            const herbPatchInProgress = utilityFunctions.getObjectByValues(state.herbPatches, {inProgress: true});
            if (!herbPatchInProgress) {
                generalFunctions.handleFailure(state, `stateManager (${state.mainState})`, 'Could not determine which herb patch is in progress', 'assign_herb_patch');
                break;
            }
            locationFunctions.webWalkTimeout(state, herbPatchInProgress.worldPoint, `${herbPatchInProgress.name} herb patch.`, 200, 10);
            state.mainState = 'withdraw_tools';
            break;
        }

        // Withdraw tools from Tool Leprechaun if tools not in inventory.
        case 'withdraw_tools': {
            if (!bot.localPlayerIdle()) break;
            if (!bot.inventory.containsId(itemIds.spade) && !exchangeToolLeprechaun('withdraw')) break;
            state.mainState = 'herb_patch_interaction';
            break;
        }

        // Interact with herb patch. Rake/Clear/Cure/Pick
        case 'herb_patch_interaction': {
            if (!bot.localPlayerIdle()) break;

            // Get in progress herb patch.
            const herbPatchInProgress = utilityFunctions.getObjectByValues(state.herbPatches, {inProgress: true});
            if (!herbPatchInProgress) {
                generalFunctions.handleFailure(state, `stateManager (${state.mainState})`, 'Could not determine which herb patch is in progress.', 'assign_herb_patch');
                break;
            }

            // Check the herb patch is rendered and the tile object exists.
            const herbPatchTileObject = tileFunctions.getTileObjectById(herbPatchInProgress.id);
            if (!herbPatchTileObject || !bot.objects.isNearIds([herbPatchInProgress.id], 15)) {
                completeHerbPatch(herbPatchInProgress);
                break;
            }

            // Herb patch state.
            const herbPatchState = tileFunctions.getAction(herbPatchInProgress.id, 0);

            // Determine interaction type.
            logger(state, 'debug', `stateManager (${state.mainState})`, `Herb patch state: ${herbPatchState}`)
            switch(String(herbPatchState)) {
                case 'Rake': {
                    bot.objects.interactObject('Herb patch', 'Rake');
                    break;
                }
                case 'Clear': {
                    bot.objects.interactObject('Dead herbs', 'Clear');
                    state.timeout = 8;
                    break;
                }
                case 'Cure': { // TO DO
                    completeHerbPatch(herbPatchInProgress);
                    break;
                }
                case 'Pick': {
                    if (bot.inventory.isFull()) {
                        state.mainState = 'note_herbs';
                        break;
                    }
                    bot.objects.interactObject('Herbs', 'Pick');
                    break;
                }

                // Empty patch
                default: {

                    // Compost
                    if (!herbPatchInProgress.composted) {
                        const compostIdToUse = inventoryFunctions.getFirstExistingItemId(itemIdGroups.compost);
                        if (!compostIdToUse) throw new Error('Ran out of compost.');
                        bot.inventory.itemOnObjectWithIds(compostIdToUse, herbPatchTileObject);
                        herbPatchInProgress.composted = true;
                        state.timeout = 7;
                        break;
                    }

                    // Get first herb seed ID in inventory and plant.
                    const herbSeedId = inventoryFunctions.getFirstExistingItemId(itemIdGroups.herb_seeds);
                    if (!herbSeedId) throw new Error('Ran out of herb seeds.');
                    bot.inventory.itemOnObjectWithIds(herbSeedId, herbPatchTileObject);
                    state.timeout = 6;
                    completeHerbPatch(herbPatchInProgress);
                    break;
                }
            }
            break;
        }

        // If inventory contains any herbs, note at the tool leprechaun.
        case 'note_herbs': {
            if (!bot.localPlayerIdle()) break;
            if (bot.inventory.containsAnyIds(itemIdGroups.grimy_herbs.concat(itemIdGroups.herbs))) {

                // Get Tool Leprechaun.
                const toolLeprechaun = npcFunctions.getClosestNpc(npcIdGroups.tool_leprechaun);
                if (!toolLeprechaun) {
                    generalFunctions.handleFailure(state, `stateManager (${state.mainState})`, 'Could not locate Tool Leprechaun', 'walk_to_herb_patch');
                    break;
                }

                // Get random herb by ID and use on the tool leprcehaun.
                const randomHerbId = inventoryFunctions.getRandomExistingItemId(itemIdGroups.grimy_herbs.concat(itemIdGroups.herbs))
                randomHerbId && bot.inventory.itemOnNpcWithIds(randomHerbId, toolLeprechaun)
                break;
            }
            state.mainState = 'herb_patch_interactions';
            break;
        }
    
        // Default to start state.
        default: {
            state.mainState = 'assign_herb_patch';
            break;
        }
    }
};

const completeHerbPatch = (herbPatchInProgress: HerbPatch) => {
    logger(state, 'all', `completeHerbPatch (${state.mainState})`, 'Moving onto next herb patch.')
    herbPatchInProgress.completed = true;
    herbPatchInProgress.inProgress = false;
    state.mainState = 'assign_herb_patch';
}

const exchangeToolLeprechaun = (withdrawDeposit: 'withdraw' | 'deposit') => {

    // Get Tool Leprechaun.
    const toolLeprechaun = npcFunctions.getClosestNpc(npcIdGroups.tool_leprechaun);
    if (!toolLeprechaun) {
        generalFunctions.handleFailure(state, `stateManager (${state.mainState})`, 'Could not locate Tool Leprechaun', 'walk_to_herb_patch');
        return false;
    }

    // Interact with Tool Leprechaun and wait for the interface to be visible.
    if (!widgetFunctions.widgetExists(widgetData.farming.tool_leprechaun[withdrawDeposit].spade.packed_widget_id)) {
        bot.npcs.interactSupplied(toolLeprechaun, 'Exchange');
        if (!widgetFunctions.widgetTimeout(state, widgetData.farming.tool_leprechaun[withdrawDeposit].spade)) return false;
    }

    // Withdraw/deposit tools.
    Object.values(widgetData.farming.tool_leprechaun[withdrawDeposit]).forEach(w => bot.widgets.interactSpecifiedWidget(w.packed_widget_id, w.identifier, w.opcode, w.p0));
    if (withdrawDeposit == 'withdraw' && !inventoryFunctions.itemInventoryTimeout.present(state, itemIds.spade)) return false;
    return true;
}