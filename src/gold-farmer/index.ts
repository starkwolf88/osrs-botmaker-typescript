// TO DO
// check herb plugin and add chance to trigger herb run
// add withdrwaing relevant items from bank for herb run and return to GE after depositing into tool leprechaun
// create jewelry crafter
// create enchanter

// Data imports
import {herbPatchData} from '../herb-run/herb-patch-data.js';
import {itemIdGroups, itemIds} from '../imports/item-ids.js';
import {itemCombinationData} from 'src/imports/item-combination-data.js';
import {npcIdGroups} from '../imports/npc-ids.js';
import {widgetData} from '../imports/widget-data.js';

// Function imports
import {logger} from 'src/imports/logger.js';
import {bankFunctions} from 'src/imports/bank-functions.js';
import {generalFunctions} from 'src/imports/general-functions.js';
import {handleFailure} from '../imports/failure-handler.js';
import {inventoryFunctions} from 'src/imports/inventory-functions.js';
import {locationFunctions} from '../imports/location-functions.js';
import {npcFunctions} from '../imports/npc-functions.js';
import {shopFunctions} from '../imports/shop-functions.js';
import {tileFunctions} from '../imports/tile-functions.js';
import {utilityFunctions} from 'src/imports/utility-functions.js';
import {widgetFunctions} from '../imports/widget-functions.js';

// Type imports
import {ItemCombinationData} from '../imports/types.js';
import {HerbPatch} from '../imports/types.js';

// Variables
const state = {

    // Core
    antibanEnabled: true,
    antibanTriggered: false,
    debugEnabled: true,
    debugFullState: false,
    failureCounts: {},
    gameTick: 0,
    scriptName: '[Stark] Gold Farmer',
    timeout: 0,

    // Optional
    scriptInitialised: false,

    // Script specific
    tasks: {
        'create_ultracompost': bot.variables.getBooleanVariable('Create Ultracompost'),
        'create_opal_necklaces': bot.variables.getBooleanVariable('Create Opal Necklaces'),
        'enchant_opal_necklaces': bot.variables.getBooleanVariable('Enchant Opal Necklaces'),
        'herb_run': bot.variables.getBooleanVariable('Herb Runs')
    },
    enableGrandExchange: bot.variables.getBooleanVariable('Enable G.E'),
    currentTask: '',
    taskMinDurationTicks: bot.variables.getIntVariable('Task Min Duration (Mins)') * 100,
    taskMaxDurationTicks: bot.variables.getIntVariable('Task Max Duration (Mins)') * 100,
    nextTaskSwitchGameTick: 0,
    itemCombinationData: undefined as ItemCombinationData | undefined,
    startDepositAllCompleted: false,
    herbPatches: herbPatchData,
    itemCombinationState: 'open_bank',
    herbRunState: 'assign_herb_patch'
};

// Functions
export const onStart = () => logger(state, 'all', 'Script', `Starting ${state.scriptName}.`);

export const onGameTick = () => {
    bot.breakHandler.setBreakHandlerStatus(false);
    try {
        if (!state.scriptInitialised) getGuiItemCombinationData('Ultracompost');
        state.scriptInitialised = true;
        if (!generalFunctions.gameTick(state)) return;
        determineTask();
        stateManager();
    } catch (error) {
        logger(state, 'all', 'Script', (error as Error).toString());
        bot.terminate();
    }
};

export const onEnd = () => generalFunctions.endScript(state);

const determineTask = () => {

    // If game tick has elapsed the next task switch game tick, switch task.
    if (state.gameTick >= state.nextTaskSwitchGameTick) {

        // Get a random task that isn't the current task
        const randomTask = utilityFunctions.getRandomObjectKeyByValue(state.tasks, true, state.currentTask);
        if (randomTask) state.currentTask = randomTask;

        // Determine next task switch game tick.
        state.nextTaskSwitchGameTick = utilityFunctions.randomInt(state.taskMinDurationTicks, state.taskMaxDurationTicks);
    }

    bot.printGameMessage(`Game Tick: ${state.gameTick}. Next Task Change: ${state.nextTaskSwitchGameTick}`); // TESTING
    if (!state.currentTask) throw new Error('No valid task found.');
};

const stateManager = () => {
    logger(state, 'debug', `stateManager`, `${state.currentTask}`);
    switch(state.currentTask) {
        case 'create_ultracompost': {
            itemCombinationStateManager();
            break;
        }
        case 'herb_run': {
            herbStateManager();
            break;
        }
    }
};

