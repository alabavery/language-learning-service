import express from 'express';
import ClipController from '../controllers/clipController';
const router = express.Router();

router.post('/', ClipController.createClips);

export default router;