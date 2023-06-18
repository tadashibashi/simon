
// Manages an array of audio FX nodes chained together
export class EffectChain {
    private readonly mPreGain: GainNode;
    private mTarget: AudioNode;
    private readonly mEffects: AudioNode[];
    private readonly mContext: AudioContext;

    get input(): AudioNode { return this.mPreGain; }

    // End-point connection target for this effect chain
    get target(): AudioNode { return this.mTarget; }
    set target(newTarget: AudioNode) {
        if (this.mEffects.length > 0) { // re-connect last effect
            const lastNode = this.mEffects[this.mEffects.length-1];
            lastNode.disconnect();
            lastNode.connect(newTarget);
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
        this.mPreGain = new GainNode(context, {gain: 1});

        this.mEffects = [];
    }

    /**
     * Push an effect onto the
     * @param effectType
     * @param options
     */
    push(effectType: new() => StereoPannerNode, options: StereoPannerOptions): PannerNode;
    push(effectType: new() => PannerNode, options: PannerOptions): PannerNode;
    push(effectType: new() => GainNode, options: GainOptions): GainNode;
    push<T extends AudioNode>(effectType: new(p?: any) => T, options?: any): T {
        let newFX: T = (options) ? new effectType(options) : new effectType;
        return this.pushExisting(newFX);
    }

    pushExisting<T extends AudioNode>(newFX: T): T {
        // connect audio node before to newFX
        if (this.mEffects.length === 0) { // empty effect chain
            this.mPreGain.disconnect();
            this.mPreGain.connect(newFX);
        } else {                          // at least one effect
            const lastEffect = this.mEffects[this.mEffects.length-1];
            lastEffect.disconnect();
            lastEffect.connect(newFX);
        }

        // connect to end point
        newFX.connect(this.mTarget);

        // done, commit changes
        this.mEffects.push(newFX);
        return newFX;
    }

    /** Remove first occurrence of effect type from the FX chain.
     * @param effectType type of effect to remove.
     * @returns disconnected effect if one was found, or null if none found.
     */
    remove<T extends AudioNode>(effectType: new() => T): T | null {
        // visit effects to find one to remove
        for (let i = 0; i < this.mEffects.length; ++i) {
            if (this.mEffects[i] instanceof effectType) {  // found matching type!
                // reconnect nodes
                const effect = this.mEffects[i];
                const before = (i === 0) ? this.mPreGain : this.mEffects[i - 1];
                const after  = (i === this.mEffects.length - 1) ? this.mTarget : this.mEffects[i + 1];

                effect.disconnect();
                before.disconnect();
                before.connect(after);

                // done, commit changes
                this.mEffects.splice(i, 1);
                return effect as T;
            }
        }

        // no effect removed
        return null;
    }

    // Get first effect of effectType. Returns null if none exists.
    // (Does not include preGain node or target end point)
    get<T extends AudioNode>(effectType: new(opts?: any) => T): T | null  {
        return this.getNth(effectType, 1);
    }

    // Get all effects of effectType.
    getAllOf<T extends AudioNode>(effectType: new(opts?: any) => T): T[] {
        return this.mEffects.filter(fx => fx instanceof effectType) as T[];
    }

    // Get the nth effect of effectType.
    getNth<T extends AudioNode>(effectType: new(opts?: any) => T, n: number): T | null {
        for (let i = 0; i < this.mEffects.length; ++i) {
            if (this.mEffects[i] instanceof effectType && --n <= 0)
                return this.mEffects[i] as T;
        }

        return null;
    }

    dispose() {
        this.mPreGain.disconnect();
        this.mEffects.forEach(effect => effect.disconnect());
        this.mTarget = null;
        this.mEffects.splice(0, this.mEffects.length);
    }

}