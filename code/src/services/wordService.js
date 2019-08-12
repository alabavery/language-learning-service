import Service from './baseService';
import {WordModel} from "../models/tables";

export default {
    findExistingWordsForData: async function (wordData) {
        const { str, partOfSpeech, meaning, tense, plurality, person, gender } = wordData;
        const possibleMatches = await Service.findAll(
            WordModel,
            {
                str, partOfSpeech,
                tense: tense || null,
                plurality: plurality || null,
                person: person || null,
                gender: gender || null,
            }
        );
        return possibleMatches.filter(word => this.meaningsAreCongruent(word.meaning, meaning));
    },
    meaningsAreCongruent: function (meaning1, meaning2) {
      return false;
    },
}