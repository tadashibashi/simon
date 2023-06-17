import {Model} from "./Model";

export class Controller<M extends Model<any, any, any>> {
    protected model: M;
    protected constructor(model: M) {
        this.model = model;
    }
}