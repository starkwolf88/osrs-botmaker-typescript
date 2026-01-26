export const npcFunctions = {

    // Gets the closest NPC with the specified ID.
    getClosestNpc: (
        npcIds: number[]
    ): net.runelite.api.NPC | undefined => {
        const npcs = bot.npcs.getWithIds(npcIds);
        if (!npcs?.length) return undefined;
        let closest: net.runelite.api.NPC | null = null;
        let min = Number.POSITIVE_INFINITY;
        npcs.forEach(npc => {
            const d = client.getLocalPlayer().getWorldLocation().distanceTo(npc.getWorldLocation());
            if (d < min) min = d, closest = npc;
        });
        return closest || undefined;
    },

    // Returns the first NPC with the specified NPC ID.
    getFirstNpcByIds: (npcIds: number[]): net.runelite.api.NPC | false => {
        const npcsByIds = bot.npcs.getWithIds(npcIds);
        if (npcsByIds.length > 0) return npcsByIds[0]
        return false;
    },

    // Returns the first NPC with the specified name.
    getFirstNpcByNames: (npcNames: string[]): net.runelite.api.NPC | false => {
        const npcsByIds = bot.npcs.getWithNames(npcNames);
        if (npcsByIds.length > 0) return npcsByIds[0]
        return false;
    },

    // Returns a boolean depending on whether an NPC is rendered.
    npcExists: (npcId: number): boolean => bot.npcs.getWithIds([npcId]).some(npc => npc.getId() === npcId)
}; 