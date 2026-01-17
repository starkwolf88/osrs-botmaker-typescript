// To-Do
// Add anti ban and debug as checkboxes to UI

// Data imports
import {ItemCombinationData, itemCombinationData} from 'src/imports/item-combination-data.js';

// Function imports
import {logger} from 'src/imports/logger.js';
import {bankFunctions} from 'src/imports/bank-functions.js';
import {createUi} from './ui.js';
import {generalFunctions} from 'src/imports/general-functions.js';
import {inventoryFunctions} from 'src/imports/inventory-functions.js';
import {utilityFunctions} from 'src/imports/utility-functions.js';
import {timeoutManager} from 'src/imports/timeout-manager.js';

// Variables
const state = {
    scriptName: '[Stark] Item Combiner',
    main_state: 'start_state',
    itemCombinationData: undefined as ItemCombinationData | undefined,
    antibanTriggered: false,
    startDepositAllCompleted: false,
    gameTick: 0,
    timeout: 0,
    uiCompleted: false,
    scriptInitialised: false,
    antibanEnabled: true,
    debugEnabled: true,
    debugFullState: false
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
    try {
        if (state.uiCompleted) {
            if (!state.scriptInitialised) getGuiItemCombinationData();
            state.scriptInitialised = true;
        } else {
            return;
        }
        if (!generalFunctions.gameTick(state)) return;
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
    logger(state, 'debug', `stateManager: ${state.main_state}`, `Function start.`);

    // Re-assign item combination data for safe use.
    const itemCombinationData = state.itemCombinationData;
    if (!itemCombinationData) throw new Error('Item combination not initialized');

    // Determine main state.
    switch(state.main_state) {

        // Starting state of the script. Open the bank.
        case 'start_state': {
            if (!bot.localPlayerIdle()) break;

            // Timeout action.
            const startStateTimeoutAction = () => {
                logger(state, 'debug', `stateManager: ${state.main_state}`, 'Opening the bank');
                bot.bank.open();
            };
            startStateTimeoutAction();

            // Timeout until bank is open.
            if (!bot.bank.isOpen()) {
                timeoutManager.add({
                    state,
                    conditionFunction: () => bot.bank.isOpen(),
                    action: () => startStateTimeoutAction(),
                    maxWait: 10,
                    maxAttempts: 3,
                    retryTimeout: 3,
                    onFail: () => {throw new Error('Bank did not open during `start_state` after 3 attempts and 10 ticks.')}
                });
                break;
            }

            // Assign the next state.
            state.main_state = 'deposit_items';
            break;
        }

        // Deposit items into the bank.
        case 'deposit_items': {
            if (!bankFunctions.requireBankOpen(state, 'start_state') || !bot.localPlayerIdle()) break;

            // Deposit items.
            logger(state, 'debug', `stateManager: ${state.main_state}`, 'Depositing items.');
            itemCombinationData.deposit_all || !state.startDepositAllCompleted ? bot.bank.depositAll() : bot.bank.depositAllWithId(itemCombinationData.combined_item_id);
            state.startDepositAllCompleted = true;

            // Assign next state.
            state.main_state = 'check_bank_quantities';
            break;
        }

        // Check bank item quantities are sufficient for item combining.
        case 'check_bank_quantities': {
            if (!bankFunctions.requireBankOpen(state, 'start_state') || !bot.localPlayerIdle()) break;

            // Check item quantities in the bank.
            logger(state, 'debug', `stateManager: ${state.main_state}`, 'Checking bank item quantities.');
            if (bankFunctions.anyQuantitiyLow(itemCombinationData.items)) throw new Error('Ran out of items to combine.');

            // Assign next state.
            state.main_state = 'withdraw_items';
            break;
        }

        // Withdraw items from the bank.
        case 'withdraw_items': {
            if (!bankFunctions.requireBankOpen(state, 'start_state') || !bot.localPlayerIdle()) break;

            // Withdraw missing items.
            if (bankFunctions.withdrawMissingItems(state, itemCombinationData.items)) break; 

            // If the inventory doesn't contain all items, reset to `start_state`.
            if (!bot.inventory.containsAllIds(itemCombinationData.items.map(item => item.id))) {
                state.main_state = 'start_state';
                break;
            }

            // Assign next state.
            state.main_state = 'validate_inventory_quantities';
            break;
        }

        // Validate inventory item quantities.
        case 'validate_inventory_quantities': {
            if (!bot.localPlayerIdle()) break;
    
            // If inventory quantities do not match the required quantities, go back to `start_state`.
            logger(state, 'debug', `stateManager: ${state.main_state}`, 'Checking inventory item quantities.');
            if (!inventoryFunctions.checkQuantitiesMatch(itemCombinationData.items.map(item => ({itemId: item.id, quantity: item.quantity})))) {
                state.main_state = 'start_state';
                break;
            }

            // Assign next state.
            state.main_state = 'close_bank';
            break;
        }

        // Close the bank if it's open.
        case 'close_bank': {
            if (!bot.localPlayerIdle()) break;

            // Timeout action.
            const closeBankTimeoutAction = () => {
                logger(state, 'debug', `stateManager: ${state.main_state}`, 'Closing the bank');
                bot.bank.close();
            };
            closeBankTimeoutAction();

            // Timeout until bank is closed. Reset to `start_state` if not closed after 3 attempts.
            if (bot.bank.isOpen()) {
                timeoutManager.add({
                    state,
                    conditionFunction: () => !bot.bank.isOpen(),
                    action: () => closeBankTimeoutAction(),
                    maxWait: 10,
                    maxAttempts: 3,
                    retryTimeout: 3,
                    onFail: () => {
                        logger(state, 'debug', `stateManager: ${state.main_state}`, 'Bank did not close after 3 attempts and 10 ticks.');
                        state.main_state = 'start_state';
                    }
                });
                break;
            }

            // Assign next state.
            state.main_state = 'item_interact';
            break;
        }

        // Interact both items on one another to create the combined item.
        case 'item_interact': {
            if (!bankFunctions.requireBankClosed(state, 'close_bank') || !bot.localPlayerIdle()) break;

            // If the inventory doesn't contain all items, reset to `start_state`.
            if (!bot.inventory.containsAllIds(itemCombinationData.items.map(item => item.id))) {
                state.main_state = 'start_state';
                break;
            }

            // Create item interact function.
            const item1 = itemCombinationData.items[0];
            const item2 = itemCombinationData.items[1];
            const itemInteractTimeoutAction = () => {
                logger(state, 'debug', `stateManager: ${state.main_state}`, `Combining ${utilityFunctions.convertToTitleCase(item1.name)} with ${utilityFunctions.convertToTitleCase(item2.name)}. Timeout: ${itemCombinationData.timeout}.`);
                bot.inventory.itemOnItemWithIds(item1.id, item2.id);
            }
            itemInteractTimeoutAction();

            // Determine if a make item interface exists for this combination and select it.
            const widgetData = itemCombinationData.make_widget_data;
            if (widgetData) {

                // Timeout until the widget is visible.
                if (!client.getWidget(widgetData.packed_widget_id)) {
                    timeoutManager.add({
                        state,
                        conditionFunction: () => client.getWidget(widgetData.packed_widget_id) !== null,
                        action: () => itemInteractTimeoutAction(),
                        maxWait: 10,
                        maxAttempts: 3,
                        retryTimeout: 3,
                        onFail: () => {throw new Error('Make item widget not visible after 3 attempts and 10 ticks.')}
                    });
                    break;
                }

                // Interact with widget
                bot.widgets.interactSpecifiedWidget(widgetData.packed_widget_id, widgetData.identifier, widgetData.opcode, widgetData.p0);
            }

            // Timeout so that items can combine, then loop back around to script starting state.
            state.timeout = itemCombinationData.timeout;
            state.main_state = 'start_state';
            break;
        }

        // Default to start state.
        default: {
            state.main_state = 'start_state';
            break;
        }
    }
};