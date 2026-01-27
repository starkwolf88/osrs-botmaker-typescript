// Requirements
// ThePlug continue clicker OFF

// Data imports
import {contractData, hotspotVarbits} from './contract-data.js';
import {npcIds} from 'src/imports/npc-ids.js';

// Function imports
import {createUi} from './ui.js';
import {generalFunctions} from 'src/imports/general-functions.js';
import {locationFunctions} from 'src/imports/location-functions.js';
import {locationCoords} from 'src/imports/location-coords.js';
import {logger} from 'src/imports/logger.js';
import {npcFunctions} from 'src/imports/npc-functions.js';
import {playerStateFunctions} from '../imports/player-state-functions.js';
import {tileFunctions} from '../imports/tile-functions.js';

// Type imports
import {Contract} from '../imports/types.js';
import { objectFunctions } from '../imports/object-functions.js';

// Variables
const state = {

    // Core
    antibanEnabled: true,
    antibanTriggered: false,
    debugEnabled: true,
    debugFullState: false,
    failureCounts: {},
    failureOrigin: '',
    gameTick: 0,
    lastFailureKey: '',
    // mainState: 'walk_to_amy',
    mainState: 'build_furniture', // TESTING
    scriptName: '[Stark] Mahogany Homes',
    timeout: 0,

    // Optional
    lastChatMessage: {
        type: '',
        name: '',
        message: ''
    },
    scriptInitialised: false,
    uiCompleted: false,

    // Script specific
    // contract: {} as Contract,
    contract:    {
        id: 10421,
        name: 'Jess',
        location: 'Ardougne',
        worldPoint: locationFunctions.coordsToWorldPoint([2621, 3292, 0]),
        hotspotIds: [40171, 40172, 40173, 40174, 40175, 40176, 40177, 40299],
        ladderIds: [17026, 16685]
    }, // TESTING

    contractType: 'beginner'
};

// Script locations
const scriptLocations = {
    faladorMahoganyHomes: locationFunctions.coordsToWorldPoint(locationCoords.falador.mahogany_homes),
};

// Core functions
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
        if (!state.uiCompleted) return;
        state.contractType = bot.bmCache.getString('contractType', 'Beginner');
        if (!generalFunctions.gameTick(state)) return;

        // Enable break if not banking, idle, not walking and the `mainState` is `walk_to_amy`.
        if (!bot.bank.isBanking() && bot.localPlayerIdle() && !bot.walking.isWebWalking() && state.mainState == 'walk_to_amy') bot.breakHandler.setBreakHandlerStatus(true);

        stateManager();
    } catch (error) {
        logger(state, 'all', 'Script', (error as Error).toString());
        bot.terminate();
    }
};
export const onChatMessage = (type: string, name: string, message: string) => generalFunctions.saveChatMessage(state, type, name, message);
export const onEnd = () => generalFunctions.endScript(state);

// Script functions
const stateManager = () => {
    logger(state, 'debug', `stateManager`, `${state.mainState}`);
    switch(state.mainState) {

        // Starting state of the script. Walk to Amy's house in Falador.
        case 'walk_to_amy': {
            if (!bot.localPlayerIdle() || bot.walking.isWebWalking()) break;
            if (!locationFunctions.webWalkTimeout(state, scriptLocations.faladorMahoganyHomes, 'Amy\'s house.', 200, 2)) break;
            if (!npcFunctions.npcExists(npcIds.falador.amy)) {
                generalFunctions.handleFailure(state, `stateManager: ${state.mainState}`, 'Unable to locate Amy.');
                break;
            }
            state.mainState = 'get_contract';
            break;
        }

        // Get contract from Any.
        case 'get_contract': { 

            // Interact with Amy.
            const amyNpc = npcFunctions.getFirstNpcByIds([npcIds.falador.amy]);
            if (!amyNpc) {
                generalFunctions.handleFailure(state, `stateManager (${state.mainState})`, 'Error locating Amy.', 'walk_to_amy');
                break;
            }
            if (!playerStateFunctions.isInDialogue()) {
                bot.npcs.interactSupplied(amyNpc, 'Contract');
                break;
            }

            // Check for contract type
            if (state.lastChatMessage.type.toString() == 'DIALOG') {
                const contract = state.lastChatMessage.message.toString().toLowerCase();
                const foundContract = contractData.find(npcContract => contract.includes(npcContract.name.toLowerCase()));
                if (foundContract) {
                    state.contract = foundContract;
                    // bot.bmGlobalCache.saveInt('contractNpcId', state.contract.id);
                    state.mainState = 'withdraw_materials';
                    break;
                }
            }

            // Handle dialogue options.
            // @ts-expect-error needs type fix
            if (bot.widgets.handleDialogue([
                `${state.contractType} Contract`,
                'Could I have a',
                'my current construction contract'
            ])) {
                state.timeout = 1;
                break;
            }
            break;
        }

        // Withdraw materials.
        case 'withdraw_materials': {
            state.mainState = 'walk_to_contract';
            break;
        }

        // Walk to contract location.
        case 'walk_to_contract': {
            if (!bot.localPlayerIdle() || bot.walking.isWebWalking()) break;
            if (!locationFunctions.webWalkTimeout(state, state.contract.worldPoint, `${state.contract.name} in ${state.contract.location}`, 120, 2)) break;
            state.mainState = 'build_furniture';
            break;
        }

        // Build furniture
        case 'build_furniture': {
            if (!bot.localPlayerIdle() || bot.walking.isWebWalking()) break;
            
            // Iterate hotspots to get actions and interact if furniture needs removing/repairing
            state.contract.hotspotIds.forEach(hotspotId => {

                // 3 = remove/repair. 4 = build. 5 = done
                const varbitId = objectFunctions.getVarbitIdFromArrays(hotspotVarbits, hotspotId);
                if (!varbitId) return // do something here




                bot.printGameMessage(`${hotspotId} - varbit - ${client.getVarbitValue(10558)}`)
                // const actions = tileFunctions.getAllActions(hotspotId);
                // let interactAction = '';
                // if (actions.includes('Repair')) interactAction = 'Repair';
                // if (actions.includes('Remove')) interactAction = 'Remove';
                // if (interactAction) {
                //     const hotspotTileObject = tileFunctions.getTileObjectById(hotspotId);
                //     if (hotspotTileObject) {
                //         bot.objects.interactSuppliedObject(hotspotTileObject, interactAction);
                //         state.timeout = 2;
                //     }
                // }
            });
            break;
        }

        // Speak to contract NPC.
        case 'speak_to_contract_npc': {
            break;
        }
    }
};