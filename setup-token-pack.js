// Helper to batch-process downloaded D&D token packs
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const AVATARS_DIR = path.join(__dirname, 'public', 'images', 'avatars');
const CONFIG_PATH = path.join(__dirname, 'public', 'avatar-gallery.json');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

const SPECIES_LIST = [
    'human', 'elf', 'dwarf', 'halfling', 'dragonborn',
    'gnome', 'half-elf', 'half-orc', 'tiefling'
];

const GENDER_LIST = ['male', 'female', 'other'];

async function setupTokenPack() {
    console.log('\n🗂️  D&D Token Pack Setup Tool\n');
    console.log('This tool helps you organize downloaded D&D character tokens.');
    console.log('Place your token images in a folder and this will copy and rename them.\n');

    const sourceDir = await question('Enter path to folder with token images: ');

    if (!fs.existsSync(sourceDir)) {
        console.error('❌ Folder not found!');
        rl.close();
        return;
    }

    const files = fs.readdirSync(sourceDir).filter(f => {
        const ext = path.extname(f).toLowerCase();
        return ['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(ext);
    });

    console.log(`\n📁 Found ${files.length} image files\n`);
    console.log('For each image, specify its species and gender.');
    console.log('Type "skip" to skip an image.\n');

    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    let processedCount = 0;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`\n[${i + 1}/${files.length}] ${file}`);

        const species = await question(`  Species (${SPECIES_LIST.join('/')}): `);
        if (species.toLowerCase() === 'skip') {
            console.log('  ⏭️  Skipped');
            continue;
        }

        if (!SPECIES_LIST.includes(species)) {
            console.log('  ⚠️  Invalid species, skipping');
            continue;
        }

        const gender = await question(`  Gender (male/female/other): `);
        if (!GENDER_LIST.includes(gender)) {
            console.log('  ⚠️  Invalid gender, skipping');
            continue;
        }

        // Find next available variant number
        const existingVariants = config[species]?.genders[gender] || [];
        let variantNum = existingVariants.length + 1;
        const variant = String(variantNum).padStart(2, '0');

        const ext = path.extname(file);
        const newFilename = `${species}-${gender}-${variant}${ext}`;
        const destPath = path.join(AVATARS_DIR, newFilename);

        try {
            fs.copyFileSync(path.join(sourceDir, file), destPath);

            // Update config
            if (!config[species].genders[gender]) {
                config[species].genders[gender] = [];
            }

            config[species].genders[gender].push({
                id: variant,
                path: `/images/avatars/${newFilename}`,
                style: 'custom',
                description: 'dnd-token'
            });

            console.log(`  ✅ Saved as: ${newFilename}`);
            processedCount++;
        } catch (error) {
            console.error(`  ❌ Error copying file:`, error.message);
        }
    }

    // Save updated config
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

    console.log(`\n✨ Done! Processed ${processedCount}/${files.length} images`);
    console.log('\n💡 Refresh your browser to see the new avatars!\n');

    rl.close();
}

// Interactive mode
async function interactiveSetup() {
    console.log('\n🎯 Quick Setup Options:\n');
    console.log('1. Batch process token folder (organize multiple tokens)');
    console.log('2. Add single token manually');
    console.log('3. View current avatar counts');
    console.log('4. Exit\n');

    const choice = await question('Select option (1-4): ');

    switch (choice) {
        case '1':
            await setupTokenPack();
            break;

        case '2':
            rl.close();
            console.log('\n💡 Use: node add-custom-avatar.js\n');
            break;

        case '3':
            const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
            console.log('\n📊 Current Avatar Counts:\n');

            for (const [species, data] of Object.entries(config)) {
                console.log(`${data.name}:`);
                for (const [gender, avatars] of Object.entries(data.genders)) {
                    console.log(`  ${gender}: ${avatars.length} avatars`);
                }
            }

            console.log('');
            rl.close();
            break;

        case '4':
            console.log('Goodbye! 👋\n');
            rl.close();
            break;

        default:
            console.log('Invalid option');
            rl.close();
    }
}

// Run
interactiveSetup().catch(error => {
    console.error('Error:', error);
    rl.close();
});
