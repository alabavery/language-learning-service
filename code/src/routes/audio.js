import express from 'express';
import AudioController from '../controllers/audioController';
import multer from "multer";
const router = express.Router();

router.post('/', multer({ dest: 'audioUploads/' }).single('audio'), AudioController.createAudio);

export default router;