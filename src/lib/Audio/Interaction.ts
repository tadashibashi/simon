// This file contains a function `interactionWorkaround`, which automatically resumes an AudioContext
// when the user first interacts with the page ("pointerdown" event). This is necessary on many modern
// browsers, which requires this gesture from the user to protect them from unwanted annoying audio.
// It is automatically called by the AudioEngine, but is available for use without any dependency on it.
// Author: Aaron Ishibashi, a.ishibashi.music@gmail.com

const InteractionWorkaroundEventType = "pointerdown";

// On most major browsers, audio contexts must be resumed or created once the user interacts with the page.
// Sets proper listeners to resume the context if the context has been suspended due to this caveat.
export function interactionWorkaround(context: AudioContext) {
    if (context.state === "running") return; // no need to execute if running properly

    window.addEventListener(InteractionWorkaroundEventType, callback);

    function callback() {
        context.resume()
            .then(() => {
                console.log("Resumed AudioContext.");
                window.removeEventListener(InteractionWorkaroundEventType, callback);
            })
            .catch(err => {
                console.log("Failed to resume AudioContext:", err);
            });
    }
}