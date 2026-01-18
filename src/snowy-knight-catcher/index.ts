// To-do
// Add UI and checkbox for 'use staminas'

// Data imports
import {itemIds} from '../imports/item-ids.js';
import {locationCoords} from 'src/imports/location-coords.js';
import {npcIds} from 'src/imports/npc-ids.js';

// Function imports
import {bankFunctions} from '../imports/bank-functions.js';
import {generalFunctions} from 'src/imports/general-functions.js';
import {locationFunctions} from 'src/imports/location-functions.js';
import {logger} from 'src/imports/logger.js';
import {npcFunctions} from 'src/imports/npc-functions.js';
import {timeoutManager} from 'src/imports/timeout-manager.js';
import {utilityFunctions} from 'src/imports/utility-functions.js';

// Variables
const state = {

    // Core
    antibanEnabled: true,
    antibanTriggered: false,
    debugEnabled: false,
    debugFullState: false,
    failure_location: '',
    gameTick: 0,
    main_state: 'walk_to_snowy_whites',
    scriptName: '[Stark] Snowy Knight Catcher',
    stuck_count: 0,
    timeout: 0,

    // Optional
    useStaminas: true
};

// Functions
export const onStart = () => logger(state, 'all', 'Script', `Starting ${state.scriptName}.`);

export const onGameTick = () => {

    // Breaks disabled
    bot.breakHandler.setBreakHandlerStatus(false);

    try {
        if (!generalFunctions.gameTick(state)) return;

        // Enable break if idle, not walking and the `main_state` is `open_bank`.
        if (bot.localPlayerIdle() && !bot.walking.isWebWalking() && state.main_state == 'open_bank') bot.breakHandler.setBreakHandlerStatus(true);

        stateManager();
    } catch (error) {
        logger(state, 'all', 'Script', (error as Error).toString());
        bot.terminate();
    }
};

export const onEnd = () => generalFunctions.endScript(state);

const scriptLocations = {
    quetzacaliGorgeBank: utilityFunctions.coordsToWorldPoint(locationCoords.quetzacali_gorge.bank),
    monsGratiaSnowyWhiteArea: utilityFunctions.coordsToWorldPoint(locationCoords.mons_gratia.snowy_knight_area)
};

// State functions
const isPlayerAtSnowyWhites = () => locationFunctions.isPlayerNearWorldPoint(scriptLocations.monsGratiaSnowyWhiteArea)
const getSnowyWhiteCount = () => bot.inventory.getQuantityOfId(itemIds.snowy_knight);
const isPlayerAtBank = () => locationFunctions.isPlayerNearWorldPoint(scriptLocations.quetzacaliGorgeBank);

