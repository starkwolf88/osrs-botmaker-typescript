export type ItemId = keyof typeof itemIds;

export const itemIds = {
    butterfly_jar: 10012,
    pastry_dough: 1953,
    pie_dish: 2313,
    pie_shell: 2315,
    pot_of_flour: 1933,
    snowy_knight: 10016,
    jug_of_water: 1937
} as const;