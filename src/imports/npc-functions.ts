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
    getFirstNpc: (
        npcId: number // NPC ID to get.
    ): net.runelite.api.NPC | undefined => bot.npcs.getWithIds([npcId])[0],

    // Returns a boolean depending on whether an NPC is rendered.
    npcExists: (
        npcId: number // NPC ID to check against.
    ): boolean => bot.npcs.getWithIds([npcId]).some(npc => npc.getId() === npcId)
}; 