// Download proper D&D species artwork
const https = require('https');
const fs = require('fs');
const path = require('path');

const AVATARS_DIR = path.join(__dirname, 'public', 'images', 'avatars');
const CONFIG_PATH = path.join(__dirname, 'public', 'avatar-gallery.json');

// Ensure directory exists
if (!fs.existsSync(AVATARS_DIR)) {
    fs.mkdirSync(AVATARS_DIR, { recursive: true });
}

// Free placeholder images with fantasy/RPG themes
// Using picsum.photos with specific seeds for consistency
const SPECIES_ART_CONFIG = {
    'human': {
        name: 'Human',
        imageUrls: {
            male: [
                'https://xsgames.co/randomusers/assets/avatars/male/1.jpg',
                'https://xsgames.co/randomusers/assets/avatars/male/2.jpg',
                'https://xsgames.co/randomusers/assets/avatars/male/3.jpg',
                'https://xsgames.co/randomusers/assets/avatars/male/4.jpg'
            ],
            female: [
                'https://xsgames.co/randomusers/assets/avatars/female/1.jpg',
                'https://xsgames.co/randomusers/assets/avatars/female/2.jpg',
                'https://xsgames.co/randomusers/assets/avatars/female/3.jpg',
                'https://xsgames.co/randomusers/assets/avatars/female/4.jpg'
            ],
            other: [
                'https://xsgames.co/randomusers/assets/avatars/male/5.jpg',
                'https://xsgames.co/randomusers/assets/avatars/female/5.jpg',
                'https://xsgames.co/randomusers/assets/avatars/male/6.jpg',
                'https://xsgames.co/randomusers/assets/avatars/female/6.jpg'
            ]
        }
    }
};

// For now, we'll use placeholder URLs and provide manual download instructions
console.log('\n🎨 D&D Species Artwork Setup\n');
console.log('❌ Generic avatars cannot be automatically downloaded with proper D&D species features.');
console.log('✅ You need to manually add proper D&D artwork.\n');

console.log('📋 HERE\'S WHAT TO DO:\n');

console.log('OPTION 1: Use AI to Generate Proper D&D Art (5 minutes)');
console.log('─────────────────────────────────────────────────────\n');
console.log('1. Go to: https://www.bing.com/create\n');

console.log('2. Use these EXACT prompts:\n');

const prompts = {
    'human-male': 'D&D human male fighter portrait, realistic fantasy art, medieval warrior, detailed face, armor, heroic, digital painting, professional quality',
    'human-female': 'D&D human female wizard portrait, realistic fantasy art, mage robes, detailed face, magical, digital painting, professional quality',
    'elf-male': 'D&D high elf male ranger portrait, long pointed ears, elegant features, realistic fantasy art, detailed face, bow, digital painting, professional quality',
    'elf-female': 'D&D high elf female wizard portrait, long pointed ears, silver hair, elegant features, realistic fantasy art, detailed face, arcane robes, digital painting, professional quality',
    'dwarf-male': 'D&D dwarf male cleric portrait, long braided beard, stout build, realistic fantasy art, detailed face, chainmail, holy symbol, digital painting, professional quality',
    'dwarf-female': 'D&D dwarf female fighter portrait, braided beard, stocky build, realistic fantasy art, detailed face, plate armor, digital painting, professional quality',
    'tiefling-male': 'D&D tiefling male warlock portrait, red skin, curved horns, glowing eyes, realistic fantasy art, detailed face, dark robes, infernal, digital painting, professional quality',
    'tiefling-female': 'D&D tiefling female sorcerer portrait, purple skin, horns, glowing eyes, realistic fantasy art, detailed face, mystical robes, digital painting, professional quality',
    'dragonborn-male': 'D&D red dragonborn paladin portrait, dragon scales, reptilian features, no hair, realistic fantasy art, detailed face, golden armor, digital painting, professional quality',
    'dragonborn-female': 'D&D blue dragonborn sorcerer portrait, blue dragon scales, reptilian features, realistic fantasy art, detailed face, robes, digital painting, professional quality',
    'halfling-male': 'D&D halfling male rogue portrait, small stature, curly hair, youthful face, realistic fantasy art, detailed face, leather armor, digital painting, professional quality',
    'halfling-female': 'D&D halfling female bard portrait, small stature, cheerful face, realistic fantasy art, detailed face, colorful clothes, musical instrument, digital painting, professional quality',
    'gnome-male': 'D&D forest gnome male druid portrait, very small, pointed ears, nature magic, realistic fantasy art, detailed face, robes, digital painting, professional quality',
    'gnome-female': 'D&D rock gnome female artificer portrait, very small, goggles, tinkerer, realistic fantasy art, detailed face, tools, digital painting, professional quality',
    'half-orc-male': 'D&D half-orc male barbarian portrait, green-grey skin, tusks, muscular, fierce, realistic fantasy art, detailed face, tribal, digital painting, professional quality',
    'half-orc-female': 'D&D half-orc female fighter portrait, green skin, small tusks, strong features, realistic fantasy art, detailed face, armor, digital painting, professional quality',
    'half-elf-male': 'D&D half-elf male bard portrait, slightly pointed ears, charming, realistic fantasy art, detailed face, elegant clothes, musical instrument, digital painting, professional quality',
    'half-elf-female': 'D&D half-elf female ranger portrait, slightly pointed ears, mixed features, realistic fantasy art, detailed face, leather armor, bow, digital painting, professional quality'
};