const getGuiItemCombinationData = (itemName: string) => {
    const itemCombination = itemCombinationData.find(itemCombination => itemCombination.combined_item_name.toLowerCase() == itemName.toLowerCase());
    if (!itemCombination) throw new Error('Item combination not initialized');
    // logger(state, 'all', 'Script', `We are creating ${utilityFunctions.convertToTitleCase(itemCombination.combined_item_name)}.`);
    state.itemCombinationData = itemCombination;
};

// Item Combiner
const itemCombinationStateManager = () => {
    logger(state, 'debug', `itemCombinationStateManager`, `${state.itemCombinationState}`);

    // Enable break if not banking, idle, not walking and the `itemCombinationState` is `open_bank`.
    if (!bot.bank.isBanking() && bot.localPlayerIdle() && !bot.walking.isWebWalking() && state.itemCombinationState == 'open_bank') bot.breakHandler.setBreakHandlerStatus(true);
      
    // Re-assign item combination data for safe use.
    const itemCombinationData = state.itemCombinationData;
    if (!itemCombinationData) throw new Error('Item combination not initialized');

    // Determine state.
    switch(state.itemCombinationState) {

        // Starting state of the script. Open the bank.
        case 'open_bank': {
            if (!bot.localPlayerIdle()) break;
            if (!bankFunctions.openBank(state)) break;
            state.itemCombinationState = 'deposit_items';
            break;
        }

        // Deposit items. Reset to `close_bank` on failure.
        case 'deposit_items': {
            if (!bankFunctions.requireBankOpen(state, 'open_bank') || !bot.localPlayerIdle()) break;
            const timeoutTrue = itemCombinationData.deposit_all || !state.startDepositAllCompleted ? bankFunctions.depositItemsTimeout.all(state, 'close_bank') : bankFunctions.depositItemsTimeout.some(state, itemCombinationData.combined_item_id, 'close_bank');
            if (!timeoutTrue) break;
            state.startDepositAllCompleted = true;
            state.itemCombinationState = 'check_bank_quantities';
            break;
        }

        // Check bank item quantities are sufficient for item combining.
        case 'check_bank_quantities': {
            if (!bankFunctions.requireBankOpen(state, 'open_bank') || !bot.localPlayerIdle()) break;
            logger(state, 'debug', `itemCombinationStateManager: ${state.itemCombinationState}`, 'Checking bank item quantities.');
            if (bankFunctions.anyQuantitiyBelow(itemCombinationData.items)) throw new Error('Ran out of items to combine.');
            state.itemCombinationState = 'withdraw_items';
            break;
        }

        // Withdraw missing items. Reset to `close_bank` on failure.
        case 'withdraw_items': {
            if (!bankFunctions.requireBankOpen(state, 'open_bank') || !bot.localPlayerIdle() || bot.bank.isBanking()) break;
            if (!bankFunctions.withdrawMissingItems(state, itemCombinationData.items, 'close_bank')) break; 
            state.itemCombinationState = 'validate_inventory_quantities';
            break;
        }

        // If inventory quantities do not match the required quantities, reset state to `open_bank`.
        case 'validate_inventory_quantities': {
            if (!bot.localPlayerIdle()) break;
            if (!inventoryFunctions.checkQuantitiesMatch(state, itemCombinationData.items.map(item => ({itemId: item.id, quantity: item.quantity})))) {
                handleFailure(state, `itemCombinationStateManager.${state.itemCombinationState}. Inventory quantities do not match required quantities`, 'open_bank');
                break;
            }
            state.itemCombinationState = 'close_bank';
            break;
        }

        // Close the bank if it's open.
        case 'close_bank': {
            if (!bot.localPlayerIdle() || bot.bank.isBanking()) break;
            if (!bankFunctions.closeBank(state)) break;
            state.itemCombinationState = 'item_interact';
            break;
        }

        // Interact both items on one another to create the combined item.
        case 'item_interact': {
            if (!itemInteract()) break;
            generalFunctions.clearFailures(state);
            state.itemCombinationState = 'open_bank';
            break;
        }

        // Default to start state.
        default: {
            state.itemCombinationState = 'open_bank';
            break;
        }
    }
};

