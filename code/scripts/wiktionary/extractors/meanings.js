/**
 * Return array of meanings
 * @param partOfSpeechText
 * @returns {*[]}
 */
// TODO make this extract all meanings instead of just the first
export default function (partOfSpeechText) {
    const meanings = [];
    const pattern = /\s\[\[[^\[]\S*[^\[]]]/;
    let match = pattern.exec(partOfSpeechText);
    if (match) {
        meanings.push(match[0])
    }
    return meanings.map(meaning => meaning.slice(3, meaning.length - 2));
}