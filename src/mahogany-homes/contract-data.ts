// Function imports
import {locationFunctions} from '../imports/location-functions.js';

// contractData
export const contractData = [

    // Ardougne
    {
        id: 10421,
        name: 'Jess',
        location: 'Ardougne',
        worldPoint: locationFunctions.coordsToWorldPoint([2621, 3292, 0]),
        hotspotIds: [40171, 40172, 40173, 40174, 40175, 40176, 40177, 40299],
        ladderIds: [17026, 16685]
    },
    {
        id: 10419,
        name: 'Noella',
        location: 'Ardougne',
        worldPoint: locationFunctions.coordsToWorldPoint([2659, 3322, 0]),
        hotspotIds: [40156, 40157, 40158, 40159, 40160, 40161, 40162, 40163],
        ladderIds: [17026, 16685, 15645, 15648]
    },
    {
        id: 10420,
        name: 'Ross',
        location: 'Ardougne',
        worldPoint: locationFunctions.coordsToWorldPoint([2612, 3316, 0]),
        hotspotIds: [40164, 40165, 40166, 40167, 40168, 40169, 40170],
        ladderIds: [16683, 16679]
    },

    // Falador
    {
        id: 10418,
        name: 'Larry',
        location: 'Falador',
        worldPoint: locationFunctions.coordsToWorldPoint([3038, 3364, 0]),
        hotspotIds: [40297, 40095, 40096, 40097, 40298, 40098, 40099],
        ladderIds: [24075, 24076]
    },
    {
        id: 3266,
        name: 'Norman',
        location: 'Falador',
        worldPoint: locationFunctions.coordsToWorldPoint([3038, 3344, 0]),
        hotspotIds: [40296, 40089, 40090, 40091, 40092, 40093, 40094],
        ladderIds: [24082, 24085]
    },
    {
        id: 10417,
        name: 'Tau',
        location: 'Falador',
        worldPoint: locationFunctions.coordsToWorldPoint([3047, 3345, 0]),
        hotspotIds: [40083, 40084, 40085, 40086, 40087, 40088, 40295],
        ladderIds: []
    },

    // Hosidious
    {
        id: 10424,
        name: 'Barbara',
        location: 'Hosidious',
        worldPoint: locationFunctions.coordsToWorldPoint([1750, 3534, 0]),
        hotspotIds: [40011, 40293, 40012, 40294, 40013, 40014, 40015],
        ladderIds: []
    },
    {
        id: 10423,
        name: 'Leela',
        location: 'Hosidious',
        worldPoint: locationFunctions.coordsToWorldPoint([1785, 3592, 0]),
        hotspotIds: [40007, 40008, 40290, 40291, 40009, 40010, 40292],
        ladderIds: [11794, 11802]
    },
    {
        id: 10422,
        name: 'Mariah',
        location: 'Hosidious',
        worldPoint: locationFunctions.coordsToWorldPoint([1766, 3621, 0]),
        hotspotIds: [40002, 40287, 40003, 40288, 40004, 40005, 40006, 40289],
        ladderIds: [11794, 11802]
    },

    // Varrock
    {
        id: 10414,
        name: 'Bob',
        location: 'Varrock',
        worldPoint: locationFunctions.coordsToWorldPoint([3238, 3486, 0]),
        hotspotIds: [39981, 39982, 39983, 39984, 39985, 39986, 39987, 39988],
        ladderIds: [11797, 11799]
    },
    {
        id: 10415,
        name: 'Jeff',
        location: 'Varrock',
        worldPoint: locationFunctions.coordsToWorldPoint([3239, 3450, 0]),
        hotspotIds: [39989, 39990, 39991, 39992, 39993, 39994, 39995, 39996],
        ladderIds: [11789, 11793]
    },
    {
        id: 10416,
        name: 'Sarah',
        location: 'Varrock',
        worldPoint: locationFunctions.coordsToWorldPoint([3235, 3384, 0]),
        hotspotIds: [39997, 39998, 39999, 40000, 40286, 40001],
        ladderIds: []
    }
];

export const hotspotVarbits = {
    10554: [39981, 39989, 39997, 40002, 40007, 40011, 40083, 40156, 40164, 40171, 40296, 40297],
    10555: [39982, 39990, 39998, 40008, 40084, 40089, 40095, 40157, 40165, 40172, 40287, 40293],
    10556: [39983, 39991, 39999, 40003, 40012, 40085, 40090, 40096, 40158, 40166, 40173, 40290],
    10557: [39984, 39992, 40000, 40086, 40091, 40097, 40159, 40167, 40174, 40288, 40291, 40294],
    10558: [39985, 39993, 40004, 40009, 40013, 40087, 40092, 40160, 40168, 40175, 40286, 40298],
    10559: [39986, 39994, 40001, 40005, 40010, 40014, 40088, 40093, 40098, 40161, 40169, 40176],
    10560: [39987, 39995, 40006, 40015, 40094, 40099, 40162, 40170, 40177, 40292, 40295],
    10561: [39988, 39996, 40163, 40289, 40299]
};