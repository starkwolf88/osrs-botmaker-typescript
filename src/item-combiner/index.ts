// To-Do
// Add anti ban and debug as checkboxes to UI

// Data imports
import {itemCombinationData} from 'src/imports/item-combination-data.js';

// Function imports
import {logger} from 'src/imports/logger.js';
import {bankFunctions} from 'src/imports/bank-functions.js';
import {createUi} from './ui.js';
import {generalFunctions} from 'src/imports/general-functions.js';
import {inventoryFunctions} from 'src/imports/inventory-functions.js';
import {utilityFunctions} from 'src/imports/utility-functions.js';

// Type imports
import {ItemCombinationData} from '../imports/types.js';
import {widgetFunctions} from '../imports/widget-functions.js';

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
    mainState: 'open_bank',
    scriptName: '[Stark] Item Combiner',
    timeout: 0,

    // Optional
    scriptInitialised: false,
    uiCompleted: false,

    // Script specific
    itemCombinationData: undefined as ItemCombinationData | undefined,
    startDepositAllCompleted: false
};

// Functions
export const onStart = () => {
    try {
        createUi(state);
        logger(state, 'all', 'Script', `Starting ${state.scriptName}.`);
    } catch (error) {
        logger(state, 'all', 'Script', (error as Error).toString());
        bot.terminate();
    }
};

export const onGameTick = () => {

    // Breaks disabled
    bot.breakHandler.setBreakHandlerStatus(false);

    try {
        if (state.uiCompleted) {
            if (!state.scriptInitialised) getGuiItemCombinationData();
            state.scriptInitialised = true;
        } else {
            return;
        }
        if (!generalFunctions.gameTick(state)) return;

        // Enable break if not banking, idle, not walking and the `mainState` is `open_bank`.
        if (!bot.bank.isBanking() && bot.localPlayerIdle() && !bot.walking.isWebWalking() && state.mainState == 'open_bank') bot.breakHandler.setBreakHandlerStatus(true);

        stateManager();
    } catch (error) {
        logger(state, 'all', 'Script', (error as Error).toString());
        bot.terminate();
    }
};

export const onEnd = () => generalFunctions.endScript(state);

const getGuiItemCombinationData = () => {
    const itemCombination = itemCombinationData.find(itemCombination => itemCombination.combined_item_name.toLowerCase() == bot.bmCache.getString('itemCombination', 'Maple longbow (u)').toLowerCase());
    if (!itemCombination) throw new Error('Item combination not initialized');
    logger(state, 'all', 'Script', `We are creating ${utilityFunctions.convertToTitleCase(itemCombination.combined_item_name)}.`);
    state.itemCombinationData = itemCombination;
};

const stateManager = () => {
    logger(state, 'debug', `stateManager`, `${state.mainState}`);

    // Re-assign item combination data for safe use.
    const itemCombinationData = state.itemCombinationData;
    if (!itemCombinationData) throw new Error('Item combination not initialized');

    // Determine main state.
    switch(state.mainState) {

        // Starting state of the script. Open the bank.
        case 'open_bank': {
            if (!bot.localPlayerIdle()) break;
            if (!bankFunctions.openBank(state)) break;
            state.mainState = 'deposit_items';
            break;
        }

        // Deposit items. Reset to `close_bank` on failure.
        case 'deposit_items': {
            if (!bankFunctions.requireBankOpen(state, 'open_bank') || !bot.localPlayerIdle()) break;
            const timeoutTrue = itemCombinationData.deposit_all || !state.startDepositAllCompleted ? bankFunctions.depositItemsTimeout.all(state, 'close_bank') : bankFunctions.depositItemsTimeout.some(state, itemCombinationData.combined_item_id, 'close_bank');
            if (!timeoutTrue) break;
            state.startDepositAllCompleted = true;
            state.mainState = 'check_bank_quantities';
            break;
        }

        // Check bank item quantities are sufficient for item combining.
        case 'check_bank_quantities': {
            if (!bankFunctions.requireBankOpen(state, 'open_bank') || !bot.localPlayerIdle()) break;
            logger(state, 'debug', `stateManager: ${state.mainState}`, 'Checking bank item quantities.');
            if (bankFunctions.anyQuantitiyBelow(itemCombinationData.items)) throw new Error('Ran out of items to combine.');
            state.mainState = 'withdraw_items';
            break;
        }

        // Withdraw missing items. Reset to `close_bank` on failure.
        case 'withdraw_items': {
            if (!bankFunctions.requireBankOpen(state, 'open_bank') || !bot.localPlayerIdle() || bot.bank.isBanking()) break;
            if (!bankFunctions.withdrawMissingItems(state, itemCombinationData.items, 'close_bank')) break; 
            state.mainState = 'validate_inventory_quantities';
            break;
        }

        // If inventory quantities do not match the required quantities, reset state to `open_bank`.
        case 'validate_inventory_quantities': {
            if (!bot.localPlayerIdle()) break;
            if (!inventoryFunctions.checkQuantitiesMatch(state, itemCombinationData.items.map(item => ({itemId: item.id, quantity: item.quantity})))) {
                generalFunctions.handleFailure(state, `stateManager: ${state.mainState}`, 'Inventory quantities do not match required quantities.', 'open_bank');
                break;
            }
            state.mainState = 'close_bank';
            break;
        }

        // Close the bank if it's open.
        case 'close_bank': {
            if (!bot.localPlayerIdle()) break;
            if (!bankFunctions.closeBank(state)) break;
            state.mainState = 'item_interact';
            break;
        }

        // Interact both items on one another to create the combined item.
        case 'item_interact': {
            if (!bankFunctions.requireBankClosed(state, 'close_bank') || !bot.localPlayerIdle()) break;

            // If the inventory doesn't contain all items, reset to `open_bank`.
            if (!bot.inventory.containsAllIds(itemCombinationData.items.map(item => item.id))) {
                generalFunctions.handleFailure(state, `stateManager: ${state.mainState}`, 'Inventory does not contain the correct items.', 'open_bank');
                break;
            }

            // Use items on each other
            const item1 = itemCombinationData.items[0];
            const item2 = itemCombinationData.items[1];
            bot.inventory.itemOnItemWithIds(item1.id, item2.id);

            // Determine if a make item interface exists for this combination and select it.
            const widgetData = itemCombinationData.make_widget_data;
            if (widgetData && !widgetFunctions.widgetTimeout(state, widgetData, true)) break;

            // Timeout so that items can combine, then loop back around to script starting state.
            state.timeout = itemCombinationData.timeout;
            logger(state, 'debug', `stateManager: ${state.mainState}`, `Combining ${utilityFunctions.convertToTitleCase(item1.name)} with ${utilityFunctions.convertToTitleCase(item2.name)}. Timeout: ${itemCombinationData.timeout}.`);
            state.mainState = 'open_bank';
            break;
        }

        // Default to start state.
        default: {
            state.mainState = 'open_bank';
            break;
        }
    }
};