// Class intended for short one-shot sound effects.
// If you need longer audio with more controls for music or ambience, please use the `Music` class.
import { Delegate } from "../UI/Delegate";
import { loadAudioBuffer } from "./Loading";
import { Sound } from "./Sound";

export class SoundEffect extends Sound<AudioBufferSourceNode> {
    private readonly defaults: AudioBufferSourceOptions;

    onended: Delegate<[AudioBufferSourceNode, SoundEffect]>;

    constructor(context: AudioContext, target?: AudioNode, url?: string) {
        super(context, null, target);
        this.defaults = {
            buffer: null,
            loop: false,
            playbackRate: 1,
            detune: 0,
            loopStart: 0,
            loopEnd: 0
        };

        this.onended = new Delegate<[AudioBufferSourceNode, SoundEffect]>;
        this.onendedHandler = this.onendedHandler.bind(this);

        if (url)
            this.load(url);
    }

    get isLoaded() { return this.defaults.buffer !== null; }
    set looping(value: boolean) { this.defaults.loop = value; }
    get looping(): boolean { return this.defaults.loop; }

    set loopStart(value: number) { this.defaults.loopStart = value; }
    set loopEnd(value: number) { this.defaults.loopEnd = value; }
    get loopStart() { return this.defaults.loopStart; }
    get loopEnd() { return this.defaults.loopEnd; }
    set playbackRate(value: number) { this.defaults.playbackRate = value; }
    get playbackRate() { return this.defaults.playbackRate; }
    set detune(value: number) { this.defaults.detune = value; }
    get detune() { return this.defaults.detune; }


    override async load(url: string) {
        return loadAudioBuffer(this.context, url)
            .then(aBuf => {
                this.defaults.buffer = aBuf;
                return true;
            })
            .catch(err => {
                console.error(err);
                return false;
            });
    }

    private onendedHandler(evt: Event) {
        this.onended.invoke(evt.target as AudioBufferSourceNode, this);
    }

    override unload() { this.defaults.buffer = null; }

    /**
     * Fire and forget. Please do not call start on the returned AudioBufferSourceNode.
     * @param when when to start playing, in seconds, relative to now
     * @param offset where in the audio file to start playing, in seconds
     * @param duration how long to play the file, in seconds. If not specified, plays the whole file.
     */
    override play(when: number = 0, offset: number = 0, duration?: number): AudioBufferSourceNode {
        const srcNode = (this.defaults) ?
            new AudioBufferSourceNode(this.context, this.defaults) :
            new AudioBufferSourceNode(this.context);
        srcNode.connect(this.effects.input);
        srcNode.onended = this.onendedHandler;

        if (duration === undefined)
            srcNode.start(this.context.currentTime + when, offset);
        else
            srcNode.start(this.context.currentTime + when, offset, duration);
        return srcNode;
    }
}
