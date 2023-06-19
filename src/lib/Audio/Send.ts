// The Send class represents audio routing that clones its signal and sends it at varying levels to
// other audio inputs. These are usually sent to other buses or effects.

export class Send {
    private readonly mNode: GainNode;
    private mTarget: AudioNode;

    get gain() {
        return this.mNode.gain;
    }

    get input(): AudioNode {
        return this.mNode;
    }

    set target(value: AudioNode) {
        this.mTarget = value;
        this.mNode.disconnect();
        this.mNode.connect(value);
    }

    get target() {
        return this.mTarget;
    }

    get hasTarget(): boolean {
        return this.mTarget !== null;
    }

    constructor(context: AudioContext, target?: AudioNode) {
        this.mNode = context.createGain();
        this.mTarget = target || null;
    }

    /**
     * Connect send to a target node
     * @param target
     */
    connect(target: AudioNode) {
        this.target = target;
    }

    /**
     * Disconnect send from current target
     */
    disconnect() {
        this.mNode.disconnect();
        this.mTarget = null;
    }
}
