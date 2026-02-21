import path from 'path';

/*
    Script used to parse data from an Excel Medal Data Set and store them in the correct folder with the types defined by the Prisma Schema at prisma/schema.prisma
*/
import { CharacterTag as CharacterTagEnum, CharacterTagType } from '@/constants/character-tags';
import ExcelJS from 'exceljs';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { stdin, stdout } from 'node:process';
import readline from 'node:readline/promises';
import { BaseGrade, Character, CharacterState, CharacterTag, Class, Element, FourStarType, Rarity, Skill, Type } from './../src/generated/prisma/client';

export type CharacterTagExcel = Omit<CharacterTag, 'id'>
export type SkillExcell = Omit<Skill, 'id' | 'characterStateId'>

export type CharacterStateExcel = {
    skills: SkillExcell[]
} & Omit<CharacterState, 'id' | 'characterId'>

export type CharacterExcel = {
    tags: CharacterTagExcel[],
    characterStates: CharacterStateExcel[]
    medals: string[]
}
    & Omit<Character, 'id'>

function stringFormatter(cell: ExcelJS.Cell): string {

    const value = cell.result as string ?? cell.value as string;
    if (typeof value !== 'string') {
        console.error('weird value: ' + value)
        return ''
    }
    return value.replaceAll('_', '-').replaceAll('``', '"');
}

const characters: CharacterExcel[] = [];
const nameRecord: Record<string, number> = {};


function save(output: string) {

    if (!existsSync(output)) {
        mkdirSync(output, { recursive: true });
    }

    try {
        writeFileSync(
            path.join(output, 'characters.json'),
            JSON.stringify(characters, null, 2),
            'utf-8'
        );
        console.log('File characters.json saved successfully!');

    } catch (error) {
        console.error('Error saving file:', error);
    }
}

function getGameId(cell: ExcelJS.Cell, findGameId: Record<string, string>): string {
    const value = cell.result as string ?? cell.value as string;


    return findGameId[value] ?? (Number(value) + 2).toString().padStart(3, '0')
}

