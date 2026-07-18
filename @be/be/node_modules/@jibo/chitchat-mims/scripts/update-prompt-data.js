'use strict'

/**
 * This script is to convert all PromptData references in chitchat-mims to
 * Pegasus compatible PromptData references in the same mims.
 *
 * This script is 1-way (v1 -> Pegasus) and should not be run on mims that
 * have already been converted to Pegasus-compliant PromptData-referencing mims.
 *
 * Default directory path assumes you are running it from the root of chitchat-mims.
 */


const FileUtils = require('jibo-cai-utils').FileUtils;
const PromiseUtils = require('jibo-cai-utils').PromiseUtils;
const PromiseQueue = require('jibo-cai-utils').PromiseQueue;
const path = require('path');
const fs = require('fs');
const err = console.error.bind(console);
const minimist = require("minimist");

const swapMapping = [
    {
        match: /(\s|^|!|\()(loopMember)\b/g,
        replace: '$1speaker'
    },
    {
        match: /(\s|^|!|\()(loopMemberAskedAbout)\b/g,
        replace: '$1referent'
    },
    {
        match: /(\s|^|!|\()(owner)\b/g,
        replace: '$1loop.$2'
    },
    {
        match: /(\s|^|!|\()(loopList)\b/g,
        replace: '$1loop.list'
    },
    {
        match: /(\s|^|!|\()(loopCount)\b/g,
        replace: '$1loop.count'
    },
    {
        match: /(\s|^|!|\()(_now)\b/g,
        replace: '$1dt.now'
    },
    {
        match: /(\s|^|!|\()(date|day|dayOfWeek|dayOfMonth|dayOfYear|weekOfYear|month|monthOfYear|quarterOfYear|year)\b/g,
        replace: '$1dt.$2'
    },
    {
        match: /(\s|^|!|\()(_home)\b/g,
        replace: '$1location.home'
    },
    {
        match: /(\s|^|!|\()(city|state|stateAbbr|country|countryCode)\b/g,
        replace: '$1location.$2'
    },
    {
        match: /(\s|^|!|\()(emotionBeforeImpact|emotionValuesBeforeImpact)\b/g,
        replace: '$1jibo.emotion'
    },
    {
        match: /(\s|^|!|\()(coin|dice)\b/g,
        replace: '$1skill.$2'
    }
]

const args = minimist(process.argv.slice(2), {
    string: [
        'mimDir'
    ],
    boolean: [
        'verbose',
        'help'
    ],
    alias: {
        m: 'mimDir',
        h: 'help',
        v: 'verbose'
    }
});


if (args.help) {
    printHelp();
    process.exit();
}

let mimDir = args.mimDir;
let verbose = args.verbose;
mimDir = mimDir || 'mims/';

console.log(`Using mimDir: '${mimDir}'`);

update(mimDir, verbose)
    .catch(e => console.error(e));

function printHelp() {
    console.log(`Usage:`);
    console.log(` node update-prompt-data.js [options]`);
    console.log(`   Options:`);
    console.log(`      --help, -h: Print this information`);
    console.log(`      --verbose, -v: Print results verbosely.`);
    console.log(`      --mimDir, -m: Root directory of MiMs to update. Default = .`);
}

function update(mimDir, verbose) {

    if (!fs.existsSync(mimDir)) {
        return Promise.reject(`MIM directory '${mimDir}' not found or not valid.`);
    }

    mimDir = path.resolve(mimDir);

    return FileUtils.findAllFilesWithExt(mimDir, 'mim').then(mims => {
        console.log(`Looking through ${mims.length} MIMs...\n`);

        let processedPrs = new PromiseQueue();
        mims.forEach(file => {
            const pr = () => FileUtils.readFile(file).then(rawMIM => {
                let mim = JSON.parse(rawMIM);
                let updated = false;
                mim.prompts.forEach(promptObj => {
                    let condition = promptObj.condition;
                    let prompt = promptObj.prompt;

                    // Update condition (if there is one)
                    if (condition) {
                        swapMapping.forEach(mapping => {
                            condition = condition.replace(mapping.match, mapping.replace);
                        });
                    }

                    // Regex to pull out content within `blah blah ${this stuff} blah`
                    const getTemplates = /(\$\{)([^\}]*)(?=\})/g;

                    // Update prompts
                    swapMapping.forEach(mapping => {
                        prompt = prompt.replace(getTemplates, function (match, capture1, capture2) {
                            return `${capture1}${capture2.replace(mapping.match, mapping.replace)}`;
                        });
                    });

                    const conditionChanged = (condition !== promptObj.condition);
                    const promptChanged = (prompt !== promptObj.prompt);

                    if (promptChanged || conditionChanged) {
                        verbose && console.log(`${promptObj.prompt_id}`);
                        if (verbose && conditionChanged) {
                            console.log('\tCONDITION:');
                            console.log(`\t\t${promptObj.condition}\n\t\t=>\n\t\t${condition}`);
                        }
                        if (verbose && promptChanged) {
                            console.log('\tPROMPT:');
                            console.log(`\t\t${promptObj.prompt}\n\t\t=>\n\t\t${prompt}`);
                        }
                        // Update original MIM object for later serialization
                        promptObj.condition = condition;
                        promptObj.prompt = prompt;
                        updated = true;
                    }
                });
                // Write updated MIM to disk
                if (updated) {
                    const serialized = JSON.stringify(mim, null, '\t');
                    return PromiseUtils.promisify(h => fs.writeFile(file, serialized, 'utf8', h));
                }
            });
            processedPrs.add(pr);
        });
        return processedPrs.waitUntilEmpty();
    }).then(() => {
        console.log('Done');
    });
}

module.exports = update;