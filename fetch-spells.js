const https = require('https');
const fs = require('fs');

// Fetch spell list from D&D 5e API
function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function fetchAllSpells() {
    try {
        console.log('Fetching spell list...');
        const spellList = await fetchJSON('https://www.dnd5eapi.co/api/2014/spells');

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

        console.log(`Found ${spellList.count} spells. Fetching details...`);

        for (let i = 0; i < spellList.results.length; i++) {
            const spell = spellList.results[i];
            console.log(`Fetching ${i + 1}/${spellList.results.length}: ${spell.name}`);

            const details = await fetchJSON(`https://www.dnd5eapi.co/api/2014${spell.url.replace('/api/2014', '')}`);

            const levelKey = details.level === 0 ? 'cantrip' : `level${details.level}`;

            const spellObj = {
                name: details.name,
                school: details.school.name,
                classes: details.classes.map(c => c.name),
                desc: Array.isArray(details.desc) ? details.desc.join(' ') : details.desc
            };

            spellsByLevel[levelKey].push(spellObj);

            // Rate limit: wait 100ms between requests
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Generate JavaScript code
        let jsCode = '// D&D 2024 Spells Database\nconst spellsData = {\n';

        for (const [level, spells] of Object.entries(spellsByLevel)) {
            jsCode += `    ${level}: [\n`;
            for (const spell of spells) {
                jsCode += `        { name: '${spell.name.replace(/'/g, "\\'")}', school: '${spell.school}', classes: [${spell.classes.map(c => `'${c}'`).join(', ')}], desc: '${spell.desc.replace(/'/g, "\\'")}' },\n`;
            }
            jsCode += `    ],\n`;
        }

        jsCode += '};\n';

        // Save to file
        fs.writeFileSync('./public/spells-complete.js', jsCode);

        console.log('\n✅ Complete! Saved to public/spells-complete.js');
        console.log(`Total spells: ${spellList.count}`);
        Object.entries(spellsByLevel).forEach(([level, spells]) => {
            console.log(`  ${level}: ${spells.length} spells`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

fetchAllSpells();
