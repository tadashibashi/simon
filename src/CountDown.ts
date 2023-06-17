

export class CountDown {
    overlayEl: HTMLDivElement;
    numberEl: HTMLParagraphElement;
    count: number;
    interval: NodeJS.Timer | null;

    constructor() {
        const overlayEl = document.createElement("div");
        overlayEl.classList.add("overlay", "hidden");

        const numberEl = document.createElement("p");
        numberEl.classList.add("countdown", "hidden");

        document.body.prepend(overlayEl, numberEl);

        this.interval = null;
        this.count = -1;
        this.overlayEl = overlayEl;
        this.numberEl = numberEl;
    }

    start() {

    }
}