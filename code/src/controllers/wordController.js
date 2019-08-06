import {WordModel, WordUserModel} from '../models/tables/index';
import Service from '../services/baseService';
import WordCreationValidation from './validators/wordCreationValidation';

export default {
  getKnownWords: async (req, res) => {
      res.status(200).json(await Service.findAll(WordModel));
  },
  getUserLexicon: async (req, res) => {
    // const { userId } = req.params;
    // if (!userId) {
    //   res.status(403).json({ error: 'Must send a valid user id!' });
    // } else {
    //   res.status(200).json(await WordModel.getUserLexicon(userId));
    // }
  },
  addWordToKnownWords: async (req, res) => {
    const { wordData, alsoAddToUserLexicon, userId } = req.body;
    const error = WordCreationValidation.validateAddWordToKnownWords(wordData, alsoAddToUserLexicon, userId);
    if (error) {
      res.status(400).send(error);
      return;
    }

    console.log("req body", req.body);
    // note that the whole word is not actually returned anyway
    const newWord = await Service.create(WordModel, wordData);
    console.log("newWord", newWord);
    if (alsoAddToUserLexicon) {
      await Service.create(WordUserModel, { userId, wordId: newWord.id });
    }
    res.status(200).json(newWord)
  },
  addWordToUserLexicon: async (req, res) => {
    const userWord = await Service.create(WordUserModel, { userId: req.body.userId, wordId: req.body.wordId });
    res.status(200).json(userWord);
  },
};