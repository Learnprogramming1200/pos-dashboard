const fs = require('fs');
const path = require('path');
const https = require('https');

const fonts = [
    'Inter:wght@300;400;500;600;700',
    'Roboto:wght@300;400;500;700',
    'Poppins:wght@300;400;500;600;700',
    'Montserrat:wght@300;400;500;600;700',
    'Lato:wght@300;400;700',
    'Merriweather:wght@300;400;700',
    'Playfair+Display:wght@400;500;700'
];

const outputDir = path.join(__dirname, '../public/fonts');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const cssFile = path.join(outputDir, 'fonts.css');
let cssContent = '';

async function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
}

async function processFonts() {

    for (const font of fonts) {
        const family = font.split(':')[0].replace(/\+/g, ' ');
        const url = `https://fonts.googleapis.com/css2?family=${font}&display=swap`;

        try {
            // 1. Get the CSS from Google
            const css = await new Promise((resolve, reject) => {
                https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' } }, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => resolve(data));
                }).on('error', reject);
            });

            // 2. Parse CSS to find font files
            const regex = /src:\s*url\((https:\/\/[^)]+)\)\s*format\(['"]([^'"]+)['"]\);/g;
            const fontFaceRegex = /@font-face\s*{([^}]+)}/g;

            let match;
            let modifiedCss = css;

            let fontFaceMatch;
            while ((fontFaceMatch = fontFaceRegex.exec(css)) !== null) {
                const fontBlock = fontFaceMatch[0];

                // Extract URL
                const urlMatch = /url\((https:\/\/[^)]+)\)/.exec(fontBlock);
                if (!urlMatch) continue;

                const fontUrl = urlMatch[1];
                const ext = path.extname(fontUrl) || '.woff2';
                const filename = `${family.replace(/\s/g, '_')}-${path.basename(fontUrl).split('.')[0]}${ext}`;
                const localPath = path.join(outputDir, filename);

                // Download font file
                await downloadFile(fontUrl, localPath);

                // Create new CSS rule with local path
                // We need to keep the other properties specifically (font-style, font-weight, unicode-range)
                // Simplified replacement for the generated CSS file

                // Replace URL in the original block with local path
                // Just appending to our big CSS string

                // We construct a valid local @font-face rule
                // We parse properties from the block
                const weightMatch = /font-weight:\s*([^;]+);/.exec(fontBlock);
                const styleMatch = /font-style:\s*([^;]+);/.exec(fontBlock);
                const unicodeMatch = /unicode-range:\s*([^;]+);/.exec(fontBlock); // Might be multiple lines, simple regex might fail on multiline

                // Better approach: String replacement on the block
                let localBlock = fontBlock.replace(fontUrl, `./${filename}`);
                cssContent += localBlock + '\n';
            }
        } catch (e) {
            console.error(`Error processing ${family}:`, e);
        }
    }

    fs.writeFileSync(cssFile, cssContent);
}

processFonts();
