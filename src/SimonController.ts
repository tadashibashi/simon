import {AudioEngine, MonoSynth, loadAudioBuffer} from "./lib/Audio";
import {Controller} from "./lib/UI/Controller";
import {GameState, SimonModel} from "./SimonModel";

export class SimonController extends Controller<SimonModel> {
    ir: AudioBuffer;

    constructor(model: SimonModel) {
        super(model);

        // Used as event listener, must bind this
        this.keydownHandler = this.keydownHandler.bind(this);

        // Init audio, preload impulse response used in reverb
        model.props.audio.init();
        loadAudioBuffer(model.props.audio.context, "audio/ir-cinema-room.wav")
            .then((buf) => {
                this.ir = buf;
                this.init();
            });
    }

    // ===== Initialization ===================================================

    // Initializes all components of the game.
    private init() {
        this.initOverlay();
        this.initVolumeSlider();
        this.initPlayAgainButton();
        this.initAudio();

        this.initButtons();
        this.initKeyboardControls();
    }

    // Called in init(). Loads audio for each button.
    private initAudio() {
        const audio = this.model.props.audio;

        // set up global reverb
        const reverb = audio.busses.master.effects.push(ConvolverNode, {buffer: this.ir});
        const filter = audio.busses.master.effects.push(BiquadFilterNode, {
            type: "lowpass",
            frequency: 300,
            Q: 2.0,
            gain: .5
        });

        reverb.setWetDry(.17);

        // load synths
        const type = "sawtooth";
        const attackTime = .05;
        const releaseTime = .1;
        const sustainLevel = .2;
        const decayTime = .25;
        const holdTime = 0;

        audio.loadSynth("red-button", "master", {
            type,
            frequency: 279.42
        }).envelope.set({
            attackTime,
            decayTime,
            sustainLevel,
            holdTime,
            releaseTime,
        });

        audio.loadSynth("green-button", "master", {
            type,
            frequency: 418.65
        }).envelope.set({
            attackTime,
            decayTime,
            sustainLevel,
            holdTime,
            releaseTime,
        });

        audio.loadSynth("blue-button", "master", {
            type,
            frequency: 554
        }).envelope.set({
            attackTime,
            decayTime,
            sustainLevel,
            holdTime,
            releaseTime,
        });

        audio.loadSynth("yellow-button", "master", {
            type,
            frequency: 469.92
        }).envelope.set({
            attackTime,
            decayTime,
            sustainLevel,
            holdTime,
            releaseTime,
        });

        audio.loadSynth("you-lost", "master", {
            type: "sine",
            frequency: 200,
        }).envelope.set({
            attackTime: 0,
            decayTime,
            sustainLevel,
            holdTime: .3,
            releaseTime,
        });

        const modulator = new MonoSynth(audio.context);
        modulator.gain.value = 200;
        modulator.type = "sine";
        modulator.frequency.value = 333;
        modulator.connect(audio.getSynth("you-lost").frequency);
        console.log(audio.getSynth("you-lost"));
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

            this.resetButtonsClass();

            // start tone playback & remove overlay in 1 second
            setTimeout(() => {
                this.playTones();
                document.body.removeChild(overlay);
            }, 1000);
        });
    }


    private initPlayAgainButton() {
        // Click "Play Again?" button
        const playAgain = this.model.props.playAgain;
        playAgain.addEventListener("click", evt => {

            if (playAgain.classList.contains("show")) {
                playAgain.classList.remove("show");

                this.resetButtonsClass();


                this.model.startGame();
                this.playTones();
            }
        });
    }


    private initKeyboardControls() {
        // Keyboard controls (triggers click)
        document.addEventListener("keydown", this.keydownHandler);
    }


    private initButtons() {
        const buttons = this.model.props.buttons;

        // Click controls (contains main logic)
        buttons.addEventListener("click", evt =>
            this.activateButton(evt.target as HTMLElement));

        // Button animation end. Removes anim class.
        buttons.addEventListener("animationend", evt => {
            const target = evt.target as HTMLElement;
            if (evt.animationName === "blink") {
                target.classList.remove("blink");
                target.children[0].classList.remove("blink");
            }
        });
    }


    private initVolumeSlider() {
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

    private resetButtonsClass() {
        // remove lose class from buttons
        const buttons = this.model.props.buttons.children;
        for (let i = 0; i < buttons.length; ++i) {
            const shadowDiv = buttons[i].children[0];
            if (shadowDiv) {
                shadowDiv.classList.remove("lose");
                shadowDiv.classList.remove("blink");
            }

        }
    }



    // ===== Game logic =======================================================

    // presses a button, triggering its animation/sound & progressing game state
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
                    this.playLoseAnimSound();
                    this.model.lose();
                }
            } break;
        }

        // nested helpers
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

    // executes playback phase
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

    // plays a tone based on the HTMLElement button target
    private playButtonSound(target: HTMLElement) {
        const audio = this.model.props.audio;
        const synth = audio.getSynth(target.id);
        if (synth)
            synth.play();
    }

    // triggers visual/audio effects for wrong button
    private playLoseAnimSound() {
        // Animation class
        const buttons = this.model.props.buttons.children;

        for (let i = 0; i < buttons.length; ++i) {
            if (this.getAnswerButtonIndex() !== i) {
                const shadowDiv = buttons[i].children[0];
                if (shadowDiv)
                    shadowDiv.classList.add("lose");
            } else {
                const shadowDiv = buttons[i].children[0];
                if (shadowDiv) {
                    setTimeout(() => shadowDiv.classList.add("blink"), 400);
                }

            }
        }


        // Audio
        const synth = this.model.props.audio.getSynth("you-lost");

        synth.frequency.value = 400;
        synth.play();

        setTimeout(() => {
            synth.frequency.value = 300;
            synth.play();
        }, 400);

    }


    // triggers visual/audio effects for correct button
    private playButtonAnimSound(target: HTMLElement) {

        this.playButtonSound(target);

        const child = target.children[0];
        child.classList.remove("blink");
        child.classList.add("blink");
        target.classList.remove("blink");
        target.classList.add("blink");
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
}