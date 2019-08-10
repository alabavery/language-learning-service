import * as _ from 'lodash';
import {
    ClipModel,
    LessonModel,
    ClipLessonModel,
    UnresolvedStringModel,
    WordClipModel,
    WordLessonModel,
    WordUserModel,
} from '../models/tables/index';
import Service from '../services/baseService';
import FindByIdsValidators from "./validators/findByIdsValidation";
import MediaHandler from '../media-handling/media-handler';
import MakeLessonFunctions from '../functions/makeLessons';

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
        const { focusWordIds, userId, thresholdForUserKnowledge, numOfClipsInLesson } = req.query;

        const {
            clips,
            userWordClips,
            allUnresolvedStringsForClips,
            allWordClipsForClips,
            allWordLessonsForUser,
        } = await getData(userId);

        const clipsToUse = MakeLessonFunctions.getClipsToUserInOrder(
            clips,
            userWordClips,
            allWordClipsForClips,
            allUnresolvedStringsForClips,
            allWordLessonsForUser,
            thresholdForUserKnowledge,
            numOfClipsInLesson,
            focusWordIds,
        );
        res.status(200).json({ clips: clipsToUse });
    },
};

async function getData(userId) {
    console.log("\n\nuser id is ", userId);
    // get all userWords for user
    const userWords = await Service.findAll(WordUserModel, { userId });
    // get all word clips user words
    const wordIdsToSeek = _.uniq(userWords.map(uw => uw.wordId));
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

    const allLessonsForUser = await Service.findAll(LessonModel, { userId });
    const allWordLessonsForUser = await Service.findAll(WordLessonModel, {
        lessonId: allLessonsForUser.map(l => l.id),
    });

    return { clips, userWordClips, allUnresolvedStringsForClips, allWordClipsForClips, allWordLessonsForUser };
}
