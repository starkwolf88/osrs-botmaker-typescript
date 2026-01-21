export const utilityFunctions = {

    // Returns a title cased string.
    convertToTitleCase: (
        stringToConvert: string, // String to convert to title case.
    ): string => stringToConvert.toLowerCase().split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),

    // Find value in array of objects that matches the values provided.
    getObjectByValues: <
        T extends object,
        Match extends Partial<T>
    >(
        array: readonly T[],
        match: Match
    ): T | false => {
        const item = array.find(object => (Object.entries(match) as [keyof T, T[keyof T]][]).every(([k, v]) => object[k] === v));
        return item ?? false;
    },

    // Sets values against an array of objects.
    setArrObjValues: <
        T extends object,
        Match extends Partial<T>,
        Set extends Partial<T>
    >(
        array: T[],
        match: Match,
        setValues: Set
    ): boolean => {
        const object = array.find(item =>
            (Object.entries(match) as [keyof T, T[keyof T]][])
            .every(([k, v]) => v !== false && item[k] === v)
        )
        if (!object) return false
        Object.entries(setValues).forEach(([k, v]) => {
            object[k as keyof T] = v as T[keyof T]
        })
        return true
    },

    // Return random integer from between two integers.
    randomInt: (
        min: number, // Minimum integer to calculate from.
        max: number // Maximum integer to calculate to.
    ): number => Math.floor(Math.random() * (max - min + 1)) + min
};