const itemInteract = () => {
    if (!bankFunctions.requireBankClosed(state, 'close_bank') || !bot.localPlayerIdle()) return false;

    // Re-assign item combination data for safe use.
    const itemCombinationData = state.itemCombinationData;
    if (!itemCombinationData) throw new Error('Item combination not initialized');

    // If the inventory doesn't contain all items, reset to `open_bank`.
    if (!bot.inventory.containsAllIds(itemCombinationData.items.map(item => item.id))) {
        handleFailure(state, `itemCombinationStateManager.${state.itemCombinationState}. Inventory does not contain the correct items`, 'open_bank');
        return false;
    }

    // Use items on each other
    const item1 = itemCombinationData.items[0];
    const item2 = itemCombinationData.items[1];
    bot.inventory.itemOnItemWithIds(item1.id, item2.id);

    // Determine if a make item interface exists for this combination and select it.
    const widgetData = itemCombinationData.make_widget_data;
    if (widgetData && !widgetFunctions.widgetTimeout(state, widgetData, true)) return false;

    // Timeout so that items can combine, then loop back around to script starting state.
    state.timeout = itemCombinationData.timeout;
    logger(state, 'debug', `itemCombinationStateManager: ${state.itemCombinationState}`, `Combining ${utilityFunctions.convertToTitleCase(item1.name)} with ${utilityFunctions.convertToTitleCase(item2.name)}. Timeout: ${itemCombinationData.timeout}.`);
    return true;
}

// Herb Run
const herbStateManager = () => {
    logger(state, 'debug', `herbStateManager`, `${state.herbRunState}`);

    // Enable break if not banking, idle, not walking and the `currentTask` is `assign_herb_patch`.
    if (!bot.bank.isBanking() && bot.localPlayerIdle() && !bot.walking.isWebWalking() && state.currentTask == 'assign_herb_patch') bot.breakHandler.setBreakHandlerStatus(true);

    // Drop bucket
    if (!inventoryFunctions.dropItem(state, itemIds.bucket)) return;

    // Determine main state.
    switch(state.herbRunState) {

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
            state.herbRunState = 'walk_to_herb_patch';
            break;
        }

        // Walk to the herb patch.
        case 'walk_to_herb_patch': {
            const herbPatchInProgress = utilityFunctions.getObjectByValues(state.herbPatches, {inProgress: true});
            if (!herbPatchInProgress) {
                handleFailure(state, `herbStateManager.${state.herbRunState}. Could not determine which herb patch is in progress`, 'assign_herb_patch');
                break;
            }
            locationFunctions.webWalkTimeout(state, herbPatchInProgress.worldPoint, `${herbPatchInProgress.name} herb patch.`, 200, 10);
            state.herbRunState = 'withdraw_tools';
            break;
        }

        // Withdraw tools from Tool Leprechaun if tools not in inventory.
        case 'withdraw_tools': {
            if (!bot.localPlayerIdle()) break;
            if (!bot.inventory.containsId(itemIds.spade) && !exchangeToolLeprechaun('withdraw')) break;
            state.herbRunState = 'herb_patch_interaction';
            break;
        }

        // Interact with herb patch. Rake/Clear/Cure/Pick
        case 'herb_patch_interaction': {
            if (!bot.localPlayerIdle()) break;

            // Get in progress herb patch.
            const herbPatchInProgress = utilityFunctions.getObjectByValues(state.herbPatches, {inProgress: true});
            if (!herbPatchInProgress) {
                handleFailure(state, `herbStateManager.${state.herbRunState}. Could not determine which herb patch is in progress`, 'assign_herb_patch');
                break;
            }

            // Check the herb patch is rendered and the tile object exists.
            const herbPatchTileObject = tileFunctions.getTileObjectById(herbPatchInProgress.id);
            if (!herbPatchTileObject || !bot.objects.isNearIds([herbPatchInProgress.id], 15)) {
                completeHerbPatch(herbPatchInProgress, 'Error getting herb patch tile object');
                break;
            }

            // Herb patch state.
            const herbPatchState = tileFunctions.getAction(herbPatchInProgress.id, 0);

            // Determine interaction type.
            logger(state, 'debug', `herbStateManager (${state.herbRunState})`, `Herb patch state: ${herbPatchState}`)
            switch(String(herbPatchState)) {
                case 'Rake': {
                    bot.objects.interactObject('Herb patch', 'Rake');
                    state.timeout = 5;
                    break;
                }
                case 'Clear': {
                    bot.objects.interactObject('Dead herbs', 'Clear');
                    state.timeout = 8;
                    break;
                }
                case 'Cure': {
                    if (!bot.inventory.containsId(itemIds.plant_cure)) {

                        // Check inventory for require quantity of coins.
                        if (inventoryFunctions.isQuantityBelow(itemIds.coins, 41)) {
                            completeHerbPatch(herbPatchInProgress, 'Not enough coins in inventory for Plant cure');
                            break;
                        }

                        // Find nearby gardener.
                        const gardener = npcFunctions.getFirstNpcByNames(['Elstan', 'Lyra', 'Dantaera', 'Kragen', 'Marisi', 'Harminia', 'Rosie']);
                        if (!gardener) {
                            completeHerbPatch(herbPatchInProgress, 'Nearby gardener not found for buying Plant cure');
                            break;
                        }

                        // Trade gardener.
                        if (!bot.shop.isOpen()) {
                            bot.npcs.interactSupplied(gardener, 'Trade');
                            shopFunctions.openTimeout(state);
                            break;
                        }

                        // Buy Plant cure and timeout until it's in inventory.
                        if (!inventoryFunctions.itemInventoryTimeout.present(state, itemIds.plant_cure)) {
                            bot.shop.buy(itemIds.plant_cure, 1);
                            break;
                        }
                    }

                    // Close shop interface.
                    if (bot.shop.isOpen()) {
                        widgetFunctions.interact(widgetData.farming.gardeners.farming_supplies.close);
                        shopFunctions.closeTimeout(state);
                        break;
                    }

                    // Use Plant cure
                    bot.objects.interactObject('Diseased herbs', 'Cure');
                    state.timeout = 6;
                    completeHerbPatch(herbPatchInProgress, 'Patch cured');
                    break;
                }
                case 'Pick': {
                    if (bot.inventory.isFull()) {
                        state.herbRunState = 'note_herbs';
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
                    completeHerbPatch(herbPatchInProgress, 'Patch completed');
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
                    handleFailure(state, `herbStateManager.${state.herbRunState}). Could not locate Tool Leprechaun`, 'walk_to_herb_patch');
                    break;
                }

                // Get random herb by ID and use on the tool leprcehaun.
                const randomHerbId = inventoryFunctions.getRandomExistingItemId(itemIdGroups.grimy_herbs.concat(itemIdGroups.herbs))
                randomHerbId && bot.inventory.itemOnNpcWithIds(randomHerbId, toolLeprechaun)
                break;
            }
            state.herbRunState = 'herb_patch_interactions';
            break;
        }
    
        // Default to start state.
        default: {
            state.herbRunState = 'assign_herb_patch';
            break;
        }
    }
};

