export type RawItemCombinationData = {
    combined_item: string;
    deposit_all: boolean;
    items: {
        name: string;
        quantity: number
    }[];
    make_widget_data?: {
        packed_widget_id: number;
        id: number;
        opcode: number;
        p0: number
    };
    timeout: number;
};

export const itemCombinationData = [
    {
        combined_item: 'pastry_dough',
        deposit_all: true,
        items: [
            {name: 'jug_of_water', quantity: 9},
            {name: 'pot_of_flour', quantity: 9}
        ],
        make_widget_data:  {
            packed_widget_id: 17694736,
            id: 1,
            opcode: 57,
            p0: -1
        },
        timeout: 16
    },
    {
        combined_item: 'pie_shell',
        deposit_all: true,
        items: [
            {name: 'pie_dish', quantity: 14},
            {name: 'pastry_dough', quantity: 14}
        ],
        timeout: 30
    }
];