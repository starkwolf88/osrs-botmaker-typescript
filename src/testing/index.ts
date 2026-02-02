export const onStart = () => {
    // const npcsByNames = bot.npcs.getWithNames(["Dantaera"])
    // if (npcsByNames.length > 0) {
    //     bot.printGameMessage(npcsByNames[0].getName())
    // }
};

type KeyFunction<T> = (current: T) => string;
type NeighbourFunction<T> = (current: T) => T[];
type SkipFunction<T> = (current: T, target: T) => boolean;
type BlockFunction<T> = (current: T) => boolean;
type CheckFunction<T> = (current: T, neighbor: T) => boolean;

export function bfs<T>(
    target: T,
    queue: T[],
    result: T[],
    keyFunction: KeyFunction<T>,
    neighbourFunction: NeighbourFunction<T>,
    skipFunction?: SkipFunction<T>,
    blockFunction?: BlockFunction<T>,
    checkFunction?: CheckFunction<T>
): T[] {
    const visited = new Set<string>();

    if (!keyFunction || !neighbourFunction) {
        // error
        return result;
    }

    const skip: SkipFunction<T>  = skipFunction  ?? (() => false);
    const block: BlockFunction<T> = blockFunction ?? (() => false);
    const check: CheckFunction<T> = checkFunction ?? (() => true);
    const max = 300;
    let iter = 0;
    let qi = 0;

    while (qi < queue.length && ++iter < max) {
        const current = queue[qi++];
        const key = keyFunction(current);

        if (visited.has(key) || skip(current, target)) continue;
        visited.add(key);
        if (!block(current)) result.push(current);

        const neighbors = neighbourFunction(current);
        for (const n of neighbors) {
            if (check(current, n)) queue.push(n);
        }
    }

    return result;
}