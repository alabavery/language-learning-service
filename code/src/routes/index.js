import express from 'express';
import WordController from '../controllers/wordController';
const router = express.Router();

router.get('/known-words', WordController.getKnownWords);
router.get('/user-lexicon', WordController.getUserLexicon);
router.post('/known-words', WordController.addWordToKnownWords);
router.post('/user-lexicon', WordController.addWordToUserLexicon);

export default router;