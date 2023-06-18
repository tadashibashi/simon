
interface Callback<Args extends any[]> {
    context: any;
    callback: (...args: Args) => void;
}


/**
 * Class that stores and invokes callback. Similar to the subject in the Observer pattern.
 * Can store 'this' context, if needed, e.g. class function performed on an instance.
 */
export class Delegate<Args extends any[]> {
    private callbacks: Callback<Args>[];

    constructor() {
        this.callbacks = [];
    }
    addListener(callback: (...args: Args) => void, context: any = null) {
        this.callbacks.push({context, callback});
    }

    /**
     * Removes listener. Must be called with the same arguments called from Delegate.addListener.
     * @param callback Function to set
     * @param context 'this' context. (Arrow functions automatically capture 'this', and do not
     * need this parameter set.)
     */
    removeListener(callback: (...args: Args) => void, context: any = null) {
        for (let i = 0; i < this.callbacks.length; ++i) {
            if (Object.is(this.callbacks[i].callback, callback) &&
                (context ? Object.is(this.callbacks[i].context, context) : true)) {
                this.callbacks.splice(i, 1);
                return true;
            }
        }

        return false;
    }

    invoke(...args: Args) {
        for (let i = 0; i < this.callbacks.length; ++i) {
            if (this.callbacks[i].context)
                this.callbacks[i].callback.call(this.callbacks[i].context, ...args);
            else
                this.callbacks[i].callback(...args);
        }
    }

    get length() {
        return this.callbacks.length;
    }

    clear() {
        this.callbacks = [];
    }
}
