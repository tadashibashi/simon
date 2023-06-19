import { EffectChain } from "./EffectChain";
import {SendMgr} from "./SendMgr";

// Bus connection graph: -> [fx] -> panner-node -> post-gain
export class Bus implements IDisposable
{
    protected mPostGain: GainNode;
    protected mPanner: StereoPannerNode;
    protected mEffects: EffectChain;
    protected mSends: SendMgr;

    // To connect a node to this bus, pass this to AudioNode#connect
    get input(): AudioNode { return this.mEffects.input; }

    get effects(): EffectChain { return this.mEffects; }
    get preGain(): GainNode { return this.mEffects.preGain; }
    get postGain(): GainNode { return this.mPostGain; }
    get panner(): StereoPannerNode { return this.mPanner; }
    get sends(): SendMgr { return this.mSends; }

    constructor(context: AudioContext, target?: AudioNode) {
        this.mPanner = context.createStereoPanner();
        this.mPostGain = context.createGain();

        this.mPanner.connect(this.mPostGain);
        this.mPostGain.connect(target || context.destination);

        this.mEffects = new EffectChain(context, this.mPanner);
        this.mSends = new SendMgr(context);
        this.mPostGain.connect(this.mSends.input);
    }

    /**
     * Connects the Bus to another target AudioNode
     * @param node node to connect
     */
    connect(node: AudioNode) {
        this.mPostGain.disconnect();
        this.mPostGain.connect(this.mSends.input);
        this.mPostGain.connect(node);
    }

    /**
     * Disconnects the Bus from its target AudioNode
     */
    disconnect() {
        this.mPostGain.disconnect();
        this.mPostGain.connect(this.mSends.input);
    }

    // Call to disconnect and remove all references of inner effects
    dispose() {
        this.mPanner.disconnect();
        this.mPostGain.disconnect();
        this.mEffects.dispose();
        this.mSends.dispose();

        this.mPanner = null;
        this.mPostGain = null;
        this.mEffects = null;
        this.mSends = null;
    }
}
