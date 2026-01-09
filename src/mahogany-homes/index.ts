/** IMPORTS **/
import {logger} from 'src/imports/logger.js';
import {generalFunctions} from 'src/imports/general-functions.js';
import {locationFunctions} from 'src/imports/location-functions.js';
import {utilityFunctions} from 'src/imports/utility-functions.js';
import {npcFunctions} from 'src/imports/npc-functions.js';
import {locationCoords} from 'src/imports/location-coords.js';
import {npcIds} from 'src/imports/npc-ids.js';
import {widgetData} from 'src/imports/widget-data.js';
import {widgetFunctions} from 'src/imports/widget-functions.js';


/** VARIABLES **/
// GUI
// const contractType = {
//     beginner: bot.variables.getBooleanVariable('Beginner'),
//     novice: bot.variables.getBooleanVariable('Novice'),
//     intermediate: bot.variables.getBooleanVariable('Intermediate'),
//     expert: bot.variables.getBooleanVariable('Expert'),
// };

// Immutable
const scriptName = '[Stark] Mahogany Homes';
const scriptLocations = {
    startLocation: utilityFunctions.coordsToWorldPoint(locationCoords.falador.mahogany_homes),
};

// Mutable
const state = {
    contract: null,

    // Timeouts
    timeout: {
        value: 0,
        conditions: [] as Array<() => boolean>,
        isConditionsMet: (): boolean => state.timeout.conditions.every(condition => condition())
    },

    // State checks for timeout conditions.
    start: {
        isPlayerAtStartLocation: (): boolean =>
            !bot.walking.isWebWalking() && // Player not web walking.
            locationFunctions.isPlayerWithinWorldPointTileThreshold(scriptLocations.startLocation) && // Player at start location.
            npcFunctions.npcExists(npcIds.FALADOR.AMY), // Amy is rendered.
        isContractSelectVisible: (): boolean => widgetFunctions.widgetExists(widgetData.dialogue.mahogany_homes.amy.select_contract.identifier)
    }
};

/** BOTMAKER FUNCTIONS **/
// Script start logic.
const onStart = () => logger('both', 'onStart', `Starting ${scriptName}.`)

// Game tick logic. Every 0.6s.
const onGameTick = () => {
    bot.breakHandler.setBreakHandlerStatus(false);

    // Return until timeout 0.
    if (state.timeout.value > 0) {
        state.timeout.value--;
        return;
    }

    // Return if any timeout functions are being waited on.
    if (!state.timeout.isConditionsMet()) return;

    // Only break when timeout functions not being waited on.
    bot.breakHandler.setBreakHandlerStatus(true);

    // Reset timeout states.
    state.timeout.conditions = [];

    // State manager.
    try {
        stateManager();
    } catch (error) {
        logger('both', 'onGameTick', (error as Error).toString())
        bot.terminate();
    }
}

// Script end logic.
const onEnd = () => generalFunctions.endScript(scriptName);


/** SCRIPT FUNCTIONS **/
// State management - main script functionality.
const stateManager = () => {

    // Get a new contract if contract is not set.
    if (!state.contract) getContract();

    // walk to bank if planks/bars required
        // fill plan sack if in inventory
    // go to location
    // build furniture
    // speak to person and drink tea
};

// Get new contract from Amy in Falador.
const getContract = () => {

    // Walk to start location.
    if (!state.start.isPlayerAtStartLocation()) {
        logger('log', 'getContract', 'Walking to start location at Amy\'s house in Falador.');
        state.timeout.conditions.push(state.start.isPlayerAtStartLocation);
        bot.walking.webWalkStart(scriptLocations.startLocation);
        return;
    }

    // Select a contract
    if (!state.start.isContractSelectVisible()) {
        logger('log', 'getContract', 'Interact with Amy and select contract.');
        const amyNpc = npcFunctions.getFirstNpc(npcIds.FALADOR.AMY);
        if (!amyNpc) throw new Error('NPC Amy cannot be found.');
        bot.npcs.interactSupplied(amyNpc, 'Contract');
        state.timeout.conditions.push(state.start.isContractSelectVisible);
        return;
    }

    state.timeout.value = 1000 // TESTING PAUSE
};


/*** REMOVE FROM CONVERTED JS */
onStart();
onGameTick();
onEnd();
/*** REMOVE FROM CONVERTED JS */