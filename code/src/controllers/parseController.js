import ResolveDataMethods from "../functions/resolveData";
import {
    AudioModel,
    ClipModel,
    FrequentStringModel,
    UnresolvedStringModel,
    WordClipModel,
    WordModel,
} from '../models/tables/index';
import Service from '../services/baseService';
import MediaHandler from '../media-handling/media-handler';
import {MIN_REQUIRED_LENGTH_TO_RESOLVE} from "../config";
import ClipCreationValidators from './validators/clipCreationValidation';

export default {
    /**
     * This provides the data needed for a user to resolve unresolvedStrings for a given
     * audio/transcript.
     * This is after the user has uploaded an audio and transcript and the method
     * this.saveParseData has already run.
     * It should return:
     * - unresolvedStrings
     * - phrases
     * - suggestions: { [unresolvedStringId]: knownWords[] }
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    getResolveDataForAudio: async (req, res) => {
        const { audioId } = req.params;
        const clips = await Service.findAll(ClipModel, { audioId });
        const knownWords = await Service.findAll(WordModel);
        const unresolvedStrings = await Service.findAll(
            UnresolvedStringModel,
            {clipId: clips.map(c => c.id)},
        );

        res.status(200).json({
            unresolvedStrings,
            phrases: clips.map(clip => clip.phrase),
            suggestions: unresolvedStrings.reduce((acc, unresolvedString) => {
                acc[unresolvedString.id] = ResolveDataMethods.getSuggestionsForString(
                    ResolveDataMethods.standardizeString(unresolvedString.rawString),
                    knownWords,
                );
                return acc;
            }, {}),
        });
    },
    /**
     * Save parse data should:
     *      - save the transcript entity
     *      - save full audio (both the actual file and an audio entity)
     *      - save clips (both the actual files and the entities
     *      - save any necessary unresolved_string entities
     *      - save word_clips
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    saveParseData: async (req, res) => {
        const { clipEnds, phrases, audioId, userId } = req.body;

        const requestError = ClipCreationValidators.validateRequestBody(req.body);
        if (requestError) {
            res.status(400).send(requestError);
            return;
        }

        const audioEntity = (await Service.findAll(AudioModel, { id: audioId }))[0];
        const clipsCreated = await saveClips(audioEntity, clipEnds, phrases);

        const resolveData = ResolveDataMethods.getResolveData(
            clipsCreated,
            await Service.findAll(WordModel),
            await Service.findAll(FrequentStringModel),
            MIN_REQUIRED_LENGTH_TO_RESOLVE,
        );

        const wordClipsCreated = await makeWordClipsFromResolveData(resolveData);

        const unresolvedStringsCreated = await makeUnresolvedStringsFromResolveData(resolveData);

        // for those clips that ended up with no unresolved strings, mark them resolved
        const resolvedClipsCreated = await markClipsResolvedFromResolveData(resolveData);
        const unresolvedClipsCreated = clipsCreated.filter(
            clip => !!resolvedClipsCreated.find(resolvedClip => resolvedClip.id === clip.id),
        );

        res.status(200).json({
            resolvedClipsCreated,
            wordClipsCreated,
            unresolvedStringsCreated,
            unresolvedClipsCreated,
        });
    },
};

/**
 * Create the actual audio media for the clips and the clip entities
 * @param audioEntity
 * @param clipEnds
 * @param phrases
 * @returns {Promise<*|Promise<*>>}
 */
async function saveClips(audioEntity, clipEnds, phrases) {
    const clipPaths = await MediaHandler.createClipSources(audioEntity.path, clipEnds);
    return Service.bulkCreate(
        ClipModel,
        clipPaths.map(
            (path, index) => ({
                path,
                resolved: false,
                text: phrases[index],
                ordinalInFullAudio: index,
                audioId: audioEntity.id,
            }),
        ),
        { audioId: audioEntity.id },
    );
}

async function markClipsResolvedFromResolveData(resolveData) {
    return Service.updateMany(
        ClipModel,
        Object.keys(resolveData)
            .filter(clipId => resolveData[clipId].unresolvedStringsToCreate.length === 0),
        {resolved: true},
        true,
    );
}

async function makeWordClipsFromResolveData(resolveData) {
    const createdWordClips = [];
    for (let i = 0; i < Object.keys(resolveData).length; i += 1) {
        const clipId = Object.keys(resolveData)[i];
        const partialWordClipsForClip = resolveData[clipId].wordClipEntitiesToCreate || [];
        if (partialWordClipsForClip.length) {
            const created = await Service.bulkCreate(
                WordClipModel,
                // resolveData[clipId].wordClipEntitiesToCreate does not have clipIds... assign it to each
                partialWordClipsForClip.map(partial => Object.assign(partial, { clipId })),
                // after creation, return what we just created by finding all word clips for this clip
                // and any of the words in these word clips.
                // TODO this is not sufficient find params when the same word appears twice in a single clip and the
                // first instance already has a word clip when the second is created -- in that case, the first instance
                // will be returned along with the second here, since it is of the same wordId and clipId.
                {
                    clipId,
                    wordId: partialWordClipsForClip.map(wc => wc.wordId),
                },
            );
            createdWordClips.push(...created);
        }
    }
    return createdWordClips;
}

async function makeUnresolvedStringsFromResolveData(resolveData) {
    const { clipIds, unresolvedStrsToCreate } = Object.keys(resolveData).reduce((acc, clipId) => {
        const strsForClip = resolveData[clipId].unresolvedStringsToCreate || [];
        if (strsForClip.length) {
            acc.unresolvedStrsToCreate.push(...strsForClip.map(partial => Object.assign(partial, { clipId })));
            acc.clipIds.push(clipId);
        }
        return acc;
    }, { clipIds: [], unresolvedStrsToCreate: [] });
    return unresolvedStrsToCreate.length
        ? Service.bulkCreate(
            UnresolvedStringModel,
            unresolvedStrsToCreate,
            { clipId: clipIds },
        ) : [];
}