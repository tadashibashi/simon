import { interactionWorkaround } from "./Interaction";
import { BusMgr } from "./BusMgr";
import { MonoSynth } from "./MonoSynth";
import { Music } from "./Music";
import { SoundEffect } from "./SoundEffect";


export class AudioEngine implements IDisposable {
    private mContext: AudioContext;
    private mBusses: BusMgr;

    private mSounds: Map<string, SoundEffect>;
    private mMusic: Map<string, Music>;
    private mSynths: Map<string, MonoSynth>;

    get listener(): AudioListener { return this.mContext.listener; }

    get busses(): BusMgr { return this.mBusses; }
    get context(): AudioContext { return this.mContext; }

    constructor() {
        this.mContext = null;
        this.mBusses = null;
        this.mSounds = new Map;
        this.mMusic = new Map;
        this.mSynths = new Map;
    }

    async loadSound(url: string, busName?: string) {
        let sound = this.mSounds.get(url);
        if (!sound) {
            let bus = busName ? this.mBusses.get(busName) : this.mBusses.master;
            if (!bus) bus = this.mBusses.master;

            sound = new SoundEffect(this.context, bus.input);
            this.mSounds.set(url, sound);
            sound.load(url)
               .then(() => {
                   return sound;
               })
               .catch(() => {
                   return null;
               });
        }

        return sound;
    }

    loadMusic(url: string, busName?: string) {
        let music = this.mMusic.get(url);
        if (!music) {
            let bus = busName ? this.mBusses.get(busName) : this.mBusses.master;
            if (!bus) bus = this.mBusses.master;
            music = new Music(this.context, bus.input);

            this.mMusic.set(url, music);
            music.load(url);
        }

        return music;
    }

    loadSynth(name: string, busName: string = "master", opts?: OscillatorOptions) {
        let synth = this.mSynths.get(name);
        if (!synth) {
            let bus = this.mBusses.get(busName);

            synth = new MonoSynth(this.context, bus.input, opts);
            this.mSynths.set(name, synth);
        }

        return synth;
    }





    wasInit(): boolean {
        return this.mContext !== null;
    }

    init(): boolean {
        let context: AudioContext | null = null;
        try {
            // @ts-ignore
            context = new (window.AudioContext || window.webkitAudioContext)();
        } catch(e) {
            console.error("AudioContext is not supported in this browser.");
            return false;
        }

        interactionWorkaround(context);

        this.mBusses = new BusMgr(context);
        this.mContext = context;
        return true;
    }

    dispose() {
        this.mBusses.dispose();
        this.mMusic.forEach(music => music.dispose());
        this.mMusic.clear();
        this.mMusic = null;

        this.mSounds.forEach(sfx => sfx.dispose());
        this.mSounds.clear();
        this.mSounds = null;

        this.mContext = null;
    }

}

