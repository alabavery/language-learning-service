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
};
