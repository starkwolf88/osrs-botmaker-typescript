export const utilityFunctions = {

    // Returns a title cased string.
    convertToTitleCase: (
        stringToConvert: string, // String to convert to title case.
    ): string => stringToConvert.toLowerCase().split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),

    // Returns WorldPoint converted from coords.
    coordsToWorldPoint: ([x, y, z]: [number, number, number]): net.runelite.api.coords.WorldPoint => new net.runelite.api.coords.WorldPoint(x, y, z),

    // Return random integer from between two integers.
    randomInt: (
        min: number, // Minimum integer to calculate from.
        max: number // Maximum integer to calculate to.
    ): number => Math.floor(Math.random() * (max - min + 1)) + min
};