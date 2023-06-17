// Deep copies data objects and Arrays. Any nested object should not be a class or DOM element as they will not maintain
// their prototype chains.
// Nested looping references are permitted, but will these objects will be copied by reference the second time they
// appear and after to prevent infinite recursive copies.
export function deepCopy<T extends any>(obj: T): T {
    const set = new Set<any>;
    return deepCopyImpl(obj, set);
}

function deepCopyImpl<T extends any>(obj: T, check: Set<any>): T {
    if (Array.isArray(obj)) {
        if (check.has(obj))
            return obj; // just a reference

        check.add(obj);

        const arr: Array<any> = [];
        obj.forEach(item => {
            arr.push(deepCopyImpl(item, check));
        });

        return arr as T;
    }

    if (obj === null) {                    // obj is null
        return null;
    } else if (typeof obj === "object") {  // obj is an object
        if (check.has(obj))
            return obj;

        check.add(obj);

        const newObj: any = {};
        Object.getOwnPropertyNames(obj).forEach(key => {
            // @ts-ignore
            newObj[key] = deepCopyImpl(obj[key], check);
        });


        return newObj;
    } else {
        // obj is primitively copiable
        return obj;
    }
}

// Generates a random integer between (0, n]
// 0: inclusive, n: exclusive
export function randInt(n: number) {
    return Math.floor(Math.random() * n);
}

// Implementation of the Fisher-Yates shuffle algorithm on an array
// https://en.wikipedia.org/wiki/Fisher–Yates_shuffle
export function shuffle(arr: Array<any> | TypedArray) {
    for (let i = arr.length-1; i > 0; --i) {
        const swapIdx = randInt(i+1);
        if (swapIdx === i)
            continue;

        const temp = arr[i];
        arr[i] = arr[swapIdx];
        arr[swapIdx] = temp;
    }
}