const completeHerbPatch = (herbPatchInProgress: HerbPatch, reason: string) => {
    logger(state, 'all', `completeHerbPatch (${state.herbRunState})`, `${reason}. Moving onto next herb patch.`)
    herbPatchInProgress.completed = true;
    herbPatchInProgress.inProgress = false;
    state.herbRunState = 'assign_herb_patch';
    generalFunctions.clearFailures(state);
}

const exchangeToolLeprechaun = (withdrawDeposit: 'withdraw' | 'deposit') => {

    // Get Tool Leprechaun.
    const toolLeprechaun = npcFunctions.getClosestNpc(npcIdGroups.tool_leprechaun);
    if (!toolLeprechaun) {
        handleFailure(state, `herbStateManager.${state.herbRunState}). Could not locate Tool Leprechaun`, 'walk_to_herb_patch');
        return false;
    }

    // Interact with Tool Leprechaun and wait for the interface to be visible.
    const toolLeprechaunInterface = widgetData.farming.tool_leprechaun[withdrawDeposit].spade;
    if (!widgetFunctions.widgetExists(toolLeprechaunInterface)) {
        bot.npcs.interactSupplied(toolLeprechaun, 'Exchange');
        if (!widgetFunctions.widgetTimeout(state, toolLeprechaunInterface)) return false;
    }

    // Withdraw/deposit tools.
    Object.values(widgetData.farming.tool_leprechaun[withdrawDeposit]).forEach(w => bot.widgets.interactSpecifiedWidget(w.packed_widget_id, w.identifier, w.opcode, w.p0));
    if (withdrawDeposit == 'withdraw' && !inventoryFunctions.itemInventoryTimeout.present(state, itemIds.spade)) return false;
    return true;
}