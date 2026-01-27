// Data imports
import {locationCoords} from '../imports/location-coords.js';
import {objectIds} from '../imports/object-ids.js';

// Function imports
import {locationFunctions} from '../imports/location-functions.js';

// herbPatchData
export const herbPatchData = [
    {
        id: objectIds.ardougne.herb_patch,
        name: 'Ardougne',
        enabled: bot.variables.getBooleanVariable('Ardougne'),
        worldPoint: locationFunctions.coordsToWorldPoint(locationCoords.ardougne.herb_patch),
        inProgress: false,
        composted: false,
        completed: false
    },
    {
        id: objectIds.catherby.herb_patch,
        name: 'Catherby',
        enabled: bot.variables.getBooleanVariable('Catherby'),
        worldPoint: locationFunctions.coordsToWorldPoint(locationCoords.catherby.herb_patch),
        inProgress: false,
        composted: false,
        completed: false,
    },
    {
        id: objectIds.falador.herb_patch,
        name: 'Falador',
        enabled: bot.variables.getBooleanVariable('Falador'),
        worldPoint: locationFunctions.coordsToWorldPoint(locationCoords.falador.herb_patch),
        inProgress: false,
        composted: false,
        completed: false
    },
    {
        id: objectIds.farming_guild.herb_patch,
        name: 'Farming Guild',
        enabled: bot.variables.getBooleanVariable('Farming Guild'),
        worldPoint: locationFunctions.coordsToWorldPoint(locationCoords.farming_guild.herb_patch),
        inProgress: false,
        composted: false,
        completed: false
    },
    {
        id: objectIds.hosidious.herb_patch,
        name: 'Hosidious',
        enabled: bot.variables.getBooleanVariable('Hosidious'),
        worldPoint: locationFunctions.coordsToWorldPoint(locationCoords.hosidious.herb_patch),
        inProgress: false,
        composted: false,
        completed: false
    },
    {
        id: objectIds.morytania.herb_patch,
        name: 'Morytania',
        enabled: bot.variables.getBooleanVariable('Morytania'),
        worldPoint: locationFunctions.coordsToWorldPoint(locationCoords.morytania.herb_patch),
        inProgress: false,
        composted: false,
        completed: false
    },
    {
        id: objectIds.varlamore.herb_patch,
        name: 'Varlamore',
        enabled: bot.variables.getBooleanVariable('Varlamore'),
        worldPoint: locationFunctions.coordsToWorldPoint(locationCoords.varlamore.herb_patch),
        inProgress: false,
        composted: false,
        completed: false
    }
];