import express from 'express';
import LessonController from '../controllers/lessonController';
const router = express.Router();

router.post('/', LessonController.createLessonFromClips);

export default router;