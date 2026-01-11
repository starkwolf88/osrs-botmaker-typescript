export type ItemCombinationData = {
    combined_item_name: string;
    combined_item_id: number,
    deposit_all: boolean;
    items: {
        id: number,
        name: string;
        quantity: number
    }[];
    make_widget_data?: {
        packed_widget_id: number;
        identifier: number;
        opcode: number;
        p0: number
    };
    timeout: number;
};

export const itemCombinationData = [
    {
        combined_item_name: 'pastry_dough',
        combined_item_id: 1953,
        deposit_all: true,
        items: [
            {
                id: 1937,
                name: 'jug_of_water',
                quantity: 9
            },
            {
                id: 1933,
                name: 'pot_of_flour',
                quantity: 9
            }
        ],
        make_widget_data:  {
            packed_widget_id: 17694736,
            identifier: 1,
            opcode: 57,
            p0: -1
        },
        timeout: 16
    },
    {
        combined_item_name: 'pie_shell',
        combined_item_id: 2315,
        deposit_all: true,
        items: [
            {
                id: 1953,
                name: 'pastry_dough',
                quantity: 14
            },
            {
                id: 2313,
                name: 'pie_dish',
                quantity: 14
            }
        ],
        make_widget_data:  {
            packed_widget_id: 17694735,
            identifier: 1,
            opcode: 57,
            p0: -1
        },
        timeout: 30
    }
];