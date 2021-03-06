import AudioModel from './audio';
import ClipModel from './clip';
import FrequentStringModel from './frequentStrings';
import WordModel from './word';
import WordClipModel from './wordClip';
import UnresolvedStringModel from './unresolvedString';
import LessonModel from './lesson';
import ClipLessonModel from './clipLesson';
import UserModel from './user';
import WordUserModel from './wordUser';
import WordLessonModel from './wordLesson';


// clip has a audioId
defineManyToOne(ClipModel, AudioModel);
// unresolved_string has a clipId
defineManyToOne(UnresolvedStringModel, ClipModel);
// word_clip has a clipId and a wordId
defineManyToOne(WordClipModel, ClipModel);
defineManyToOne(WordClipModel, WordModel);
// clip_lessons have a lessonId and a clipId
defineManyToOne(ClipLessonModel, ClipModel);
defineManyToOne(ClipLessonModel, LessonModel);
// word_user has one user and one word
defineManyToOne(WordUserModel, UserModel);
defineManyToOne(WordUserModel, WordModel);
// word_lesson has one lesson and one word
defineManyToOne(WordLessonModel, WordModel);
defineManyToOne(WordLessonModel, LessonModel);
// lessons are created by user
defineManyToOne(LessonModel, UserModel);

export {
    AudioModel,
    ClipModel,
    ClipLessonModel,
    FrequentStringModel,
    LessonModel,
    UnresolvedStringModel,
    UserModel,
    WordModel,
    WordClipModel,
    WordLessonModel,
    WordUserModel,
}

function defineManyToOne(manyModel, oneModel) {
    oneModel.hasMany(manyModel);
    manyModel.belongsTo(oneModel);
}