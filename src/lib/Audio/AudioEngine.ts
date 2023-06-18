import {BusMgr} from "./BusMgr";
import {interactionWorkaround} from "./Interaction";

export class AudioEngine {
    private mContext: AudioContext;
    private mBusses: BusMgr;

    get busses(): BusMgr { return this.mBusses; }
    get context(): AudioContext { return this.mContext; }

    constructor() {
        this.mContext = null;
        this.mBusses = null;
    }

    wasInit(): boolean {
        return this.mContext !== null;
    }

    init(): boolean {
        let context: AudioContext | null = null;
        try {
            // @ts-ignore
            context = new (window.AudioContext || window.webkitAudioContext)();
        } catch(e) {
            console.error("AudioContext is not supported in this browser.");
            return false;
        }

        interactionWorkaround(context);

        this.mBusses = new BusMgr(context);
        this.mContext = context;
        return true;
    }

}
