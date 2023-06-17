import {Controller} from "./lib/Controller";
import {SimonModel} from "./SimonModel";

export class SimonController extends Controller<SimonModel> {
    constructor(model: SimonModel) {
        super(model);
        this.init();
    }

    private init() {
        const m = this.model;

        // load audio
        const audio = m.props.audio;
        audio.init();
        const osc = m.props.audio.context.createOscillator();
        const gain = audio.context.createGain();
        gain.gain.value = 0;
        gain.connect(audio.context.destination);
        osc.type = "sine";
        osc.frequency.value = 440;
        osc.connect(gain);
        osc.start(0);

        m.props.buttons.addEventListener("click", () => {
            osc.frequency.value = 440;
            osc.frequency.linearRampToValueAtTime(880, audio.context.currentTime + 1);
            gain.gain.value = 1;
            gain.gain.linearRampToValueAtTime(0, audio.context.currentTime+1);
        });
    }
}