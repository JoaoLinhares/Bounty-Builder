
/*
    Script used to parse data from an Excel Medal Data Set and store them in the correct folder with the types defined by the Prisma Schema at prisma/schema.prisma
*/
import ExcelJS from 'exceljs';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

const paths: Record<string, string> = {};


function save(output: string) {

    if (!existsSync(output)) {
        mkdirSync(output, { recursive: true });
    }

    try {
        writeFileSync(
            path.join(output, 'paths.json'),
            JSON.stringify(paths, null, 2),
            'utf-8'
        );
        console.log('File paths.json saved successfully!');

    } catch (error) {
        console.error('Error saving file:', error);
    }
}

const calculatePath = async (input: string, output: string, ids: Set<string>) => {

    try {

        const workbook = new ExcelJS.Workbook();

        await workbook.xlsx.readFile(input);

        const csvPage = workbook.getWorksheet(2);


        csvPage?.eachRow((row, rowNumber) => {
            if (rowNumber >= 2 && rowNumber <= 297) {
                if (row) {
                    const id = (row.getCell(1).value as string).toString().match(/310110(\d+)$/i)?.[1]
                    const path = (row.getCell(2).value as string) + '01'
                    if (!id || !ids.has(id)) {
                        console.error('Error at: ' + rowNumber)
                    } else {
                        paths[id] = path
                        ids.delete(id)
                    }

                }

            }
        })

        console.log('Missing (' + ids.size + '):' + Array.from(ids).join(', '))
        save(output)
    } catch (err) {
        console.error(`Error parsing file : ${input})`);
        console.error(err);
        process.exit(1);
    }

}




const [, , input, output] = process.argv;
const defaultOutput = 'scripts/';

if (!input) {
    console.error(`Use: npx tsx scripts/calculate-character-img-path <src> <dest> (dest is optional, default is : ${defaultOutput})`);
    process.exit(1);
}

if (!existsSync('scripts/characterId.json')) {
    console.error(`Missing helper characterId.json file on scripts folder. Please generate the medal data first.`);
    process.exit(1);
}

const rawData = readFileSync('scripts/characterId.json', 'utf-8');

const findGameId: Record<string, string> = JSON.parse(rawData);

const ids: Set<string> = new Set(Object.values(findGameId))



calculatePath(input, output ?? defaultOutput, ids)
