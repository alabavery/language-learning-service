import FrequentStringSeeder from './frequentStrings';
import Service from '../../src/services/baseService';

async function seed() {
    await FrequentStringSeeder.seed(Service);
}

seed();