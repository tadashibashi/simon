import { AudioEngine } from "./lib/AudioEngine"
import {Simon} from "./Simon";

const volumeEl = document.querySelector("#volume");

window.addEventListener("load", async () => {
    const simon = new Simon();

    const audio = new AudioEngine;

    audio.init();

    const sounds: Map<string, AudioBuffer> = new Map;

    async function loadSound(url: string): Promise<AudioBuffer> {
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.open("GET", url, true);
            req.responseType = "arraybuffer";

            req.onload = () => {
                audio.context.decodeAudioData(req.response,
                    buf => {
                        resolve(buf);
                    }, err => {
                        reject(err);
                    });
            };

            req.send();
        });
    }

    async function loadSoundSync(url: string) {
        const res = await fetch(url);
        const buf = await res.arrayBuffer();
        return await audio.context.decodeAudioData(buf);
    }

    async function preloadSounds(...urls: string[]) {
        const promises = urls.map(url => loadSound(url));
        return Promise.all(promises);
    }

    let bufs: AudioBuffer[] = null;
    await preloadSounds("bop.wav").then(val => {
        bufs = val;
    });


    function playSound(buf: AudioBuffer) {
        const src = audio.context.createBufferSource();
        src.buffer = buf;
        src.connect(audio.context.destination);
        src.start(0);
        return src;
    }

    document.querySelector("#volume").addEventListener("click", () => {
        const buf = bufs[0];
        playSound(buf);
    });

});


