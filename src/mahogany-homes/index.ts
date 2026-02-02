// Requirements
// ThePlug continue clicker OFF

// Data imports
import {contractData, contractDefault, hotspotVarbits} from './contract-data.js';
import {locationCoords} from 'src/imports/location-coords.js';
import {npcIds} from 'src/imports/npc-ids.js';

// Function imports
import {createUi} from './ui.js';
import {generalFunctions} from 'src/imports/general-functions.js';
import {locationFunctions} from 'src/imports/location-functions.js';
import {logger} from 'src/imports/logger.js';
import {npcFunctions} from 'src/imports/npc-functions.js';
import {objectFunctions} from '../imports/object-functions.js';
import {playerStateFunctions} from '../imports/player-state-functions.js';
import {tileFunctions} from '../imports/tile-functions.js';

// Type imports
import {Contract} from '../imports/types.js';

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
    // mainState: 'walk_to_amy', // TESTING
    mainState: 'walk_to_contract',
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
    contract: contractDefault as Contract,
    // contract: {
    //     id: 10423,
    //     name: 'Leela',
    //     location: 'Hosidious',
    //     worldPoint: locationFunctions.coordsToWorldPoint([1787, 3591, 0]),
    //     hotspotIds: [40007, 40008, 40290, 40291, 40009, 40010, 40292],
    //     ladderIds: {
    //         lower: 11794,
    //         upper: 11802
    //     },
    //     currentFloor: 'lower'
    // }, // TESTING
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

export const onChatMessage = (type: string, name: string, message: string) => {
    bot.printLogMessage(`${type} - ${name} - ${message}`) // TESTING
    if (type.toString() == 'DIALOG') contractCheck(message);
}

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
            
            generalFunctions.handleFailure(state, `stateManager (${state.mainState})`, 'Error getting contract.', 'walk_to_amy');
            break;
        }

        // Withdraw materials.
        case 'withdraw_materials': {
            if (!bot.localPlayerIdle() || bot.walking.isWebWalking()) break;


            // 1 steel bar
            // 17 planks
            // 18 empty inventory spaces required, or terminate

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
            const validVarbitValues = new Set<number>([1, 3, 4]); // 1 = Repair, 3 = Remove, 4 = Build

            // Get hotspot tile objects.
            const hotspotTileObjects = tileFunctions.getTileObjectsByIds(state.contract.hotspotIds);
            if (!hotspotTileObjects) {
                generalFunctions.handleFailure(state, `stateManager (${state.mainState})`, 'Error getting hotspot tile objects.', 'walk_to_amy');
                break;
            }

            // Filter hotspots that can be interacted with.
            const validHotspots = hotspotTileObjects.filter(object => {
                const varbitId = objectFunctions.getVarbitIdFromArrays(hotspotVarbits, object.getId());
                if (!varbitId) return false;
                return validVarbitValues.has(client.getVarbitValue(varbitId));
            });

            // If no valid hotspots, navigate ladder or finish contract.
            if (validHotspots.length === 0) {
                state.mainState = 'current_floor_check';
                break;
            }

            // Get closest hotspot.
            const closestHotspot = bot.objects.getClosest(validHotspots);
            if (!closestHotspot) {
                generalFunctions.handleFailure(state, `stateManager (${state.mainState})`, 'Error getting closest hotspot object.', 'walk_to_contract');
                break;
            }

            // Get closest hotspot varbit ID.
            const varbitId = objectFunctions.getVarbitIdFromArrays(hotspotVarbits, closestHotspot.getId());
            if (!varbitId) {
                generalFunctions.handleFailure(state, `stateManager (${state.mainState})`, 'Error getting varbit ID for closest hotspot object.', 'walk_to_contract');
                break;
            }
            const varbitValue = client.getVarbitValue(varbitId);
            if (varbitValue === 4) { // 4 = Build
                bot.objects.interactSuppliedObject(closestHotspot, 'Build');
                state.timeout = 2;
                break;
            }
            if (varbitValue === 1) { // 1 = Repair
                bot.objects.interactSuppliedObject(closestHotspot, 'Repair');
                state.timeout = 2;
                break;
            }
            if (varbitValue === 3) { // 3 = Remove
                bot.objects.interactSuppliedObject(closestHotspot, 'Remove');
                state.timeout = 2;
                break;
            }

            generalFunctions.handleFailure(state, `stateManager (${state.mainState})`, 'Error building furniture contract.', 'walk_to_amy');
            break;
        }

        // Current floor check. Navigate ladder or finish contract.
        case 'current_floor_check': {
            if (!bot.localPlayerIdle() || bot.walking.isWebWalking()) break;

            // If the contract doesn't have ladders, go to `finish_contract` state.
            if (!state.contract.ladderIds) {
                state.mainState = 'finish_contract';
                break;
            }
               
            // If on the lower floor, interact with lower ladder
            if (state.contract.currentFloor == 'lower') {
                if (state.contract.ladderIds.lower) {
                    const ladderTileObject = tileFunctions.getTileObjectById(state.contract.ladderIds.lower)
                    if (!ladderTileObject) {
                        generalFunctions.handleFailure(state, `stateManager (${state.mainState})`, 'Error getting ladder tile object.', 'walk_to_contract');
                        break;
                    }
                    bot.objects.interactSuppliedObject(ladderTileObject, 'Climb-up');
                }
            } else {
                //
            }

            bot.printGameMessage('NAVIGATE LADDER');
            break;
        }

        // Speak to contract NPC.
        case 'finish_contract': {
            if (!bot.localPlayerIdle() || bot.walking.isWebWalking()) break;
            bot.printGameMessage('FINISH CONTRACT')

            // interact NPC

            // Handle dialogue options.
            // @ts-expect-error needs type fix
            if (bot.widgets.handleDialogue([
                'finished with the work you wanted',
                'would you like a cup of tea before you go'
            ])) {
                state.timeout = 1;
                break;  
            }

            // @ts-expect-error needs type fix
            if (bot.widgets.handleDialogue(['love a cuppa'])) {
                state.timeout = 2;
                state.mainState = 'walk_to_amy';
                bot.bmCache.saveInt('contractNpcId', 0);
                state.contract = contractDefault;
                break;
            }

            generalFunctions.handleFailure(state, `stateManager (${state.mainState})`, 'Error finishing contract.', 'walk_to_contract');
            break;
        }
    }
};

const contractCheck = (chatMessage: string) => {
    const chatMessageLower = chatMessage.toString().toLowerCase();
    const foundContract = contractData.find(npcContract => chatMessageLower.includes(npcContract.name.toLowerCase()));
    if (foundContract) {
        // state.contract = foundContract;
        state.mainState = 'withdraw_materials';
        bot.bmCache.saveInt('contractNpcId', state.contract.id);
    }
};