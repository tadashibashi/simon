import { Model } from "./Model";

export abstract class View<M extends Model<any, any, any> > {
    protected model: M;

    protected constructor(model: M) {
        this.model = model;

        model.onStateUpdated = this.render.bind(this);
    }

    render(model: M) {
        this.renderImpl(model);
    }

    cleanup() {
        this.model.onStateUpdated = null;
    }

    abstract renderImpl(model: M): void;
}
