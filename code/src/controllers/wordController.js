import WordModel from '../models/handleWord';

export default {
  getKnownWords: (req, res) => {
    return WordModel.getKnownWords();
  },
  getUserLexicon: (req, res) => {
    return WordModel.getUserLexicon(req.userId);
  },
  addWordToKnownWords: (req, res) => {

  },
  addWordToUserLexicon: (req, res) => {
    // req should contain isNewWord property, which tells us if this also needs to be added to the dictionary
  },
};