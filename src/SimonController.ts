import {AudioEngine} from "./lib/Audio/AudioEngine";
import {Controller} from "./lib/UI/Controller";
import {GameState, SimonModel} from "./SimonModel";

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

        // Used as event listener, must bind this
        this.keydownHandler = this.keydownHandler.bind(this);

        // Init audio, preload impulse response used in reverb
        model.props.audio.init();
        loadSound(model.props.audio.context, "ir-cinema-room.wav").then((buf) => {
            this.ir = buf.buffer;
            this.init();
        });
    }

    private playTones() {
        const buttons = this.model.props.buttons.children;

        // space playback via an interval
        const interval = setInterval(() => {

            this.playButtonAnimSound(
                buttons[this.getAnswerButtonIndex()] as HTMLElement);

            // progress to the next tone/state
            this.model.progress();

            // exit case
            if (this.model.state.progress === 0)
                clearInterval(interval);

        }, this.model.state.speed);
    }

    // Overlay appears as a dimmed screen with play button.
    // Player can click anywhere on the overlay to remove it and start the game.
    private initOverlay() {
        const overlay = document.getElementById("overlay");

        // clicking overlay will hide it, and start the game
        overlay.addEventListener("click", evt => {
            evt.stopPropagation(); // prevent clicks from penetrating overlay
            if (overlay.classList.contains("hide")) return; // only hide once

            overlay.classList.add("hide");

            this.model.startGame();

            // start tone playback & remove overlay in 1 second
            setTimeout(() => {
                this.playTones();
                document.body.removeChild(overlay);
            }, 1000);
        });
    }

    private activateButton(target: HTMLElement) {
        if (!target) return; // reject null/undefined from invalid input

        const state = this.model.state.gameState;
        switch(state) {
            case GameState.Response:
            case GameState.AwaitResponse: {
                const id = target.getAttribute("id");

                if (this.getAnswerButtonIndex() === getButtonIndexFromID(id)) {  // player input correctly
                    this.playButtonAnimSound(target); // visual/audio fx
                    this.model.progress();        // progress game logic

                    if (this.model.state.gameState === GameState.PlayTones) { // track exit case

                        // finished player response, start playing next round
                        setTimeout(() => this.playTones(), 600);
                    }
                } else {                              // player input incorrectly
                    showPlayAgainButton(this.model.props.playAgain);
                    this.model.lose();

                    // TODO: Play SFX for losing
                }
            } break;
        }



        function showPlayAgainButton(playAgain: HTMLElement) {
            playAgain.classList.add("show");
            playAgain.classList.remove("first-hide");
        }

        function getButtonIndexFromID(id: string) {
            let pressed;
            switch(id) {
                case "red-button":    pressed = 0; break;
                case "green-button":  pressed = 1; break;
                case "blue-button":   pressed = 2; break;
                case "yellow-button": pressed = 3; break;
                default:              pressed = -1;break; // should throw?
            }

            return pressed;
        }
    }

    // get current answer that player must guess correctly
    private getAnswerButtonIndex() {
        return this.model.props.order[this.model.state.progress];
    }

    private keydownHandler(evt: KeyboardEvent) {
        if (evt.repeat) return; // quit on repeat presses

        const btns = this.model.props.buttons.children as HTMLCollectionOf<HTMLDivElement>;
        let button: HTMLElement;
        switch(evt.code) {
            case "ArrowLeft":
            case "KeyA":
                button = btns[3];
                break;
            case "ArrowRight":
            case "KeyD":
                button = btns[1];
                break;
            case "ArrowUp":
            case "KeyW":
                button = btns[0];
                break;
            case "ArrowDown":
            case "KeyS":
                button = btns[2];
                break;
            default:
                button = null;
                break;
        }

        this.activateButton(button);
    }

    private initMainUI() {
        const buttons = this.model.props.buttons;

        // Click controls (contains main logic)
        buttons.addEventListener("click", evt =>
            this.activateButton(evt.target as HTMLElement));

        // Keyboard controls (triggers click)
        document.addEventListener("keydown", this.keydownHandler);

        // Button animation end. Removes anim class.
        buttons.addEventListener("animationend", evt => {
            const target = evt.target as HTMLElement;
            if (evt.animationName === "blink") {
                target.classList.remove("blink");
                target.children[0].classList.remove("blink");
            }
        });

        // Click "Play Again?" button
        const playAgain = this.model.props.playAgain;
        playAgain.addEventListener("click", evt => {

            if (playAgain.classList.contains("show")) {
                playAgain.classList.remove("show");
                this.model.startGame();
                this.playTones();
            }
        });
    }


    init() {
        //this.testAudio();
        this.initSoundbar();
        this.initAudio();
        this.initOverlay();
        this.initMainUI();
    }


    // Called in init(). Loads audio for each button.
    private initAudio() {
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

    private playSound(target: HTMLElement) {
        const audio = this.model.props.audio;
        const synth = audio.getSynth(target.id);
        if (synth)
            synth.play();
    }

    private playButtonAnimSound(target: HTMLElement) {

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

    /*
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
    */
}