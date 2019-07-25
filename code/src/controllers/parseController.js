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
        const {audio, transcript, clipEnds, phrases, userId} = req.body;

        const audioCreated = await saveAudio(audio, transcript);

        const clipsCreated = await saveClips(audioCreated, clipEnds, phrases);

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
            audioCreated,
            resolvedClipsCreated,
            wordClipsCreated,
            unresolvedStringsCreated,
            unresolvedClipsCreated,
        });
    },
};

/**
 * For the full audio
 * Create the actual audio media and the audio entity
 * @param audioSource
 * @param transcript
 * @returns {Promise<*|Promise<*>>}
 */
async function saveAudio(audioSource, transcript) {
    const audioPath = await MediaHandler.createAudioSource(audioSource);
    return Service.create(AudioModel, {
        path: audioPath,
        transcript,
    });
}


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
        true,
        {audioId: audioEntity.id},
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
    const wordClipsToCreate = Object.keys(resolveData).reduce((acc, clipId) => {
        const wordClipsForClip = resolveData[clipId].wordClipEntitiesToCreate || [];
        if (wordClipsForClip.length) {
            acc.push(...wordClipsForClip.map(partial => Object.assign(partial, { clipId })));
        }
        return acc;
    }, []);

    return Service.bulkCreate(WordClipModel, wordClipsToCreate, true);
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
            true,
            { clipId: clipIds },
        ) : [];
}