function getDate(cell: ExcelJS.Cell): string {
    const date = (cell.formula as string);


    const matches = date.match(/"(\d{4}-\d{2}-\d{2})"/g);
    if (matches) {
        return matches[matches.length - 1].replace(/"/g, '').trim();
    } else {
        return '2019-01-31'
    }


}

function defaultSkill(slot: number, calcPath: string): SkillExcell {

    return {
        name: '',
        description: {},
        effect: {},
        asset: 'img_icon_' + calcPath + '_skill_' + (slot === 1 ? 'a' : 'b') + '.webp',
        slot,
        skillTransform: false,
        cooldown: 0,
        isPowerGage: false,
        isTimeGated: false

    }
}

function defaultCharacterState(name: string, isBase: boolean, overrideClass: Class, calcPath: string): CharacterStateExcel {


    return {
        name,
        isBase,
        sizeTraits: {},
        overrideBaseClass: isBase ? null : overrideClass,
        overrideBaseElement: null,
        overrideBaseSize: null,
        stateTraits: {},
        skills: isBase ? [defaultSkill(1, calcPath), defaultSkill(2, calcPath)] : []
    }
}

function getElementClass(cell: ExcelJS.Cell, calcPath: string): {
    type: Type[]
    mainElement: Element,
    mainClass: Class,
    characterStates: CharacterStateExcel[]
} {

    const values = (cell.result as string ?? cell.value as string).trim().split(' ~ ')

    const element = values[0].replaceAll(' ', '')
    const gameClass = values[1].replaceAll(' ', '')


    const types: Type[] = []

    const elements = element.split('-')

    if (elements.length > 1) {
        types.push(Type.ELEMENT_CHANGE)
    }

    const classes = gameClass.split('-')

    if (classes.length > 1) {
        types.push(Type.CLASS_CHANGE)
    }


    return {
        type: types,
        mainElement: Element[elements[0].toUpperCase() as keyof typeof Element],
        mainClass: Class[classes[0].toUpperCase() as keyof typeof Class],
        characterStates: classes.map((c, index) => {
            const isBase = index === 0
            return defaultCharacterState(c.charAt(0) + c.toLowerCase().slice(1), isBase, Class[c.toUpperCase() as keyof typeof Class], calcPath)
        })
    }

}


function getTags(cell: ExcelJS.Cell): CharacterTagExcel[] {
    const tagValues = stringFormatter(cell).trim().split(' ~ ');


    return tagValues.map(tag => {
        const formatedTag = tag.replaceAll(/["/]+/g, '').replaceAll(/[- `']+/g, '_').replaceAll('(s)', '').replaceAll('(S', '').trim().toUpperCase();
        const tagEnum = CharacterTagEnum[formatedTag as CharacterTagType];
        if (formatedTag === 'BAROQUE_WORKS') {
            return {
                name: CharacterTagEnum.BAROQUE_WORKS_FORMER_BAROQUE_WORKS
            }
        }
        if (!tagEnum) {
            console.error('Didnt find: ' + formatedTag + ' original: ' + tag + ' values: ' + tagValues + 'cell: ' + cell.value + ' ' + cell.$col$row)
        }
        return {
            name: tagEnum
        }
    })
}

function getRarityDetails(cell: ExcelJS.Cell): {
    baseGrade: BaseGrade,
    fourStarType: FourStarType | null,
    rarity: Rarity | null
} {

    const values = (cell.result as string ?? cell.value as string).trim().split(' - ')

    const rarity = values.length > 1 ? values[0].trim().toUpperCase() as keyof typeof Rarity : null

    const grade = values.length > 1 ? values[1].trim().toUpperCase() : values[0].trim().toUpperCase()

    const baseGradeMap: Record<string, BaseGrade> = {
        '3 STARS': BaseGrade.THREE_STAR,
        '4 STARS': BaseGrade.FOUR_STAR,
        '2 STARS': BaseGrade.TWO_STAR,
    }
    const baseGrade = baseGradeMap[grade] ?? BaseGrade.FOUR_STAR

    const fourStarTypeMap: Record<string, FourStarType> = {
        'EXTREME': FourStarType.EXTREME,
        'BOUNTY FESTIVAL': FourStarType.BOUNTY_FEST,
        'STEP UP': FourStarType.STEP_UP,
        'COLA': FourStarType.COLA,
    }

    const fourStarType = baseGrade === BaseGrade.FOUR_STAR ? (fourStarTypeMap[grade] ?? FourStarType.STEP_UP) : null



    return {
        baseGrade,
        fourStarType,
        rarity
    }

}



async function determinePath(fullName: string, name: string, possiblePaths: Set<string>): Promise<string> {
    let listOfTokens = ''
    if (name.includes('Kuzan')) {
        listOfTokens = 'Aokiji'
    }

    if (name.includes('Koby')) {
        listOfTokens = 'Coby'
    }

    if (name.includes('Jewelry Bonney')) {
        listOfTokens = 'Bonie'
    }

    if (name.includes('Broggy')) {
        listOfTokens = 'Brogy'
    }
    if (name.includes('[')) {
        listOfTokens = name.replaceAll('[', '').replaceAll(']', '').replace('Issho', 'Fujitora').replace('Aramaki', 'Ryokugyu').replace('Borsalino', 'Kizaru')
    }
    const tokens = (listOfTokens || name).replaceAll(/[~-]/g, ' ').trim().toLowerCase().split(' ')


    const arrayOfLeft = Array.from(possiblePaths)

    let res = []
    for (const p of arrayOfLeft) {
        const test = tokens.filter(t => p.includes(t))
        if (test.length > 0) {
            res.push(p)

        }
    }

    if (res.length == 0) {
        console.error('Not found: ' + fullName)
    }


    if (res.length === 1) {
        const value = res[0]
        console.log('Found match: ' + value + ' for: ' + fullName)
        possiblePaths.delete(value)
        return value
    }

    const rl = readline.createInterface({
        input: stdin,
        output: stdout
    });

    try {
        const string = res.reduce((prev, r, i) => prev + ' ' + i + ' : ' + r + '\n', '')
        let answered = false
        while (!answered) {
            const answer = await rl.question('Choose one for ' + fullName + ': \n' + string + '\n');
            const number = Number(answer)
            if (!Number.isNaN(number) && number >= 0 && number < res.length) {
                const number = Number(answer)
                const value = res[number]
                console.log('Chose: ' + value + ' for: ' + fullName)
                possiblePaths.delete(value)
                answered = true
                return value

            } else {
                console.log('Wrong input. Choose between those numbers.');
            }
        }

        return 'NOT FOUND'
    } finally {
        rl.close();
    }
}

async function characterRow(row: ExcelJS.Row, findGameId: Record<string, string>, knownPaths: Record<string, string>, possiblePaths: Set<string>): Promise<CharacterExcel> {
    const fullName = stringFormatter(row.getCell(4)).trim()
    const nameSplit = fullName.split('~')
    const name = nameSplit?.[1].trim().replace('Vinsmoke Neji', 'Vinsmoke Niji')
    const charDescription = nameSplit?.[0].trim()
    if (nameRecord[name]) {
        nameRecord[name] += 1
    } else {
        nameRecord[name] = 1
    }
    const gameId = getGameId(row.getCell(2), findGameId)


    const calcPath = knownPaths[gameId] ?? await determinePath(fullName, name, possiblePaths)

    const character: CharacterExcel = {
        name: name,
        charDescription: charDescription,
        gameId: gameId,
        nameId: name,
        dateAdded: new Date(getDate(row.getCell(10))),
        assetLarge: 'img_chara_' + calcPath + '_l.webp',
        assetCard: 'img_chara_' + calcPath + '_m.webp',
        ...getElementClass(row.getCell(8), calcPath),
        mainSize: 'NORMAL', //Manual Change
        ...getRarityDetails(row.getCell(6)),
        teamBoost: 'ATTACK', //Manual Change
        bountyColours: [], //Manual Change
        sizeTraits: null, //Manual Change
        characterTraits: {}, //Manual Change
        traits1: {}, //Manual Change
        traits2: {}, //Manual Change
        boostTrait: {}, //Manual Change
        inflictsStatusEffect: [], //Manual Change
        tags: getTags(row.getCell(7)),
        medals: ['310100' + gameId, '310110' + gameId],
        medalSetEvaluation: {}, //AI Eval
        partySupportEvaluation: {},  //AI Eval
        playStyleEvaluation: {}  //AI Eval

    }

    return character
}

async function characterParse(input: string, output: string, findGameId: Record<string, string>, knownPaths: Record<string, string>, possiblePaths: Set<string>) {

    try {

        const workbook = new ExcelJS.Workbook();

        await workbook.xlsx.readFile(input);

        const csvPage = workbook.getWorksheet(7);

        const rows: ExcelJS.Row[] = [];
        csvPage?.eachRow((row, rowNumber) => {
            if (rowNumber >= 2 && rowNumber <= 344) {
                rows.push(row);
            }
        });

        for (const row of rows) {
            const character: CharacterExcel = await characterRow(row, findGameId, knownPaths, possiblePaths);
            characters.push(character);
        }


        save(output)
    } catch (err) {
        console.error(`Error parsing file : ${input})`);
        console.error(err);
        process.exit(1);
    }

}




const [, , input, output] = process.argv;
const defaultOutput = 'prisma/data';

if (!input) {
    console.error(`Use: npx tsx scripts/character-parser <src> <dest> (dest is optional, default is : ${defaultOutput})`);
    process.exit(1);
}

if (!existsSync('scripts/characterId.json')) {
    console.error(`Missing helper characterId.json file on scripts folder. Please generate the medal data first.`);
    process.exit(1);
}

if (!existsSync('scripts/paths.json')) {
    console.error(`Missing helper paths.json file on scripts folder. Please calculate this data first.`);
    process.exit(1);
}

if (!existsSync('public/chars_large')) {
    console.error(`Missing public/chars_card folder. Please add this folder with all character images.`);
    process.exit(1);
}

const rawData = readFileSync('scripts/characterId.json', 'utf-8');

const findGameId: Record<string, string> = JSON.parse(rawData);


const rawDataPath = readFileSync('scripts/paths.json', 'utf-8');

const knownPaths: Record<string, string> = JSON.parse(rawDataPath);

function calculatePossiblePaths(): Set<string> {
    const ids = new Set<string>();


    const files = readdirSync('public/chars_large');

    const regex = /(?<=img_chara_)(.+?01)/g;

    for (const file of files) {
        const match = file.match(regex);

        if (match) {
            ids.add(match[0]);
        }
    }

    const known: Set<string> = new Set(Object.values(knownPaths));

    return new Set(
        [...ids].filter(id => !known.has(id))
    );
}

const possiblePaths: Set<string> = calculatePossiblePaths()

characterParse(input, output ?? defaultOutput, findGameId, knownPaths, possiblePaths)
