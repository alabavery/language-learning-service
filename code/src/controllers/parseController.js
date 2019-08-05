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
import ParseService from '../services/parseService';
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
     * - transcript
     * - suggestions: { [unresolvedStringId]: knownWords[] }
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    getResolveDataForAudio: async (req, res) => {
        const { audioId } = req.query;
        const audio = (await Service.findAll(AudioModel, { id: audioId }))[0];
        const clips = await Service.findAll(ClipModel, { audioId });
        const knownWords = await Service.findAll(WordModel);
        const unresolvedStrings = await Service.findAll(
            UnresolvedStringModel,
            {clipId: clips.map(c => c.id)},
        );

        res.status(200).json({
            unresolvedStrings,
            transcript: audio.transcript,
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

        console.log(resolveData);
        const wordClipsCreated = await ParseService.makeWordClipsFromResolveData(resolveData);

        const unresolvedStringsCreated = await ParseService.makeUnresolvedStringsFromResolveData(resolveData);

        // for those clips that ended up with no unresolved strings, mark them resolved
        const resolvedClipsCreated = await ParseService.markClipsResolvedFromResolveData(resolveData);
        const unresolvedClipsCreated = clipsCreated.filter(
            clip => !resolvedClipsCreated.find(resolvedClip => resolvedClip.id === clip.id),
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

