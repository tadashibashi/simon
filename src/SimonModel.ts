import {Model} from "./lib/Model";
import {AudioEngine} from "./lib/AudioEngine";

export enum GameState {
    // Play button with grayed-out screen.
    Standby,
    // Count down when player decides to play game
    CountDown,
    // Computer plays back tones
    PlayTones,
    // Wait for player to press first response
    AwaitResponse,
    // Player must respond in time, in order
    Response,
    // Plays a reward tone if player reaches a significant score
    RewardTone,
    // After player loses, shows score and play again button
    Result,
    // Number of states in GameState. Leave last.
    MAX_COUNT
}

enum Action {
    Start,
    Progress,
    Lose
}


export interface SimonState {
    turnNumber: number;
    progress: number;
    // milliseconds between player button presses
    speed: number;
    gameState: GameState;
}

const stateDefault: SimonState = {
    turnNumber: 0,
    progress: 0,
    speed: 800,
    gameState: GameState.Standby,
};

export interface SimonProps {
    buttons: HTMLElement;
    volume: HTMLInputElement;
    order: Uint8Array;
    audio: AudioEngine; // audio engine
}


export class SimonModel extends Model<SimonProps, SimonState, Action> {
    constructor() {
        const props: SimonProps = {
            buttons: document.querySelector(".buttons"),
            order: new Uint8Array(30),
            volume: document.querySelector("#volume"),
            audio: new AudioEngine
        };

        super(props, stateDefault);
    }

    startGame() {
        this.reducer(Action.Start, null);
    }

    progress() {
        this.reducer(Action.Progress, null);
    }

    lose() {
        this.reducer(Action.Lose, null);
    }

    reducerImpl(type: Action, data: any, lastState: SimonState): SimonState {
        switch(type) {
            case Action.Start:
                return Object.assign({}, stateDefault, { gameState: GameState.CountDown});
            case Action.Progress: {
                const partial: Partial<SimonState> = {};

                const step = lastState.progress + 1;
                if (lastState.gameState === GameState.AwaitResponse) {
                    lastState.gameState = GameState.Response;
                }

                if (step > lastState.turnNumber) {
                    partial.progress = 0;
                    if (lastState.gameState === GameState.PlayTones)
                        partial.gameState = GameState.AwaitResponse;
                    else if (lastState.gameState === GameState.Response)
                        partial.gameState = GameState.PlayTones;
                }
                return Object.assign({}, lastState, partial);
            }
            case Action.Lose: {
                return Object.assign({}, lastState, { gameState: GameState.Result });
            }
            default:
                return lastState;
        }
    }

}