/** TO DO */
// Send notification in game and on discord when script stops
// Click relevant option widget
// Add UI
// Add buy more ingredients and sell with GE


/** TYPE IMPORTS **/
import type {MappedItemCombinationData} from 'src/imports/item-functions.js';


/** FUNCTION IMPORTS **/
import {logger} from 'src/imports/logger.js';
import {itemCombinationData} from 'src/imports/item-combination-data.js';
import {antibanFunctions} from 'src/imports/antiban-functions.js';
import {bankFunctions} from 'src/imports/bank-functions.js';
import {debugFunctions} from 'src/imports/debug-functions.js';
import {generalFunctions} from 'src/imports/general-functions.js';
import {inventoryFunctions} from 'src/imports/inventory-functions.js';
import {itemFunctions} from 'src/imports/item-functions.js';
import {utilityFunctions} from 'src/imports/utility-functions.js';
import {timeoutManager} from 'src/imports/timeout-manager.js';


/** VARIABLES **/
const antibanEnabled = bot.variables.getBooleanVariable('[Setting] Antiban AFKs');
const debugEnabled = bot.variables.getBooleanVariable('[Setting] Debug Enabled');
const scriptName = '[Stark] Item Combiner';
const state = {
    antibanTriggered: false,
    current: 'start_state',
    itemCombinationData: undefined as MappedItemCombinationData | undefined,
    startDepositAllCompleted: false,
    timeout: 0 // << required for AFK delay
};


/** GENERAL FUNCTIONS **/
// Script start logic.
const onStart = () => {
    logger('both', 'onStart', `Starting ${scriptName}.`); // Debug Log

    // Set item combination data state from GUI variables.
    const guiCombination = itemCombinationData.find(itemCombination => bot.variables.getBooleanVariable(utilityFunctions.convertToTitleCase(itemCombination.combined_item)));
    if (!guiCombination) throw new Error('No item combination selected in GUI.');

    // Add item IDs to item combination data.
    const itemCombinationDataWithIds = itemFunctions.addItemIdsToItemCombination(guiCombination);
    if (!itemCombinationDataWithIds) throw new Error(`Failed to map item IDs for ${guiCombination.combined_item}.`)

    // Set item combination data state.
    state.itemCombinationData = itemCombinationDataWithIds;
    logger('both', 'onStart', `We are creating ${utilityFunctions.convertToTitleCase(guiCombination.combined_item)}.`);
};

// Game tick logic. Every 0.6s.
const onGameTick = () => {
    if (debugEnabled) logger('log', 'onGameTick', `Function start.`);
    if (debugEnabled) debugFunctions.stateDebugger(state);

    // Break handling - set to false until in a static state
    bot.breakHandler.setBreakHandlerStatus(false);

    // Return if static timeout is set.
    if (state.timeout > 0) {
        state.timeout--;
        return;
    }

    // Process advanced timeout manager conditions
    timeoutManager.tick();

    // Stop here if any timeoutManager conditions are still waiting
    if (timeoutManager.isWaiting()) return;

    // Antiban AFK
    if (antibanEnabled && antibanFunctions.triggerAfkIfNeeded(state)) return;

    // Break handling - Only break when timeout functions not being waited on
    bot.breakHandler.setBreakHandlerStatus(true);

    // State manager
    try {
        stateManager();
    } catch (error) {
        logger('both', 'onGameTick', (error as Error).toString());
        bot.terminate();
    }
};

// Script end logic.
const onEnd = () => generalFunctions.endScript(scriptName);


