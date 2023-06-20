
export abstract class Model<Props, State, ActionType> {
    state: State;
    props: Props;
    stateHistory: {state: State, time: Date}[];

    onStateUpdated: (model: Model<Props, State, ActionType>) => void | null;

    protected constructor(propsDefault: Props, stateDefault: State) {
        this.props = propsDefault;
        this.state = stateDefault;
        this.stateHistory = [];
        this.onStateUpdated = null;
    }

    // Used by child class to set state via its reducerImpl
    protected reducer(type: ActionType, data: any) {
        // Get resultant state from reducer implementation from child class
        const newState = this.reducerImpl(type, data, this.state);

        // If lastState was returned, no changes have been made, so return
        if (Object.is(newState, this.state))
            return;

        // Changes have been made, record and set them.
        this.stateHistory.push({state: newState, time: new Date()});
        this.state = newState;

        // Fire callback to listener
        if (this.onStateUpdated)
            this.onStateUpdated(this);

        // console.log(this.state);
    }

    // To be implemented by child class, but not called directly. Please use reducer().
    abstract reducerImpl(type: ActionType, data: any, lastState: State): State;
}