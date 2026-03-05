/*
    Script used to parse data from an Excel Medal Data Set and store them in the correct folder with the types defined by the Prisma Schema at prisma/schema.prisma
*/
import { MedalTag as EnumMedalTag, MedalTagType } from '@/constants/medal-tags';
import { MedalType } from '@/generated/prisma/client';
import ExcelJS from 'exceljs';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

import path from 'path';
import { getUniqueTraitConstraint } from './constraint-helper';
import { getUniqueTrait } from './trait-helper';
import { MedalExcel, MedalTagExcel, UniqueTraitConstraintExcel, UniqueTraitExcel } from './type';


function stringFormatter(cell: ExcelJS.Cell): string {
    const val = cell.value ? String(cell.value) : '';
    return val.replaceAll('_', '-').replaceAll('``', '"');
}


function getTags(cell: ExcelJS.Cell): MedalTagExcel[] {
    const tagValues = stringFormatter(cell).trim().split('\n');


    return tagValues.map(tag => {
        const formatedTag = tag.replaceAll(/["/]+/g, '').replaceAll(/[- `]+/g, '_').replace('2', 'two').toUpperCase();
        const tagEnum = EnumMedalTag[formatedTag as MedalTagType];
        if (formatedTag === 'BAROQUE_WORKS') {
            return {
                name: EnumMedalTag.BAROQUE_WORKS_FORMER_BAROQUE_WORKS
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

function getUniqueTraitConstraints(constraint: string): UniqueTraitConstraintExcel[] {
    if (!constraint) {
        return [];
    }

    const constraints = constraint.split(' and ');

    const res: UniqueTraitConstraintExcel[] = []

    constraints.forEach(c => {
        const uniqueConstraint = getUniqueTraitConstraint(c.trim());
        if (uniqueConstraint) {
            res.push(uniqueConstraint);
        }

    })

    return res
}

function getUniqueTraits(trait: string): UniqueTraitExcel[] {
    if (!trait) {
        return [];
    }

    const traits = trait.replaceAll('.', ' ').split(' and ');

    const res: UniqueTraitExcel[] = []

    traits.forEach(t => {
        const uniqueTrait = getUniqueTrait(t.trim());
        if (uniqueTrait) {
            res.push(uniqueTrait);
        }

    })

    return res
}

// Medal data objects
const mainMedals: Record<number, MedalExcel> = {};
const mainRankedMedals: Record<number, MedalExcel> = {};
const eventMedals: Record<number, MedalExcel> = {};

function mainMedalRow(row: ExcelJS.Row): MedalExcel {
    const uniqueTrait = stringFormatter(row.getCell(5))
    const constraitParser = uniqueTrait.split(':');

    const contraint = constraitParser.length > 1 ? constraitParser[0] : '';
    const traits = constraitParser.length > 1 ? constraitParser[1] : constraitParser[0];

    const medal: MedalExcel = {
        gameId: '',
        asset: '',
        characterId: null,
        name: stringFormatter(row.getCell(3)).replaceAll('\n', ' '),
        type: MedalType.CHARACTER,
        tags: getTags(row.getCell(6)),
        uniqueTraitDescription: uniqueTrait,
        uniqueConstraints: getUniqueTraitConstraints(contraint),
        uniqueTraits: getUniqueTraits(traits),

    }

    return medal
}

function idString(id: number): string {

    return id.toString().padStart(3, '0')
}

function eventMedalRow(row: ExcelJS.Row, medalID: number): MedalExcel {
    const uniqueTrait = stringFormatter(row.getCell(12))
    const constraitParser = uniqueTrait.split(':');

    const contraint = constraitParser.length > 1 ? constraitParser[0] : '';
    const traits = constraitParser.length > 1 ? constraitParser[1] : constraitParser[0];

    const medal: MedalExcel = {
        gameId: '310200' + idString(medalID),
        asset: 'img_icon_medal_310200' + idString(medalID) + '.webp',
        characterId: null,
        name: stringFormatter(row.getCell(10)).replaceAll('\n', ' '),
        type: MedalType.EVENT,
        tags: getTags(row.getCell(13)),
        uniqueTraitDescription: uniqueTrait,
        uniqueConstraints: getUniqueTraitConstraints(contraint),
        uniqueTraits: getUniqueTraits(traits),

    }

    return medal
}

const getImageMainMedal = async (workbook: ExcelJS.Workbook) => {

    const imagePage = workbook.getWorksheet(3);


    imagePage?.eachRow((row, rowNumber) => {
        if (rowNumber >= 2 && rowNumber <= 342) {
            if (row) {
                const id = Number(row.getCell(3).result)
                const image = row.getCell(2).value as string

                const match = image?.match(/img_icon_medal_310110(\d+)$/i)
                const gameId = match ? match[1] : null


                if (!gameId) {
                    console.error('Error at: ' + rowNumber)
                }
                mainMedals[id].asset = 'img_icon_medal_310100' + gameId + '.webp'
                mainMedals[id].gameId = '310100' + gameId
                mainMedals[id].characterId = gameId ?? null

                mainRankedMedals[id].asset = 'img_icon_medal_310110' + gameId + '.webp'
                mainRankedMedals[id].gameId = '310110' + gameId
                mainRankedMedals[id].characterId = gameId ?? null

            }

        }
    })



}

function save(output: string) {

    if (!existsSync(output)) {
        mkdirSync(output, { recursive: true });
    }

    try {
        writeFileSync(
            path.join(output, 'medals.json'),
            JSON.stringify(Object.values(mainMedals), null, 2),
            'utf-8'
        );
        console.log('File medals_event.json saved successfully!');

        writeFileSync(
            path.join(output, 'medals_rank.json'),
            JSON.stringify(Object.values(mainRankedMedals), null, 2),
            'utf-8'
        );
        console.log('File medals_ranked.json saved successfully!');


        writeFileSync(
            path.join(output, 'medals_event.json'),
            JSON.stringify(Object.values(eventMedals), null, 2),
            'utf-8'
        );
        console.log('File medals_event.json saved successfully!');


        const trimmedObject = Object.fromEntries(
            Object.entries(mainMedals).map(([key, medal]) => [key, medal.characterId])
        );

        writeFileSync(
            path.join('scripts', 'characterId.json'),
            JSON.stringify(trimmedObject, null, 2),
            'utf-8'
        );
        console.log('File characterId.json saved successfully! (Connector for character-parser.ts)');
    } catch (error) {
        console.error('Error saving files:', error);
    }
}


const medalParse = async (input: string, output: string) => {

    try {

        const workbook = new ExcelJS.Workbook();

        await workbook.xlsx.readFile(input);

        const mainPage = workbook.getWorksheet(1);


        let mainMedalNumber = 341
        let eventMedalNumber = 309
        mainPage?.eachRow((row, rowNumber) => {
            if (rowNumber >= 10 && rowNumber <= 350) {
                if (row) {
                    const medal: MedalExcel = mainMedalRow(row)

                    if (rowNumber <= 316) {
                        const eventMedal: MedalExcel = eventMedalRow(row, eventMedalNumber)
                        eventMedals[eventMedalNumber] = eventMedal;
                        eventMedalNumber = eventMedalNumber - (eventMedalNumber === 69 ? 3 : 1)
                    }

                    mainMedals[mainMedalNumber] = medal;
                    mainRankedMedals[mainMedalNumber] = {
                        ...medal,
                        type: MedalType.CHARACTER_RANKING,
                    }
                    mainMedalNumber -= 1
                }

            }
        })

        getImageMainMedal(workbook)
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
    console.error(`Use: npx tsx scripts/medal-parser <src> <dest> (dest is optional, default is : ${defaultOutput})`);
    process.exit(1);
}


medalParse(input, output ?? defaultOutput)