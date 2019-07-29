import express from 'express';
import LessonController from '../controllers/lessonController';
const router = express.Router();

router.post('/', LessonController.createLessonFromClips);
router.get('/select-clips', LessonController.selectClips);


export default router;