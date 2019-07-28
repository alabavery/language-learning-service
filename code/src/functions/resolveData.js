export default {
    getSuggestionsForString: function (standardizedStr, knownWords) {
        return knownWords.filter(word => word.str === standardizedStr);
    },
    standardizeString: function (rawString) {
        return rawString.toLowerCase();
    },
    getRawString: function (text, lastSpaceOrPunctuation, end) {
        return text.slice(lastSpaceOrPunctuation + 1, end);
    },
    /**
     *
     * @param standardizedStr
     * @param knownWords
     * @param frequentStrings
     * @returns {*} - a matching word or undefined if no match
     */
    getKnownWordForString: function (standardizedStr, knownWords, frequentStrings) {
        const knownWordsThatMatchString = this.getSuggestionsForString(standardizedStr, knownWords);
        // this string has a match IFF there is exactly 1 known word for the str and 1 or 0
        // frequent strings.  Return the matching word in this case.  Otherwise, return nothing.
        if (
            knownWordsThatMatchString.length === 1 &&
            frequentStrings.filter(({str}) => str === standardizedStr).length <= 1
        ) {
            return knownWordsThatMatchString[0];
        }
    },
    /**
     *
     * @param phrase
     * @param minRequiredLengthToResolve
     * @returns {Array} - each item is { rawString, locationInText }
     */
    splitPhraseIntoStrings: function (phrase, minRequiredLengthToResolve) {
        const returned = [];
        let lastSpaceOrPunctuation = -1;
        let i = 0;
        while (i < phrase.length) {
            if ([' ', '.', ',', '"'].includes(phrase[i])) {
                if (i - lastSpaceOrPunctuation > minRequiredLengthToResolve) {
                    returned.push({
                        rawString: this.getRawString(phrase, lastSpaceOrPunctuation, i),
                        locationInText: lastSpaceOrPunctuation + 1,
                    });
                }
                lastSpaceOrPunctuation = i;
            } else if (i + 1 === phrase.length) {
                if (i - lastSpaceOrPunctuation >= minRequiredLengthToResolve) {
                    returned.push({
                        rawString: this.getRawString(phrase, lastSpaceOrPunctuation, i + 1),
                        locationInText: lastSpaceOrPunctuation + 1,
                    });
                }
            }
            i += 1;
        }
        return returned;
    },
    /**
     *
     * @returns * { [clipId]: { wordClipEntitiesToCreate, unresolvedStringsToCreate } }
     *      - wordClipEntitiesToCreate is an array of { rawString, wordId, locationInText }
     *      - unresolvedStringsToCreate is an array of { rawString, locationInText }
     */
    getResolveData: function (clipEntities, knownWords, frequentStrings, minRequiredLengthToResolve) {
        return clipEntities.reduce((acc, entity) => {
            const stringsToSaveAndTheirLocations = this.splitPhraseIntoStrings(entity.text, minRequiredLengthToResolve);
            return Object.assign(acc, {
                [entity.id]: this.getResolveDataForSinglePhrase(
                    stringsToSaveAndTheirLocations,
                    knownWords,
                    frequentStrings,
                ),
            });
        }, {});
    },
    /**x
     * return object { wordClipEntitiesToCreate, unresolvedStringsToCreate }
     * @param stringsToSaveAndTheirLocations
     * @param knownWords
     * @param frequentStrings
     * @returns {*|{wordClipEntitiesToCreate: Array, unresolvedStringsToCreate: Array}}
     */
    getResolveDataForSinglePhrase: function (stringsToSaveAndTheirLocations, knownWords, frequentStrings) {

        return stringsToSaveAndTheirLocations.reduce((acc, {rawString, locationInText}) => {
            const standardizedStr = rawString.toLowerCase();
            const matchingKnownWord = this.getKnownWordForString(standardizedStr, knownWords, frequentStrings);
            if (matchingKnownWord) {
                acc.wordClipEntitiesToCreate.push({rawString, wordId: matchingKnownWord.id, locationInText});
            } else {
                acc.unresolvedStringsToCreate.push({rawString, locationInText});
            }
            return acc;
        }, {wordClipEntitiesToCreate: [], unresolvedStringsToCreate: []})
    },
}

