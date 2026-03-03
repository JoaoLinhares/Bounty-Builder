
import { CharacterTag, CharacterTagType } from '@/constants/character-tags';
import ExcelJS from 'exceljs';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { CharacterExcel } from './character-parser';

let errorLog: string = ''

function addLog(msg: string) {
    errorLog += msg + '\n'
}

const newTags: Set<CharacterTag> = new Set([CharacterTag.NAVY_ADMIRAL_FORMER_NAVY_ADMIRAL, CharacterTag.ROYALTY_FORMER_ROYALTY, CharacterTag.STRAW_HAT_FLEET, CharacterTag.CELESTIAL_DRAGONS_FORMER_CELESTIAL_DRAGONS, CharacterTag.GIANT_PIRATE_CREW, CharacterTag.GIANT, CharacterTag.BAROQUE_WORKS_FORMER_BAROQUE_WORKS, CharacterTag.THE_SEVEN_WARLORDS_OF_THE_SEA_FORMER_WARLORDS_OF_THE_SEA])



// 0 Value, didnt exist a the time of that data set
const rowToTag: Record<number, CharacterTagType> = {
    9: "ATTACKER",
    10: "DEFENDER",
    11: "RUNNER",
    12: "CAPTAIN",
    13: "LOGIA",
    14: "PARAMECIA",
    15: "ZOAN",
    16: "REVOLUTIONARY_ARMY",
    17: "KOZUKI_CLAN_KOZUKI_CLAN_SERVANT",
    18: "DON_QUIXOTE_FAMILY",
    19: "EAST_BLUE",
    20: "WHITEBEARD_PIRATES",
    21: "STRAW_HAT_PIRATES",
    22: "ROGER_PIRATES_EX_ROGER_PIRATES",
    23: "ANIMAL_KINGDOM_PIRATES",
    24: "CHARLOTTE_FAMILY",
    25: "WORST_GENERATION",
    26: "THE_GRAND_LINE",
    27: "FISH_MAN",
    28: "NAVY",
    29: "NEW_WORLD",
    30: "THE_SEVEN_WARLORDS_OF_THE_SEA_FORMER_WARLORDS_OF_THE_SEA",
    32: "LONG_RANGE_NORMAL_ATTACKS",
    33: "BUGGY_S_DELIVERY",
    34: "BAROQUE_WORKS_FORMER_BAROQUE_WORKS",
    35: "CIPHER_POL",
    36: "POWER_USERS",
    37: "BLACKBEARD_PIRATES",
    38: "RED_HAIRED_PIRATES",
    39: "KUJA_PIRATES",
    40: "GERMA_66",
    41: "NINJA",
    42: "ALABASTA_KINGDOM",
    43: "CHAMBRES",
    44: "MINKS"
};



function save() {

    try {
        if (errorLog) {
            writeFileSync(
                path.join('scripts', 'errorLog.txt'),
                errorLog,
                'utf-8'
            );
            console.log('File errorLog.txt created!');
        }

    } catch (error) {
        console.error('Error saving file:', error);
    }
}

function findTags(row: ExcelJS.Row): Set<CharacterTag> {
    const tags: Set<CharacterTag> = new Set()

    for (let i = 9; i <= 44; i++) {
        if (i !== 31) {
            const cellHasValue = row.getCell(i).value !== null && row.getCell(i).value !== undefined;
            if (cellHasValue) {
                tags.add(CharacterTag[rowToTag[i] as keyof typeof CharacterTag])
            }
        }

    }

    return tags
}

const calculateConsistency = async (charactersMap: Record<string, CharacterExcel>) => {

    try {

        const workbook = new ExcelJS.Workbook();

        await workbook.xlsx.readFile(input);

        const csvPage = workbook.getWorksheet(6);
        const gradeMap: Record<string, string> = {
            '2': 'TWO_STAR',
            '3': 'THREE_STAR',
            '4': 'FOUR_STAR'
        }

        csvPage?.eachRow((row, rowNumber) => {
            if (rowNumber >= 4 && rowNumber <= 299) {
                if (row) {
                    const id = String(row.getCell(5).result)
                    const character = charactersMap[id]
                    if (!character) {
                        addLog('CHAR NOT FOUND:: Error at row: ' + rowNumber)
                    } else {
                        const grade = String(row.getCell(2).value)

                        if (gradeMap[grade] !== character.baseGrade && character.gameId !== '103' && character.gameId !== '094') {
                            addLog(`CHAR GRADE ERROR:: ${character.name} / ${character.charDescription} has ${character.baseGrade} instead of ${gradeMap[grade]}`)
                        }

                        const tagsFound: Set<CharacterTag> = findTags(row)

                        const dataTags: CharacterTag[] = character.tags.map(t => {
                            if (!(t.name in CharacterTag)) {
                                addLog(`CHAR TAG ERROR:: ${character.name} / ${character.charDescription} has tag that should not exist -  ${t.name}`)
                            }
                            return CharacterTag[t.name as keyof typeof CharacterTag]

                        })

                        const dataTagsSet = new Set(dataTags)

                        const differences: CharacterTag[] = [
                            ...Array.from(tagsFound).filter(x => !dataTagsSet.has(x)),
                            ...dataTags.filter(x => !tagsFound.has(x))
                        ]

                        if (differences.length > 0 && character.gameId !== '288' && character.gameId !== '293' && character.gameId !== '199') {
                            for (const diff of differences) {
                                if (newTags.has(diff)) {
                                    console.log(`Character ${character.name} / ${character.charDescription} has ${diff} tag that didnt exist in the old data set.`)
                                } else {
                                    if (!dataTagsSet.has(diff)) {
                                        addLog(`CHAR TAG ERROR MISSING IN JSON:: ${character.name} / ${character.charDescription} doenst have ${diff} tag that ist present in the old data set.`)
                                    } else {
                                        addLog(`CHAR TAG ERROR WRONG IN JSON:: ${character.name} / ${character.charDescription} has ${diff} tag that is present in the old data set.`)
                                    }
                                }
                            }
                        }

                    }

                }

            }
        })

    } catch (err) {
        console.error(`Error parsing file : ${input})`);
        console.error(err);
        process.exit(1);
    }

}




const [, , input] = process.argv;

if (!input) {
    console.error(`Use: npx tsx scripts/data-consistency-check <src>`);
    process.exit(1);
}

if (!existsSync('prisma/data/characters.json')) {
    console.error(`Missing main data file on prisma/data/characters.json. Please generate the cheracter data first.`);
    process.exit(1);
}

const rawData = readFileSync('prisma/data/characters.json', 'utf-8');

const characters: CharacterExcel[] = JSON.parse(rawData);

const charactersMap: Record<string, CharacterExcel> = {}

characters.forEach(c => {
    const key = c.assetCard.match(/img_chara_(.*?)01_m.webp/i)?.[1] ?? ''
    if (key) { charactersMap[key] = c } else {
        addLog('KEY ERROR:: Error finding key for: ' + c.name + ' / ' + c.charDescription + ' with image asset: ' + c.assetCard)
    }

})


await calculateConsistency(charactersMap)
save()