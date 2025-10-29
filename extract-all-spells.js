const fs = require('fs');
const path = require('path');

// This script will help organize the extraction process
// Since we need to manually read PDFs through the tool, we'll track progress here

const spellsFolder = 'C:\\Users\\bryan\\git\\DnD-rogulike\\chapters\\spells';
const outputFile = 'C:\\Users\\bryan\\git\\DnD-rogulike\\extracted-spells.js';

// Storage for all extracted spells organized by level
const spells = {
    cantrip: [],
    level1: [],
    level2: [],
    level3: [],
    level4: [],
    level5: [],
    level6: [],
    level7: [],
    level8: [],
    level9: []
};

// Helper function to determine spell level key
function getSpellLevelKey(levelText) {
    if (levelText.includes('Cantrip')) return 'cantrip';
    if (levelText.includes('Level 1')) return 'level1';
    if (levelText.includes('Level 2')) return 'level2';
    if (levelText.includes('Level 3')) return 'level3';
    if (levelText.includes('Level 4')) return 'level4';
    if (levelText.includes('Level 5')) return 'level5';
    if (levelText.includes('Level 6')) return 'level6';
    if (levelText.includes('Level 7')) return 'level7';
    if (levelText.includes('Level 8')) return 'level8';
    if (levelText.includes('Level 9')) return 'level9';
    return null;
}

// We'll manually populate this after reading all PDFs
// Format: { name: 'Spell Name', school: 'School', classes: ['Class1', 'Class2'], desc: 'Description' }

console.log('Spell extraction helper script loaded');
console.log(`PDFs location: ${spellsFolder}`);
console.log(`Output file: ${outputFile}`);

// List all PDF files
const files = fs.readdirSync(spellsFolder).filter(f => f.endsWith('.pdf')).sort();
console.log(`Total PDF files found: ${files.length}`);
console.log(`Files range from: ${files[0]} to ${files[files.length - 1]}`);
