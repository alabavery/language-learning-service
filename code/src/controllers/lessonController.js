import {
    ClipModel,
    LessonModel,
    ClipLessonModel,
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
        const { focusWordIds, userId } = req.params;

        // get all userWords for user

        // get all word clips for union of userWords and focusWords
        // get all clips for word clips
        // get all unresolvedStrings and wordClips for clips
        // filter out clips for which:
        // (number of wordClips for clip in union of userWords and focusWords) /
        // (all wordClips + unresolvedStrings for clip) < threshold
        // if resulting clips is longer than length of lesson, prioritize
        // focus words by dropping any clips w/no focus words until at a length of
        // lesson
        // if still longer than length of lesson, drop randomly
        // if preferred, group together clips that were adjacent in full audios
    },
};

async function getClipsForWordIds()