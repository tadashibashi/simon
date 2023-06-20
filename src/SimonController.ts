import {Controller} from "./lib/UI/Controller";
import {GameState, SimonModel} from "./SimonModel";
import {SoundEffect} from "./lib/Audio/SoundEffect";
import {MonoSynth} from "./lib/Audio/MonoSynth";
import {AudioEngine} from "./lib/Audio/AudioEngine";

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

    playTones() {
        const buttons = document.querySelectorAll("#simon > .buttons > div");
        // start interval
        const interval = setInterval(() => {
            this.buttonBlink(buttons[this.model.props.order[this.model.state.progress]] as HTMLElement);
            this.model.progress();
            if (this.model.state.progress === 0) {
                clearInterval(interval);
            }
        }, this.model.state.speed);
    }

    init() {
        //this.testAudio();
        this.initSoundbar();
        this.initAudio();

        const overlay = document.getElementById("overlay");
        overlay.addEventListener("click", evt => {
            evt.stopPropagation();
            if (overlay.classList.contains("hide")) return;

            overlay.classList.add("hide");
            this.model.startGame();
            setTimeout(() => {
                this.playTones();
                document.body.removeChild(overlay);
            }, 1000);
        });

        const playAgain = document.getElementById("play-again");

        const buttons = document.querySelector("#simon > .buttons") as HTMLElement;
        buttons.addEventListener("click", evt => {
            const target = evt.target as HTMLElement;

            switch(this.model.state.gameState) {
                case GameState.Standby:

                    break;

                case GameState.Response:
                case GameState.AwaitResponse: {
                    const id = target.getAttribute("id");
                    this.buttonBlink(target);
                    let pressed;
                    switch(id) {
                        case "red-button": // play sounds here
                            pressed = 0;
                            break;
                        case "green-button":
                            pressed = 1;
                            break;
                        case "blue-button":
                            pressed = 2;
                            break;
                        case "yellow-button":
                            pressed = 3;
                            break;
                    }

                    if (this.model.props.order[this.model.state.progress] === pressed) {
                        this.model.progress();

                        // @ts-ignore
                        if (this.model.state.gameState === GameState.PlayTones) {
                            setTimeout(() => this.playTones(), 600);
                        }

                        // play sound, wait

                    } else {
                        this.model.lose();
                        playAgain.classList.add("show");
                        playAgain.classList.remove("first-hide");
                    }
                } break;

            }
        });

        document.addEventListener("keydown", evt => {
            if (evt.repeat) return;
            const btns = buttons.children as HTMLCollectionOf<HTMLDivElement>;

            switch(evt.code) {
                case "ArrowLeft":
                case "KeyA":
                    btns[3].click();
                    break;
                case "ArrowRight":
                case "KeyD":
                    btns[1].click();
                    break;
                case "ArrowUp":
                case "KeyW":
                    btns[0].click();
                    break;
                case "ArrowDown":
                case "KeyS":
                    btns[2].click();
                    break;
            }

            console.log(evt.code);
        });

        buttons.addEventListener("animationend", evt => {
            const target = evt.target as HTMLElement;
            if (evt.animationName === "blink") {
                target.classList.remove("blink");
                target.children[0].classList.remove("blink");
            }
        });

        playAgain.addEventListener("click", evt => {

            if (playAgain.classList.contains("show")) {
                playAgain.classList.remove("show");
                this.model.startGame();
                this.playTones();
            }
        });
    }

    initAudio() {
        const audio = this.model.props.audio;
        audio.loadSynth("red-button", "master", {
            type: "sine",
            frequency: 279.42
        }).envelope.set({
            attackTime: .1,
            releaseTime: .1
        });

        audio.loadSynth("green-button", "master", {
            type: "sine",
            frequency: 418.65
        }).envelope.set({
            attackTime: .1,
            releaseTime: .1
        });

        audio.loadSynth("blue-button", "master", {
            type: "sine",
            frequency: 440
        }).envelope.set({
            attackTime: .1,
            releaseTime: .1
        });

        audio.loadSynth("yellow-button", "master", {
            type: "sine",
            frequency: 469.92
        }).envelope.set({
            attackTime: .1,
            releaseTime: .1
        });
    }

    playSound(target: HTMLElement) {
        const audio = this.model.props.audio;
        const synth = audio.getSynth(target.id);
        if (synth)
            synth.play();
        console.log(synth);
    }

    buttonBlink(target: HTMLElement) {

        this.playSound(target);

        const child = target.children[0];
        child.classList.remove("blink");
        child.classList.add("blink");
        target.classList.remove("blink");
        target.classList.add("blink");
    }

    initSoundbar() {
        const volIcon = document.querySelector("#volume-label > i");
        const volEl = this.model.props.volume;
        let volume = 67; // TODO: use cookie to retrieve this val?

        volEl.value = volume.toString();
        setVolImage(volume, volIcon);
        setMasterVolume(volume, this.model.props.audio);


        function setVolImage(value: number, volIcon: Element) {
            if (value === 0) {
                volIcon.className = "fa-solid fa-volume-xmark";
            } else if (value < 33) {
                volIcon.className = "fa-solid fa-volume-off";
            } else if (value < 66) {
                volIcon.className = "fa-solid fa-volume-low";
            } else {
                volIcon.className = "fa-solid fa-volume-high";
            }
        }

        function setMasterVolume(value: number, audio: AudioEngine) {
            audio.busses.master.postGain.gain.value = value * .01;
        }

        volEl.addEventListener("input", evt => {
            const value = Number(volEl.value);
            volume = value;
            setVolImage(value, volIcon);
            setMasterVolume(value, this.model.props.audio);
        });

        volIcon.addEventListener("click", evt => {
            evt.stopPropagation();

            const tempVolume = (Number(volEl.value) === 0) ? volume : 0;

            setVolImage(tempVolume, volIcon);
            setMasterVolume(tempVolume, this.model.props.audio);
            volEl.value = tempVolume.toString();
        });
    }

    async testAudio() {
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