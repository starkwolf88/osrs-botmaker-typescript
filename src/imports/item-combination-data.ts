export type ItemCombinationData = {
    combined_item_name: string,
    combined_item_id: number,
    deposit_all: boolean,
    items: {
        id: number,
        name: string,
        quantity: number
    }[],
    make_widget_data?: {
        packed_widget_id: number,
        identifier: number;
        opcode: number;
        p0: number
    },
    timeout: number
};

// Timeouts
const timeouts = {
    unstrungBows: 82
};

export const itemCombinationData = [
    {
        combined_item_name: 'Pastry dough',
        combined_item_id: 1953,
        deposit_all: true,
        items: [
            {
                id: 1937,
                name: 'Jug of water',
                quantity: 9
            },
            {
                id: 1933,
                name: 'Pot of flour',
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
        combined_item_name: 'Pie shell',
        combined_item_id: 2315,
        deposit_all: true,
        items: [
            {
                id: 1953,
                name: 'Pastry dough',
                quantity: 14
            },
            {
                id: 2313,
                name: 'Pie dish',
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
    },
    {
        combined_item_name: 'Maple longbow (u)',
        combined_item_id: 62,
        deposit_all: false,
        items: [
            {
                id: 946,
                name: 'Knife',
                quantity: 1
            },
            {
                id: 1517,
                name: 'Maple logs',
                quantity: 27
            }
        ],
        make_widget_data:  {
            packed_widget_id: 17694737,
            identifier: 1,
            opcode: 57,
            p0: -1
        },
        timeout: timeouts.unstrungBows
    }
];