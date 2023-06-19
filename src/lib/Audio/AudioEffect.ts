/**
 *             /dry            \
 * inputGain <                 > outputGain -> target
 *             \wet -> effect /
 */
export class AudioEffect<T extends AudioNode> {
    private mEffect: T;
    private mDry: GainNode;
    private mWet: GainNode;

    private mInput: GainNode;
    private mOutput: GainNode;

    get effect(): T { return this.mEffect; }
    get input(): GainNode { return this.mInput; }
    get output(): GainNode { return this.mOutput; }

    constructor(effect: T, target?: AudioNode) {
        const context = effect.context;

        this.mEffect = effect;
        this.mDry = new GainNode(context);
        this.mWet = new GainNode(context);
        this.mInput = new GainNode(context);
        this.mOutput = new GainNode(context);

        this.mInput.connect(this.mDry);
        this.mInput.connect(this.mWet);
        this.mDry.connect(this.mOutput);
        this.mWet.connect(this.mEffect);
        this.mEffect.connect(this.mOutput);
        this.mOutput.connect(target || context.destination);
    }

    connect(audioNode: AudioNode) {
        this.disconnect();
        this.mOutput.connect(audioNode);
    }

    disconnect() {
        this.mOutput.disconnect();
    }

    // Balances wet and dry. Value of wet is set to percent, and dry is set to 1-percent
    setWetDry(percent: number, rampTime: number = 0) {
        percent = Math.min(Math.max(percent, 0), 1);
        if (rampTime > 0) {
            const time = this.mEffect.context.currentTime + rampTime;
            this.mDry.gain.linearRampToValueAtTime(1 - percent, time);
            this.mWet.gain.linearRampToValueAtTime(percent, time);
        } else {
            this.mDry.gain.value = 1 - percent;
            this.mWet.gain.value = percent;
        }
    }

    setWet(percent: number, rampTime: number = 0) {
        percent = Math.max(percent, 0);
        if (rampTime > 0)
            this.mWet.gain.linearRampToValueAtTime(percent, this.mEffect.context.currentTime + rampTime);
        else
            this.mWet.gain.value = percent;
    }

    setDry(percent: number, rampTime: number = 0) {
        percent = Math.max(percent, 0);
        if (rampTime > 0)
            this.mDry.gain.linearRampToValueAtTime(percent, this.mEffect.context.currentTime + rampTime);
        else
            this.mDry.gain.value = percent;
    }

    dispose() {
        this.mDry.disconnect();
        this.mWet.disconnect();
        this.mEffect.disconnect();
        this.mInput.disconnect();
        this.mOutput.disconnect();

        this.mDry = null;
        this.mWet = null;
        this.mEffect = null;
        this.mInput = null;
        this.mOutput = null;
    }

}