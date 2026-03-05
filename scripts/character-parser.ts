import path from 'path';

import { CharacterTag as CharacterTagEnum, CharacterTagType } from '@/constants/character-tags';
import { CharacterMechanics, SkillMechanics } from '@/constants/mechanics';
import { StatusEffect } from '@/constants/status-effects';
import ExcelJS from 'exceljs';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { stdin, stdout } from 'node:process';
import readline from 'node:readline/promises';
import { BaseGrade, Class, Element, FourStarType, Size, TeamBoost } from './../src/generated/prisma/client';
import { CharacterGameData } from './seperate_main_game_data';
import { CharacterExcel, CharacterStateExcel, CharacterTagExcel, SkillExcell } from './type';


const rl = readline.createInterface({
    input: stdin,
    output: stdout
});

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


let errorLog: string = ''

function addLog(msg: string) {
    errorLog += msg + '\n'
}

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

        if (errorLog) {
            writeFileSync(
                path.join('scripts', 'errorLog.txt'),
                errorLog,
                'utf-8'
            );
        }

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

    if (!date) {
        return '2019-01-31';
    }

    const matches = date.match(/"(\d{4}-\d{2}-\d{2})"/g);
    if (matches) {
        return matches[matches.length - 1].replace(/"/g, '').trim();
    } else {
        return '2019-01-31'
    }


}

function getElementClass(cell: ExcelJS.Cell, characterGameData: CharacterGameData, calcPath: string): {
    mainElement: Element,
    mainClass: Class,
} {

    const values = (cell.result as string ?? cell.value as string).trim().split(' ~ ')

    const element = values[0].replaceAll(' ', '')
    const gameClass = values[1].replaceAll(' ', '')


    const types: CharacterMechanics[] = []

    const elements = element.split('-')

    if (elements.length > 1) {
        if (!(characterGameData.type.includes(CharacterMechanics.ELEMENT_CHANGE))) {
            addLog(characterGameData.gameId + ' should had element change type.')
        }
    }

    const classes = gameClass.split('-')

    if (classes.length > 1) {
        if (!(characterGameData.type.includes(CharacterMechanics.CLASS_CHANGE))) {
            addLog(characterGameData.gameId + ' should had class change type.')
        }
    }


    return {
        mainElement: Element[elements[0].toUpperCase() as keyof typeof Element],
        mainClass: Class[classes[0].toUpperCase() as keyof typeof Class],

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
            addLog('Didnt find: ' + formatedTag + ' original: ' + tag + ' values: ' + tagValues + 'cell: ' + cell.value + ' ' + cell.$col$row)
        }
        return {
            name: tagEnum
        }
    })
}

function getGradeDetails(cell: ExcelJS.Cell): {
    baseGrade: BaseGrade,
    fourStarType: FourStarType | null,
} {

    const values = (cell.result as string ?? cell.value as string).trim().split(' ~ ')




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
        addLog('Not found: ' + fullName)
    }


    if (res.length === 1) {
        const value = res[0]
        console.log('Found match: ' + value + ' for: ' + fullName)
        possiblePaths.delete(value)
        return value
    }

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

}

function defaultSkill(slot: number): SkillExcell {

    return {
        name: '',
        description: [],
        effect: [],
        asset: '',
        slot,
        skillTransform: false,
        cooldown: 0,
        inflictsStatusEffect: [],
        selfStatusEffect: [],
        type: []

    }
}

function defaultCharacterState(name: string): CharacterStateExcel {


    return {
        name,
        isBase: true,
        sizeTraits: [],
        overrideBaseClass: null,
        overrideBaseElement: null,
        overrideBaseSize: null,
        stateTraits: [],
        skills: [defaultSkill(1), defaultSkill(2)]
    }
}

