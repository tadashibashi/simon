// This file contains the class BusMgr, which manages a set of busses. By default a master bus
// is created, which by default is attached to the AudioContext#destination, unless otherwise
// specified. All busses created by this manager are attached to the master bus by default.
// Created busses are stored in the manager by key, and can be retrieved via BusMgr#get
import { Bus } from "./Bus";

export class BusMgr implements IDisposable {
    private mMasterBus: Bus;
    private mBusses: Map<string, Bus>;
    private readonly mContext: AudioContext;

    get context() { return this.mContext; }
    get master() { return this.mMasterBus; }

    /**
     * @param context - audio context
     * @param target - master bus will connect to this target
     */
    constructor(context: AudioContext, target?: AudioNode) {
        this.mContext = context;
        this.mMasterBus = new Bus(context, target);
        this.mBusses = new Map;

        this.mBusses.set("master", this.mMasterBus);
    }

    /**
     * Creates a bus, and stores it in the AudioEngine. It can be retrieved via AudioEngine#getBus
     * @param key key to set and retrieve this new bus. It must be unique, otherwise no bus will be created.
     * @param target Target node to connect the bus to. Left unspecified, will set it to the
     * master bus.
     * @returns created audio bus, or null if the key was not unique.
     */
    create(key: string, target?: AudioNode): Bus | null {
        if (this.mBusses.has(key))
            return null;

        const newBus = new Bus(this.context, target || this.mMasterBus.input);
        this.mBusses.set(key, newBus);

        return newBus;
    }

    get(key: string): Bus | null {
        const bus = this.mBusses.get(key);
        return bus ? bus : null;
    }

    remove(key: string): boolean {
        const bus = this.mBusses.get(key);
        if (bus)
            bus
        return this.mBusses.delete(key);
    }

    dispose() {
        this.mBusses.forEach(bus => bus.dispose());
        this.mBusses.clear();

        this.mBusses = null;
        this.mMasterBus = null;
    }
}
