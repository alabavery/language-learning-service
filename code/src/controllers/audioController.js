import Service from '../services/baseService';
import {AudioModel} from "../models/tables";
import {FULL_AUDIO_DIR_PATH} from "../config";

export default {
    createAudio: async function (req, res) {
        console.log("\n\n\nhere!!!!!");
      // await Service.create(AudioModel, req.body);
      res.status(200).json(await Service.create(AudioModel, {
          transcript: req.body.transcript,
          // we want to exclude everything from the path saved in the db that is not
          // specific to this file
          // so we take everything in the path after the directory we know they are all
          // save under (by finding that dir name and slicing from its end + 1 for the "/")
          path: req.file.path.slice(req.file.path.indexOf(FULL_AUDIO_DIR_PATH) + FULL_AUDIO_DIR_PATH.length + 1),
      }));
    },
};