// Requirements
// ThePlug continue clicker OFF

// Function imports
import {logger} from 'src/imports/logger.js';
import {createUi} from './ui.js';
import {generalFunctions} from 'src/imports/general-functions.js';
import {locationFunctions} from 'src/imports/location-functions.js';
// import {utilityFunctions} from 'src/imports/utility-functions.js';
import {npcFunctions} from 'src/imports/npc-functions.js';
import {locationCoords} from 'src/imports/location-coords.js';
import {npcIds} from 'src/imports/npc-ids.js';
// import {timeoutManager} from 'src/imports/timeout-manager.js';
import {widgetData} from 'src/imports/widget-data.js';
import {widgetFunctions} from 'src/imports/widget-functions.js';

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
    mainState: 'walk_to_amy',
    scriptName: '[Stark] Mahogany Homes',
    timeout: 0,

    // Optional
    scriptInitialised: false,
    uiCompleted: false,

    // Script specific
    contract: false,
    contractType: 'beginner'
};

// Widget data
const scriptWidgets = {
    contractSelect: widgetData.dialogue.mahogany_homes.amy.select_contract
}

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

export const onEnd = () => generalFunctions.endScript(state);

const scriptLocations = {
    faladorMahoganyHomes: locationFunctions.coordsToWorldPoint(locationCoords.falador.mahogany_homes),
};

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

            // // Interact with Amy.
            // const amyNpc = npcFunctions.getFirstNpc(npcIds.falador.amy);
            // if (!amyNpc) throw new Error('NPC Amy cannot be found.');

            // // Contract select.
            // if (!widgetFunctions.widgetExists(scriptWidgets.contractSelect)) {
            //     bot.npcs.interactSupplied(amyNpc, 'Contract');
            //     if (!widgetFunctions.widgetTimeout(state, scriptWidgets.contractSelect)) break;
            // }
    
            // // @ts-expect-error needs type fix
            // if (bot.widgets.handleDialogue([
            //     `${state.contractType} Contract`,
            //     'Could I have a',
            //     'What\'s my current'
            // ])) {
            //     state.timeout = 1;
            //     break;
            // }

            

            break;   
        }
    }
};