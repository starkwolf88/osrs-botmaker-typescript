// Function imports
import { handleFailure } from './failure-handler.js';

// Type imports
import { State } from './types.js';

// timeoutManager
export const timeoutManager = {
    conditions: [] as Array<{
        conditionFunction: () => boolean;
        maxWait: number;
        ticksWaited: number;
        ticksDelayed: number;
        failureKey?: string;
        failResetState?: string;
        state: State;
    }>,
    globalFallback: undefined as (() => void) | undefined,
    globalFallbackThreshold: 60,
    globalTicksWaited: 0,

    // add()
    add({
        state,
        conditionFunction,
        maxWait,
        failureKey,
        failResetState,
        initialTimeout = 0
    }: {
        state: State;
        conditionFunction: () => boolean;
        maxWait: number;
        failureKey?: string;
        failResetState?: string;
        initialTimeout?: number;
    }): void {
        this.conditions.push({
            state,
            conditionFunction,
            maxWait,
            failureKey,
            failResetState,
            ticksDelayed: initialTimeout,
            ticksWaited: 0,
        });
    },

    // tick()
    tick(): void {
        this.conditions = this.conditions.filter(condition => {
            if (condition.ticksDelayed > 0) {
                condition.ticksDelayed--;
                return true;
            }

            // Condition succeeded - clear failure count for this key if it exists.
            if (condition.conditionFunction()) {
                if (condition.failureKey) delete condition.state.failureCounts[condition.failureKey];
                return false;
            }

            // Condition failed
            condition.ticksWaited++;
            if (condition.ticksWaited >= condition.maxWait) {
                if (condition.failureKey) handleFailure(condition.state, condition.failureKey, condition.failResetState);
                return false;
            }
            return true;
        });

        // Global fallback logic
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

    isWaiting(): boolean {return this.conditions.length > 0;}
};