//
// /*
// Methods for determining what strings need to be resolved and getting data
// to aid in the resolution.
//  */
// export function getSuggestionsForString(standardizedStr, knownWords) {
//     return knownWords.filter(word => word.str === standardizedStr);
// }
//
// export function standardizeString(rawString) {
//     return rawString.toLowerCase();
// }
//
// /**
//  *
//  * @param standardizedStr
//  * @param knownWords
//  * @param frequentStrings
//  * @returns {*} - a matching word or undefined if no match
//  */
// export function getKnownWordForString(standardizedStr, knownWords, frequentStrings) {
//     const knownWordsThatMatchString = getSuggestionsForString(standardizedStr, knownWords);
//     // this string has a match IFF there is exactly 1 known word for the str and 1 or 0
//     // frequent strings.  Return the matching word in this case.  Otherwise, return nothing.
//     if (
//         knownWordsThatMatchString.length === 1 &&
//         frequentStrings.filter(str => str === standardizedStr).length <= 1
//     ) {
//         return knownWordsThatMatchString[0];
//     }
// }
//
// const getRawString = (text, lastSpaceOrPunctuation, end) =>
//     text.slice(lastSpaceOrPunctuation + 1, end);
//
// /**
//  *
//  * @param phrase
//  * @param minRequiredLengthToResolve
//  * @returns {Array} - each item is { rawString, locationInText }
//  */
// export function splitPhraseIntoStrings(phrase, minRequiredLengthToResolve) {
//     const returned = [];
//     let lastSpaceOrPunctuation = -1;
//     let i = 0;
//     while (i < phrase.length) {
//         if ([' ', '.', ',', '"'].includes(phrase[i])) {
//             if (i - lastSpaceOrPunctuation > minRequiredLengthToResolve) {
//                 returned.push({
//                     rawString: getRawString(phrase, lastSpaceOrPunctuation, i),
//                     locationInText: lastSpaceOrPunctuation + 1,
//                 });
//             }
//             lastSpaceOrPunctuation = i;
//         } else if (i + 1 === phrase.length) {
//             if (i - lastSpaceOrPunctuation >= minRequiredLengthToResolve) {
//                 returned.push({
//                     rawString: getRawString(phrase, lastSpaceOrPunctuation, i + 1),
//                     locationInText: lastSpaceOrPunctuation + 1,
//                 });
//             }
//         }
//         i += 1;
//     }
//     return returned;
// }
//
//
// /**
//  *
//  * @returns * { [clipId]: { wordClipEntitiesToCreate, unresolvedStringsToCreate } }
//  *      - wordClipEntitiesToCreate is an array of { rawString, wordId, locationInText }
//  *      - unresolvedStringsToCreate is an array of { rawString, locationInText }
//  */
// export async function getResolveData(clipEntities, knownWords, frequentStrings, minRequiredLengthToResolve) {
//     return clipEntities.reduce((acc, entity) => {
//         const stringsToSaveAndTheirLocations = splitPhraseIntoStrings(entity.text, minRequiredLengthToResolve);
//         return {
//             ...acc,
//             [entity.id]: getResolveDataForSinglePhrase(
//                 stringsToSaveAndTheirLocations,
//                 knownWords,
//                 frequentStrings,
//             ),
//         };
//     }, {});
// }
//
// /**x
//  * return object { wordClipEntitiesToCreate, unresolvedStringsToCreate }
//  * @param stringsToSaveAndTheirLocations
//  * @param knownWords
//  * @param frequentStrings
//  * @returns {*|{wordClipEntitiesToCreate: Array, unresolvedStringsToCreate: Array}}
//  */
// export function getResolveDataForSinglePhrase(stringsToSaveAndTheirLocations, knownWords, frequentStrings) {
//
//     return stringsToSaveAndTheirLocations.reduce((acc, { rawString, locationInText }) => {
//         const standardizedStr = rawString.toLowerCase();
//         const matchingKnownWord = getKnownWordForString(standardizedStr, knownWords, frequentStrings);
//         if (matchingKnownWord) {
//             acc.wordClipEntitiesToCreate.push({ rawString, wordId: matchingKnownWord.id, locationInText });
//         } else {
//             acc.unresolvedStringsToCreate.push({ rawString, locationInText });
//         }
//         return acc;
//     }, { wordClipEntitiesToCreate: [], unresolvedStringsToCreate: [] })
// }
