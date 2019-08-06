import Service from '../services/baseService';
import { UserModel } from '../models/tables/index';

export default {
    createUser: async function (req, res) {
        res.status(200).json(await Service.create(UserModel, { name: req.body.name }));
    }
};
