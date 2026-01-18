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
    debugEnabled: true,
    debugFullState: false,
    failure_location: '',
    gameTick: 0,
    main_state: 'open_bank',
    scriptName: '[Stark] Item Combiner',
    stuck_count: 0,
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

        // Enable break if not banking, idle, not walking and the `main_state` is `open_bank`.
        if (!bot.bank.isBanking() && bot.localPlayerIdle() && !bot.walking.isWebWalking() && state.main_state == 'open_bank') bot.breakHandler.setBreakHandlerStatus(true);

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
    logger(state, 'debug', `stateManager (${state.main_state})`, `Function start.`);

    // Re-assign item combination data for safe use.
    const itemCombinationData = state.itemCombinationData;
    if (!itemCombinationData) throw new Error('Item combination not initialized');

    // Determine main state.
    switch(state.main_state) {

        // Starting state of the script. Open the bank.
        case 'open_bank': {
            if (!bot.localPlayerIdle()) break;
            if (!bankFunctions.openBank(state)) break;

            // Assign next state.
            state.main_state = 'deposit_items';
            break;
        }

        // Deposit items into the bank.
        case 'deposit_items': {
            if (!bankFunctions.requireBankOpen(state, 'open_bank') || !bot.localPlayerIdle()) break;

            // Deposit items. Reset to `close_bank` on failure.
            let depositItemId = itemCombinationData.combined_item_id;
            if (itemCombinationData.deposit_all || !state.startDepositAllCompleted) depositItemId = 0; // 0 = deposit all
            if (!bankFunctions.depositAllItems(state, depositItemId, 'close_bank')) break;
            state.startDepositAllCompleted = true;

            // Assign next state.
            state.main_state = 'check_bank_quantities';
            break;
        }

        // Check bank item quantities are sufficient for item combining.
        case 'check_bank_quantities': {
            if (!bankFunctions.requireBankOpen(state, 'open_bank') || !bot.localPlayerIdle()) break;

            // Check item quantities in the bank.
            logger(state, 'debug', `stateManager: ${state.main_state}`, 'Checking bank item quantities.');
            if (bankFunctions.anyQuantitiyLow(itemCombinationData.items)) throw new Error('Ran out of items to combine.');

            // Assign next state.
            state.main_state = 'withdraw_items';
            break;
        }

        // Withdraw items from the bank.
        case 'withdraw_items': {
            if (!bankFunctions.requireBankOpen(state, 'open_bank') || !bot.localPlayerIdle() || bot.bank.isBanking()) break;

            // Withdraw missing items. Reset to `close_bank` on failure.
            if (bankFunctions.withdrawMissingItems(state, itemCombinationData.items, 'close_bank')) break; 

            // Assign next state.
            state.main_state = 'validate_inventory_quantities';
            break;
        }

        // Validate inventory item quantities.
        case 'validate_inventory_quantities': {
            if (!bot.localPlayerIdle()) break;
    
            // If inventory quantities do not match the required quantities, reset state to `open_bank`.
            if (!inventoryFunctions.checkQuantitiesMatch(state, itemCombinationData.items.map(item => ({itemId: item.id, quantity: item.quantity})))) {
                generalFunctions.handleFailure(state, `stateManager: ${state.main_state}`, 'Inventory quantities do not match required quantities.', 'open_bank');
                break;
            }

            // Assign next state.
            state.main_state = 'close_bank';
            break;
        }

        // Close the bank if it's open.
        case 'close_bank': {
            if (!bot.localPlayerIdle()) break;
            if (!bankFunctions.closeBank(state)) break;

            // Assign next state.
            state.main_state = 'item_interact';
            break;
        }

        // Interact both items on one another to create the combined item.
        case 'item_interact': {
            if (!bankFunctions.requireBankClosed(state, 'close_bank') || !bot.localPlayerIdle()) break;

            // If the inventory doesn't contain all items, reset to `open_bank`.
            if (!bot.inventory.containsAllIds(itemCombinationData.items.map(item => item.id))) {
                generalFunctions.handleFailure(state, `stateManager: ${state.main_state}`, 'Inventory does not contain the correct items.', 'open_bank');
                break;
            }

            // Use items on each other
            const item1 = itemCombinationData.items[0];
            const item2 = itemCombinationData.items[1];
            bot.inventory.itemOnItemWithIds(item1.id, item2.id);

            // Determine if a make item interface exists for this combination and select it.
            const widgetData = itemCombinationData.make_widget_data;
            if (widgetData && !widgetFunctions.interactWithWidget(state, widgetData)) break;

            // Timeout so that items can combine, then loop back around to script starting state.
            state.timeout = itemCombinationData.timeout;
            logger(state, 'debug', `stateManager: ${state.main_state}`, `Combining ${utilityFunctions.convertToTitleCase(item1.name)} with ${utilityFunctions.convertToTitleCase(item2.name)}. Timeout: ${itemCombinationData.timeout}.`);
         
            // Assign next state.
            state.main_state = 'open_bank';
            break;
        }

        // Default to start state.
        default: {
            state.main_state = 'open_bank';
            break;
        }
    }
};