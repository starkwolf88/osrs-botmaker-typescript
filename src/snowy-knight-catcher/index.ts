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
    mainState: 'walk_to_snowy_knights',
    scriptName: '[Stark] Snowy Knight Catcher',
    timeout: 0,

    // Optional
    useStaminas: bot.variables.getBooleanVariable('Use Staminas')
};

// Functions
export const onStart = () => logger(state, 'all', 'Script', `Starting ${state.scriptName}.`);
export const onGameTick = () => {

    // Breaks disabled
    bot.breakHandler.setBreakHandlerStatus(false);

    try {
        if (!generalFunctions.gameTick(state)) return;

        // Enable break if idle, not walking and the `mainState` is `open_bank`.
        if (bot.localPlayerIdle() && !bot.walking.isWebWalking() && state.mainState == 'open_bank') bot.breakHandler.setBreakHandlerStatus(true);

        stateManager();
    } catch (error) {
        logger(state, 'all', 'Script', (error as Error).toString());
        bot.terminate();
    }
};
export const onEnd = () => generalFunctions.endScript(state);

const scriptLocations = {
    quetzacaliGorgeBank: locationFunctions.coordsToWorldPoint(locationCoords.quetzacali_gorge.bank),
    monsGratiaSnowyKnightArea: locationFunctions.coordsToWorldPoint(locationCoords.mons_gratia.snowy_knight_area)
};

const stateManager = () => {
    logger(state, 'debug', `stateManager`, `${state.mainState}`);
    switch(state.mainState) {

        // Starting state of the script. Walk to Mons Gratia.
        case 'walk_to_snowy_knights': {
            if (!bot.localPlayerIdle() || bot.walking.isWebWalking()) break;

            // If inventory does not contain any butterfly jars, bank.
            if (!bot.inventory.containsId(itemIds.butterfly_jar)) {
                state.mainState = 'walk_to_bank';
                break;
            }
            if (!locationFunctions.webWalkTimeout(state, scriptLocations.monsGratiaSnowyKnightArea, 'Snowy Knight start location.', 200, 5)) break;
            state.mainState = 'catch_snowy_knight';
            break;
        }

        // Catch Snowy Knight
        case 'catch_snowy_knight': {
            if (!bot.localPlayerIdle() || bot.walking.isWebWalking()) break;

            // Reset back to `monsGratiaSnowyKnightArea` if not within 5 tiles.
            if (!locationFunctions.isPlayerNearWorldPoint(scriptLocations.monsGratiaSnowyKnightArea, 5)) state.mainState = 'walk_to_snowy_knights';

            // If inventory does not contain any butterfly jars, bank.
            if (!bot.inventory.containsId(itemIds.butterfly_jar)) {
                state.mainState = 'walk_to_bank';
                break;
            }

            // If a Snowy Knight exists, attempt to catch.
            const snowyKnight = npcFunctions.getClosestNpc([npcIds.mons_gratia.snowy_knight]);
            if (snowyKnight) {
                const currentSnowyKnightCount = bot.inventory.getQuantityOfId(itemIds.snowy_knight);
                bot.npcs.interactSupplied(snowyKnight, 'Catch');
                timeoutManager.add({
                    state,
                    conditionFunction: () => bot.inventory.getQuantityOfId(itemIds.snowy_knight) > currentSnowyKnightCount,
                    maxWait: 10
                });
            }
            break;
        }

        // Walk to the bank.
        case 'walk_to_bank': {
            if (!bot.localPlayerIdle() || bot.walking.isWebWalking()) break;
            if (!locationFunctions.webWalkTimeout(state, scriptLocations.quetzacaliGorgeBank, 'Quetzacali Gorge bank.', 200)) break;
            state.mainState = 'open_bank';
            break;
        }

        // Open the bank.
        case 'open_bank': {
            if (!bot.localPlayerIdle()) break;
            if (!bankFunctions.openBank(state)) break;
            state.mainState = 'deposit_items';
            break;
        }

        // Deposit items into the bank.
        case 'deposit_items': {
            if (!bankFunctions.requireBankOpen(state, 'open_bank') || !bot.localPlayerIdle()) break;
            if (!bankFunctions.depositItemsTimeout.all(state, 'close_bank')) break;
            state.mainState = 'check_bank_quantities';
            break;
        }

        // Check bank item quantities are sufficient.
        case 'check_bank_quantities': {
            if (!bankFunctions.requireBankOpen(state, 'open_bank') || !bot.localPlayerIdle()) break;
            logger(state, 'debug', `stateManager: ${state.mainState}`, 'Checking butterfly jar quantity.');
            if (bankFunctions.isQuantityBelow(itemIds.butterfly_jar, 1)) throw new Error('Ran out of Butterfly jars.');
            state.useStaminas && !bankFunctions.isQuantityBelow(itemIds.stamina_potion_4, 1) ? state.mainState = 'withdraw_stamina' : state.mainState = 'withdraw_jars';
            break;
        }

        // Withdraw stamina potion from the bank if don't exist in inventory. Reset to `close_bank` on failure.
        case 'withdraw_stamina': {
            if (!bankFunctions.requireBankOpen(state, 'open_bank') || !bot.localPlayerIdle() || bot.bank.isBanking()) break;
            const staminaIds = [itemIds.stamina_potion_1, itemIds.stamina_potion_2, itemIds.stamina_potion_3, itemIds.stamina_potion_4];
            if (!bot.inventory.containsAnyIds(staminaIds) && !bankFunctions.withdrawFirstExisting(state, staminaIds, 1)) break;
            state.mainState = 'withdraw_jars';
            break;
        }

        // Withdraw butterfly jars items. Reset to `close_bank` on failure.
        case 'withdraw_jars': {
            if (!bankFunctions.requireBankOpen(state, 'open_bank') || !bot.localPlayerIdle() || bot.bank.isBanking()) break;
            if (bankFunctions.withdrawMissingItems(state, [{id: itemIds.butterfly_jar, quantity: 'all'}], 'close_bank')) break; 
            state.mainState = 'walk_to_snowy_knights';
            break;
        }

        // Default to start state.
        default: {
            state.mainState = 'walk_to_snowy_knights';
            break;
        }
    }
};