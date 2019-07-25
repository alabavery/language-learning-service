import ResolveDataMethods from '../resolveData';

describe('ResolveDataMethods.splitPhraseIntoStrings', () => {
    it('a b', () => {
        expect(
            ResolveDataMethods.splitPhraseIntoStrings('a b', 2),
        ).toEqual([]);
    });
    it('abc def', () => {
        expect(
            ResolveDataMethods.splitPhraseIntoStrings('abc def', 2),
        ).toEqual(
            [
                {rawString: 'abc', locationInText: 0},
                {rawString: 'def', locationInText: 4}
            ],
        );
    });
    it('.abc. .def.', () => {
        expect(
            ResolveDataMethods.splitPhraseIntoStrings('.abc. .def.', 3),
        ).toEqual(
            [
                {rawString: 'abc', locationInText: 1},
                {rawString: 'def', locationInText: 7}
            ],
        );
    });
    it('abcd efgh', () => {
        expect(
            ResolveDataMethods.splitPhraseIntoStrings('abcd efgh', 4),
        ).toEqual(
            [
                {rawString: 'abcd', locationInText: 0},
                {rawString: 'efgh', locationInText: 5}
            ],
        );
    });
    it('abcd  efgh', () => {
        expect(
            ResolveDataMethods.splitPhraseIntoStrings('abcd  efgh', 3),
        ).toEqual(
            [
                {rawString: 'abcd', locationInText: 0},
                {rawString: 'efgh', locationInText: 6}
            ],
        );
    });
    it('abcd.  .efgh', () => {
        expect(
            ResolveDataMethods.splitPhraseIntoStrings('abcd.  .efgh', 4),
        ).toEqual(
            [
                {rawString: 'abcd', locationInText: 0},
                {rawString: 'efgh', locationInText: 8}
            ],
        );
    });
    it('abcd.  .efgh.', () => {
        expect(
            ResolveDataMethods.splitPhraseIntoStrings('abcd.  .efgh.', 4),
        ).toEqual(
            [
                {rawString: 'abcd', locationInText: 0},
                {rawString: 'efgh', locationInText: 8}
            ],
        );
    });
    it('.abcd.  .efgh.', () => {
        expect(
            ResolveDataMethods.splitPhraseIntoStrings('.abcd.  .efgh.', 4),
        ).toEqual(
            [
                {rawString: 'abcd', locationInText: 1},
                {rawString: 'efgh', locationInText: 9}
            ],
        );
    });
    it('.abcd.  .efgh. hello', () => {
        expect(
            ResolveDataMethods.splitPhraseIntoStrings('.abcd.  .efgh. hello', 4),
        ).toEqual(
            [
                {rawString: 'abcd', locationInText: 1},
                {rawString: 'efgh', locationInText: 9},
                {rawString: 'hello', locationInText: 15}
            ],
        );
    });
    it('         ', () => {
        expect(
            ResolveDataMethods.splitPhraseIntoStrings('         ', 4),
        ).toEqual([]);
    });
    it('"abcd"', () => {
        expect(
            ResolveDataMethods.splitPhraseIntoStrings('"abcd"', 4),
        ).toEqual(
            [
                {rawString: 'abcd', locationInText: 1},
            ],
        );
    });
    it('"abcd." Hello', () => {
        expect(
            ResolveDataMethods.splitPhraseIntoStrings('"abcd." Hello', 4),
        ).toEqual(
            [
                {rawString: 'abcd', locationInText: 1},
                {rawString: 'Hello', locationInText: 8},
            ],
        );
    });
    it('"abcd." Hello', () => {
        expect(
            ResolveDataMethods.splitPhraseIntoStrings('"abcd." "Hello"', 4),
        ).toEqual(
            [
                {rawString: 'abcd', locationInText: 1},
                {rawString: 'Hello', locationInText: 9},
            ],
        );
    });
});

