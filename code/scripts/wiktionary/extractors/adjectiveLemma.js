// if returns null, should assume this string/word is itself the lemma
export default function (partOfSpeechText) {
    const preceder = 'form of|';
    const startOfFormOf = partOfSpeechText.indexOf(preceder);
    if (startOfFormOf < 0) {
        return null;
    }
    const textAfterPreceder = startOfFormOf + preceder.length;
    const end = textAfterPreceder.indexOf('|') || textAfterPreceder.indexOf('}}');
    if (!end) {
        throw new Error(`No end delimiter found for lemma`);
    }
    return textAfterPreceder.slice(0, end);
}