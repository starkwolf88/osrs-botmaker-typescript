// Function imports
import {generalFunctions} from 'src/imports/general-functions.js';
import {locationFunctions} from 'src/imports/location-functions.js';
import {logger} from 'src/imports/logger.js';
import {utilityFunctions} from '../imports/utility-functions.js';

// Variables
const state = {

    // Core
    antibanEnabled: bot.variables.getBooleanVariable('Antiban Random AFKs'),
    antibanTriggered: false,
    debugEnabled: bot.variables.getBooleanVariable('Debug Enabled'),
    debugFullState: false,
    failureCounts: {},
    gameTick: 0,
    mainState: 'get_skill_levels',
    scriptName: '[Stark] F2P Woodcut Firemaking',
    timeout: 0,

    // Script specific
    trees_to_chop: 'normal_trees'
};

// Script locations
const scriptLocations = {
    normal_trees: locationFunctions.coordsToWorldPoint([3181, 3330, 0]),
    oak_trees: locationFunctions.coordsToWorldPoint([3195, 3323, 0]),
    burnLocations: [
        locationFunctions.coordsToWorldPoint([3195, 3328, 0]),
        locationFunctions.coordsToWorldPoint([3186, 3334, 0]),
        locationFunctions.coordsToWorldPoint([3196, 3323, 0]),
        locationFunctions.coordsToWorldPoint([3188, 3338, 0]),
        locationFunctions.coordsToWorldPoint([3189, 3325, 0]),
        locationFunctions.coordsToWorldPoint([3193, 3333, 0])
    ]
};

// Core functions
export const onStart = () => logger(state, 'all', 'Script', `Starting ${state.scriptName}.`);

export const onGameTick = () => {

    // Breaks disabled
    bot.breakHandler.setBreakHandlerStatus(false);

    try {
        if (!generalFunctions.gameTick(state)) return;

        // Enable break if not banking, idle, not walking and the `mainState` is `walk_to_amy`.
        if (bot.localPlayerIdle() && !bot.walking.isWebWalking()) bot.breakHandler.setBreakHandlerStatus(true);

        stateManager();
    } catch (error) {
        logger(state, 'all', 'Script', (error as Error).toString());
        bot.terminate();
    }
};

export const onEnd = () => generalFunctions.endScript(state);

export const onChatMessage = (type: string, name: string, message: string) => {
    if (type.toString() == 'GAMEMESSAGE' && message == 'You can\'t light a fire here.') locationFunctions.webWalkTimeout(state, getRandomBurnLocation(), 'Burn start location', 120, 1)
    if (type.toString() == 'GAMEMESSAGE' && message == 'I can\'t reach that!') state.mainState = 'walk_to_trees';
}

// Script functions
const stateManager = () => {
    logger(state, 'debug', `stateManager`, `${state.mainState}`);
    switch(state.mainState) {
        case 'get_skill_levels': {
            const firemakingLevel = client.getRealSkillLevel(net.runelite.api.Skill['FIREMAKING']);
            const woodcuttingLevel = client.getRealSkillLevel(net.runelite.api.Skill['WOODCUTTING']);
            if (firemakingLevel >= bot.variables.getIntVariable('Firemaking Goal Level')) {
                logger(state, 'all', `stateManager: get_skill_levels`, 'Firemaking goal level reached. Stopping script.');
                bot.terminate();
                break;
            }
            if (woodcuttingLevel >= bot.variables.getIntVariable('Woodcutting Goal Level')) {
                logger(state, 'all', `stateManager: get_skill_levels`, 'Woddcutting goal level reached. Stopping script.');
                bot.terminate();
                break;
            }
            if (firemakingLevel >= 15 && woodcuttingLevel >= 15) state.trees_to_chop = 'oak_trees';
            state.mainState = 'chop_trees';
            break;
        }
        case 'chop_trees': {
            if (!bot.localPlayerIdle() || bot.walking.isWebWalking()) break;
            
            // Reset back to tree chopping location if not within 8 tiles.
            let treeLocation = scriptLocations.normal_trees;
            if (state.trees_to_chop == 'oak_trees') treeLocation = scriptLocations.oak_trees;
            if (!locationFunctions.isPlayerNearWorldPoint(treeLocation, 8)) {
                state.mainState = 'walk_to_trees';
                break;
            }

            if (!bot.inventory.isFull()) {
                let trees = bot.objects.getTileObjectsWithIds([1278]);
                if (state.trees_to_chop == 'oak_trees') trees = bot.objects.getTileObjectsWithIds([10820]);
                const closestTree = bot.objects.getClosest(trees) 
                if (!closestTree) {
                    state.mainState = 'walk_to_trees';
                    break;
                }
                bot.objects.interactSuppliedObject(closestTree, 'Chop down');
                state.timeout = 4;
                break;
            }
            state.mainState = 'burn_logs';
            break;
        }
        case 'walk_to_trees': {
            if (bot.inventory.getEmptySlots() < 10) {
                state.mainState = 'burn_logs';
                break;
            }
            if (!bot.localPlayerIdle() || bot.walking.isWebWalking()) break;
            let treeLocation = scriptLocations.normal_trees;
            if (state.trees_to_chop == 'oak_trees') treeLocation = scriptLocations.oak_trees;
            if (!locationFunctions.webWalkTimeout(state, treeLocation, 'Tree chopping location', 200, 5)) break;
            state.mainState = 'chop_trees';
            break;
        }
        case 'burn_logs': {
            if (!bot.localPlayerIdle() || bot.walking.isWebWalking()) break;

            // Randomly stop burning when X left
            if ((utilityFunctions.randomInt(1, 1000) <= 10) && (utilityFunctions.randomInt(18, 28) > bot.inventory.getEmptySlots())) {
                state.mainState = 'get_skill_levels';
                break;
            }

            if (bot.inventory.containsId(1511)) {
                bot.inventory.itemOnItemWithIds(590, 1511);
                state.timeout = 1;
                break;
            }
            if (bot.inventory.containsId(1521)) {
                bot.inventory.itemOnItemWithIds(590, 1521);
                state.timeout = 1;
                break;
            }
            state.mainState = 'get_skill_levels';
            break;
        }
        default: {
            state.mainState = 'get_skill_levels';
            break;
        }
    }
};

const getRandomBurnLocation = () => scriptLocations.burnLocations[Math.floor(Math.random() * scriptLocations.burnLocations.length)];