describe('getResolveDataForSinglePhrase', () => {
    it('handles no stringsToSaveAndTheirLocations', () => {

        const stringsToSaveAndTheirLocations = [];

        expect(
            ResolveDataMethods.getResolveDataForSinglePhrase(
                stringsToSaveAndTheirLocations,
                [{id: 'a_id', str: 'a'}],
                [{str: 'a'}],
            ),
        ).toEqual({
            wordClipEntitiesToCreate: [],
            unresolvedStringsToCreate: [],
        });
    });
    it('handles no known words', () => {

        const stringsToSaveAndTheirLocations = [
            {rawString: 'a', locationInText: 5},
        ];

        expect(
            ResolveDataMethods.getResolveDataForSinglePhrase(
                stringsToSaveAndTheirLocations,
                [],
                [],
            ),
        ).toEqual({
            wordClipEntitiesToCreate: [],
            unresolvedStringsToCreate: [{rawString: 'a', locationInText: 5}],
        });
    });
    it('handles no frequent strings', () => {

        const stringsToSaveAndTheirLocations = [
            {rawString: 'a', locationInText: 5},
        ];

        expect(
            ResolveDataMethods.getResolveDataForSinglePhrase(
                stringsToSaveAndTheirLocations,
                [{id: 'a_id', str: 'a'}],
                [],
            ),
        ).toEqual({
            wordClipEntitiesToCreate: [{rawString: 'a', locationInText: 5, wordId: 'a_id'}],
            unresolvedStringsToCreate: [],
        });
    });
    it('handles basic match', () => {

        const stringsToSaveAndTheirLocations = [
            {rawString: 'a', locationInText: 5},
        ];

        expect(
            ResolveDataMethods.getResolveDataForSinglePhrase(
                stringsToSaveAndTheirLocations,
                [{id: 'a_id', str: 'a'}],
                [{str: 'b'}],
            ),
        ).toEqual({
            wordClipEntitiesToCreate: [{rawString: 'a', locationInText: 5, wordId: 'a_id'}],
            unresolvedStringsToCreate: [],
        });
    });
    it('handles one known word and one unknown', () => {
        const stringsToSaveAndTheirLocations = [
            {rawString: 'b', locationInText: 0},
            {rawString: 'a', locationInText: 5},
        ];

        expect(
            ResolveDataMethods.getResolveDataForSinglePhrase(
                stringsToSaveAndTheirLocations,
                [{id: 'a_id', str: 'a'}],
                [{str: 'b'}],
            ),
        ).toEqual({
            wordClipEntitiesToCreate: [{rawString: 'a', locationInText: 5, wordId: 'a_id'}],
            unresolvedStringsToCreate: [{rawString: 'b', locationInText: 0}],
        });
    });
    it('handles two known words and one unknown', () => {
        const stringsToSaveAndTheirLocations = [
            {rawString: 'b', locationInText: 0},
            {rawString: 'a', locationInText: 5},
            {rawString: 'c', locationInText: 10},
        ];

        expect(
            ResolveDataMethods.getResolveDataForSinglePhrase(
                stringsToSaveAndTheirLocations,
                [{id: 'a_id', str: 'a'}, {id: 'c_id', str: 'c'}],
                [{str: 'b'}],
            ),
        ).toEqual({
            wordClipEntitiesToCreate: [
                {rawString: 'a', locationInText: 5, wordId: 'a_id'},
                {rawString: 'c', locationInText: 10, wordId: 'c_id'},
            ],
            unresolvedStringsToCreate: [{rawString: 'b', locationInText: 0}],
        });
    });
    it('standardizes string', () => {
        const stringsToSaveAndTheirLocations = [
            {rawString: 'A', locationInText: 0},
        ];

        expect(
            ResolveDataMethods.getResolveDataForSinglePhrase(
                stringsToSaveAndTheirLocations,
                [{id: 'a_id', str: 'a'}],
                [],
            ),
        ).toEqual({
            wordClipEntitiesToCreate: [
                {rawString: 'A', locationInText: 0, wordId: 'a_id'},
            ],
            unresolvedStringsToCreate: [],
        });
    });
});


describe('getKnownWordForString', () => {
    it('returns undefined when no known words and no frequent strings', () => {
        expect(
            ResolveDataMethods.getKnownWordForString(
                "hello",
                [],
                [],
            ),
        ).toEqual(
            undefined,
        );
    })
    it('returns undefined when no known words', () => {
        expect(
            ResolveDataMethods.getKnownWordForString(
                "hello",
                [],
                [{str: "hello"}],
            ),
        ).toEqual(
            undefined,
        );
    });
    it ('returns undefined when 1 known words but 2 frequent strings', () => {
        expect(
            ResolveDataMethods.getKnownWordForString(
                "hello",
                [{ str: "hello" }],
                [{ str: "hello" }, { str: "hello" }],
            ),
        ).toEqual(
            undefined,
        );
    });
    it ('returns word when 1 known words and no frequent strings', () => {
        expect(
            ResolveDataMethods.getKnownWordForString(
                "hello",
                [{ id: 'helloId', str: "hello" }],
                [],
            ),
        ).toEqual(
            { id: 'helloId', str: "hello" },
        );
    });
    it ('returns undefined when 2 known words and no frequent strings', () => {
        expect(
            ResolveDataMethods.getKnownWordForString(
                "hello",
                [
                    { id: 'helloId', str: "hello" },
                    { id: 'helloId2', str: "hello" },
                ],
                [],
            ),
        ).toEqual(
            undefined,
        );
    });
});
