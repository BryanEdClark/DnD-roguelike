// Generate avatar configuration with working external URLs (no download needed)
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'public', 'avatar-gallery.json');

// Use DiceBear API URLs directly - these will always work
const SPECIES_CONFIGS = {
    'human': {
        name: 'Human',
        styles: ['adventurer', 'lorelei', 'micah', 'personas']
    },
    'elf': {
        name: 'Elf',
        styles: ['lorelei-neutral', 'adventurer-neutral', 'micah', 'personas']
    },
    'dwarf': {
        name: 'Dwarf',
        styles: ['adventurer', 'micah', 'personas', 'fun-emoji']
    },
    'halfling': {
        name: 'Halfling',
        styles: ['adventurer-neutral', 'lorelei', 'personas', 'micah']
    },
    'dragonborn': {
        name: 'Dragonborn',
        styles: ['bottts', 'adventurer', 'personas', 'shapes']
    },
    'gnome': {
        name: 'Gnome',
        styles: ['adventurer-neutral', 'lorelei', 'micah', 'personas']
    },
    'half-elf': {
        name: 'Half-Elf',
        styles: ['lorelei-neutral', 'adventurer', 'micah', 'personas']
    },
    'half-orc': {
        name: 'Half-Orc',
        styles: ['adventurer', 'personas', 'micah', 'fun-emoji']
    },
    'tiefling': {
        name: 'Tiefling',
        styles: ['lorelei-neutral', 'adventurer', 'personas', 'micah']
    }
};

const GENDERS = ['male', 'female', 'other'];

function generateAvatarUrl(species, gender, variant, styleIndex) {
    const config = SPECIES_CONFIGS[species];
    const style = config.styles[styleIndex];
    const seed = `${species}-${gender}-v${variant}`;

    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=transparent&size=128`;
}

function generateConfig() {
    const avatarConfig = {};

    console.log('🎨 Generating avatar configuration with working URLs...\n');

    for (const [speciesKey, speciesData] of Object.entries(SPECIES_CONFIGS)) {
        avatarConfig[speciesKey] = { name: speciesData.name, genders: {} };

        for (const gender of GENDERS) {
            avatarConfig[speciesKey].genders[gender] = [];

            for (let i = 0; i < 4; i++) {
                const variant = String(i + 1).padStart(2, '0');
                const url = generateAvatarUrl(speciesKey, gender, variant, i);

                avatarConfig[speciesKey].genders[gender].push({
                    id: variant,
                    path: url,  // Use external URL directly
                    style: speciesData.styles[i],
                    description: 'external-url'
                });
            }

            console.log(`✓ ${speciesData.name} - ${gender}: 4 avatars`);
        }
    }

    // Save configuration
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(avatarConfig, null, 2));

    console.log(`\n✅ Configuration saved to: ${CONFIG_PATH}`);
    console.log('\n📝 Using external URLs - no downloads needed!');
    console.log('💡 Refresh your browser to see working avatars.\n');
    console.log('🎯 To use custom artwork later, follow FASTEST-SETUP.md\n');
}

generateConfig();
