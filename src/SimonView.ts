import {View} from "./lib/UI/View";
import {GameState, SimonModel} from "./SimonModel";

export class SimonView extends View<SimonModel> {

    constructor(model: SimonModel) {
        super(model);
    }
    renderImpl(model: SimonModel): void {
        const roundEl = model.props.roundDisplay.children[0] as HTMLElement;
        const roundNumEl = model.props.roundDisplay.children[1] as HTMLElement;

        // Update when the computer starts playing tones
        if ((model.state.gameState === GameState.PlayTones && model.state.progress > 0) || model.state.turnNumber === 0) {
            roundEl.innerText = "ROUND";
            roundNumEl.innerText = (model.state.turnNumber + 1).toString();
        }

    }
}