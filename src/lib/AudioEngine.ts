// Controls the creation of web audio contexts
export class AudioEngine {
    private mContext: AudioContext | null;

    get context(): AudioContext {
        return this.mContext;
    }

    constructor() {
        this.mContext = null;
        this.interactionWorkaround = this.interactionWorkaround.bind(this);
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

        // Set-up audio interaction workaround
        window.addEventListener("pointerdown", this.interactionWorkaround);

        this.mContext = context;
        return true;
    }

    // Handler for audio interaction workaround. On most major browsers, audio context
    // must be resumed or created once the user interacts with the page.
    private interactionWorkaround() {
        this.context.resume()
            .then(() => {
                console.log("Resumed AudioContext.");
                window.removeEventListener("pointerdown", this.interactionWorkaround);
            })
            .catch(err => {
                console.log("Failed to resume AudioContext:", err);
            });
    }
}
