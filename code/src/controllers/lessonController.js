import * as _ from 'lodash';
import {
    ClipModel,
    LessonModel,
    ClipLessonModel,
    UnresolvedStringModel,
    WordClipModel,
    WordUserModel,
} from '../models/tables/index';
import Service from '../services/baseService';
import FindByIdsValidators from "./validators/findByIdsValidation";
import MediaHandler from '../media-handling/media-handler';

export default {
    createLessonFromClips: async function (req, res) {
        const { clipIds } = req.body;
        if (!clipIds || !clipIds.length) {
            res.status(400).send('Must have clipIds!');
        }
        const clips = await Service.findAll(ClipModel, { id: clipIds });
        const error = FindByIdsValidators.validateEntitiesFoundFromIds(clipIds, clips);
        if (error) {
            res.status(404).send(error);
        }
        const paths = clips.map(clip => clip.path);
        const lessonPath = await MediaHandler.joinClipSources(paths);
        const lesson = await Service.create(
            LessonModel, {
                path: lessonPath,
            },
        );
        // create clip_lessons
        const clipLessons = await Service.bulkCreate(
            ClipLessonModel,
            clips.map(clip => ({ clipId: clip.id, lessonId: lesson.id })),
            { lessonId: lesson.id },
        );

        res.status(200).json({ lesson, clipLessons });
    },
    selectClips: async function (req, res) {
        const { focusWordIds, userId, thresholdForUserKnowledge, numOfClipsInLesson } = req.params;

        const {
            clips,
            userWordClips,
            allUnresolvedStringsForClips,
            allWordClipsForClips,
        } = await getData(focusWordIds, userId);

        const clipIds = getClipIdsToUserInOrder(
            clips,
            userWordClips,
            allWordClipsForClips,
            allUnresolvedStringsForClips,
            thresholdForUserKnowledge,
            numOfClipsInLesson,
        );
        res.status(200).json({ clipIds });
    },
};

async function getData(userId, focusWordIds) {
    // get all userWords for user
    const userWords = await Service.findAll(WordUserModel, { userId });
    // get all word clips for union of userWords and focusWords
    const wordIdsToSeek = _.uniq(userWords.map(uw => uw.wordId).concat(focusWordIds));
    const userWordClips = await Service.findAll(WordClipModel, { wordId: wordIdsToSeek });
    // get all clips for word clips
    const clips = await Service.findAll(ClipModel, { id: userWordClips.map(wc => wc.clipId ) })
    // get all unresolvedStrings and wordClips for clips
    const allUnresolvedStringsForClips = await Service.findAll(
        UnresolvedStringModel,
        {clipId: clips.map(c => c.id) },
    );
    const allWordClipsForClips = await Service.findAll(
        WordClipModel,
        {clipId: clips.map(c => c.id) },
    );
    return { clips, userWordClips, allUnresolvedStringsForClips, allWordClipsForClips };
}

function getClipIdsToUserInOrder(
    clips,
    userWordClips,
    allWordClipsForClips,
    allUnresolvedStringsForClips,
    thresholdForUserKnowledge,
    numOfClipsInLesson,
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
    )
    // if preferred, group together clips that were adjacent in full audios
    return orderClips(clipsToUse);
}

function getUsableClips(
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
        const wordClipsInClip = allWordClipsForClips.filter(wc => wc.clipId === clip.id);
        const numOfUserWordsInClip = wordClipsInClip
            .filter(wc => userWordClips.find(uwc => uwc.id === wc.id))
            .length;


        const numOfUnresolvedStringsInClip = allUnresolvedStringsForClips
            .filter(urs => urs.clipId === clip.id)
            .length;

        return (numOfUserWordsInClip /
            (numOfUnresolvedStringsInClip + wordClipsInClip.length))
            > thresholdForUserKnowledge;
    });
}

function getClipsToUseFromUsableClips(
    usableClips,
    numOfClipsInLesson,
    userWordClips,
    allWordClipsForClips,
) {
    // if resulting clips is longer than length of lesson, prioritize
    // focus words by dropping any clips w/no focus words until at a length of
    // lesson
    while (usableClips.length > numOfClipsInLesson) {
        const thisClip = usableClips[usableClips.length - 1];
        const wordClipsInClip = allWordClipsForClips.filter(wc => wc.clipId === thisClip.id);
        if (!!wordClipsInClip.find(wc => userWordClips.find(uwc => uwc.id === wc.id))) {
            usableClips.pop();
        }
    }
    // if still longer than length of lesson, drop randomly
    return usableClips.length > numOfClipsInLesson
        ? usableClips.slice(0, numOfClipsInLesson)
        : usableClips;
}

function orderClips(clips) {
    return clips;
}