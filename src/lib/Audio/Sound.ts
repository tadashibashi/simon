import { EffectChain } from "./EffectChain";

export abstract class Sound<T extends AudioNode> implements IDisposable {
    private mEffects: EffectChain;
    private mSound: T;

    // Effect Chain
    get effects() { return this.mEffects; }

    // AudioContext
    get context() { return this.mEffects.context; }

    // The inner sound node
    get source(): T { return this.mSound; }

    // Shortcut to post-gain parameter
    get gain(): AudioParam { return this.mEffects.gain.gain; }

    protected constructor(context: AudioContext, soundNode: T, target?: AudioNode) {
        this.mEffects = new EffectChain(context, target);
        this.mSound = soundNode;

        if (this.mSound) // some Sounds do not have an inner source object
            this.mSound.connect(this.mEffects.input);
    }

    abstract play(...params: any[]): T | Promise<T>;
    abstract load(url: string): boolean | Promise<boolean>;
    abstract unload(): void;

    dispose() {
        this.mSound.disconnect();
        this.mSound = null;
        this.mEffects.dispose();
        this.mEffects = null;
    }

    connect(target: AudioNode | AudioParam) {
        this.mEffects.connect(target);
    }
}
