
export async function loadAudioBuffer(context: BaseAudioContext, url: string) {
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    return context.decodeAudioData(buf);
}
