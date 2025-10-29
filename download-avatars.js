// Script to download avatar images for D&D character species/genders
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const AVATARS_DIR = path.join(__dirname, 'public', 'images', 'avatars');

// Ensure directory exists
if (!fs.existsSync(AVATARS_DIR)) {
    fs.mkdirSync(AVATARS_DIR, { recursive: true });
}

// DiceBear styles to use for variety
const STYLES = ['avataaars', 'big-ears', 'personas', 'adventurer'];

// Species and their mappings
const SPECIES = {
    'human': { name: 'Human', variants: ['01', '02', '03', '04'] },
    'elf': { name: 'Elf', variants: ['01', '02', '03', '04'] },
    'dwarf': { name: 'Dwarf', variants: ['01', '02', '03', '04'] },
    'halfling': { name: 'Halfling', variants: ['01', '02', '03', '04'] },
    'dragonborn': { name: 'Dragonborn', variants: ['01', '02', '03', '04'] },
    'gnome': { name: 'Gnome', variants: ['01', '02', '03', '04'] },
    'half-elf': { name: 'Half-Elf', variants: ['01', '02', '03', '04'] },
    'half-orc': { name: 'Half-Orc', variants: ['01', '02', '03', '04'] },
    'tiefling': { name: 'Tiefling', variants: ['01', '02', '03', '04'] }
};

const GENDERS = ['male', 'female', 'other'];

// Download file from URL
function downloadFile(url, filepath) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const file = fs.createWriteStream(filepath);

        protocol.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            } else {
                fs.unlink(filepath, () => {});
                reject(new Error(`Failed to download: ${response.statusCode}`));
            }
        }).on('error', (err) => {
            fs.unlink(filepath, () => {});
            reject(err);
        });
    });
}

// Generate avatar configurations
async function generateAvatars() {
    const avatarConfig = {};
    let totalDownloads = 0;
    let successCount = 0;

    console.log('🎨 Starting avatar generation...\n');

    for (const [speciesKey, speciesData] of Object.entries(SPECIES)) {
        avatarConfig[speciesKey] = { name: speciesData.name, genders: {} };

        for (const gender of GENDERS) {
            avatarConfig[speciesKey].genders[gender] = [];

            console.log(`📥 Downloading ${speciesData.name} - ${gender}...`);

            for (let i = 0; i < 4; i++) {
                const variant = speciesData.variants[i];
                const style = STYLES[i % STYLES.length];
                const seed = `${speciesKey}-${gender}-${variant}`;

                // Use SVG format
                const url = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=transparent`;
                const filename = `${speciesKey}-${gender}-${variant}.svg`;
                const filepath = path.join(AVATARS_DIR, filename);

                totalDownloads++;

                try {
                    await downloadFile(url, filepath);
                    avatarConfig[speciesKey].genders[gender].push({
                        id: variant,
                        path: `/images/avatars/${filename}`,
                        style: style
                    });
                    successCount++;
                    process.stdout.write('.');
                } catch (error) {
                    console.error(`\n  ❌ Failed to download ${filename}:`, error.message);
                }

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            console.log(' ✓');
        }
    }

    // Save avatar configuration
    const configPath = path.join(__dirname, 'public', 'avatar-gallery.json');
    fs.writeFileSync(configPath, JSON.stringify(avatarConfig, null, 2));

    console.log(`\n✅ Download complete!`);
    console.log(`   Successfully downloaded: ${successCount}/${totalDownloads} avatars`);
    console.log(`   Saved to: ${AVATARS_DIR}`);
    console.log(`   Config saved to: ${configPath}\n`);
}

// Run the script
generateAvatars().catch(error => {
    console.error('❌ Error generating avatars:', error);
    process.exit(1);
});
