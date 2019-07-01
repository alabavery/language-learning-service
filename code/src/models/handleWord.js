import db from '../models/dbConnection';

const makeWordFromWordData = wordData => {
  if (!wordData) {
    throw new Error(`word data not received!`);
  }
  return {
    str: wordData.str,
    meaning: wordData.meaning,
    part_of_speech: wordData.partOfSpeech,
    metadata: JSON.stringify(wordData.metadata),
  }
};

export default {
  getKnownWords: async function () {
    return db.any(`SELECT * FROM word`);
  },
  getUserLexicon: async userId => {
    const results = await db.any(`SELECT word_id FROM learner_word WHERE learner_id = '${userId}'`);
    return (results || []).map(row => row.word_id);
  },
  addWordToKnownWords: async function (wordData) {
    const wordValues = Object.values(makeWordFromWordData(wordData)).join(" ', '");
    console.log("wordVlaues");
    console.log(wordValues);
    const r = await db.one(
      `INSERT INTO word (str, meaning, part_of_speech, metadata) VALUES ('${wordValues}') RETURNING id`,
    );
    console.log(r);
    return r;
  },
  addWordToUserLexicon: async (wordId, userId) => {
    console.log("wordId", wordId);
    console.log("userId", userId);
    await db.any(`INSERT INTO learner_word (learner_id, word_id) VALUES ('${userId}', '${wordId}')`)
    console.log("done");
  },
};