for (const [key, prompt] of Object.entries(prompts)) {
    console.log(`   ${key}:`);
    console.log(`   "${prompt}"\n`);
}

console.log('\n3. For each prompt:');
console.log('   - Paste into Bing Image Creator');
console.log('   - Click "Create"');
console.log('   - Download the best result');
console.log('   - Save as: {species}-{gender}-01.jpg\n');

console.log('4. Place all images in: public/images/avatars/\n');

console.log('5. Run: node setup-token-pack.js');
console.log('   (This will organize and configure them automatically)\n\n');

console.log('OPTION 2: Download Free D&D Token Packs (10 minutes)');
console.log('─────────────────────────────────────────────────────\n');
console.log('1. Visit: https://2minutetabletop.com/product-category/tokens/character-tokens/');
console.log('2. Download FREE character token packs');
console.log('3. Extract the images');
console.log('4. Run: node setup-token-pack.js');
console.log('5. Point it to the extracted folder\n\n');

console.log('OPTION 3: Use Existing Free Resources');
console.log('─────────────────────────────────────────────────────\n');
console.log('• Forgotten Adventures: https://www.forgotten-adventures.net/');
console.log('• Roll20 Free Tokens: https://marketplace.roll20.net/ (filter: free)');
console.log('• Token Stamp: https://rolladvantage.com/tokenstamp/\n\n');

console.log('💡 TIP: Generate 3-4 variations per species/gender for variety!\n');
console.log('📁 Target: 9 species × 3 genders × 4 variants = 108 images\n');

// Create empty config for manual population
const emptyConfig = {};

Object.keys(SPECIES_ART_CONFIG).forEach(species => {
    emptyConfig[species] = {
        name: SPECIES_ART_CONFIG[species].name,
        genders: {
            male: [],
            female: [],
            other: []
        }
    };
});

// Add all other species
const allSpecies = {
    'elf': 'Elf',
    'dwarf': 'Dwarf',
    'halfling': 'Halfling',
    'dragonborn': 'Dragonborn',
    'gnome': 'Gnome',
    'half-elf': 'Half-Elf',
    'half-orc': 'Half-Orc',
    'tiefling': 'Tiefling'
};

Object.entries(allSpecies).forEach(([key, name]) => {
    emptyConfig[key] = {
        name: name,
        genders: {
            male: [],
            female: [],
            other: []
        }
    };
});

fs.writeFileSync(CONFIG_PATH, JSON.stringify(emptyConfig, null, 2));

console.log('✅ Empty configuration created.');
console.log('🎯 Follow the steps above to add proper D&D artwork!\n');
