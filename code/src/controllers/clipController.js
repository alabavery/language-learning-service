import MediaHandler from '../media-handling/media-handler';
import Service from '../services/baseService';
import {AudioModel, ClipModel} from "../models/tables";
import ClipCreationValidators from './validators/clipCreationValidation';

export default {
    /**
     * Note that this does not create any word clips or unresolved strings for
     * the clips.  It should therefore not be used in production.
     * It also marks created clips as unresolved.
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    createClips: async function (req, res) {
        const { audioId, clipEnds, phrases } = req.body;
        const requestError = ClipCreationValidators.validateRequestBody(req.body);
        if (requestError) {
            res.status(400).send(requestError);
            return;
        }

        const audioEntity = (await Service.findAll(AudioModel, { id: audioId }))[0];
        const paths = await MediaHandler.createClipSources(audioEntity.path, clipEnds);
        const clips = await Service.bulkCreate(
            ClipModel,
            paths.map((path, index) => ({
                path,
                audioId,
                text: phrases[index],
                resolved: false,
                ordinalInFullAudio: index,
            })),
            { audioId }
        );

        res.status(200).json({ clips });
    },
}
