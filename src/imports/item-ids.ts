export type ItemId = keyof typeof itemIds;

export const itemIds = {
    pastry_dough: 1953,
    pie_dish: 2313,
    pie_shell: 2315,
    pot_of_flour: 1933,
    jug_of_water: 1937
} as const;