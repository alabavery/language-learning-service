import { WordModel } from '../models/tables/index';

export default {
  getKnownWords: async (req, res) => {
      res.status(200).json(await WordModel.getKnownWords());
  },
  getUserLexicon: async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
      res.status(403).json({ error: 'Must send a valid user id!' });
    } else {
      res.status(200).json(await WordModel.getUserLexicon(userId));
    }
  },
  addWordToKnownWords: async (req, res) => {
    console.log("req body", req.body);
    // note that the whole word is not actually returned anyway
    const newWordId = (await WordModel.addWordToKnownWords(req.body.wordData)).id;
    console.log("newWordId", newWordId);
    if (req.body.alsoAddToUserLexicon) {
      await WordModel.addWordToUserLexicon(newWordId, req.body.userId);
    }
    res.status(200).json({ id: newWordId })
  },
  addWordToUserLexicon: async (req, res) => {
    await WordModel.addWordToUserLexicon(req.body.wordId, req.body.userId);
    res.status(200).send('success');
  },
  /**
   * Called after parsing is finished to determine which words from the transcript need to be resolved and to
   * provide
   * @param req
   * @param res
   * @return {Promise<void>}
   */
  getResolveData: async (req, res) => {

  },
};