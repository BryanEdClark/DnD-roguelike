const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const spellsByLevel = {
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

const processedSpells = new Set();

async function extractTextFromPDF(pdfPath) {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    return '';
  }
}

function extractSpellsFromText(text) {
  const spells = [];
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    const cantripMatch = line.match(/^(.+?)\s+(Abjuration|Conjuration|Divination|Enchantment|Evocation|Illusion|Necromancy|Transmutation)\s+Cantrip\s+\((.+?)\)/i);
    const levelMatch = line.match(/^(.+?)\s+Level\s+(\d)\s+(Abjuration|Conjuration|Divination|Enchantment|Evocation|Illusion|Necromancy|Transmutation)\s+\((.+?)\)/i);
    
    if (cantripMatch) {
      const name = cantripMatch[1].trim();
      const school = cantripMatch[2].trim();
      const classesStr = cantripMatch[3].trim();
      const classes = classesStr.split(',').map(c => c.trim());
      
      let desc = '';
      for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
        const nextLine = lines[j].trim();
        if (nextLine && !nextLine.match(/^(Casting Time|Range|Components|Duration):/)) {
          desc += ' ' + nextLine;
        }
        if (desc.length > 150) break;
      }
      
      spells.push({ name, level: 'cantrip', school, classes, desc: desc.trim().substring(0, 200) || 'Cantrip spell' });
    } else if (levelMatch) {
      const name = levelMatch[1].trim();
      const levelNum = levelMatch[2];
      const school = levelMatch[3].trim();
      const classesStr = levelMatch[4].trim();
      const classes = classesStr.split(',').map(c => c.trim());
      
      let desc = '';
      for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
        const nextLine = lines[j].trim();
        if (nextLine && !nextLine.match(/^(Casting Time|Range|Components|Duration):/)) {
          desc += ' ' + nextLine;
        }
        if (desc.length > 150) break;
      }
      
      spells.push({ name, level: 'level' + levelNum, school, classes, desc: desc.trim().substring(0, 200) || 'Level ' + levelNum + ' spell' });
    }
  }
  
  return spells;
}

async function processAllPDFs() {
  const spellsDir = path.join(__dirname, 'chapters', 'spells');
  const files = fs.readdirSync(spellsDir).filter(f => f.endsWith('.pdf')).sort();

  console.log('Processing ' + files.length + ' PDF files...\n');

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(spellsDir, file);

    if (i % 10 === 0) {
      console.log('Progress: ' + (i + 1) + '/' + files.length + ' files...');
    }

    const text = await extractTextFromPDF(filePath);
    const spells = extractSpellsFromText(text);

    for (const spell of spells) {
      if (!processedSpells.has(spell.name)) {
        processedSpells.add(spell.name);
        spellsByLevel[spell.level].push({ name: spell.name, school: spell.school, classes: spell.classes, desc: spell.desc });
      }
    }
  }

  console.log('\n=== EXTRACTION COMPLETE ===\n');
  let total = 0;
  for (const level in spellsByLevel) {
    const count = spellsByLevel[level].length;
    console.log(level + ': ' + count + ' spells');
    total += count;
  }
  console.log('\nTotal spells extracted: ' + total);

  const output = '// PHB 2024 Spells - Complete List\n// Extracted from Player\'s Handbook 2024\n// Total: ' + total + ' spells\n\nconst phb2024Spells = ' + JSON.stringify(spellsByLevel, null, 2) + ';\n\nmodule.exports = phb2024Spells;\n';

  fs.writeFileSync(path.join(__dirname, 'phb-2024-all-spells.js'), output);
  console.log('\nSaved to phb-2024-all-spells.js');
  
  console.log('\n=== SAMPLE SPELLS ===');
  for (const level in spellsByLevel) {
    if (spellsByLevel[level].length > 0) {
      console.log('\n' + level + ' (showing first 3):');
      spellsByLevel[level].slice(0, 3).forEach(s => { console.log('  - ' + s.name + ' (' + s.school + ')'); });
    }
  }
}

processAllPDFs().catch(console.error);
