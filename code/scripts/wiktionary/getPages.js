import fs from 'fs';
import axios from 'axios';

function delay(seconds) {
    return new Promise(resolve => {
        setTimeout(resolve, seconds * 1000);
    });
}


async function getPages() {
    let terminate = false;
    const pagesToGet = JSON.parse(await fs.readFileSync('./wiktionary/frequentStrings.json'));
    for (let i = 1778; i < pagesToGet.length; i += 1) {
        await delay(0.5);

        const url = `https://en.wiktionary.org/wiki/${pagesToGet[i]}?action=raw`;
        const res = await axios.get(url).catch(err => {
            console.log(`encountered error at ${i}`);
            console.log(`Encountered the following error retrieving page ${url}`, err);
            terminate = true;
        });

        if (terminate) {
            break;
        }

        const path = `./wiktionary/pages/${pagesToGet[i]}_${i}`;
        fs.writeFile(path, res.data, err => {
            if (err) {
                console.log(`encountered error at ${i}`);
                console.log(`Encountered the following error writing to path ${path}`, err);
                terminate = true;
            }
        });
        if (terminate) {
            break;
        }
    }
}

getPages();