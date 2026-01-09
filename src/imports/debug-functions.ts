import {logger} from './logger.js';

export const debugFunctions = {
    stateDebugger: (state: Record<string, unknown>, prefix = ''): void => {
        for (const [key, value] of Object.entries(state)) {
            const type = typeof value;
            if (type === 'string' || type === 'number' || type === 'boolean') logger('log', 'stateDebugger', `${prefix}${key}: ${String(value)}`); // Simple values
            else if (Array.isArray(value)) logger('log', 'stateDebugger', `${prefix}${key} Length: ${value.length}]`); // Array lengths
            else if (type === 'object' && value !== null) debugFunctions.stateDebugger(value as Record<string, unknown>, `${prefix}${key}.`); // Recurse objects
        }
    }
};
