import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const resize = async (inputDir: string, outputDir: string, height: number, width: number) => {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const files = fs.readdirSync(inputDir);
    const pngFiles = files.filter(file => path.extname(file).toLowerCase() === '.png');
    const numberOfFiles = pngFiles.length;

    console.log(`Found ${numberOfFiles} files in ${inputDir}. Initiating resizing...`);

    let counter = 0;

    for (const file of pngFiles) {
        const inputPath = path.join(inputDir, file);
        const fileName = path.parse(file).name;
        const outputPath = path.join(outputDir, `${fileName}.webp`);

        try {
            await sharp(inputPath)
                .trim()
                .resize(width, height, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 },
                    kernel: sharp.kernel.lanczos3
                })
                .webp({
                    quality: 85,
                    effort: 6
                })
                .toFile(outputPath);
            counter += 1;
            console.log(`Counter: ${counter}/${numberOfFiles}: Standardized ${fileName}.webp to ${height}x${width}`);
        } catch (err) {
            console.error(`Error resizing  ${file}:`, err);
        }
    }

    console.log('--- Finished : Total files standardized: ' + counter + ' of ' + numberOfFiles + ' . ---');
};

const [, , input, output, height, width] = process.argv;

if (!input || !output) {
    console.error('Use: npx ts-node scripts/image-resizer.ts <src> <dest> <height> <width> (default 128 each)');
    process.exit(1);
}

resize(input, output, parseInt(height) || 128, parseInt(width) || 128);