import {logger} from './logger.js';

interface ScriptState {
    debugEnabled: boolean;
    [key: string]: unknown;
}

export const debugFunctions = {
    stateDebugger: (
        state: ScriptState,
        prefix = ''
    ): void => {
        for (const [key, value] of Object.entries(state)) {
            const type = typeof value;
            if (type === 'string' || type === 'number' || type === 'boolean') 
                logger(state, 'debug', 'stateDebugger', `${prefix}${key}: ${String(value)}`);
            else if (Array.isArray(value)) 
                logger(state, 'debug', 'stateDebugger', `${prefix}${key} Length: ${value.length}`);
            else if (type === 'object' && value !== null) 
                debugFunctions.stateDebugger(value as ScriptState, `${prefix}${key}.`);
        }
    }
};