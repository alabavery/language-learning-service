import wordService from '../../src/services/wordService';
import { WordModel } from '../../src/models/tables/index';

export default {
    seed: async function (service) {
      const toCreate = [];
      for (let i = 0; i < this.words.length; i += 1) {
          if (await wordService.findExistingWordsForData(this.words[i]).length === 0) {
              toCreate.push(this.words[i]);
          }
      }
      return service.bulkCreate(WordModel, toCreate);
    },
    //  str, partOfSpeech, meaning, tense, plurality, person, gender
}