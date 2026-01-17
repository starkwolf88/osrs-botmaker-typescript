// Function imports
import {logger} from 'src/imports/logger.js';
import {createUi} from './ui.js';
import {generalFunctions} from 'src/imports/general-functions.js';
import {locationFunctions} from 'src/imports/location-functions.js';
import {utilityFunctions} from 'src/imports/utility-functions.js';
import {npcFunctions} from 'src/imports/npc-functions.js';
import {locationCoords} from 'src/imports/location-coords.js';
import {npcIds} from 'src/imports/npc-ids.js';
import {timeoutManager} from 'src/imports/timeout-manager.js';
import {widgetData} from 'src/imports/widget-data.js';
import {widgetFunctions} from 'src/imports/widget-functions.js';

// Variables
const state = {
    scriptName: '[Stark] Mahogany Homes',
    main_state: 'walk_to_amy',
    sub_state: 'default',
    antibanTriggered: false,
    gameTick: 0,
    timeout: 0,
    uiCompleted: false,
    contract: undefined,
    contractType: 'beginner',
    antibanEnabled: true,
    debugEnabled: false,
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
        if (!state.uiCompleted) return;
        state.contractType = bot.bmCache.getString('contractType', 'Beginner');
        generalFunctions.gameTick(state);
        stateManager();
    } catch (error) {
        logger(state, 'all', 'Script', (error as Error).toString());
        bot.terminate();
    }
};

export const onEnd = () => generalFunctions.endScript(state);

const scriptLocations = {
    startLocation: utilityFunctions.coordsToWorldPoint(locationCoords.falador.mahogany_homes),
};

const stateManager = () => {
    logger(state, 'debug', `stateManager: ${state.main_state}.${state.sub_state}`, `Function start.`);

    // Determine curren state.
    switch(state.main_state) {

        // Starting state of the script. Walk to Amy's house in Falador.
        case 'walk_to_amy': {
            if (!bot.localPlayerIdle() || bot.walking.isWebWalking()) break;

            // Is player is at start point of Amy's house and Amy is rendered.
            const isPlayerAtStartLocation = () => locationFunctions.isPlayerNearWorldPoint(scriptLocations.startLocation) && npcFunctions.npcExists(npcIds.falador.amy);
            if (!isPlayerAtStartLocation()) {
                logger(state, 'all', `stateManager: ${state.main_state}.${state.sub_state}`, 'Walking to Amy in Falador.');
                bot.walking.webWalkStart(scriptLocations.startLocation);
                timeoutManager.add({
                    state,
                    conditionFunction: () => isPlayerAtStartLocation(),
                    maxWait: 200,
                    onFail: () => {throw new Error('Unable to locate Amy in Falador after 200 ticks.')}
                });
                break;
            }

            logger(state, 'debug', `stateManager: ${state.main_state}.${state.sub_state}`, 'Player is at start location.');
            state.main_state = 'get_contract';
            break;
        }

        // Get contract from Any.
        case 'get_contract': {

            // Sub state
            switch(state.sub_state) {
                case 'default': {

                    // Interact with Amy.
                    const isContractSelectVisible = () => widgetFunctions.widgetExists(widgetData.dialogue.mahogany_homes.amy.select_contract.identifier)
                    if (!isContractSelectVisible()) {
                        logger(state, 'debug', `stateManager: ${state.main_state}.${state.sub_state}`, `Getting a {state.contractType} contract from Amy.`);
                        // const amyNpc = npcFunctions.getFirstNpc(npcIds.falador.amy);
                        // if (!amyNpc) throw new Error('NPC Amy cannot be found.');
                        // bot.npcs.interactSupplied(amyNpc, 'Contract');
                        // state.timeout.conditions.push(state.start.isContractSelectVisible);
                        // return;
                    }
                }
            }
        }
    }
};