// Function imports
import {logger} from './logger.js';

// Type imports
import {State} from './types.js';

export const debugFunctions = {
    stateDebugger: (state: State, prefix = ''): void => {
        const recurse = (object: Record<string, unknown>, prefix = '') => {
            for (const [key, value] of Object.entries(object)) {
                const type = typeof value;
                if (type === 'string' || type === 'number' || type === 'boolean') {
                    logger(state, 'debug', 'stateDebugger', `${prefix}${key}: ${String(value)}`);
                } else if (Array.isArray(value)) {
                    logger(state, 'debug', 'stateDebugger', `${prefix}${key} Length: ${value.length}`);
                } else if (type === 'object' && value !== null) {
                    recurse(value as Record<string, unknown>, `${prefix}${key}.`);
                }
            }
        };

        // Only top-level parameter is strongly typed State
        recurse(state, prefix);
    }
};