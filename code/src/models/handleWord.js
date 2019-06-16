import db from '../models/dbConnection';

export default {
  getKnownWords: async () => {
    return db.any(`select * from word`);
  },
};
