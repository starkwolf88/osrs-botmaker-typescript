// Function impots
import {
    addStartButton,
    createMainPanel,
    createBasicWindow,
    createDropdown
} from '../imports/ui-functions.js';

// Colour scheme
const colorScheme = {
    BACKGROUND: new java.awt.Color(0x000A30),
    PANEL: new java.awt.Color(0x010014),
    ACCENT: new java.awt.Color(0x060254),
    TEXT: new java.awt.Color(0xFFFFFF),
};

// Create the UI.
export const createUi = (
    state: {
        scriptName: string,
        uiCompleted: boolean
    }
): any => {

    // Create main window.
    const {frame, panel} = createBasicWindow(
        state.scriptName,
        325,
        150,
        new java.awt.BorderLayout(),
    );

    // Set background color
    panel.setBackground(colorScheme.BACKGROUND);

    // Main panel
    const mainPanel = createMainPanel(colorScheme, 'Combination Selection');

    // Combination dropdown menu
    const combinationDropdown = createDropdown(
        'Item to Make',
        'itemCombination',
        [
            'Maple longbow (u)',
            'Pastry dough',
            'Pie shell',
            'Ultracompost'
        ],
        'Maple longbow (u)',
        colorScheme.TEXT,
    );
    mainPanel.add(combinationDropdown.panel, java.awt.BorderLayout.CENTER);

    // Add start button.
    addStartButton(state, frame, panel, colorScheme);

    // Add main panel to main window.
    panel.add(mainPanel, java.awt.BorderLayout.CENTER);
    panel.revalidate();
    panel.repaint();
    return frame;
};