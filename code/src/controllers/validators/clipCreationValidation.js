function validateRequestBody(body) {
    if (!body.audioId) {
        return `Must provide an audioId!`;
    }
    if (!body.clipEnds || !body.clipEnds.length) {
        return `Must provide a non-empty array of clipEnds`;
    }
    if (!body.phrases || !body.phrases.length) {
        return `Must provide a non-empty array of phrases`;
    }
    if (body.phrases.length !== body.clipEnds.length) {
        return `clipEnds must be the same length as phrases!`;
    }
}

export default { validateRequestBody };