import Service from '../services/baseService';
import {AudioModel} from "../models/tables";

export default {
    createAudio: async function (req, res) {
        console.log("\n\n\nhere!!!!!");
      // await Service.create(AudioModel, req.body);
      res.status(200).json(await Service.create(AudioModel, req.body));
    },
};