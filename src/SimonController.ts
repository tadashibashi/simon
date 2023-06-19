import {Controller} from "./lib/UI/Controller";
import {SimonModel} from "./SimonModel";
import {SoundEffect} from "./lib/Audio/SoundEffect";
import {MonoSynth} from "./lib/Audio/MonoSynth";

async function loadSound(context: AudioContext, url: string): Promise<{buffer: AudioBuffer, url: string}> {
    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.open("GET", url, true);
        req.responseType = "arraybuffer";

        req.onload = () => {
            context.decodeAudioData(req.response,
                buf => {
                    resolve({buffer: buf, url});
                }, err => {
                    reject(err);
                });
        };

        req.send();
    });
}

export class SimonController extends Controller<SimonModel> {
    ir: AudioBuffer;


    constructor(model: SimonModel) {
        super(model);
        model.props.audio.init();
        loadSound(model.props.audio.context, "ir-cinema-room.wav").then((buf) => {
            this.ir = buf.buffer;
            this.init();
        });
    }

    async init() {
        const m = this.model;
        const audio = m.props.audio;

        // Add convolution reverb to the master bus
        const cverb = audio.busses.master.effects.push(ConvolverNode, {buffer: this.ir});
        cverb.dry.value = .75;
        cverb.wet.value = .25;

        const osc = audio.loadSynth("osc1", "master", {type: "sine"});
        osc.envelope.attackTime = 0.5;

        // Example of using MonoSynth as a modulator
        const modulator = new MonoSynth(audio.context);
        modulator.type = "sine";
        modulator.frequency.value = 2550;
        modulator.gain.value = 12500;
        modulator.connect(osc.frequency);

        // TODO: Modulator abstract class -> LFO, Envelope
        // ModulatorMgr class owned by each sfx. Seems kind of difficult for
        // SFX, but very practical for music and Oscillators.

        // Sound effect object
        const sound = await audio.loadSound("bop.wav");
        const panner = sound.effects.insert(PannerNode);

        m.props.buttons.addEventListener("click", () => {
            osc.frequency.cancelScheduledValues(audio.context.currentTime);
            osc.frequency.value = 440;
            osc.frequency.linearRampToValueAtTime(880, audio.context.currentTime + 1);
            osc.play();
            panner.effect.positionX.value = Math.random() * 40 - 20;
            panner.effect.positionY.value = Math.random() * 40 - 20;
            panner.effect.positionZ.value = Math.random() * 40 - 20;
            sound.play();
        });
    }
}