function getCharStateGameData(gameId: string, characterGameData: CharacterGameData): CharacterStateExcel[] {

    if (!characterGameData.characterStates || characterGameData.characterStates.length === 0) {
        addLog(gameId + ' not found character states.')
        return [defaultCharacterState('Normal')]
    }

    for (const state of characterGameData.characterStates) {
        for (const skill of state.skills) {
            const inflictsStatusEffect: string[] = skill.inflictsStatusEffect || []
            if (skill.inflictsStatusEffect) {
                const temp = inflictsStatusEffect.filter(s => s in StatusEffect)

                if (temp.length !== inflictsStatusEffect.length) {
                    addLog(gameId + ' something wrong in game data skill ' + skill.name + ' in inflictsStatusEffect.')
                }
            }

            const selfStatusEffect: string[] = skill.selfStatusEffect || []
            if (skill.selfStatusEffect) {
                const temp = selfStatusEffect.filter(s => s in StatusEffect)

                if (temp.length !== selfStatusEffect.length) {
                    addLog(gameId + ' something wrong in game data in ' + skill.name + ' selfStatusEffect.')
                }
            }


            const type: string[] = skill.type || []
            if (skill.type) {
                const temp = type.filter(t => t in SkillMechanics)
                if (temp.length !== type.length) {
                    addLog(gameId + ' something wrong in ' + skill.name + ' game data in type.')
                }

                if ((!type.includes(CharacterMechanics.STATUS_EFFECT) && inflictsStatusEffect.length !== 0) || (type.includes(CharacterMechanics.STATUS_EFFECT) && inflictsStatusEffect.length === 0)) {
                    addLog(gameId + '  ' + skill.name + ' inconsistency between status effect and status effect applied.')
                }
            }
        }
    }

    return characterGameData.characterStates
}


function getGameData(gameId: string, characterGameData: CharacterGameData): {
    mainSize: Size,
    teamBoost: TeamBoost,
    sizeTraits: string[],
    characterTraits: string[],
    traits1: string[],
    traits2: string[],
    boostTrait: string[],
    inflictsStatusEffect: string[],
    nullifiesStatusEffect: string[],
    selfStatusEffect: string[],
    type: string[],
    characterStates: CharacterStateExcel[]
} {
    let mainSize: Size = Size.NORMAL
    if (characterGameData.mainSize && characterGameData.mainSize in Size) {
        mainSize = characterGameData.mainSize
    } else {
        addLog(gameId + ' somethint wrong in game data in mainSize.')
    }

    let teamBoost: TeamBoost = TeamBoost.ATTACK
    if (characterGameData.teamBoost && characterGameData.teamBoost in TeamBoost) {
        teamBoost = characterGameData.teamBoost
    } else {
        addLog(gameId + ' something wrong in game data in teamBoost.')
    }

    const inflictsStatusEffect: string[] = characterGameData.inflictsStatusEffect || []
    if (characterGameData.inflictsStatusEffect) {
        const temp = inflictsStatusEffect.filter(s => s in StatusEffect)

        if (temp.length !== inflictsStatusEffect.length) {
            addLog(gameId + ' something wrong in game data in inflictsStatusEffect.')
        }
    }

    const nullifiesStatusEffect: string[] = characterGameData.nullifiesStatusEffect || []
    if (characterGameData.nullifiesStatusEffect) {
        const temp = nullifiesStatusEffect.filter(s => s in StatusEffect)

        if (temp.length !== nullifiesStatusEffect.length) {
            addLog(gameId + ' something wrong in game data in nullifiesStatusEffect.')
        }
    }

    const selfStatusEffect: string[] = characterGameData.selfStatusEffect || []
    if (characterGameData.selfStatusEffect) {
        const temp = selfStatusEffect.filter(s => s in StatusEffect)

        if (temp.length !== selfStatusEffect.length) {
            addLog(gameId + ' something wrong in game data in selfStatusEffect.')
        }
    }


    const type: string[] = characterGameData.type || []
    if (characterGameData.type) {
        const temp = type.filter(t => t in CharacterMechanics)
        if (temp.length !== type.length) {
            addLog(gameId + ' something wrong in game data in type.')
        }

        if ((!type.includes(CharacterMechanics.STATUS_EFFECT) && inflictsStatusEffect.length !== 0) || (type.includes(CharacterMechanics.STATUS_EFFECT) && inflictsStatusEffect.length === 0)) {
            addLog(gameId + ' inconsistency between status effect and status effect applied.')
        }
    }


    return {
        mainSize,
        teamBoost,
        sizeTraits: characterGameData.sizeTraits || [],
        characterTraits: characterGameData.characterTraits || [],
        traits1: characterGameData.traits1 || [],
        traits2: characterGameData.traits2 || [],
        boostTrait: characterGameData.boostTrait || [],
        inflictsStatusEffect,
        nullifiesStatusEffect,
        selfStatusEffect,
        type,
        characterStates: getCharStateGameData(gameId, characterGameData)

    }



}

