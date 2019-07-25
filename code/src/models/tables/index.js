import AudioModel from './audio';
import ClipModel from './clip';
import FrequentStringModel from './frequentStrings';
import WordModel from './word';
import WordClipModel from './wordClip';
import UnresolvedStringModel from './unresolvedString';

// clip has a audioId
defineManyToOne(ClipModel, AudioModel);
// unresolved_string has a clipId
defineManyToOne(UnresolvedStringModel, ClipModel);
// word_clip has a clipId and a wordId
defineManyToOne(WordClipModel, ClipModel);
defineManyToOne(WordClipModel, WordModel);


export {
    AudioModel,
    ClipModel,
    FrequentStringModel,
    UnresolvedStringModel,
    WordModel,
    WordClipModel,
}

function defineManyToOne(manyModel, oneModel) {
    oneModel.hasMany(manyModel);
    manyModel.belongsTo(oneModel);
}