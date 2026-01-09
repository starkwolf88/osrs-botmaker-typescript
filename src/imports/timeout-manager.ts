import {logger} from './logger.js';

export const timeoutManager = {
    conditions: [] as Array<{
        conditionFunction: () => boolean;
        maxWait: number;
        ticksWaited: number;
        onFail?: () => void;

        // Optional retry logic
        action?: () => void;
        maxAttempts?: number;
        retryTimeout?: number;

        // internal bookkeeping
        _attempts?: number;
        _retryCooldown?: number;
    }>,
    globalFallback: undefined as (() => void) | undefined,
    globalFallbackThreshold: 60,
    globalTicksWaited: 0,

    add({
        state,
        conditionFunction,
        maxWait,
        onFail,
        action,
        maxAttempts,
        retryTimeout
    }: {
        state: {debugEnabled: boolean};
        conditionFunction: () => boolean;
        maxWait: number;
        onFail?: (() => void) | string;
        action?: () => void;
        maxAttempts?: number;
        retryTimeout?: number;
    }): void {
        const failCallback = typeof onFail === 'string' ? () => logger(state, 'all', 'Timeout', onFail) : onFail;
        this.conditions.push({
            conditionFunction,
            maxWait,
            ticksWaited: 0,
            onFail: failCallback,
            action,
            maxAttempts,
            retryTimeout,
            _attempts: 0,
            _retryCooldown: 0
        });
    },

    tick(): void {
        this.conditions = this.conditions.filter(condition => {

            // Condition satisfied? remove
            if (condition.conditionFunction()) return false;

            // Retry logic
            if (condition.action && (condition.maxAttempts === undefined || condition._attempts! < condition.maxAttempts)) {
                if (condition._retryCooldown! <= 0) {
                    condition.action();
                    condition._attempts!++;
                    condition._retryCooldown = condition.retryTimeout ?? 1;
                    if (condition.conditionFunction()) return false;
                } else {
                    condition._retryCooldown!--;
                    if (condition.conditionFunction()) return false;
                }
            }

            // Increment ticks every tick
            condition.ticksWaited++;

            // Max wait check
            if (condition.maxWait !== undefined && condition.ticksWaited >= condition.maxWait) {
                if (condition.onFail) condition.onFail();
                return false;
            }

            return true;
        });

        // Global fallback
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