import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const convertPngToWebp = async (inputDir: string, outputDir: string) => {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const files = fs.readdirSync(inputDir);
    const pngFiles = files.filter(file => path.extname(file).toLowerCase() === '.png');
    const numberOfFiles = pngFiles.length;

    console.log(`Found ${numberOfFiles} PNG files in ${inputDir}. Initiating conversion...`);

    let counter = 0;

    for (const file of pngFiles) {
        const inputPath = path.join(inputDir, file);
        const fileName = path.parse(file).name;
        const outputPath = path.join(outputDir, `${fileName}.webp`);

        try {
            await sharp(inputPath)
                .webp({ quality: 80 }) // 80 é o sweet spot entre qualidade e peso
                .toFile(outputPath);
            counter += 1;
            console.log(`Converted ${counter}/${numberOfFiles}: ${file} -> ${fileName}.webp`);
        } catch (err) {
            console.error(`Error converting  ${file}:`, err);
        }
    }

    console.log('--- Finished : Total files converted: ' + counter + ' of ' + numberOfFiles + ' . ---');
};

const [, , input, output] = process.argv;

if (!input || !output) {
    console.error('Use: npx tsx scripts/png-to-webp-converter.ts <src> <dest>');
    process.exit(1);
}

convertPngToWebp(input, output);