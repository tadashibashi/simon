import { AudioEffect } from "./AudioEffect";

// Manages an array of audio FX chained together
export class EffectChain implements IDisposable {
    private mPreGain: GainNode;
    private mPostGain: GainNode;
    private mEffects: AudioEffect<any>[];
    private readonly mContext: AudioContext;

    get input(): AudioNode {
        return this.mPreGain;
    }
    get output(): AudioNode {
        return this.mPostGain;
    }

    connect(newTarget: AudioNode | AudioParam) {
        this.output.disconnect();
        this.output.connect(newTarget as AudioParam);
    }

    get context(): BaseAudioContext {
        return this.mPreGain.context;
    }

    get preGain(): GainNode {
        return this.mPreGain;
    }

    get gain(): GainNode {
        return this.mPostGain;
    }

    // the size of the effect chain not including preGain and target nodes.
    get length(): number {
        return this.mEffects.length;
    }

    /**
     *
     * @param context
     * @param target Target end-point to connect to. If no target is explicitly given,
     * it will be set to the context's destination output
     */
    constructor(context: AudioContext, target?: AudioNode) {
        this.mContext = context;
        this.mPreGain = new GainNode(context);
        this.mPostGain = new GainNode(context);
        this.mPreGain.connect(this.mPostGain);
        this.mPostGain.connect(target || context.destination);
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

    pushEffect<T extends AudioNode>(node: T): AudioEffect<T> {
        // AudioNode wrapped and target set
        const newFx = new AudioEffect<T>(node, this.output);

        // connect last effect to the newFX
        const before = (this.mEffects.length === 0) ? this.input :
            this.mEffects[this.mEffects.length - 1].output;
        before.disconnect();
        before.connect(newFx.input);

        // done, commit changes
        this.mEffects.push(newFx);
        return newFx;
    }

    push<T extends AudioNode, Opts>(type: new(ctx: BaseAudioContext, opts?: Opts) => T, opts?: Opts) {
        const node = opts ? new type(this.context, opts) : new type(this.context);
        return this.pushEffect(node);
    }

    insertEffect<T extends AudioNode>(node: T, idx: number = 0): AudioEffect<T> {
        // wrap AudioNode
        const newFx = new AudioEffect<T>(node);

        // clamp index
        idx = (this.mEffects.length === 0) ? 0 :
            Math.min(Math.max(0, idx), this.mEffects.length-1);

        // splice connections
        const before = idx === 0 ? this.input: this.mEffects[idx - 1].output;
        const after = idx >= this.mEffects.length - 1 ? this.output : this.mEffects[idx].input;

        before.disconnect();
        before.connect(newFx.input);
        newFx.connect(after);

        // done, commit changes
        this.mEffects.splice(idx, 0, newFx);
        return newFx;
    }

    insert<T extends AudioNode, Opts>(type: new(ctx: BaseAudioContext, opts?: Opts) => T, idx: number = 0, opts?: Opts) {
        const node = (opts) ? new type(this.context, opts) : new type(this.context);
        return this.insertEffect(node, idx);
    }

    /**
     * Remove first occurrence of effect type from the FX chain.
     * @param effectType type of effect to remove.
     * @returns disconnected effect if one was found, or null if none found.
     */
    remove<T extends AudioNode>(effectType: new() => T): AudioEffect<T> | null {
        // visit effects to find one to remove
        for (let i = 0; i < this.mEffects.length; ++i) {
            if (this.mEffects[i].effect instanceof effectType) {  // found matching type!
                // reconnect nodes
                const effect = this.mEffects[i];
                const before = (i === 0) ? this.input : this.mEffects[i - 1].output;
                const after = (i === this.mEffects.length - 1) ? this.output : this.mEffects[i + 1].input;

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
    get<T extends AudioNode>(effectType: new(opts?: any) => T): AudioEffect<T> | null {
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
        this.mPostGain.disconnect();
        this.mEffects.forEach(effect => effect.dispose());

        this.mPostGain = null;
        this.mPreGain = null;
        this.mEffects = null;
    }
}
