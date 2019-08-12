import { PARTS_OF_SPEECH } from "../config";
import getMeanings from './meanings';
import getAdjectiveLemma from './adjectiveLemma.js';

export default [
    {
        key: 'meanings',
        posThatApply: Object.values(PARTS_OF_SPEECH),
        get: getMeanings,
    },
    {
        key: 'lemma',
        posThatApply: [PARTS_OF_SPEECH.adjective],
        get: getAdjectiveLemma,
    }
];