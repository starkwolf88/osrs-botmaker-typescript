export const npcFunctions = {

    // Gets the closest NPC with the specified ID.
    getClosestNpc: (
        npcId: number // NPC ID to get.
    ): net.runelite.api.NPC | undefined => {
        const npcs = bot.npcs.getWithIds([npcId]);
        if (npcs){
            let closestNpc = null;
            let minDistance = Number.MAX_VALUE;

            npcs.forEach(npc => {
                const distance = client.getLocalPlayer().getWorldLocation().distanceTo(npc.getWorldLocation());
                if (distance < minDistance) {
                    minDistance = distance;
                    closestNpc = npc;
                }
            });
    
            if (closestNpc) return closestNpc;
            return undefined;
        }
        return undefined;
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