/** SCRIPT FUNCTIONS **/
// State management - main script functionality.
const stateManager = () => {
    if (debugEnabled) logger('log', 'stateManager', `Function start.`); // Debug Log
    
    // Re-assign itemCombinationData for safe use throughout this function.
    const itemCombinationData = state.itemCombinationData;
    if (!itemCombinationData) throw new Error('Item combination not initialized');

    // Determine current state.
    switch(state.current) {

        // `start_state`: Open the bank and deposit all if first bank interaction.
        case 'start_state': {
            if (debugEnabled) logger('log', 'stateManager', `Case: start_start.`); // Debug Log

            logger('both', 'stateManager', 'Testing before add condition')

            timeoutManager.addCondition({
                conditionFunction: () => bot.bank.isOpen(),
                maxTicks: 30,
                onFail: 'Bank did not open during `start_state`'
            });

            logger('both', 'stateManager', 'Testing after add condition')

            break;

            // // Open the bank if it isn't open.
            // if (!bot.bank.isOpen()) {
            //     logger('both', 'stateManager', 'Opening bank to withdraw items.');
            //     bot.bank.open();
            //     state.timeout.conditions.push(() => bot.bank.isOpen());
            //     break;
            // }

            // // Deposit all on script start.
            // if (!state.startDepositAllCompleted) {
            //     bot.bank.depositAll();
            //     state.startDepositAllCompleted = true;
            //     break;
            // }

            // // Assign next state
            // state.current = 'deposit_items';
            // break;
        }

        // // Deposit all if `deposit_all` is set, or the combined item if not.
        // case 'deposit_items': {
        //     if (debugEnabled) logger('log', 'stateManager', `Case: deposit_items.`); // Debug Log

        //     // Open the bank if it isn't open.
        //     if (!bot.bank.isOpen()) {
        //         state.current = 'start_state';
        //         break;
        //     }

        //     // Deposit items.
        //     if (debugEnabled) logger('log', 'stateManager', 'Depositing combined items.');
        //     itemCombinationData.deposit_all ? bot.bank.depositAll() : bot.bank.depositAllWithId(itemCombinationData.combined_item_id);

        //     // Assign next state.
        //     state.current = 'check_item_quantities';
        //     break;
        // }

        // // `check_item_quantities`: Check item quantities.
        // case 'check_item_quantities': {
        //     if (debugEnabled) logger('log', 'stateManager', `Case: check_item_quantities.`); // Debug Log

        //     // Open the bank if it isn't open.
        //     if (!bot.bank.isOpen()) {
        //         state.current = 'start_state';
        //         break;
        //     }

        //     // Check item quantities in the bank.
        //     if (debugEnabled) logger('log', 'stateManager', 'Checking item quantities.');
        //     if (bankFunctions.anyQuantitiyLow(itemCombinationData.items)) throw new Error('Ran out of items to combine.');

        //     // Assign next state.
        //     state.current = 'withdraw_items';
        //     break;
        // }

        // // Withdraw items from the bank.
        // case 'withdraw_items': {
        //     if (debugEnabled) logger('log', 'stateManager', `Case: withdraw_items.`); // Debug Log

        //     // If the bank is not open, go back to `start_state`.
        //     if (!bot.bank.isOpen()) {
        //         state.current = 'start_state';
        //         break;
        //     }

        //     // Withdraw missing items one at a time.
        //     for (const item of itemCombinationData.items) {
        //         if (!bot.inventory.containsId(item.id)) {
        //             state.timeout.conditions.push(() => bot.inventory.containsId(item.id));
        //             bot.bank.withdrawQuantityWithId(item.id, item.quantity);
        //             if (debugEnabled) logger('log', 'stateManager', `Withdrawing item ID ${item.id}. with quantity ${item.quantity}`);
        //             break;
        //         }
        //     }

        //     // Break if inventory doesn't contain all items.
        //     if (!bot.inventory.containsAllIds(itemCombinationData.items.map(item => item.id))) break;

        //     // If inventory quantities do not match the required quantities, go back to `start_state`.
        //     if (!inventoryFunctions.checkQuantitiesMatch(itemCombinationData.items.map(item => ({itemId: item.id, quantity: item.quantity})))) {
        //         state.current = 'start_state';
        //         break;
        //     }

        //     // Assign next state.
        //     state.current = 'close_bank';
        //     break;
        // }

        // // Close the bank if open.
        // case 'close_bank': {
        //     if (debugEnabled) logger('log', 'stateManager', `Case: close_bank.`); // Debug Log

        //     // Close the bank if open
        //     if (bot.bank.isOpen()) {
        //         bot.bank.close();
        //         state.timeout.conditions.push(() => !bot.bank.isOpen());
        //         break;
        //     }

        //     // Assign next state.
        //     state.current = 'item_interact';
        //     break;
        // }

        // // Item interaction - use items on each other.
        // case 'item_interact': {
        //     if (debugEnabled) logger('log', 'stateManager', `Case: item_interact.`); // Debug Log

        //     // If items are not in the inventory, go back to `start_state`.
        //     if (!bot.inventory.containsAllIds(itemCombinationData.items.map(item => item.id))) {
        //         state.current = 'start_state';
        //         break;
        //     }

        //     // if the bank is open, go back to `close_bank`.
        //     if (bot.bank.isOpen()) {
        //         state.current = 'close_bank';
        //         break;
        //     }

        //     // If the player isn't idle, timeout.
        //     if (!bot.localPlayerIdle()) {
        //         state.timeout.conditions.push(() => bot.localPlayerIdle());
        //         break;
        //     }

        //     // If the inventory contains items to combine, interact with the items.
        //     const item1 = itemCombinationData.items[0];
        //     const item2 = itemCombinationData.items[1];
        //     const itemsRequireCombining = () => bot.inventory.containsAllIds(itemCombinationData.items.map(item => item.id));
        //     if (itemsRequireCombining()) {
        //         logger('both', 'stateManager', `Combining ${item1.name} with ${item2.name}. Timeout: ${itemCombinationData.timeout}.`);

        //         // Item interaction - use items on each other.
        //         bot.inventory.itemOnItemWithIds(item1.id, item2.id);

        //         // Assign next state.
        //         state.current = 'item_widget_interact';
        //     }
        //     break;
        // }

        // // Determine if a "Make X" interface exists for this combination and select it
        // case 'item_widget_interact': {
        //     if (debugEnabled) logger('log', 'stateManager', `Case: item_widget_interact.`); // Debug Log

        //         // // Determine if a "Make X" interface exists for this combination and select it
        //         // const widgetData = itemCombinationData.make_widget_data;
        //         // if (widgetData) {

        //         //     // If the widget isn't showing, wait for it to show.
        //         //     const widgetVisible = () => client.getWidget(widgetData.id) !== null;
        //         //     if (!widgetVisible()) {
        //         //         state.timeout.conditions.push(() => widgetVisible());
        //         //         break;
        //         //     }

        //         //     // Click the "Make X" widget.
        //         //     bot.widgets.interactSpecifiedWidget(widgetData.packed_widget_id, widgetData.id, widgetData.opcode, widgetData.p0);
        //         //     break;
        //         // }


        //         // Timeout until the inventory does not contain any items to combine.
        //         // state.timeout.conditions.push(() => !itemsRequireCombining());
        //         // // Timeout for the duration of processing.
        //         // state.timeout.conditions.push(() => playerIdleAndItemsNotCombined());
        //         // state.timeout = itemCombinationData.timeout;
        //         // break;


        //     // Assign next state.
        //     state.current = 'start_state';
        //     break;
        // }

        // Default back to bank opening.
        default: {
            if (debugEnabled) logger('log', 'stateManager', `Case: default.`); // Debug Log
            state.current = 'start_state';
            break;
        }
    }
};


/*** REMOVE FROM CONVERTED JS */
onStart();
onGameTick();
onEnd();
/*** REMOVE FROM CONVERTED JS */