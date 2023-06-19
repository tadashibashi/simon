import {View} from "./lib/UI/View";
import {SimonModel} from "./SimonModel";

export class SimonView extends View<SimonModel> {

    constructor(model: SimonModel) {
        super(model);
    }
    renderImpl(model: SimonModel): void {

    }
}