/*
    Script used to parse data from an Excel Medal Data Set and store them in the correct folder with the types defined by the Prisma Schema at prisma/schema.prisma
*/
import { MedalTag as EnumMedalTag, MedalTagType } from '@/constants/medal-tags';
import { Medal, MedalTag, MedalType, UniqueTrait, UniqueTraitConstraint } from '@/generated/prisma/client';
import ExcelJS from 'exceljs';
import { getUniqueTraitConstraint } from './constrait-helper';
import { getUniqueTrait } from './trait-helper';

export type UniqueTraitConstraintExcel = Omit<UniqueTraitConstraint, 'id'>
export type UniqueTraitExcel = Omit<UniqueTrait, 'id'>
type MedalTagExcel = Omit<MedalTag, 'id'>

export type MedalExcel = {
    tags: MedalTagExcel[],
    uniqueConstraints: UniqueTraitConstraintExcel[],
    uniqueTraits: UniqueTraitExcel[],

} & Omit<Medal, 'id'>
function stringFormatter(cell: ExcelJS.Cell): string {

    return (cell.value as string).replaceAll('_', '-').replaceAll('``', '"');
}


function getTags(cell: ExcelJS.Cell): MedalTagExcel[] {
    const tagValues = stringFormatter(cell).split('\n');


    return tagValues.map(tag => {
        const formatedTag = tag.replaceAll(/["/]+/g, '').replaceAll(/[- `]+/g, '_').replace('2', 'two').toUpperCase();
        const tagEnum = EnumMedalTag[formatedTag as MedalTagType];
        if (formatedTag === 'BAROQUE_WORKS') {
            return {
                name: EnumMedalTag.BAROQUE_WORKS_FORMER_BAROQUE_WORKS
            }
        }
        if (!tagEnum) {
            console.error('Didnt find: ' + formatedTag + ' original: ' + tag)
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

const medalParse = async (input: string, output: string) => {

    try {

        const workbook = new ExcelJS.Workbook();

        await workbook.xlsx.readFile(input);

        const mainPage = workbook.getWorksheet(1);

        const mainMedals: Record<number, MedalExcel> = {};
        let keyNumber = 341
        mainPage?.eachRow((row, rowNumber) => {
            if (rowNumber >= 10 && rowNumber <= 350) {
                if (row) {
                    const uniqueTrait = stringFormatter(row.getCell(5))
                    const constraitParser = uniqueTrait.split(':');

                    const contraint = constraitParser.length > 0 ? constraitParser[0] : '';
                    const traits = constraitParser.length > 0 ? constraitParser[1] : constraitParser[0];

                    const medal: MedalExcel = {
                        gameId: 0, //TODO
                        name: stringFormatter(row.getCell(3)),
                        type: MedalType.CHARACTER,
                        asset: '', // TODO
                        characterId: null,
                        uniqueTraitDescription: uniqueTrait,
                        tags: getTags(row.getCell(6)),
                        uniqueConstraints: getUniqueTraitConstraints(contraint),
                        uniqueTraits: [] //TODO

                    }
                    if (rowNumber < 13) {
                        //console.log(medal)
                    }

                    mainMedals[keyNumber--] = medal;
                }

            }
        })
        //imagens evento da skip 67,68



    } catch (err) {
        console.error(`Error parsing file : ${input})`);
        console.error(err);
        process.exit(1);
    }

    /*
   
    if (!existsSync(output)) {
        mkdirSync(output, { recursive: true });
    }
        */

}



const [, , input, output] = process.argv;
const defaultOutput = 'prisma/data';

if (!input) {
    console.error(`Use: npx ts-node scripts/medal-parser <src> <dest> (dest is optional, default is : ${defaultOutput})`);
    process.exit(1);
}


medalParse(input, output ?? defaultOutput)