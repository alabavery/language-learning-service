import fs from 'fs';
import extractors from './extractors/index';
import {PARTS_OF_SPEECH} from "./config";

// parsePages();

// async function parsePages() {
//     fs.readdir('./wiktionary/pages', async function(err, items) {
//         const lemmas = [];
//         const errors = [];
//         let terminate = false;
//
//         for (let i = 0; i < 2; i += 1) {
//             const pageText = await fs.readFileSync(
//                 `./wiktionary/pages/${items[i]}`,
//                 'utf8'
//             ).catch(err => {
//                 console.log(`problem getting file ${items[i]}: ${err.message}`);
//                 terminate = true;
//             });
//
//             if (terminate) {
//                 return;
//             }
//
//             try {
//                 lemmas.push(...parsePage(pageText));
//             } catch (e) {
//                 errors.push({
//                    item: items[i],
//                    error: e.message,
//                 });
//             }
//         }
//     });
// }
//
function parsePage(pageText, extractors) {
    const spanishPart = getSpanishPart(pageText);
    let textByPartOfSpeech;
    try {
        textByPartOfSpeech = getByPartOfSpeech(spanishPart);
    } catch (e) {
        throw new Error(`Problem dividing by part of speech: ${e.message}`);
    }
    return Object.keys(textByPartOfSpeech).reduce((acc, pos) => {
        try {
            acc[pos] = parsePartOfSpeech(pos, textByPartOfSpeech[pos], extractors);
        } catch (e) {
            throw new Error(`Problem extracting for pos ${pos}: ${e.message}`);
        }
        return acc;
    }, {});
}

function parsePartOfSpeech(pos, textForPartOfSpeech, extractors) {
    return extractors.reduce((extractedForPos, { key, get, posThatApply }) => {
        if (posThatApply.includes(pos)) {
            try {
                extractedForPos[key] = get(textForPartOfSpeech);
            } catch (e) {
                throw new Error(`Problem getting ${key}: ${e.message}`);
            }
        }
        return extractedForPos;
    }, {});
}


function getSpanishPart(pageText) {
    // get from ==Spanish== to end of file or to next language
    const startIndicator = "==Spanish==";
    const startsAt = pageText.indexOf(startIndicator);
    if (startsAt < 0) {
        throw new Error(`Did not find start of language`);
    }
    const afterStart = pageText.slice(startsAt + startIndicator.length);
    const nextLanguageStarts = /\s==[^=]\S*[^=]==\s/.exec(afterStart);
    return nextLanguageStarts
        ? afterStart.slice(0, nextLanguageStarts.index)
        : afterStart;
}

function getByPartOfSpeech(text) {
    const startsByPos = Object.values(PARTS_OF_SPEECH)
        .reduce((acc, pos) => {
            const start = text.indexOf(`===${pos}===`);
            if (start >= 0) {
                acc.push({ start, pos });
            }
            return acc;
        }, [])
        .sort((a, b) => a.start - b.start);

    return startsByPos.reduce((acc, posAndStart, i, all) => {
        const end = i === all.length - 1 ? undefined : all[i + 1].start;
        acc[posAndStart.pos] = text.slice(posAndStart.start, end);
        return acc;
    }, {});
}

const s = "==Catalan==\n" +
    "\n" +
    "===Etymology===\n" +
    "From {{der|ca|la|amābilis}}, corresponding to {{suffix|ca|amar|able}}.\n" +
    "\n" +
    "===Pronunciation===\n" +
    "* {{ca-IPA}}\n" +
    "* {{rhymes|aβle|lang=ca}}\n" +
    "\n" +
    "===Adjective===\n" +
    "{{ca-adj|mf}}\n" +
    "\n" +
    "# [[kind]], [[nice]], [[friendly]]\n" +
    "\n" +
    "====Related terms====\n" +
    "* {{l|ca|amabilitat}}\n" +
    "* {{l|ca|amar}}\n" +
    "\n" +
    "===Further reading===\n" +
    "* {{R:IEC2}}\n" +
    "* {{R:GDLC}}\n" +
    "* {{R:DNV}}\n" +
    "* {{R:DCVB}}\n" +
    "\n" +
    "----\n" +
    "\n" +
    "==Galician==\n" +
    "\n" +
    "===Alternative forms===\n" +
    "* {{alter|gl|amábel}}\n" +
    "\n" +
    "===Etymology===\n" +
    "From {{der|gl|la|amābilis}}.\n" +
    "\n" +
    "===Adjective===\n" +
    "{{gl-adj}}\n" +
    "\n" +
    "# [[lovable]]\n" +
    "\n" +
    "====Related terms====\n" +
    "* {{l|gl|amar}}\n" +
    "\n" +
    "===Further reading===\n" +
    "* {{R:DRAG}}\n" +
    "\n" +
    "----\n" +
    "\n" +
    "==Spanish==\n" +
    "\n" +
    "===Etymology===\n" +
    "From {{der|es|la|amābilis}}.\n" +
    "\n" +
    "===Pronunciation===\n" +
    "* {{es-IPA}}\n" +
    "\n" +
    "===Adjective===\n" +
    "{{es-adj|f=amable}} (''superlative'' '''[[amabilísimo]]''')\n" +
    "\n" +
    "# [[kind]], [[amiable]]\n" +
    "#: {{ux|es|Él es muy '''amable''' conmigo.|He is very kind to me.}}\n" +
    "# [[charming]]\n" +
    "\n" +
    "====Derived terms====\n" +
    "* {{l|es|amabilísimo}}\n" +
    "* {{l|es|amablemente}}\n" +
    "\n" +
    "====Related terms====\n" +
    "* {{l|es|amabilidad}}\n" +
    "* {{l|es|amar}}\n" +
    "\n" +
    "===Further reading===\n" +
    "* {{R:DRAE}}\n" +
    "\n" +
    "[[Category:Spanish 3-syllable words]]";

console.log(parsePage(s, extractors));
