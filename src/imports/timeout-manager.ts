// Function imports
import {logger} from './logger.js';

// Type imports
import {State} from './types.js';

// timeoutManager
export const timeoutManager = {
    conditions: [] as Array<{
        conditionFunction: () => boolean;
        maxWait: number;
        ticksWaited: number;
        ticksDelayed: number;
        onFail?: () => void;
    }>,
    globalFallback: undefined as (() => void) | undefined,
    globalFallbackThreshold: 60,
    globalTicksWaited: 0,

    add({
        state,
        conditionFunction,
        maxWait,
        onFail,
        initialTimeout = 0
    }: {
        state: State,
        conditionFunction: () => boolean;
        maxWait: number;
        onFail?: (() => void) | string;
        initialTimeout?: number;
    }): void {
        const failCallback = typeof onFail === 'string' ? () => logger(state, 'all', 'Timeout', onFail) : onFail;
        this.conditions.push({
            conditionFunction,
            maxWait,
            ticksWaited: 0,
            ticksDelayed: initialTimeout,
            onFail: failCallback
        });
    },

    tick(): void {
        this.conditions = this.conditions.filter(condition => {
            if (condition.ticksDelayed > 0) {
                condition.ticksDelayed--;
                return true; // still delaying
            }
            if (condition.conditionFunction()) return false;
            condition.ticksWaited++;
            if (condition.ticksWaited >= condition.maxWait) {
                condition.onFail?.();
                return false;
            }
            return true;
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

    isWaiting(): boolean { return this.conditions.length > 0; }
};