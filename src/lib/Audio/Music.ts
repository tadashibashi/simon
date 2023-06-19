import { Sound } from "./Sound";

// Class meant for longer sounds like music, ambience, etc.
// AudioNode graph: source -> gainNode
export class Music extends Sound<MediaElementAudioSourceNode> {

    constructor(context: AudioContext, target: AudioNode, url?: string) {
        const source = new MediaElementAudioSourceNode(context, {
            mediaElement: url ? new Audio(url) : new Audio()
        });
        super(context, source, target);
    }

    override load(url: string) {
        this.source.mediaElement.src = url;
        this.source.mediaElement.load();

        return true;
    }

    override unload() {
        this.source.mediaElement.src = "";
    }

    override async play(): Promise<MediaElementAudioSourceNode> {
        return this.source.mediaElement.play()
            .then(() => this.source)
            .catch(() => null);
    }

    // Pauses audio and sets currentTime to 0
    stop() {
        this.source.mediaElement.pause();
        this.source.mediaElement.currentTime = 0;
    }

    setPause(pause: boolean) {
        if (pause)
            this.source.mediaElement.pause();
        else
            this.source.mediaElement.play();
    }

    get paused() {
        return this.source.mediaElement.paused;
    }

    override dispose() {
        this.source.mediaElement.src = "";
        super.dispose();
    }
}
