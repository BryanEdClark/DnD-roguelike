// Search and download D&D character artwork from the web
const axios = require('axios');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const AVATARS_DIR = path.join(__dirname, 'public', 'images', 'avatars');
const CONFIG_PATH = path.join(__dirname, 'public', 'avatar-gallery.json');

// Ensure directory exists
if (!fs.existsSync(AVATARS_DIR)) {
    fs.mkdirSync(AVATARS_DIR, { recursive: true });
}

// Search queries for each species/gender
const SEARCH_QUERIES = {
    'human': {
        name: 'Human',
        searches: {
            male: ['DnD 2024 male human fighter', 'DnD male human warrior', 'DnD male human paladin'],
            female: ['DnD 2024 female human wizard', 'DnD female human cleric', 'DnD female human rogue'],
            other: ['DnD human adventurer', 'DnD human character']
        }
    },
    'elf': {
        name: 'Elf',
        searches: {
            male: ['DnD 2024 male elf ranger', 'DnD male high elf', 'DnD male elf wizard'],
            female: ['DnD 2024 female elf ranger', 'DnD female high elf', 'DnD female elf wizard'],
            other: ['DnD elf character', 'DnD elf portrait']
        }
    },
    'dwarf': {
        name: 'Dwarf',
        searches: {
            male: ['DnD 2024 male dwarf cleric', 'DnD male dwarf fighter', 'DnD male dwarf warrior'],
            female: ['DnD 2024 female dwarf fighter', 'DnD female dwarf cleric', 'DnD female dwarf paladin'],
            other: ['DnD dwarf character', 'DnD dwarf portrait']
        }
    },
    'halfling': {
        name: 'Halfling',
        searches: {
            male: ['DnD 2024 male halfling rogue', 'DnD male halfling bard', 'DnD male halfling character'],
            female: ['DnD 2024 female halfling rogue', 'DnD female halfling bard', 'DnD female halfling character'],
            other: ['DnD halfling character', 'DnD halfling portrait']
        }
    },
    'dragonborn': {
        name: 'Dragonborn',
        searches: {
            male: ['DnD 2024 male dragonborn paladin', 'DnD male dragonborn fighter', 'DnD red dragonborn'],
            female: ['DnD 2024 female dragonborn sorcerer', 'DnD female dragonborn fighter', 'DnD blue dragonborn'],
            other: ['DnD dragonborn character', 'DnD dragonborn portrait']
        }
    },
    'gnome': {
        name: 'Gnome',
        searches: {
            male: ['DnD 2024 male gnome wizard', 'DnD male gnome artificer', 'DnD male gnome character'],
            female: ['DnD 2024 female gnome wizard', 'DnD female gnome artificer', 'DnD female gnome character'],
            other: ['DnD gnome character', 'DnD gnome portrait']
        }
    },
    'half-elf': {
        name: 'Half-Elf',
        searches: {
            male: ['DnD 2024 male half-elf bard', 'DnD male half-elf ranger', 'DnD male half-elf character'],
            female: ['DnD 2024 female half-elf bard', 'DnD female half-elf ranger', 'DnD female half-elf character'],
            other: ['DnD half-elf character', 'DnD half-elf portrait']
        }
    },
    'half-orc': {
        name: 'Half-Orc',
        searches: {
            male: ['DnD 2024 male half-orc barbarian', 'DnD male half-orc fighter', 'DnD male half-orc character'],
            female: ['DnD 2024 female half-orc barbarian', 'DnD female half-orc fighter', 'DnD female half-orc character'],
            other: ['DnD half-orc character', 'DnD half-orc portrait']
        }
    },
    'tiefling': {
        name: 'Tiefling',
        searches: {
            male: ['DnD 2024 male tiefling warlock', 'DnD male tiefling sorcerer', 'DnD red tiefling male'],
            female: ['DnD 2024 female tiefling warlock', 'DnD female tiefling sorcerer', 'DnD purple tiefling female'],
            other: ['DnD tiefling character', 'DnD tiefling portrait']
        }
    }
};

// Download file from URL
function downloadFile(url, filepath) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const file = fs.createWriteStream(filepath);

        protocol.get(url, (response) => {
            // Handle redirects
            if (response.statusCode === 301 || response.statusCode === 302) {
                file.close();
                fs.unlinkSync(filepath);
                return downloadFile(response.headers.location, filepath)
                    .then(resolve)
                    .catch(reject);
            }

            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            } else {
                file.close();
                fs.unlink(filepath, () => {});
                reject(new Error(`Failed: ${response.statusCode}`));
            }
        }).on('error', (err) => {
            file.close();
            fs.unlink(filepath, () => {});
            reject(err);
        });
    });
}

async function downloadDnDImages() {
    console.log('\n🔍 Searching for D&D Character Artwork...\n');
    console.log('This script will show you what to search for.\n');
    console.log('Due to copyright and automated scraping limitations,');
    console.log('you\'ll need to manually download the images.\n');
    console.log('─────────────────────────────────────────────────\n');

    for (const [species, data] of Object.entries(SEARCH_QUERIES)) {
        console.log(`\n📚 ${data.name}:`);
        console.log('─'.repeat(50));

        for (const [gender, queries] of Object.entries(data.searches)) {
            console.log(`\n  ${gender.toUpperCase()}:`);

            queries.forEach((query, index) => {
                const variant = String(index + 1).padStart(2, '0');
                const filename = `${species}-${gender}-${variant}`;

                console.log(`\n    ${index + 1}. Search: "${query}"`);
                console.log(`       Google Images: https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`);
                console.log(`       Save first good result as: ${filename}.jpg`);
            });
        }
    }

    console.log('\n\n📋 QUICK STEPS:');
    console.log('─────────────────────────────────────────────────\n');
    console.log('1. Click any Google Images link above');
    console.log('2. Find a good D&D character portrait');
    console.log('3. Right-click → "Save image as..."');
    console.log('4. Save to: public/images/avatars/');
    console.log('5. Use the filename shown above');
    console.log('6. Repeat for each species/gender');
    console.log('7. Run: node setup-token-pack.js\n');

    console.log('💡 TIP: Look for official D&D artwork or fan art from:');
    console.log('   • D&D Beyond character pages');
    console.log('   • ArtStation D&D collections');
    console.log('   • Pinterest D&D character boards\n');

    console.log('✅ After downloading images, the helper tool will configure them!\n');
}

downloadDnDImages();
