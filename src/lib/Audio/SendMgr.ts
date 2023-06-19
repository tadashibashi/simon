// The SendMgr manages a list of Sends, useful to broadcast input signals to other sources.
import {Send} from "./Send";

export class SendMgr {
    private mSends: Send[];
    private readonly mContext: AudioContext;
    private readonly mInput: GainNode;

    constructor(context: AudioContext) {
        this.mContext = context;
        this.mSends = [];
        this.mInput = new GainNode(context);
    }

    get input(): AudioNode { return this.mInput; }

    create(target: AudioNode): Send {
        const newSend = new Send(this.mContext, target);
        this.mInput.connect(newSend.input);
        this.mSends.push(newSend);
        return newSend;
    }

    /**
     * Get a Send previously created on this send manager
     * @param idxOrTarget if index, it must be a value between 0 and SendMgr#length. If an AudioNode target,
     * it will return the first Send that is targeting the AudioNode. If none exists, null is returned.
     */
    get(idxOrTarget: number | AudioNode): Send | null {
        return (typeof idxOrTarget === "number") ?
            this.mSends[idxOrTarget] || null :
            this.mSends.find(send => Object.is(send.target, idxOrTarget)) || null;
    }


    /**
     * Remove a send belonging to this SendMgr, cached by the user.
     * @param send
     * @returns true: if send was successfully removed;
     * false: if it did not exist in the container.
     */
    remove(send: Send) {
        for (let i = 0; i < this.mSends.length; ++i) {
            if (Object.is(this.mSends[i], send)) {
                this.cleanSend(send);
                this.mSends.splice(i, 1);
                return true;
            }
        }

        return false;
    }

    /**
     * Remove all sends
     */
    removeAll() {
        this.mSends.forEach(send => this.cleanSend(send));
        this.mSends = [];
    }

    /**
     * Call when "destructing" the SendMgr
     */
    dispose() {
        this.removeAll();
    }

    /**
     * Get number of sends stored
     */
    get length() {
        return this.mSends.length;
    }

    /**
     * Removes all sends that have a specified target
     * @param target
     */
    removeIfTargeting(target: AudioNode) {
        let i = 0;
        while (i < this.mSends.length) {
            if (Object.is(this.mSends[i].target, target)) {
                this.cleanSend(this.mSends[i]);
                this.mSends.splice(i, 1);
            } else {
                ++i;
            }
        }
    }

    // Helper: cleans/removes all connections in an internal Send
    private cleanSend(send: Send) {
        send.disconnect();
        this.mInput.disconnect(send.input);
    }
}