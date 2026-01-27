export const playerStateFunctions = {

    // Return boolean condition depending on whether the player is in a cut scene
    isInCutscene: (): boolean => (client.getVarbitValue(542) > 0 || client.getVarbitValue(4606) > 0 || client.getVarbitValue(6719) > 0 || client.getVarbitValue(12139) > 0),

    // Return boolean condition depending on whether the player is in dialogue
    isInDialogue: (): boolean => {
        const dialogueWidgets = [
            [219, 1],
            [217, 0],
            [217, 5],
            [231, 6],
            [231, 5],
            [231, 6],
            [162, 41],
            [193, 0],
            [229, 2]
        ];
        for (const [group, child] of dialogueWidgets) {
            const widget = client.getWidget(group, child);
            if (widget && !widget.isHidden()) return true;
        }
        return false;
    }
}

