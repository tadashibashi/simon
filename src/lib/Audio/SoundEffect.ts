// Class intended for short one-shot sound effects.
// If you need longer audio with more controls for music or ambience, please use the `Music` class.
export class SoundEffect {
    private readonly context: AudioContext;
    private readonly defaults: AudioBufferSourceOptions;
    private readonly target: AudioNode;

    constructor(context: AudioContext, target: AudioNode) {
        this.context = context;
        this.defaults = {
            buffer: null,
            loop: false,
            playbackRate: 1,
            detune: 0,
            loopStart: 0,
            loopEnd: 0
        };
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


    async load(url: string) {
        const res = await fetch(url);
        const buf = await res.arrayBuffer();
        return await this.context.decodeAudioData(buf)
            .then(aBuf => {
                this.defaults.buffer = aBuf;
                return true;
            })
            .catch(err => {
                console.error(err);
                return false;
            });
    }

    unload() { this.defaults.buffer = null; }

    /**
     *
     * @param when when to start playing, in seconds, relative to now
     * @param offset where in the audio file to start playing, in seconds
     * @param duration how long to play the file, in seconds. If not specified, plays the whole file.
     */
    play(when: number = 0, offset: number = 0, duration?: number): AudioBufferSourceNode {
        const srcNode = (this.defaults) ?
            new AudioBufferSourceNode(this.context,this.defaults) :
            new AudioBufferSourceNode(this.context);
        srcNode.connect(this.target);
        srcNode.start(this.context.currentTime + when, offset, duration);

        return srcNode;
    }
}