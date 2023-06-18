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

    get(idxOrTarget: number | AudioNode) {
        return (typeof idxOrTarget === "number") ?
            this.mSends[idxOrTarget] :
            this.mSends.find(send => Object.is(send.target, idxOrTarget));
    }

    /**
     * Removes send at index
     * @param index
     */
    removeAt(index: number) {
        const send = this.mSends[index];
        if (send) {
            this.cleanSend(send);
            this.mSends.splice(index, 1);
        }
    }

    /**
     * Remove all sends
     */
    removeAll() {
        this.mSends.forEach(send => this.cleanSend(send));
        this.mSends = [];
    }

    dispose() {
        this.removeAll();
    }

    /**
     * Get number of sends
     */
    get length() {
        return this.mSends.length;
    }

    /**
     * Removes all sends that have a specified target
     * @param target
     */
    removeAllTargeting(target: AudioNode) {
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

    private cleanSend(send: Send) {
        send.disconnect();
        this.mInput.disconnect(send.input);
    }
}