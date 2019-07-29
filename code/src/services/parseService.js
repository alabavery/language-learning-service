import Service from "./baseService";
import {ClipModel, UnresolvedStringModel, WordClipModel} from "../models/tables";

export default {
    makeWordClipsFromResolveData: async function (resolveData) {
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
    },
    makeUnresolvedStringsFromResolveData: async function (resolveData) {
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
    },
    markClipsResolvedFromResolveData: async function (resolveData) {
        return Service.updateMany(
            ClipModel,
            Object.keys(resolveData)
                .filter(clipId => resolveData[clipId].unresolvedStringsToCreate.length === 0),
            {resolved: true},
            true,
        );
    },
};
