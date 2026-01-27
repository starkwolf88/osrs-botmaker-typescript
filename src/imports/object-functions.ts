export const objectFunctions = {
    getVarbitIdFromArrays: (
        object: Record<number, number[]>,
        value: number
    ): number | undefined => {
        for (const [key, array] of Object.entries(object)) {
            if (array.includes(value)) return Number(key);
        }
        return undefined;
    }
};
