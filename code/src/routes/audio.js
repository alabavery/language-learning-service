import express from 'express';
import AudioController from '../controllers/audioController';
import multer from "multer";
import {FULL_AUDIO_DIR_PATH} from "../config";
const router = express.Router();

router.post('/', multer({ dest: `${FULL_AUDIO_DIR_PATH}/` }).single('audio'), AudioController.createAudio);

export default router;