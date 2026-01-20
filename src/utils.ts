export function once<A extends any[] = any[], R = unknown, T = any>(f: (this: T, ...args: A) => R): (this: T, ...args: A) => R {
    let state:
        | 0 // waiting to be called
        | 1 // started execution but not done
        | 2 // done and succeeded
        | 3 // done and threw an error
        = 0;
    let value: R | unknown | undefined;
    return function (...args) {
        if (state === 0) {
            state = 1;
            let threw = false;
            try {
                value = f.call(this, ...args);
            } catch (e) {
                threw = true;
                value = e;
            }
            state = threw ? 3 : 2;
        }
        if (state === 1) {
            throw new ReferenceError(`${f.name} called while executing`)
        }
        if (state === 2) {
            return value as R
        }
        if (state === 3) {
            throw value;
        }
        throw new TypeError(`state ${state} not ${"0 | 1 | 2 | 3"}`)
    }
}

export function stringJSON(strings: TemplateStringsArray, ...substitutions: unknown[]): string {
    return String.raw({ raw: strings }, substitutions.map(x => JSON.stringify(x)))
}
