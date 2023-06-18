import { AudioEngine } from "./lib/Audio/AudioEngine"
import {Simon} from "./Simon";

const volumeEl = document.querySelector("#volume");

window.addEventListener("load", async () => {
    const simon = new Simon();

    const audio = new AudioEngine;

    audio.init();

    const sounds: Map<string, AudioBuffer> = new Map;

    async function loadSound(url: string): Promise<{buffer: AudioBuffer, url: string}> {
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.open("GET", url, true);
            req.responseType = "arraybuffer";

            req.onload = () => {
                audio.context.decodeAudioData(req.response,
                    buf => {
                        resolve({buffer: buf, url});
                    }, err => {
                        reject(err);
                    });
            };

            req.send();
        });
    }


    async function preloadSounds(...urls: string[]) {
        const promises = urls.map(url => loadSound(url));
        return Promise.all(promises);
    }

    let bufs: {buffer: AudioBuffer, url: string}[] = null;
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
        const buf = bufs[0].buffer;
        playSound(buf);
    });

});


