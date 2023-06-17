import {SimonModel} from "./SimonModel";
import {SimonView} from "./SimonView";
import {SimonController} from "./SimonController";

export class Simon {

    model: SimonModel;
    view: SimonView;
    controller: SimonController;
    constructor() {
        this.model = new SimonModel;
        this.view = new SimonView(this.model);
        this.controller = new SimonController(this.model);
    }
}