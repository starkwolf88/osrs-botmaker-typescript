export const npcFunctions = {

    // Returns the first NPC with the specified NPC ID.
    getFirstNpc: (
        npcId: number // NPC ID to get.
    ): net.runelite.api.NPC | undefined => bot.npcs.getWithIds([npcId])[0],

    // Returns a boolean depending on whether an NPC is rendered.
    npcExists: (
        npcId: number // NPC ID to check against.
    ): boolean => bot.npcs.getWithIds([npcId]).some(npc => npc.getId() === npcId)
}; 