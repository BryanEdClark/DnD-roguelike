// Script to download fantasy character artwork for D&D species/genders
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const AVATARS_DIR = path.join(__dirname, 'public', 'images', 'avatars');

// Ensure directory exists
if (!fs.existsSync(AVATARS_DIR)) {
    fs.mkdirSync(AVATARS_DIR, { recursive: true });
}

// Species-specific artwork configurations with better fantasy styles
const SPECIES_CONFIGS = {
    'human': {
        name: 'Human',
        styles: ['adventurer', 'lorelei', 'micah', 'personas'],
        descriptions: ['warrior', 'knight', 'mage', 'rogue']
    },
    'elf': {
        name: 'Elf',
        styles: ['lorelei-neutral', 'adventurer-neutral', 'micah', 'personas'],
        descriptions: ['elf-ranger', 'elf-wizard', 'elf-archer', 'elf-noble']
    },
    'dwarf': {
        name: 'Dwarf',
        styles: ['adventurer', 'micah', 'personas', 'big-smile'],
        descriptions: ['dwarf-warrior', 'dwarf-cleric', 'dwarf-fighter', 'dwarf-smith']
    },
    'halfling': {
        name: 'Halfling',
        styles: ['adventurer-neutral', 'lorelei', 'personas', 'micah'],
        descriptions: ['halfling-rogue', 'halfling-bard', 'halfling-scout', 'halfling-druid']
    },
    'dragonborn': {
        name: 'Dragonborn',
        styles: ['bottts', 'adventurer', 'personas', 'micah'],
        descriptions: ['dragonborn-red', 'dragonborn-blue', 'dragonborn-gold', 'dragonborn-green']
    },
    'gnome': {
        name: 'Gnome',
        styles: ['adventurer-neutral', 'lorelei', 'micah', 'personas'],
        descriptions: ['gnome-wizard', 'gnome-tinkerer', 'gnome-illusionist', 'gnome-artificer']
    },
    'half-elf': {
        name: 'Half-Elf',
        styles: ['lorelei-neutral', 'adventurer', 'micah', 'personas'],
        descriptions: ['halfelf-bard', 'halfelf-ranger', 'halfelf-sorcerer', 'halfelf-warlock']
    },
    'half-orc': {
        name: 'Half-Orc',
        styles: ['adventurer', 'personas', 'micah', 'big-smile'],
        descriptions: ['halforc-barbarian', 'halforc-fighter', 'halforc-monk', 'halforc-cleric']
    },
    'tiefling': {
        name: 'Tiefling',
        styles: ['lorelei-neutral', 'adventurer', 'personas', 'micah'],
        descriptions: ['tiefling-warlock', 'tiefling-sorcerer', 'tiefling-rogue', 'tiefling-bard']
    }
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

// Generate better avatar URLs with species-appropriate styling
function generateAvatarUrl(species, gender, variant, styleIndex) {
    const config = SPECIES_CONFIGS[species];
    const style = config.styles[styleIndex];
    const description = config.descriptions[styleIndex];

    // Create a unique seed combining all parameters
    const seed = `${species}-${gender}-${description}-${variant}`;

    // Build URL with species-appropriate parameters
    let url = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
    url += '&backgroundColor=transparent';

    // Add style-specific parameters for more variety
    if (style.includes('adventurer')) {
        url += '&flip=false';
    }
    if (style.includes('lorelei')) {
        url += '&frecklesProbability=30';
    }
    if (style === 'micah') {
        url += '&baseColor=apricot,coast,topaz';
    }

    return url;
}

// Generate fantasy avatars
async function generateFantasyAvatars() {
    const avatarConfig = {};
    let totalDownloads = 0;
    let successCount = 0;

    console.log('🐉 Starting fantasy character art generation...\n');

    for (const [speciesKey, speciesData] of Object.entries(SPECIES_CONFIGS)) {
        avatarConfig[speciesKey] = { name: speciesData.name, genders: {} };

        for (const gender of GENDERS) {
            avatarConfig[speciesKey].genders[gender] = [];

            console.log(`⚔️  Downloading ${speciesData.name} - ${gender}...`);

            for (let i = 0; i < 4; i++) {
                const variant = String(i + 1).padStart(2, '0');
                const url = generateAvatarUrl(speciesKey, gender, variant, i);
                const style = speciesData.styles[i];
                const filename = `${speciesKey}-${gender}-${variant}.svg`;
                const filepath = path.join(AVATARS_DIR, filename);

                totalDownloads++;

                try {
                    await downloadFile(url, filepath);
                    avatarConfig[speciesKey].genders[gender].push({
                        id: variant,
                        path: `/images/avatars/${filename}`,
                        style: style,
                        description: speciesData.descriptions[i]
                    });
                    successCount++;
                    process.stdout.write('✓ ');
                } catch (error) {
                    console.error(`\n  ❌ Failed to download ${filename}:`, error.message);
                }

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 150));
            }
            console.log('');
        }
    }

    // Save avatar configuration
    const configPath = path.join(__dirname, 'public', 'avatar-gallery.json');
    fs.writeFileSync(configPath, JSON.stringify(avatarConfig, null, 2));

    console.log(`\n✅ Fantasy character art download complete!`);
    console.log(`   Successfully downloaded: ${successCount}/${totalDownloads} avatars`);
    console.log(`   Saved to: ${AVATARS_DIR}`);
    console.log(`   Config saved to: ${configPath}`);
    console.log(`\n🎨 Tip: These are improved fantasy-style avatars using better DiceBear styles.`);
    console.log(`   For even better custom artwork, you can replace the SVG files in the avatars folder.\n`);
}

// Run the script
generateFantasyAvatars().catch(error => {
    console.error('❌ Error generating fantasy avatars:', error);
    process.exit(1);
});
