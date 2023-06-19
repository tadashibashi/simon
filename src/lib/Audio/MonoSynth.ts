import {Sound} from "./Sound";
import {Envelope} from "./Envelope";

// TODO: Create SynthVoice class which can make multiple voices easier.
export class MonoSynth extends Sound<OscillatorNode> {
    envelope: Envelope;

    constructor(context: AudioContext, target?: AudioNode, opts?: OscillatorOptions) {
        const node = opts ? new OscillatorNode(context, opts) :
            new OscillatorNode(context);
        super(context, node, target);

        this.envelope = new Envelope(context);
        this.envelope.addTarget(this.gain);
        this.gain.value = 0;
        this.source.start(context.currentTime);
    }

    get type() { return this.source.type; }
    set type(type: "sine" | "square" | "sawtooth" | "triangle" | "custom") {
        this.source.type = type;
    }

    get frequency() { return this.source.frequency; }


    /**
     * Synth does not need to be loaded!
     * @param url
     */
    override load(url: string): boolean | Promise<boolean> {
        throw "Synth#load should not be called!";
    }

    override play(when: number = 0): OscillatorNode {
        this.envelope.activate(when);

        return this.source;
    }

    override unload(): void {
        throw "Synth#unload should not be called!";
    }
}