const stateManager = () => {
    logger(state, 'debug', `stateManager: ${state.main_state}`, `Function start.`);

    // Determine main state.
    switch(state.main_state) {

        // Starting state of the script. Walk to Mons Gratia.
        case 'walk_to_snowy_whites': {
            if (!bot.localPlayerIdle() || bot.walking.isWebWalking()) break;

            // If inventory does not contain any butterfly jars, bank.
            if (!bot.inventory.containsId(itemIds.butterfly_jar)) {
                state.main_state = 'walk_to_bank';
                break;
            }

            // Is player is at Mons Gratia Snowy White area.
            if (!isPlayerAtSnowyWhites()) {
                logger(state, 'all', `stateManager: ${state.main_state}`, 'Walking back to catch area.');
                bot.walking.webWalkStart(scriptLocations.monsGratiaSnowyWhiteArea);
                timeoutManager.add({
                    state,
                    conditionFunction: () => isPlayerAtSnowyWhites(),
                    maxWait: 200,
                    onFail: () => {throw new Error('Unable to find start point after 200 ticks.')}
                });
                break;
            }

            logger(state, 'debug', `stateManager: ${state.main_state}`, 'Player is at start location.');
            state.main_state = 'catch_snowy_knight';
            break;
        }

        // Catch Snowy Knight
        case 'catch_snowy_knight': {
            if (!bot.localPlayerIdle() || bot.walking.isWebWalking()) break;

            // Reset back to `monsGratiaSnowyWhiteArea` if not within 5 tiles.
            if (!locationFunctions.isPlayerNearWorldPoint(scriptLocations.monsGratiaSnowyWhiteArea, 5)) state.main_state = 'walk_to_snowy_whites';

            // If inventory does not contain any butterfly jars, bank.
            if (!bot.inventory.containsId(itemIds.butterfly_jar)) {
                state.main_state = 'walk_to_bank';
                break;
            }

            // If a Snowy Knight exists, attempt to catch.
            const snowyKnight = npcFunctions.getClosestNpc(npcIds.mons_gratia.snowy_knight);
            if (snowyKnight) {
                const currentSnowyWhiteCount = getSnowyWhiteCount();
                bot.npcs.interactSupplied(snowyKnight, 'Catch');
                timeoutManager.add({
                    state,
                    conditionFunction: () => getSnowyWhiteCount() > currentSnowyWhiteCount,
                    maxWait: 10
                });
            }
            break;
        }

        // Walk to the bank.
        case 'walk_to_bank': {
            if (!bot.localPlayerIdle() || bot.walking.isWebWalking()) break;

            // Is player at the bank.
            if (!isPlayerAtBank()) {
                logger(state, 'all', `stateManager: ${state.main_state}`, 'Walking to the Quetzacali Gorge bank.');
                bot.walking.webWalkStart(scriptLocations.quetzacaliGorgeBank);
                timeoutManager.add({
                    state,
                    conditionFunction: () => isPlayerAtBank(),
                    maxWait: 200,
                    onFail: () => {throw new Error('Unable to find Quetzacali Gorge bank after 200 ticks.')}
                });
                break;
            }

            // Assign the next state.
            state.main_state = 'open_bank';
            break;
        }

        // Open the bank.
        case 'open_bank': {
            if (!bot.localPlayerIdle()) break;
            if (!bankFunctions.openBank(state)) break;
            state.main_state = 'deposit_items';
            break;
        }

        // Deposit items into the bank.
        case 'deposit_items': {
            if (!bankFunctions.requireBankOpen(state, 'open_bank') || !bot.localPlayerIdle()) break;

            // Deposit items.
            logger(state, 'debug', `stateManager: ${state.main_state}`, 'Depositing items.');
            bot.bank.depositAll();

            // Assign next state.
            state.main_state = 'check_bank_quantities';
            break;
        }

        // Check bank item quantities are sufficient.
        case 'check_bank_quantities': {
            if (!bankFunctions.requireBankOpen(state, 'open_bank') || !bot.localPlayerIdle()) break;

            // Check item quantities in the bank.
            logger(state, 'debug', `stateManager: ${state.main_state}`, 'Checking butterfly jar quantity.');
            if (bankFunctions.isQuantityLow(itemIds.butterfly_jar, 1)) throw new Error('Ran out of Butterfly jars.');

            // Assign next state.
            state.main_state = 'withdraw_stamina';
            break;
        }
        
        // Withdraw stamina potion from the bank
        case 'withdraw_stamina': {
            if (state.useStaminas && !bot.inventory.containsId(itemIds.stamina_potion_4) && bot.bank.getQuantityOfId(itemIds.stamina_potion_4)) {
                logger(state, 'debug', `stateManager: ${state.main_state}`, 'Withdrawing Stamina potion (4).');
                bot.bank.withdrawAllWithId(itemIds.stamina_potion_4);
                timeoutManager.add({
                    state,
                    conditionFunction: () => bot.inventory.containsId(itemIds.stamina_potion_4),
                    maxWait: 10,
                    onFail: () => {
                        logger(state, 'all', `stateManager: ${state.main_state}`, 'Failed to withdraw Stamina potion (4) after 3 attempts and 10 ticks.');
                        state.main_state = 'open_bank';
                    }
                });
            }

            // Assign next state.
            state.main_state = 'withdraw_jars';
            break;
        }

        // Withdraw Butterfly jars from the bank.
        case 'withdraw_jars': {
            if (!bankFunctions.requireBankOpen(state, 'open_bank') || !bot.localPlayerIdle()) break;

            // Withdraw Butterfly jars.
            if (!bot.inventory.containsId(itemIds.butterfly_jar)) {
                logger(state, 'debug', `stateManager: ${state.main_state}`, 'Withdrawing Butterfly jars.');
                bot.bank.withdrawAllWithId(itemIds.butterfly_jar);
                timeoutManager.add({
                    state,
                    conditionFunction: () => bot.inventory.containsId(itemIds.butterfly_jar),
                    maxWait: 10,
                    onFail: () => {
                        logger(state, 'all', `stateManager: ${state.main_state}`, 'Failed to withdraw Butterfly jars after 3 attempts and 10 ticks.');
                        state.main_state = 'open_bank';
                    }
                });
            }

            // Assign next state.
            state.main_state = 'walk_to_snowy_whites';
            break;
        }
    }
};