async function characterRow(row: ExcelJS.Row, gameData: Record<string, CharacterGameData>, findGameId: Record<string, string>, knownPaths: Record<string, string>, possiblePaths: Set<string>, bountyColors: Record<string, string[]>): Promise<CharacterExcel> {
    const fullName = stringFormatter(row.getCell(4)).trim()
    const nameSplit = fullName.split('~')
    const name = nameSplit?.[1]?.trim().replace('Vinsmoke Neji', 'Vinsmoke Niji') ?? fullName
    const charDescription = nameSplit?.[0].trim()
    if (nameRecord[name]) {
        nameRecord[name] += 1
    } else {
        nameRecord[name] = 1
    }
    const gameId = getGameId(row.getCell(2), findGameId)


    const calcPath = knownPaths[gameId] ?? await determinePath(fullName, name, possiblePaths)

    const characterGameData = gameData[gameId]


    const character: CharacterExcel = {
        name: name,
        charDescription: charDescription,
        gameId: gameId,
        nameId: gameData[gameId].nameId || name,
        dateAdded: new Date(getDate(row.getCell(10))),
        assetLarge: 'img_chara_' + calcPath + '_l.webp',
        assetCard: 'img_chara_' + calcPath + '_m.webp',
        ...getGameData(gameId, characterGameData),
        tags: getTags(row.getCell(7)),
        medals: ['310100' + gameId, '310110' + gameId],
        ...getGradeDetails(row.getCell(6)),
        colab: ['FILM RED', 'STAMPED', 'ODYSSEY', 'FILM GOLD', 'FILM STRONG WORLD'].includes(charDescription.toUpperCase()) || name === 'Uta',
        ...getElementClass(row.getCell(8), characterGameData, calcPath),
        bountyColours: bountyColors[calcPath] || [],

        medalSetEvaluation: {}, //AI Eval
        partySupportEvaluation: {},  //AI Eval
        playStyleEvaluation: {}  //AI Eval

    }

    return character
}

async function characterParse(input: string, output: string, gameData: Record<string, CharacterGameData>, findGameId: Record<string, string>, knownPaths: Record<string, string>, possiblePaths: Set<string>, bountyColors: Record<string, string[]>) {

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
            const character: CharacterExcel = await characterRow(row, gameData, findGameId, knownPaths, possiblePaths, bountyColors);
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
    console.error(`Missing helper characterId.json file on scripts folder. Please generate the characterId data first.`);
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

if (!existsSync('public/bounty_colors')) {
    console.error(`Missing public/bounty_colors folder. Please add this folder with all character bounty colors images.`);
    process.exit(1);
}

if (!existsSync('scripts/characters_game_data.json')) {
    console.error(`Missing scripts/characters_game_data.json file. Please add this file with all game data.`);
    process.exit(1);
}

const rawData = readFileSync('scripts/characterId.json', 'utf-8');

const findGameId: Record<string, string> = JSON.parse(rawData);


const rawDataPath = readFileSync('scripts/paths.json', 'utf-8');

const knownPaths: Record<string, string> = JSON.parse(rawDataPath);


const gameData: Record<string, CharacterGameData> = JSON.parse(readFileSync('scripts/characters_game_data.json', 'utf-8'));


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


function calculateBountyColors(): Record<string, string[]> {
    const bc: Record<string, string[]> = {};



    const files = readdirSync('public/bounty_colors');

    const regex = /(?<=img_chara_)(.+?01)/g;

    for (const file of files) {
        const match = file.match(regex);

        if (match) {
            const id = match[0]

            if (!bc[id]) {
                bc[id] = []
            }
            bc[id].push(file)
        }
    }


    return bc
}

const possiblePaths: Set<string> = calculatePossiblePaths()
const bountyColors = calculateBountyColors()

try {
    await characterParse(input, output ?? defaultOutput, gameData, findGameId, knownPaths, possiblePaths, bountyColors)
} finally {
    rl.close()
}
