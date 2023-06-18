import { EffectChain } from "./EffectChain";

// Bus connection graph: -> [fx] -> panner-node -> post-gain
export class Bus
{
    protected mPostGain: GainNode;
    protected mPanner: StereoPannerNode;
    protected mEffects: EffectChain;

    // To connect a node to this bus, pass this to AudioNode#connect
    get input(): AudioNode { return this.mEffects.input; }
    get effects(): EffectChain { return this.mEffects; }
    get preGain(): GainNode { return this.mEffects.preGain; }
    get postGain(): GainNode { return this.mPostGain; }
    get panner(): StereoPannerNode { return this.mPanner; }

    constructor(context: AudioContext, target?: AudioNode) {
        this.mPanner = context.createStereoPanner();
        this.mPostGain = context.createGain();

        this.mPanner.connect(this.mPostGain);
        this.mPostGain.connect(target || context.destination);

        this.mEffects = new EffectChain(context, this.mPanner);
    }
}
