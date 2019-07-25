export default {
    createAudioSource: async function (audio) {
        console.log("CREATED AUDIO SOURCE");
        return "here is a bogus path";
    },
    createClipSources: async function (fullAudioPath, clipEnds) {
        console.log("CREATED CLIPS");
        return clipEnds.map((_, index) => `bogusPath${index}`)
    },
}