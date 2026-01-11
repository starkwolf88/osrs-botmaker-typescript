// To-Do
    // Add more combinations. Unfinished potions. Potions. Fletching. Gems. Glass.
    // Add UI

// Data imports
import {ItemCombinationData, itemCombinationData} from 'src/imports/item-combination-data.js';

// Function imports
import {logger} from 'src/imports/logger.js';
import {antibanFunctions} from 'src/imports/antiban-functions.js';
import {bankFunctions} from 'src/imports/bank-functions.js';
import {debugFunctions} from 'src/imports/debug-functions.js';
import {generalFunctions} from 'src/imports/general-functions.js';
import {inventoryFunctions} from 'src/imports/inventory-functions.js';
import {utilityFunctions} from 'src/imports/utility-functions.js';
import {timeoutManager} from 'src/imports/timeout-manager.js';

// Variables
const state = {
    scriptName: '[Stark] Item Combiner',
    current: 'start_state',
    itemCombinationData: undefined as ItemCombinationData | undefined,
    antibanTriggered: false,
    startDepositAllCompleted: false,
    gameTick: 0,
    timeout: 0,

    // GUI
    antibanEnabled: bot.variables.getBooleanVariable('[Setting] Antiban AFKs'),
    debugEnabled: bot.variables.getBooleanVariable('[Setting] Debug Enabled'),
    debugFullState: bot.variables.getBooleanVariable('[Setting] Debug Full State'),
    scriptStopDiscordMessage: bot.variables.getBooleanVariable('[Setting] Script Stop Discord Notification')
};

// Functions
const onStart = () => {
    try {
        logger(state, 'all', 'Script', `Starting ${state.scriptName}.`);
        getGuiItemCombination();
    } catch (error) {
        logger(state, 'all', 'Script', (error as Error).toString());
        bot.terminate();
    }
};

const onGameTick = () => {
    try {
        logger(state, 'debug', 'onGameTick', `Function start. Script game tick ${state.gameTick}`);
        state.gameTick++;
        if (state.debugEnabled && state.debugFullState) debugFunctions.stateDebugger(state);

        // Break logic.
        bot.breakHandler.setBreakHandlerStatus(false);

        // Timeout logic.
        if (state.timeout > 0) {
            state.timeout--;
            return;
        }
        timeoutManager.tick();
        if (timeoutManager.isWaiting()) return;

        // Antiban AFK and break logic.
        if (state.antibanEnabled && antibanFunctions.afkTrigger(state)) return;
        bot.breakHandler.setBreakHandlerStatus(true);

        // State manager.
        stateManager();
    } catch (error) {
        logger(state, 'all', 'Script', (error as Error).toString());
        bot.terminate();
    }
};

const onEnd = () => generalFunctions.endScript(state);

const getGuiItemCombination = () => {
    const itemCombination = itemCombinationData.find(itemCombination => bot.variables.getBooleanVariable(utilityFunctions.convertToTitleCase(itemCombination.combined_item_name)));
    if (!itemCombination) throw new Error('Item combination not initialized');
    logger(state, 'all', 'Script', `We are creating ${utilityFunctions.convertToTitleCase(itemCombination.combined_item_name)}.`);
    state.itemCombinationData = itemCombination;
};

const stateManager = () => {
    logger(state, 'debug', `stateManager: ${state.current}`, `Function start.`);

    const itemCombinationData = state.itemCombinationData;
    if (!itemCombinationData) throw new Error('Item combination not initialized');

    // Determine current state.
    switch(state.current) {

        // Timeout until bank is open.
        case 'start_state': {
            if (!bot.localPlayerIdle()) break;

            // Timeout action.
            const startStateTimeoutAction = () => {
                logger(state, 'debug', `stateManager: ${state.current}`, 'Opening the bank');
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
            state.current = 'deposit_items';
            break;
        }

        // Deposit all if `deposit_all` is set, or the combined item if not.
        case 'deposit_items': {
            if (!bankFunctions.requireBankOpen(state, 'start_state') || !bot.localPlayerIdle()) break;

            // Deposit items.
            logger(state, 'debug', `stateManager: ${state.current}`, 'Depositing items.');
            itemCombinationData.deposit_all || !state.startDepositAllCompleted ? bot.bank.depositAll() : bot.bank.depositAllWithId(itemCombinationData.combined_item_id);

            // Assign next state.
            state.current = 'check_bank_quantities';
            break;
        }

        // Check bank item quantities.
        case 'check_bank_quantities': {
            if (!bankFunctions.requireBankOpen(state, 'start_state') || !bot.localPlayerIdle()) break;

            // Check item quantities in the bank.
            logger(state, 'debug', `stateManager: ${state.current}`, 'Checking bank item quantities.');
            if (bankFunctions.anyQuantitiyLow(itemCombinationData.items)) throw new Error('Ran out of items to combine.');

            // Assign next state.
            state.current = 'withdraw_items';
            break;
        }

        // Withdraw items from the bank.
        case 'withdraw_items': {
            if (!bankFunctions.requireBankOpen(state, 'start_state') || !bot.localPlayerIdle()) break;

            // Withdraw missing items.
            if (bankFunctions.withdrawMissingItems(state, itemCombinationData.items)) break; 

            // If the inventory doesn't contain all items, reset to `start_state`.
            if (!bot.inventory.containsAllIds(itemCombinationData.items.map(item => item.id))) {
                state.current = 'start_state';
                break;
            }

            // Assign next state.
            state.current = 'check_inventory_quantities';
            break;
        }

        // Check inventory item quantities.
        case 'check_inventory_quantities': {
            if (!bot.localPlayerIdle()) break;
    
            // If inventory quantities do not match the required quantities, go back to `start_state`.
            logger(state, 'debug', `stateManager: ${state.current}`, 'Checking inventory item quantities.');
            if (!inventoryFunctions.checkQuantitiesMatch(itemCombinationData.items.map(item => ({itemId: item.id, quantity: item.quantity})))) {
                state.current = 'start_state';
                break;
            }

            // Assign next state.
            state.current = 'close_bank';
            break;
        }

        // Close the bank if open.
        case 'close_bank': {
            if (!bot.localPlayerIdle()) break;

            // Timeout action.
            const closeBankTimeoutAction = () => {
                logger(state, 'debug', `stateManager: ${state.current}`, 'Closing the bank');
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
                        logger(state, 'debug', `stateManager: ${state.current}`, 'Bank did not close after 3 attempts and 10 ticks.');
                        state.current = 'start_state';
                    }
                });
                break;
            }

            // Assign next state.
            state.current = 'item_interact';
            break;
        }

        // Interact both items to create combined item.
        case 'item_interact': {
            if (!bankFunctions.requireBankClosed(state, 'close_bank') || !bot.localPlayerIdle()) break;

            // If the inventory doesn't contain all items, reset to `start_state`.
            if (!bot.inventory.containsAllIds(itemCombinationData.items.map(item => item.id))) {
                state.current = 'start_state';
                break;
            }

            // Create item interact function.
            const item1 = itemCombinationData.items[0];
            const item2 = itemCombinationData.items[1];
            const itemInteractTimeoutAction = () => {
                logger(state, 'debug', `stateManager: ${state.current}`, `Combining ${utilityFunctions.convertToTitleCase(item1.name)} with ${utilityFunctions.convertToTitleCase(item2.name)}. Timeout: ${itemCombinationData.timeout}.`);
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

            // Timeout so that items can combine.
            state.timeout = itemCombinationData.timeout;
            state.current = 'start_state';
            break;
        }

        default: {
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