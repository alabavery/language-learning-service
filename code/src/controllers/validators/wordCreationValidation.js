function validateWordData(wordData) {

}

function validateAddToUserLexiconRequest(shouldAddToUserLexicon, userId) {

}

function validateAddWordToKnownWords(wordData, shouldAddToUserLexicon, userId) {
    const wordDataError = validateWordData(wordData);
    if (wordDataError) {
        return wordDataError;
    }
    const validateAddToUserLexiconRequestError = validateAddToUserLexiconRequest(shouldAddToUserLexicon, userId);
    if (validateAddToUserLexiconRequestError) {
        return validateAddToUserLexiconRequestError;
    }
}

export default { validateAddWordToKnownWords };