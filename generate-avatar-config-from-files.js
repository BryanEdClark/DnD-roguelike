// Generate avatar configuration from existing files in avatars folder
const fs = require('fs');
const path = require('path');

const AVATARS_DIR = path.join(__dirname, 'public', 'images', 'avatars');
const CONFIG_PATH = path.join(__dirname, 'public', 'avatar-gallery.json');

// Species mapping - maps D&D species to avatar file names
const SPECIES_MAPPING = {
    'human': { name: 'Human', filePrefix: 'human' },
    'elf': { name: 'Elf', filePrefix: 'elf' },
    'dwarf': { name: 'Dwarf', filePrefix: 'dwarf' },
    'halfling': { name: 'Halfling', filePrefix: 'gnome' }, // Use gnome avatars for halfling
    'dragonborn': { name: 'Dragonborn', filePrefix: 'dragonborn' },
    'gnome': { name: 'Gnome', filePrefix: 'gnome' },
    'half-elf': { name: 'Half-Elf', filePrefix: 'elf' }, // Use elf avatars for half-elf
    'half-orc': { name: 'Half-Orc', filePrefix: 'orc' },
    'tiefling': { name: 'Tiefling', filePrefix: 'tiefling' },
    'aasimar': { name: 'Aasimar', filePrefix: 'aasimar' }, // Has own artwork
    'goliath': { name: 'Goliath', filePrefix: 'goliath' }  // Has own artwork
};

function generateConfig() {
    console.log('🎨 Generating avatar configuration from existing files...\n');

    // Read all files in avatars directory
    const files = fs.readdirSync(AVATARS_DIR);
    const avatarConfig = {};

    // Initialize config structure
    for (const [species, data] of Object.entries(SPECIES_MAPPING)) {
        avatarConfig[species] = {
            name: data.name,
            genders: {
                male: [],
                female: [],
                other: []
            }
        };
    }

    // Process files
    files.forEach(file => {
        // Expected format: {gender}_{species}{number}.jpg
        const match = file.match(/^(male|female)_([a-z]+)(\d+)\.(jpg|png|jpeg|gif|webp|svg)$/i);

        if (match) {
            const [, gender, fileSpecies, number, ext] = match;

            // Find which D&D species this file should be used for
            for (const [species, data] of Object.entries(SPECIES_MAPPING)) {
                if (data.filePrefix === fileSpecies) {
                    const avatarPath = `/images/avatars/${file}`;

                    avatarConfig[species].genders[gender].push({
                        id: number.padStart(2, '0'),
                        path: avatarPath,
                        style: 'custom',
                        description: `${fileSpecies}-portrait`
                    });

                    console.log(`✓ ${data.name} ${gender} #${number}: ${file}`);
                }
            }
        }
    });

    // Sort avatars by ID
    for (const species of Object.values(avatarConfig)) {
        for (const gender of Object.keys(species.genders)) {
            species.genders[gender].sort((a, b) => a.id.localeCompare(b.id));
        }
    }

    // Save configuration
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(avatarConfig, null, 2));

    console.log(`\n✅ Configuration saved to: ${CONFIG_PATH}\n`);

    // Print summary
    console.log('📊 Summary:');
    console.log('─'.repeat(50));
    for (const [species, data] of Object.entries(avatarConfig)) {
        const maleCount = data.genders.male.length;
        const femaleCount = data.genders.female.length;
        const otherCount = data.genders.other.length;
        const total = maleCount + femaleCount + otherCount;
        console.log(`${data.name.padEnd(15)} Male: ${maleCount}, Female: ${femaleCount}, Other: ${otherCount} (Total: ${total})`);
    }

    console.log('\n💡 Species mappings:');
    console.log('   • Halfling → uses Gnome avatars');
    console.log('   • Half-Elf → uses Elf avatars');
    console.log('   • Half-Orc → uses Orc avatars\n');

    console.log('🎯 Next step: Refresh your browser to see the avatars!\n');
}

generateConfig();
