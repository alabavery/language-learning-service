import express from 'express';
import AudioController from '../controllers/audioController';
const router = express.Router();

router.post('/', AudioController.createAudio);

export default router;