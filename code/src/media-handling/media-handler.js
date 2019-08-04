import uuid from 'uuid/v4';
import Ffmpeg from 'ffmpeg';
import fs from 'fs';
import { FULL_AUDIO_DIR_PATH, CLIPS_DIR_PATH, LESSONS_DIR_PATH } from "../config";

export default {
    /**
     * After creating an audio source, take the path to that and the ends of each clip
     * and create clip sources.  Return an array of their paths.
     * @param fullAudioFileName
     * @param clipEnds
     * @returns {Promise<*>}
     */
    createClipSources: async function (fullAudioFileName, clipEnds) {
        // save all the clips in a directory with the name of the full audio file within the clips directory
        if (!fs.existsSync(`${CLIPS_DIR_PATH}/${fullAudioFileName}`)){
            fs.mkdirSync(`${CLIPS_DIR_PATH}/${fullAudioFileName}`);
        }
        const clipPaths = clipEnds.map(_ => `${CLIPS_DIR_PATH}/${fullAudioFileName}/${uuid()}.mp3`);

        try {
            for (let i = 0; i < clipPaths.length; i++) {
                const audio = await new Ffmpeg(`${FULL_AUDIO_DIR_PATH}/${fullAudioFileName}`);
                const previousClipEnd = clipEnds[i - 1] || 0;
                // ffmpeg -ss [start] -i in.mp4 -t [duration] -c copy out.mp4
                audio.addCommand('-ss', previousClipEnd);
                audio.addCommand('-t', clipEnds[i] - previousClipEnd);
                audio.addCommand('-c', 'copy');
                await audio.save(clipPaths[i]);
            }
        } catch (e) {
            throw new Error(`Error creating clips media: ${e.msg || e.message}`);
        }

        console.log("CREATED CLIP MEDIAS");
        return clipPaths;
    },
    joinClipSources: async function (pathsToClips) {
        // $ cat mylist.txt
        // file '/path/to/file1'
        // file '/path/to/file2'
        // file '/path/to/file3'

        await fs.writeFile(
            `${LESSONS_DIR_PATH}/input_files.txt`,
            `file ${pathsToClips.join(' file ')}`,
        );

        const outputFilePath = `${LESSONS_DIR_PATH}/${uuid()}.mp3`;

        try {
            // $ ffmpeg -f concat -i mylist.txt -c copy output.mp4
            const process = await new Ffmpeg();
            process.addCommand('-f', 'concat');
            process.addCommand('-i', `${LESSONS_DIR_PATH}/input_files.txt`);
            process.addCommand('-c', 'copy');
            await process.save(outputFilePath);
        } catch (e) {
            throw new Error(`Error joining clip media: ${e.msg || e.message}`);
        }

        console.log("CREATED LESSON");
        return outputFilePath;
    },
}