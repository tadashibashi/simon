export interface EnvelopeOptions {
    attackTime: number;
    attackLevel: number;
    decayTime: number;
    sustainLevel: number;
    holdTime: number;
    releaseTime: number;
}

// ADSHR Envelope
export class Envelope {
    private readonly mTargets: AudioParam[];
    private readonly mContext: BaseAudioContext;

    private mAttackTime: number;
    private mAttackLevel: number;
    private mDecayTime: number;
    private mSustainLevel: number;
    private mHoldTime: number;
    private mReleaseTime: number;

    get attackTime() { return this.mAttackTime; }
    get attackLevel() { return this.mAttackLevel; }
    get decayTime() { return this.mDecayTime; }
    get sustainLevel() { return this.mSustainLevel; }
    get holdTime() { return this.mHoldTime; }
    get releaseTime() { return this.mReleaseTime; }

    set attackTime(value: number) { this.mAttackTime = Math.max(0, value); }
    set attackLevel(value: number) { this.mAttackLevel = Math.max(0, value); }
    set decayTime(value: number) { this.mDecayTime = Math.max(0, value); }
    set sustainLevel(value: number) { this.mSustainLevel = Math.max(0, value); }
    set holdTime(value: number) { this.mHoldTime = Math.max(0, value); }
    set releaseTime(value: number) { this.mReleaseTime = Math.max(0, value); }


    constructor(context: BaseAudioContext, opts?: Partial<EnvelopeOptions>) {
        this.mContext = context;
        this.mTargets = [];

        if (opts)
            this.set(opts);
        else { // defaults
            this.mAttackTime = 0;
            this.mAttackLevel = 1;
            this.mDecayTime = .5;
            this.mSustainLevel = .25;
            this.mHoldTime = .25;
            this.mReleaseTime = .5;

        }
    }


    /**
     * Add a parameter to the envelope's targets.
     * @param param
     */
    addTarget(param: AudioParam) {
        this.mTargets.push(param);
    }

    /**
     * Remove a parameter from the envelope's targets
     * @param param
     */
    removeTarget(param: AudioParam) {
        for (let i = 0; i < this.mTargets.length; ++i) {
            if (Object.is(this.mTargets[i], param)) {
                this.mTargets.splice(i, 1);
                break;
            }
        }
    }

    /**
     * Set the envelope via an EnvelopeOptions object.
     * @param opts
     */
    set(opts: Partial<EnvelopeOptions>) {
        this.mAttackTime = opts.attackTime ?? this.mAttackTime;
        this.mAttackLevel = opts.attackLevel ?? this.mAttackLevel;
        this.mDecayTime = opts.decayTime ?? this.mDecayTime;
        this.mSustainLevel = opts.sustainLevel ?? this.mSustainLevel;
        this.mHoldTime = opts.holdTime ?? this.mHoldTime;
        this.mReleaseTime = opts.releaseTime ?? this.mReleaseTime ;
    }

    /**
     * Triggers the envelope on all target parameters.
     * @param when - When to trigger/activate the envelope, relative to now, in seconds.
     */
    activate(when: number = 0) {
        // Grab timings
        // .02 extra seconds to give time for gain to snap back to zero without popping
        const currentTime = this.mContext.currentTime + when + .02;
        const startDecay = currentTime + this.mAttackTime;
        const startRelease =  currentTime + this.mAttackTime + this.mDecayTime + this.mHoldTime;

        // Set envelope for each target param
        this.mTargets.forEach(param => {
            // init value
            param.cancelScheduledValues(currentTime);
            param.linearRampToValueAtTime(0, currentTime);

            // attack
            param.setTargetAtTime(this.mAttackLevel, currentTime, this.mAttackTime * .1);
            // decay
            param.setTargetAtTime(this.mSustainLevel, startDecay, this.mDecayTime * .1);
            // release
            param.setTargetAtTime(0, startRelease, this.mReleaseTime * .1);
        });
    }

    /**
     * Cancel effects of a triggered envelope (side effect: will also cancel any other scheduled
     * changes to the target parameters).
     * @param when - Time after which all events will be cancelled, relative to now in seconds.
     */
    cancel(when: number = 0) {
        this.mTargets.forEach(param => {
            param.cancelScheduledValues(this.mContext.currentTime + when);
        });
    }
}