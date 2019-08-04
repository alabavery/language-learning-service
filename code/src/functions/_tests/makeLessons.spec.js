import {
    getClipsToUseFromUsableClips,
    sortClipsByNumberOfFocusWords,
    getUsableClips,
} from "../makeLessons";

const allWordClipsForClips = [
    { clipId: '1', wordId: 'a' },
    { clipId: '1', wordId: 'b' },
    { clipId: '2', wordId: 'a' },
    { clipId: '3', wordId: 'a' },
    { clipId: '3', wordId: 'b' },
    { clipId: '4', wordId: 'a' },
    { clipId: '4', wordId: 'b' },
    { clipId: '4', wordId: 'c' },
    { clipId: '4', wordId: 'd' },
];

describe('sortClipsByNumberOfFocusWords', () => {
    it ('works', () => {
       expect(
           sortClipsByNumberOfFocusWords(
               [
                   { id: '1' },
                   { id: '2' },
                   { id: '4' },
                   { id: '3' },
                   { id: '5' },
               ],
               ['a', 'b', 'c'],
               allWordClipsForClips,
           ),
       ).toEqual([
           { id: '4' },
           { id: '1' },
           { id: '3' },
           { id: '2' },
           { id: '5' },
       ]);
    });
    it ('works with no clips', () => {
        expect(
            sortClipsByNumberOfFocusWords(
                [],
                ['a', 'b', 'c'],
                allWordClipsForClips,
            ),
        ).toEqual([]);
    });
});

describe('getClipsToUseFromUsableClips', () => {
    it ('works when no focusWordIds', () => {
        expect(
            getClipsToUseFromUsableClips(
              [
                  { id: 1 },
                  { id: 2 },
                  { id: 3 },
                  { id: 4 },
                ],
                2,
                null,
                [],
            ),
        ).toEqual([
            { id: 1 },
            { id: 2 },
        ]);
    });
});

describe('getUsableClips', () => {
    // find the num of combined unresolved strings and wcs for a
    // a given clip below
    const allUnresolvedStringsForClips = [
        { clipId: '1' }, // 3 combined
        { clipId: '2' }, // 2 combined
        { clipId: '3' },
        { clipId: '3' }, // 4 combined
        { clipId: '4' }, // 5 combined
    ];
   it ('works', () => {
       // given that we have required a user know 60% of the
       // words for a clip, we should get the following:
       // - clip 1, since the user knows 66% of the words/unresolveds in 1
       // - clip 4, since the user knows 80% of those
      expect(
          getUsableClips(
              [
                  { id: '1' },
                  { id: '2' },
                  { id: '4' },
                  { id: '3' },
                  { id: '5' },
              ],
              [
                  { clipId: '1', wordId: 'a' },
                  { clipId: '1', wordId: 'b' },
                  { clipId: '2', wordId: 'a' },
                  { clipId: '3', wordId: 'a' },
                  { clipId: '3', wordId: 'b' },
                  { clipId: '4', wordId: 'a' },
                  { clipId: '4', wordId: 'b' },
                  { clipId: '4', wordId: 'c' },
                  { clipId: '4', wordId: 'd' },
              ],
              allWordClipsForClips,
              allUnresolvedStringsForClips,
              .6,
          ),
      ).toEqual([
          { id: '1' },
          { id: '4' },
      ])
   });
});