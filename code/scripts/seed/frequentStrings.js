import fs from 'fs';
import { FrequentStringModel } from '../../src/models/tables';

export default {
    seed: async function (service) {
        const strsToConsider = await fs.readFileSync('./wiktionary/frequentStrings.json');
        const allExistingStrs = (await FrequentStringModel.findAll()).map(fs => fs.str);
        const toCreate = JSON.parse(strsToConsider).filter(s => !allExistingStrs.includes(s));
        return service.bulkCreate(FrequentStringModel, toCreate.map(s => ({ str: s })));
    },
}