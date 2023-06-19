// Manages an array of audio FX nodes chained together
import {AudioEffect} from "./AudioEffect";

export class EffectChain {
    private readonly mPreGain: GainNode;
    private mTarget: AudioNode;
    private readonly mEffects: AudioEffect<any>[];
    private readonly mContext: AudioContext;

    get input(): AudioNode { return this.mPreGain; }

    // End-point connection target for this effect chain
    get target(): AudioNode { return this.mTarget; }
    set target(newTarget: AudioNode) {
        if (this.mEffects.length > 0) { // re-connect last effect
            const lastEffect = this.mEffects[this.mEffects.length-1];
            lastEffect.disconnect();
            lastEffect.connect(newTarget);
        } else {                        // no effects, re-connect preGain
            this.mPreGain.disconnect();
            this.mPreGain.connect(newTarget);
        }

        this.mTarget = newTarget;
    }

    get context(): AudioContext { return this.mContext; }
    get preGain(): GainNode { return this.mPreGain; }

    // the size of the effect chain not including preGain and target nodes.
    get length(): number { return this.mEffects.length; }

    /**
     *
     * @param context
     * @param target Target end-point to connect to. If no target is explicitly given,
     * it will be set to the context's destination output
     */
    constructor(context: AudioContext, target?: AudioNode) {
        this.mContext = context;
        this.mTarget = target || context.destination;
        this.mPreGain = new GainNode(context);

        this.mEffects = [];
    }

    // /**
    //  * Push an effect onto the
    //  * @param effectType
    //  * @param options
    //  */
    // push<T extends AudioEffect<any>>(effectType: new(p?: any) => T, options?: any): T {
    //     let newFX: T = (options) ? new effectType(options) : new effectType;
    //     return this.pushExisting(newFX);
    // }

    push<T extends AudioNode>(node: T): AudioEffect<T> {
        const newFx = new AudioEffect<T>(node, this.mTarget);
        // connect audio node before to newFX
        if (this.mEffects.length === 0) { // empty effect chain
            this.mPreGain.disconnect();
            this.mPreGain.connect(newFx.input);
        } else {                          // at least one effect
            const lastEffect = this.mEffects[this.mEffects.length-1];
            lastEffect.disconnect();
            lastEffect.connect(newFx.input);
        }

        // done, commit changes
        this.mEffects.push(newFx);
        return newFx;
    }

    /** Remove first occurrence of effect type from the FX chain.
     * @param effectType type of effect to remove.
     * @returns disconnected effect if one was found, or null if none found.
     */
    remove<T extends AudioNode>(effectType: new() => T): AudioEffect<T> | null {
        // visit effects to find one to remove
        for (let i = 0; i < this.mEffects.length; ++i) {
            if (this.mEffects[i].effect instanceof effectType) {  // found matching type!
                // reconnect nodes
                const effect = this.mEffects[i];
                const before = (i === 0) ? this.mPreGain : this.mEffects[i - 1].output;
                const after  = (i === this.mEffects.length - 1) ? this.mTarget : this.mEffects[i + 1].input;

                effect.dispose();
                before.disconnect();
                before.connect(after);

                // done, commit changes
                this.mEffects.splice(i, 1);
                return effect as AudioEffect<T>;
            }
        }

        // no effect removed
        return null;
    }

    // Get first effect of effectType. Returns null if none exists.
    // (Does not include preGain node or target end point)
    get<T extends AudioNode>(effectType: new(opts?: any) => T): AudioEffect<T> | null  {
        return this.getNth(effectType, 1);
    }

    // Get all effects of effectType.
    getAllOf<T extends AudioNode>(effectType: new(opts?: any) => T): AudioEffect<T>[] {
        return this.mEffects.filter(fx => fx.effect instanceof effectType) as AudioEffect<T>[];
    }

    // Get the nth effect of effectType.
    getNth<T extends AudioNode>(effectType: new(opts?: any) => T, n: number): AudioEffect<T> | null {
        for (let i = 0; i < this.mEffects.length; ++i) {
            if (this.mEffects[i].effect instanceof effectType && --n <= 0)
                return this.mEffects[i] as AudioEffect<T>;
        }

        return null;
    }

    dispose() {
        this.mPreGain.disconnect();
        this.mEffects.forEach(effect => effect.dispose());
        this.mTarget = null;
        this.mEffects.splice(0, this.mEffects.length);
    }

}