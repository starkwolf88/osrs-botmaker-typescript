import { logger } from "./logger.js";

export const timeoutManager = {
    conditions: [] as Array<{
        conditionFunction: () => boolean;
        maxTicks: number;
        ticksWaited: number;
        onFail?: () => void;
    }>,

    globalFallback: undefined as (() => void) | undefined,
    globalFallbackThreshold: 60,
    globalTicksWaited: 0,

    addCondition({
        conditionFunction,
        maxTicks,
        onFail
    }: {
        conditionFunction: () => boolean;
        maxTicks: number;
        onFail?: (() => void) | string;
    }): void {
        const failCallback = typeof onFail === 'string' ? () => logger('both', 'Timeout', onFail) : onFail;
        this.conditions.push({
            conditionFunction,
            maxTicks,
            ticksWaited: 0,
            onFail: failCallback
        });
    },

    tick(): void {
        this.conditions = this.conditions.filter(condition => {
            const result = condition.conditionFunction();
            if (!result) {
                condition.ticksWaited++;
                if (condition.ticksWaited >= condition.maxTicks) {
                    if (condition.onFail) condition.onFail();
                    return false;
                }
                return true;
            }
            return false;
        });

        if (this.conditions.length > 0) {
            this.globalTicksWaited++;
            if (this.globalTicksWaited >= this.globalFallbackThreshold && this.globalFallback) {
                this.globalFallback();
                this.globalTicksWaited = 0;
            }
        } else {
            this.globalTicksWaited = 0;
        }
    },

    // Returns true if there are any unresolved conditions
    isWaiting(): boolean {
        return this.conditions.length > 0;
    }
};