function getClipsToUserInOrder(
    clips,
    userWordClips,
    allWordClipsForClips,
    allUnresolvedStringsForClips,
    allWordLessonsForUser,
    thresholdForUserKnowledge,
    numOfClipsInLesson,
    focusWordIds,
) {
    const usableClips = getUsableClips(
        clips,
        userWordClips,
        allWordClipsForClips,
        allUnresolvedStringsForClips,
        thresholdForUserKnowledge,
    );

    const clipsToUse = getClipsToUseFromUsableClips(
        usableClips,
        numOfClipsInLesson,
        userWordClips,
        allWordClipsForClips,
        allWordLessonsForUser,
        focusWordIds,
    );
    // if preferred, group together clips that were adjacent in full audios
    return orderClips(clipsToUse);
}

export function getUsableClips(
    clips,
    userWordClips,
    allWordClipsForClips,
    allUnresolvedStringsForClips,
    thresholdForUserKnowledge,
) {
    // filter out clips for which:
    // (number of wordClips for clip in union of userWords and focusWords) /
    // (all wordClips + unresolvedStrings for clip) < threshold
    return clips.filter(clip => {
        const numOfWordsInClip = allWordClipsForClips.filter(wc => wc.clipId === clip.id).length;
        const numOfUserWordsInClip = userWordClips.filter(uwc => uwc.clipId === clip.id).length;

        const numOfUnresolvedStringsInClip = allUnresolvedStringsForClips
            .filter(urs => urs.clipId === clip.id)
            .length;

        return (numOfUserWordsInClip / (numOfUnresolvedStringsInClip + numOfWordsInClip)) > thresholdForUserKnowledge;
    });
}

/**
 * Usable clips are clips that the user knows enough words in to include in a lesson.  The
 * job of this method is to take an array of those and return a list of clips of the proper
 * length.
 * This is easy if there are no focus words selected - just arbitrarily slice the
 * list of usable words at the proper length.
 * If there are focus words selected, should prioritize those by selecting the clips with
 * the most of those words.
 *
 * @param usableClips - clips that user knows enough words in
 * @param numOfClipsInLesson - num of clips to put in lesson
 * @param allWordClipsForClips - all word clips for the clips referenced by useWordClips
 * @param allWordLessonsForUser
 * @param focusWordIds
 * @returns {*} - an array of clips of the length numOfClipsInLesson, where foc
 */
export function getClipsToUseFromUsableClips(
    usableClips,
    numOfClipsInLesson,
    allWordClipsForClips,
    allWordLessonsForUser,
    focusWordIds,
) {
    if (focusWordIds && focusWordIds.length) {
        usableClips = sortClipsByNumberOfFocusWords(usableClips, focusWordIds, allWordClipsForClips);
    } else {
        usableClips = sortClipsByNumberOfUnusedWords(usableClips, allWordClipsForClips, allWordLessonsForUser);
    }
    // if still longer than length of lesson, drop randomly
    return usableClips.length > numOfClipsInLesson
        ? usableClips.slice(0, numOfClipsInLesson)
        : usableClips;
}

export const sortClipsByNumberOfUnusedWords = (
    clips,
    allWordClipsForClips,
    allWordLessonsForUser,
) => {
    const usedWordIds = allWordLessonsForUser.map(wl => wl.wordId);
    const numOfUsedWordsByClipId = getNumOfWordsFromListInClipsByClipId(
      clips,
      allWordClipsForClips,
      usedWordIds,
    );
    // sort in reverse order, since we want the ones with the FEWEST used words
    return clips.sort((a, b) => numOfUsedWordsByClipId[a.id] - numOfUsedWordsByClipId[b.id]);
};

export const sortClipsByNumberOfFocusWords = (clips, focusWordIds, allWordClipsForClips) => {
    const numOfFocusWordsByClipId = getNumOfWordsFromListInClipsByClipId(
      clips,
      allWordClipsForClips,
      focusWordIds,
    );
    return clips.sort((a, b) => numOfFocusWordsByClipId[b.id] - numOfFocusWordsByClipId[a.id]);
};

const getNumOfWordsFromListInClipsByClipId = (
    clips,
    allWordClipsForClips,
    wordIds,
) => {
    const getNumOfWordsFromListInClip = clip => {
        const wordClipsInClip = allWordClipsForClips.filter(wc => wc.clipId === clip.id);
        return wordClipsInClip.filter(wc => wordIds.includes(wc.wordId)).length;
    };
    return clips.reduce((acc, clip) => {
        acc[clip.id] = getNumOfWordsFromListInClip(clip);
        return acc;
    }, {});
};

function orderClips(clips) {
    return clips;
}

export default {
    getClipsToUserInOrder,
    getUsableClips,
    getClipsToUseFromUsableClips,
    orderClips,
};