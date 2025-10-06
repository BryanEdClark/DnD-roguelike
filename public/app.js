let allMonsters = [];
let filteredMonsters = [];
let currentMonster = null;

// Load monsters database and populate UI
async function loadMonsters() {
    try {
        const response = await fetch('/api/monsters');
        const data = await response.json();

        // Flatten monsters by CR
        allMonsters = [];
        for (const cr in data.monsters_by_cr) {
            data.monsters_by_cr[cr].forEach(monster => {
                allMonsters.push({ ...monster, cr });
            });
        }

        // Sort alphabetically
        allMonsters.sort((a, b) => a.name.localeCompare(b.name));
        filteredMonsters = [...allMonsters];

        // Populate CR filter
        populateCRFilter(data.monsters_by_cr);

        // Display monster list
        displayMonsterList();
    } catch (error) {
        console.error('Error loading monsters:', error);
        document.getElementById('monsterListContainer').innerHTML =
            '<div class="error">Failed to load monsters database</div>';
    }
}

// Populate CR filter dropdown
function populateCRFilter(monstersByCR) {
    const crFilter = document.getElementById('crFilter');
    const crs = Object.keys(monstersByCR).sort((a, b) => {
        const crA = parseCR(a);
        const crB = parseCR(b);
        return crA - crB;
    });

    crs.forEach(cr => {
        const option = document.createElement('option');
        option.value = cr;
        option.textContent = `CR ${cr}`;
        crFilter.appendChild(option);
    });
}

// Parse CR string to number for sorting
function parseCR(cr) {
    if (cr.includes('/')) {
        const [num, denom] = cr.split('/');
        return parseInt(num) / parseInt(denom);
    }
    return parseInt(cr);
}

// Display monster list
function displayMonsterList() {
    const container = document.getElementById('monsterListContainer');

    if (filteredMonsters.length === 0) {
        container.innerHTML = '<div class="no-results">No monsters found</div>';
        return;
    }

    container.innerHTML = filteredMonsters.map(monster => `
        <div class="monster-item" onclick="loadMonster('${monster.name}')" data-name="${monster.name}">
            <div class="monster-name">${monster.name}</div>
            <div class="monster-cr">CR ${monster.cr} • ${monster.type}</div>
        </div>
    `).join('');
}

// Search and filter
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const crFilter = document.getElementById('crFilter').value;

    filteredMonsters = allMonsters.filter(monster => {
        const matchesSearch = monster.name.toLowerCase().includes(searchTerm) ||
                            monster.type.toLowerCase().includes(searchTerm);
        const matchesCR = !crFilter || monster.cr === crFilter;
        return matchesSearch && matchesCR;
    });

    displayMonsterList();
});

document.getElementById('crFilter').addEventListener('change', (e) => {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const crFilter = e.target.value;

    filteredMonsters = allMonsters.filter(monster => {
        const matchesSearch = monster.name.toLowerCase().includes(searchTerm) ||
                            monster.type.toLowerCase().includes(searchTerm);
        const matchesCR = !crFilter || monster.cr === crFilter;
        return matchesSearch && matchesCR;
    });

    displayMonsterList();
});

// Load monster details
async function loadMonster(name) {
    const detailDiv = document.getElementById('monsterDetail');

    // Scroll page to top
    window.scrollTo(0, 0);

    detailDiv.innerHTML = '<div class="loading">Loading monster data...</div>';

    // Highlight selected monster
    document.querySelectorAll('.monster-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.name === name) {
            item.classList.add('active');
        }
    });

    try {
        const response = await fetch(`/api/monster/${encodeURIComponent(name)}`);
        if (!response.ok) throw new Error('Monster not found');

        const monster = await response.json();
        currentMonster = monster;
        displayMonsterDetail(monster);
    } catch (error) {
        console.error('Error loading monster:', error);
        detailDiv.innerHTML = `<div class="error">Failed to load ${name}: ${error.message}</div>`;
    }
}

// Helper function to format modifier
function formatModifier(score) {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
}

// Display monster details (SRD format)
function displayMonsterDetail(monster) {
    const detailDiv = document.getElementById('monsterDetail');

    // Format armor class
    const acText = monster.armor_class?.map(ac => {
        if (ac.armor && ac.armor.length > 0) {
            const armorNames = ac.armor.map(a => a.name).join(', ');
            return `${ac.value} (${armorNames})`;
        }
        return ac.value;
    }).join(', ') || 'N/A';

    // Format speed
    const speedText = Object.entries(monster.speed || {})
        .map(([type, value]) => `${type} ${value}`)
        .join(', ');

    // Format senses
    const sensesText = Object.entries(monster.senses || {})
        .map(([type, value]) => `${type.replace('_', ' ')} ${value}`)
        .join(', ');

    // Ability scores
    const abilitiesHTML = `
        <div class="abilities">
            <div class="ability">
                <div class="ability-name">STR</div>
                <div class="ability-score">${monster.strength}</div>
                <div class="ability-modifier">(${formatModifier(monster.strength)})</div>
            </div>
            <div class="ability">
                <div class="ability-name">DEX</div>
                <div class="ability-score">${monster.dexterity}</div>
                <div class="ability-modifier">(${formatModifier(monster.dexterity)})</div>
            </div>
            <div class="ability">
                <div class="ability-name">CON</div>
                <div class="ability-score">${monster.constitution}</div>
                <div class="ability-modifier">(${formatModifier(monster.constitution)})</div>
            </div>
            <div class="ability">
                <div class="ability-name">INT</div>
                <div class="ability-score">${monster.intelligence}</div>
                <div class="ability-modifier">(${formatModifier(monster.intelligence)})</div>
            </div>
            <div class="ability">
                <div class="ability-name">WIS</div>
                <div class="ability-score">${monster.wisdom}</div>
                <div class="ability-modifier">(${formatModifier(monster.wisdom)})</div>
            </div>
            <div class="ability">
                <div class="ability-name">CHA</div>
                <div class="ability-score">${monster.charisma}</div>
                <div class="ability-modifier">(${formatModifier(monster.charisma)})</div>
            </div>
        </div>
    `;

    // Skills
    const skillsText = monster.proficiencies
        ?.filter(p => p.proficiency.name.startsWith('Skill:'))
        .map(p => `${p.proficiency.name.replace('Skill: ', '')} +${p.value}`)
        .join(', ') || '';

    // Saving throws
    const savesText = monster.proficiencies
        ?.filter(p => p.proficiency.name.startsWith('Saving Throw:'))
        .map(p => `${p.proficiency.name.replace('Saving Throw: ', '')} +${p.value}`)
        .join(', ') || '';

    const statsHTML = `
        <div class="stat-block">
            <div class="stat-line"><strong>Armor Class</strong> ${acText}</div>
            <div class="stat-line"><strong>Hit Points</strong> ${monster.hit_points} (${monster.hit_dice})</div>
            <div class="stat-line"><strong>Speed</strong> ${speedText}</div>
        </div>
    `;

    const additionalStatsHTML = `
        <div class="stat-block">
            ${savesText ? `<div class="stat-line"><strong>Saving Throws</strong> ${savesText}</div>` : ''}
            ${skillsText ? `<div class="stat-line"><strong>Skills</strong> ${skillsText}</div>` : ''}
            ${monster.damage_vulnerabilities?.length ? `<div class="stat-line"><strong>Damage Vulnerabilities</strong> ${monster.damage_vulnerabilities.join(', ')}</div>` : ''}
            ${monster.damage_resistances?.length ? `<div class="stat-line"><strong>Damage Resistances</strong> ${monster.damage_resistances.join(', ')}</div>` : ''}
            ${monster.damage_immunities?.length ? `<div class="stat-line"><strong>Damage Immunities</strong> ${monster.damage_immunities.join(', ')}</div>` : ''}
            ${monster.condition_immunities?.length ? `<div class="stat-line"><strong>Condition Immunities</strong> ${monster.condition_immunities.map(c => c.name).join(', ')}</div>` : ''}
            <div class="stat-line"><strong>Senses</strong> ${sensesText}</div>
            <div class="stat-line"><strong>Languages</strong> ${monster.languages || '—'}</div>
            <div class="stat-line"><strong>Challenge</strong> ${monster.challenge_rating} (${monster.xp.toLocaleString()} XP)</div>
        </div>
    `;

    const specialAbilitiesHTML = monster.special_abilities?.length ? `
        <div class="section">
            <h3 class="section-title">Special Abilities</h3>
            ${monster.special_abilities.map(ability => `
                <div class="ability-block">
                    <div class="ability-name-text"><strong>${ability.name}.</strong></div>
                    <div class="ability-desc">${ability.desc}</div>
                </div>
            `).join('')}
        </div>
    ` : '';

    const actionsHTML = monster.actions?.length ? `
        <div class="section">
            <h3 class="section-title">Actions</h3>
            ${monster.actions.map(action => `
                <div class="action-block">
                    <div class="action-name-text"><strong>${action.name}.</strong></div>
                    <div class="action-desc">${action.desc}</div>
                </div>
            `).join('')}
        </div>
    ` : '';

    const reactionsHTML = monster.reactions?.length ? `
        <div class="section">
            <h3 class="section-title">Reactions</h3>
            ${monster.reactions.map(reaction => `
                <div class="action-block">
                    <div class="action-name-text"><strong>${reaction.name}.</strong></div>
                    <div class="action-desc">${reaction.desc}</div>
                </div>
            `).join('')}
        </div>
    ` : '';

    const legendaryActionsHTML = monster.legendary_actions?.length ? `
        <div class="section">
            <h3 class="section-title">Legendary Actions</h3>
            ${monster.legendary_actions.map(action => `
                <div class="action-block">
                    <div class="action-name-text"><strong>${action.name}.</strong></div>
                    <div class="action-desc">${action.desc}</div>
                </div>
            `).join('')}
        </div>
    ` : '';

    const imageHTML = monster.imageUrl ? `
        <div class="monster-image-container">
            <img src="${monster.imageUrl}" alt="${monster.name}" class="monster-image" onerror="this.parentElement.style.display='none'">
        </div>
    ` : '';

    detailDiv.innerHTML = `
        <div class="monster-statblock">
            ${imageHTML}
            <div class="monster-header-srd">
                <h2 class="monster-title">${monster.name}</h2>
                <div class="monster-subtitle"><em>${monster.size} ${monster.type}${monster.subtype ? ` (${monster.subtype})` : ''}, ${monster.alignment}</em></div>
            </div>
            <button class="add-to-encounter-btn" onclick="addMonsterToBuilder('${monster.name.replace(/'/g, "\\'")}')">
                ➕ Add to Encounter Builder
            </button>
            <div class="red-line"></div>
            ${statsHTML}
            <div class="red-line"></div>
            ${abilitiesHTML}
            <div class="red-line"></div>
            ${additionalStatsHTML}
            ${specialAbilitiesHTML}
            ${actionsHTML}
            ${reactionsHTML}
            ${legendaryActionsHTML}
            <div class="srd-attribution">
                <small>Content from <a href="https://www.dnd5eapi.co" target="_blank">D&D 5e SRD API</a> under the Open Gaming License</small>
            </div>
        </div>
    `;
}

// Main tab switching (DM Tools / Player Tools / Dice Roller / Reference)
function switchTab(tab) {
    // Remove active class from all main tabs and content
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to selected tab
    if (tab === 'dmtools') {
        document.querySelectorAll('.tab-button')[0].classList.add('active');
        document.getElementById('dmtoolsTab').classList.add('active');
        // Default to encounter generator when switching to DM Tools
        switchSection('encounter');
    } else if (tab === 'playertools') {
        document.querySelectorAll('.tab-button')[1].classList.add('active');
        document.getElementById('playertoolsTab').classList.add('active');
    } else if (tab === 'diceroller') {
        document.querySelectorAll('.tab-button')[2].classList.add('active');
        document.getElementById('dicerollerTab').classList.add('active');
    } else if (tab === 'reference') {
        document.querySelectorAll('.tab-button')[3].classList.add('active');
        document.getElementById('referenceTab').classList.add('active');
        switchReferenceSection('quickref');
    }
}

// Section switching within DM Tools
function switchSection(section) {
    // Remove active class from all section tabs
    document.querySelectorAll('#dmtoolsTab .section-tab-button').forEach(btn => btn.classList.remove('active'));

    // Remove active class from encounter, browser, and campaigns tabs
    document.getElementById('encounterTab').classList.remove('active');
    document.getElementById('browserTab').classList.remove('active');
    if (document.getElementById('campaignsTab')) {
        document.getElementById('campaignsTab').classList.remove('active');
    }

    // Add active class to selected section
    if (section === 'encounter') {
        document.querySelectorAll('#dmtoolsTab .section-tab-button')[0].classList.add('active');
        document.getElementById('encounterTab').classList.add('active');
    } else if (section === 'browser') {
        document.querySelectorAll('#dmtoolsTab .section-tab-button')[1].classList.add('active');
        document.getElementById('browserTab').classList.add('active');
    } else if (section === 'campaigns') {
        document.querySelectorAll('#dmtoolsTab .section-tab-button')[2].classList.add('active');
        document.getElementById('campaignsTab').classList.add('active');
        loadCampaignsList();
    }
}

// Section switching within Reference
function switchReferenceSection(section) {
    // Remove active class from all reference section tabs
    document.querySelectorAll('#referenceTab .section-tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.reference-section').forEach(content => content.classList.remove('active'));

    // Add active class to selected section
    if (section === 'quickref') {
        document.querySelectorAll('#referenceTab .section-tab-button')[0].classList.add('active');
        document.getElementById('quickrefSection').classList.add('active');
    } else if (section === 'species') {
        document.querySelectorAll('#referenceTab .section-tab-button')[1].classList.add('active');
        document.getElementById('speciesSection').classList.add('active');
    } else if (section === 'classes') {
        document.querySelectorAll('#referenceTab .section-tab-button')[2].classList.add('active');
        document.getElementById('classesSection').classList.add('active');
    } else if (section === 'rules') {
        document.querySelectorAll('#referenceTab .section-tab-button')[3].classList.add('active');
        document.getElementById('rulesSection').classList.add('active');
    } else if (section === 'spells') {
        document.querySelectorAll('#referenceTab .section-tab-button')[4].classList.add('active');
        document.getElementById('spellsSection').classList.add('active');
        renderReferenceSpells();
    } else if (section === 'shop') {
        document.querySelectorAll('#referenceTab .section-tab-button')[5].classList.add('active');
        document.getElementById('shopSection').classList.add('active');
        renderShopItems();
    } else if (section === 'monsters') {
        document.querySelectorAll('#referenceTab .section-tab-button')[6].classList.add('active');
        document.getElementById('monstersSection').classList.add('active');
    }
}

// Species information data
const speciesInfo = {
    'human': {
        name: 'Human',
        size: 'Medium',
        speed: '30 ft',
        traits: [
            { name: 'Ability Score Increase', desc: '2024 PHB: Ability score increases come from your Background, not your species. Backgrounds grant either +2 to one ability and +1 to another, or +1 to three different abilities.' },
            { name: 'Age', desc: 'Humans reach adulthood in their late teens and live less than a century.' },
            { name: 'Alignment', desc: 'Humans tend toward no particular alignment.' },
            { name: 'Size', desc: 'Humans vary widely in height and build, from barely 5 feet to well over 6 feet tall. Your size is Medium.' },
            { name: 'Speed', desc: 'Your base walking speed is 30 feet.' },
            { name: 'Languages', desc: 'You can speak, read, and write Common and one extra language of your choice.' }
        ]
    },
    'elf': {
        name: 'Elf',
        size: 'Medium',
        speed: '30 ft',
        traits: [
            { name: 'Ability Score Increase', desc: '2024 PHB: Ability score increases come from your Background, not your species. Backgrounds grant either +2 to one ability and +1 to another, or +1 to three different abilities.' },
            { name: 'Size', desc: 'Elves range from under 5 to over 6 feet tall and have slender builds. Your size is Medium.' },
            { name: 'Speed', desc: 'Your base walking speed is 30 feet.' },
            { name: 'Darkvision', desc: 'You have Darkvision with a range of 60 feet.' },
            { name: 'Elven Lineage', desc: '2024 PHB: You are part of an elven lineage. Choose one of the following options: Drow, High Elf, or Wood Elf. Your choice grants you spells and other traits.' },
            { name: 'Fey Ancestry', desc: 'You have Advantage on saving throws you make to avoid or end the Charmed condition.' },
            { name: 'Keen Senses', desc: '2024 PHB: You have proficiency in the Insight, Perception, or Survival skill (your choice).' },
            { name: 'Trance', desc: 'You don\'t need to sleep, and magic can\'t put you to sleep. You can finish a Long Rest in 4 hours if you spend those hours in a trancelike meditation, during which you remain conscious.' },
            { name: 'Languages', desc: 'You can speak, read, and write Common and Elvish.' }
        ],
        subspecies: [
            { name: 'Drow (Dark Elf)', desc: '2024 PHB: Darkvision 120 feet. You know the Dancing Lights cantrip. At 3rd level, you can cast Faerie Fire. At 5th level, you can cast Darkness. You can cast each spell with this trait once without a spell slot and regain the ability when you finish a Long Rest. You can also cast these spells using any spell slots you have. Intelligence, Wisdom, or Charisma is your spellcasting ability for these spells (choose when you select this lineage).' },
            { name: 'High Elf', desc: '2024 PHB: You know the Prestidigitation cantrip. Whenever you finish a Long Rest, you can replace Prestidigitation with a different Wizard cantrip. At 3rd level, you can cast Detect Magic. At 5th level, you can cast Misty Step. You can cast each spell with this trait once without a spell slot and regain the ability when you finish a Long Rest. You can also cast these spells using any spell slots you have. Intelligence, Wisdom, or Charisma is your spellcasting ability for these spells (choose when you select this lineage).' },
            { name: 'Wood Elf', desc: '2024 PHB: Your Speed increases to 35 feet. You know the Druidcraft cantrip. At 3rd level, you can cast Longstrider. At 5th level, you can cast Pass Without Trace. You can cast each spell with this trait once without a spell slot and regain the ability when you finish a Long Rest. You can also cast these spells using any spell slots you have. Intelligence, Wisdom, or Charisma is your spellcasting ability for these spells (choose when you select this lineage).' }
        ]
    },
    'dwarf': {
        name: 'Dwarf',
        size: 'Medium',
        speed: '30 ft',
        traits: [
            { name: 'Ability Score Increase', desc: '2024 PHB: Ability score increases come from your Background, not your species. Backgrounds grant either +2 to one ability and +1 to another, or +1 to three different abilities.' },
            { name: 'Size', desc: 'Dwarves stand between 4 and 5 feet tall. Your size is Medium.' },
            { name: 'Speed', desc: '2024 PHB: Your base walking speed is 30 feet. Your speed is not reduced by wearing heavy armor.' },
            { name: 'Darkvision', desc: '2024 PHB: You have Darkvision with a range of 120 feet.' },
            { name: 'Dwarven Resilience', desc: 'You have Resistance to Poison damage. You also have Advantage on saving throws you make to avoid or end the Poisoned condition.' },
            { name: 'Dwarven Toughness', desc: '2024 PHB: Your Hit Point maximum increases by 1, and it increases by 1 again whenever you gain a level.' },
            { name: 'Stonecunning', desc: '2024 PHB: As a Bonus Action, you gain Tremorsense with a range of 60 feet for 10 minutes. You must be on a stone surface or touching a stone surface to use this Tremorsense. The stone can be natural or worked. You can use this Bonus Action a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest.' },
            { name: 'Languages', desc: 'You can speak, read, and write Common and Dwarvish.' }
        ],
        subspecies: [
            { name: 'Hill Dwarf', desc: '2024 PHB: Dwarven Toughness is a base trait for all Dwarves. Hill Dwarves gain proficiency in one of the following skills: Animal Handling, Medicine, Nature, or Survival.' },
            { name: 'Mountain Dwarf', desc: '2024 PHB: Proficiency with light and medium armor. You have proficiency with battleaxe, handaxe, light hammer, and warhammer.' },
            { name: 'Duergar (Gray Dwarf)', desc: '2024 PHB: Duergar Magic - You know the Mage Hand cantrip. Starting at 3rd level, you can cast Enlarge/Reduce on yourself once per Long Rest. Starting at 5th level, you can cast Invisibility on yourself once per Long Rest. Intelligence, Wisdom, or Charisma is your spellcasting ability for these spells (choose when you select this lineage).' }
        ]
    },
    'halfling': {
        name: 'Halfling',
        size: 'Small',
        speed: '30 ft',
        traits: [
            { name: 'Ability Score Increase', desc: '2024 PHB: Ability score increases come from your Background, not your species. Backgrounds grant either +2 to one ability and +1 to another, or +1 to three different abilities.' },
            { name: 'Size', desc: 'Halflings average about 3 feet tall. Your size is Small.' },
            { name: 'Speed', desc: '2024 PHB: Your base walking speed is 30 feet.' },
            { name: 'Brave', desc: 'You have Advantage on saving throws you make to avoid or end the Frightened condition.' },
            { name: 'Halfling Nimbleness', desc: 'You can move through the space of any creature that is a size larger than you, but you can\'t stop in the same space.' },
            { name: 'Luck', desc: '2024 PHB: When you roll a 1 on the d20 of a D20 Test, you can reroll the die, and you must use the new roll.' },
            { name: 'Naturally Stealthy', desc: 'You can take the Hide action even when you are obscured only by a creature that is at least one size larger than you.' },
            { name: 'Languages', desc: 'You can speak, read, and write Common and Halfling.' }
        ],
        subspecies: [
            { name: 'Lightfoot', desc: '2024 PHB: Naturally Stealthy is a base trait for all Halflings. Lightfoot Halflings gain no additional unique traits beyond the base Halfling traits.' },
            { name: 'Stout', desc: '2024 PHB: Stout Resilience - You have Resistance to Poison damage. You also have Advantage on saving throws you make to avoid or end the Poisoned condition.' }
        ]
    },
    'dragonborn': {
        name: 'Dragonborn',
        size: 'Medium',
        speed: '30 ft',
        traits: [
            { name: 'Ability Score Increase', desc: '2024 PHB: Ability score increases come from your Background, not your species. Backgrounds grant either +2 to one ability and +1 to another, or +1 to three different abilities.' },
            { name: 'Size', desc: 'Dragonborn are taller and heavier than humans, standing over 6 feet tall. Your size is Medium.' },
            { name: 'Speed', desc: 'Your base walking speed is 30 feet.' },
            { name: 'Draconic Ancestry', desc: '2024 PHB: You are the descendant of a dragon. Choose one kind of dragon from the Draconic Ancestry table. Your choice affects your Breath Weapon and Damage Resistance traits, as well as your appearance.' },
            { name: 'Breath Weapon', desc: '2024 PHB: When you take the Attack action on your turn, you can replace one of your attacks with an exhalation of magical energy in either a 15-foot Cone or a 30-foot Line that is 5 feet wide (your choice each time). Each creature in that area must make a Dexterity saving throw (DC = 8 + your Constitution modifier + your Proficiency Bonus). On a failed save, a creature takes 1d10 damage of the type determined by your Draconic Ancestry. On a successful save, a creature takes half as much damage. This damage increases by 1d10 when you reach character levels 5 (2d10), 11 (3d10), and 17 (4d10). You can use this Breath Weapon a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest.' },
            { name: 'Damage Resistance', desc: 'You have Resistance to the damage type determined by your Draconic Ancestry.' },
            { name: 'Draconic Flight', desc: '2024 PHB: When you reach character level 5, you can channel draconic magic to give yourself temporary flight. As a Bonus Action, you sprout spectral wings that last for 10 minutes or until you retract the wings (no action required) or have the Incapacitated condition. During that time, you have a Fly Speed equal to your Speed. Your wings appear to be made of the same energy as your Breath Weapon. Once you use this trait, you can\'t use it again until you finish a Long Rest.' },
            { name: 'Languages', desc: 'You can speak, read, and write Common and Draconic.' }
        ],
        subspecies: [
            { name: 'Black Dragon', desc: '2024 PHB: Acid damage. Can choose 15 ft Cone or 30 ft Line for Breath Weapon.' },
            { name: 'Blue Dragon', desc: '2024 PHB: Lightning damage. Can choose 15 ft Cone or 30 ft Line for Breath Weapon.' },
            { name: 'Brass Dragon', desc: '2024 PHB: Fire damage. Can choose 15 ft Cone or 30 ft Line for Breath Weapon.' },
            { name: 'Bronze Dragon', desc: '2024 PHB: Lightning damage. Can choose 15 ft Cone or 30 ft Line for Breath Weapon.' },
            { name: 'Copper Dragon', desc: '2024 PHB: Acid damage. Can choose 15 ft Cone or 30 ft Line for Breath Weapon.' },
            { name: 'Gold Dragon', desc: '2024 PHB: Fire damage. Can choose 15 ft Cone or 30 ft Line for Breath Weapon.' },
            { name: 'Green Dragon', desc: '2024 PHB: Poison damage. Can choose 15 ft Cone or 30 ft Line for Breath Weapon.' },
            { name: 'Red Dragon', desc: '2024 PHB: Fire damage. Can choose 15 ft Cone or 30 ft Line for Breath Weapon.' },
            { name: 'Silver Dragon', desc: '2024 PHB: Cold damage. Can choose 15 ft Cone or 30 ft Line for Breath Weapon.' },
            { name: 'White Dragon', desc: '2024 PHB: Cold damage. Can choose 15 ft Cone or 30 ft Line for Breath Weapon.' }
        ]
    },
    'gnome': {
        name: 'Gnome',
        size: 'Small',
        speed: '30 ft',
        traits: [
            { name: 'Ability Score Increase', desc: '2024 PHB: Ability score increases come from your Background, not your species. Backgrounds grant either +2 to one ability and +1 to another, or +1 to three different abilities.' },
            { name: 'Size', desc: 'Gnomes are between 3 and 4 feet tall. Your size is Small.' },
            { name: 'Speed', desc: '2024 PHB: Your base walking speed is 30 feet.' },
            { name: 'Darkvision', desc: 'You have Darkvision with a range of 60 feet.' },
            { name: 'Gnomish Cunning', desc: 'You have Advantage on Intelligence, Wisdom, and Charisma saving throws.' },
            { name: 'Languages', desc: 'You can speak, read, and write Common and Gnomish.' }
        ],
        subspecies: [
            { name: 'Forest Gnome', desc: '2024 PHB: You know the Minor Illusion and Speak with Animals spells. Intelligence is your spellcasting ability for these spells.' },
            { name: 'Rock Gnome', desc: '2024 PHB: You know the Mending and Prestidigitation cantrips. Intelligence is your spellcasting ability for these spells. Artificer\'s Lore: You have proficiency with Artisan\'s Tools (any). Whenever you make an Intelligence (History) check about the origin of any manufactured item, add twice your Proficiency Bonus instead of any Proficiency Bonus you normally apply.' },
            { name: 'Deep Gnome (Svirfneblin)', desc: '2024 PHB: You have Darkvision with a range of 120 feet (instead of 60 feet). You know the Disguise Self and Nondetection spells. You can cast each spell with this trait once without a spell slot, and you regain the ability to do so when you finish a Long Rest. You can also cast these spells using any spell slots you have. Intelligence, Wisdom, or Charisma is your spellcasting ability for these spells (choose when you select this lineage).' }
        ]
    },
    'goliath': {
        name: 'Goliath',
        size: 'Medium',
        speed: '35 ft',
        traits: [
            { name: 'Ability Score Increase', desc: '2024 PHB: Ability score increases come from your Background, not your species. Backgrounds grant either +2 to one ability and +1 to another, or +1 to three different abilities.' },
            { name: 'Size', desc: 'Goliaths are between 7 and 8 feet tall and weigh between 280 and 340 pounds. Your size is Medium.' },
            { name: 'Speed', desc: 'Your base walking speed is 35 feet.' },
            { name: 'Giant Ancestry', desc: '2024 PHB: You are descended from Giants. Choose one of the following benefits (usable Proficiency Bonus times per Long Rest): Cloud\'s Jaunt (teleport 30 ft as bonus action), Fire\'s Burn (+1d10 fire damage when you hit), Frost\'s Chill (+1d6 cold damage and -10 ft speed when you hit), Hill\'s Tumble (knock Large or smaller prone when you hit), Stone\'s Fortitude (1d12 + CON modifier to reduce damage as reaction), or Storm\'s Thunder (+1d8 thunder damage when you hit).' },
            { name: 'Large Form', desc: '2024 PHB: Starting at level 5, you can become Large as a bonus action for 10 minutes (if space allows). While Large, you have Advantage on Strength checks and your Speed increases by 10 feet. Once per Long Rest.' },
            { name: 'Powerful Build', desc: '2024 PHB: You have Advantage on any ability check to end the Grappled condition on yourself. You count as one size larger when determining your carrying capacity and the weight you can push, drag, or lift.' },
            { name: 'Languages', desc: 'You can speak, read, and write Common and Giant.' }
        ],
        subspecies: [
            { name: 'Cloud Giant Ancestry', desc: '2024 PHB: Cloud\'s Jaunt - As a Bonus Action, you magically teleport up to 30 feet to an unoccupied space you can see. Usable Proficiency Bonus times per Long Rest.' },
            { name: 'Fire Giant Ancestry', desc: '2024 PHB: Fire\'s Burn - When you hit a target with an attack roll and deal damage, you can deal an extra 1d10 Fire damage to that target. Usable Proficiency Bonus times per Long Rest.' },
            { name: 'Frost Giant Ancestry', desc: '2024 PHB: Frost\'s Chill - When you hit a target with an attack roll and deal damage, you can deal an extra 1d6 Cold damage and reduce its Speed by 10 feet until the start of your next turn. Usable Proficiency Bonus times per Long Rest.' },
            { name: 'Hill Giant Ancestry', desc: '2024 PHB: Hill\'s Tumble - When you hit a Large or smaller creature with an attack roll and deal damage, you can give that target the Prone condition. Usable Proficiency Bonus times per Long Rest.' },
            { name: 'Stone Giant Ancestry', desc: '2024 PHB: Stone\'s Fortitude - When you take damage, you can use your Reaction to roll 1d12, add your Constitution modifier, and reduce the damage by that total. Usable Proficiency Bonus times per Long Rest.' },
            { name: 'Storm Giant Ancestry', desc: '2024 PHB: Storm\'s Thunder - When you hit a target with an attack roll and deal damage, you can deal an extra 1d8 Thunder damage to that target. Usable Proficiency Bonus times per Long Rest.' }
        ]
    },
    'orc': {
        name: 'Orc',
        size: 'Medium',
        speed: '30 ft',
        traits: [
            { name: 'Ability Score Increase', desc: '2024 PHB: Ability score increases come from your Background, not your species. Backgrounds grant either +2 to one ability and +1 to another, or +1 to three different abilities.' },
            { name: 'Size', desc: 'Orcs are usually over 6 feet tall and weigh between 230 and 280 pounds. Your size is Medium.' },
            { name: 'Speed', desc: 'Your base walking speed is 30 feet.' },
            { name: 'Darkvision', desc: '2024 PHB: You have Darkvision with a range of 120 feet.' },
            { name: 'Adrenaline Rush', desc: '2024 PHB: You can take the Dash action as a Bonus Action. When you do so, you gain a number of Temporary Hit Points equal to your Proficiency Bonus. You can use this trait a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Short or Long Rest.' },
            { name: 'Relentless Endurance', desc: '2024 PHB: When you are reduced to 0 Hit Points but not killed outright, you can drop to 1 Hit Point instead. Once you use this trait, you can\'t do so again until you finish a Long Rest.' },
            { name: 'Languages', desc: 'You can speak, read, and write Common and Orc.' }
        ]
    },
    'tiefling': {
        name: 'Tiefling',
        size: 'Medium',
        speed: '30 ft',
        traits: [
            { name: 'Ability Score Increase', desc: '2024 PHB: Ability score increases come from your Background, not your species. Backgrounds grant either +2 to one ability and +1 to another, or +1 to three different abilities.' },
            { name: 'Size', desc: 'Tieflings are about the same size and build as humans. Your size is Medium.' },
            { name: 'Speed', desc: 'Your base walking speed is 30 feet.' },
            { name: 'Darkvision', desc: 'You have Darkvision with a range of 60 feet.' },
            { name: 'Fiendish Legacy', desc: '2024 PHB: You are the recipient of a fiendish legacy. Choose one of the following options: Abyssal, Chthonic, or Infernal. Your choice grants you resistance to a damage type, a cantrip, and spells at higher levels.' },
            { name: 'Otherworldly Presence', desc: 'You know the Thaumaturgy cantrip. When you cast it with this trait, the spell uses the same spellcasting ability you use for your Fiendish Legacy spells.' },
            { name: 'Languages', desc: 'You can speak, read, and write Common and one other language of your choice.' }
        ],
        subspecies: [
            { name: 'Abyssal Tiefling', desc: '2024 PHB: You have Resistance to Poison damage. You know the Poison Spray cantrip. At 3rd level, you can cast Ray of Sickness. At 5th level, you can cast Hold Person. You can cast each spell with this trait once without a spell slot and regain the ability when you finish a Long Rest. You can also cast these spells using any spell slots you have. Intelligence, Wisdom, or Charisma is your spellcasting ability for these spells (choose when you select this lineage).' },
            { name: 'Chthonic Tiefling', desc: '2024 PHB: You have Resistance to Necrotic damage. You know the Chill Touch cantrip. At 3rd level, you can cast False Life. At 5th level, you can cast Ray of Enfeeblement. You can cast each spell with this trait once without a spell slot and regain the ability when you finish a Long Rest. You can also cast these spells using any spell slots you have. Intelligence, Wisdom, or Charisma is your spellcasting ability for these spells (choose when you select this lineage).' },
            { name: 'Infernal Tiefling', desc: '2024 PHB: You have Resistance to Fire damage. You know the Fire Bolt cantrip. At 3rd level, you can cast Hellish Rebuke. At 5th level, you can cast Darkness. You can cast each spell with this trait once without a spell slot and regain the ability when you finish a Long Rest. You can also cast these spells using any spell slots you have. Intelligence, Wisdom, or Charisma is your spellcasting ability for these spells (choose when you select this lineage).' }
        ]
    }
};

// Display species information
function displaySpeciesInfo() {
    const select = document.getElementById('speciesInfoSelect');
    const display = document.getElementById('speciesInfoDisplay');
    const species = select.value;

    if (!species || !speciesInfo[species]) {
        display.innerHTML = '<p class="no-selection">Select a species to view its information</p>';
        return;
    }

    const info = speciesInfo[species];
    let html = `
        <div class="reference-card">
            <h3>${info.name}</h3>
            <div class="reference-detail">
                <strong>Size:</strong> ${info.size}
            </div>
            <div class="reference-detail">
                <strong>Speed:</strong> ${info.speed}
            </div>
        </div>

        <div class="reference-card">
            <h3>Traits</h3>
    `;

    info.traits.forEach(trait => {
        html += `
            <div class="reference-detail">
                <strong>${trait.name}:</strong> ${trait.desc}
            </div>
        `;
    });

    html += '</div>';

    if (info.subspecies && info.subspecies.length > 0) {
        html += `
            <div class="reference-card">
                <h3>Subspecies</h3>
        `;
        info.subspecies.forEach(sub => {
            html += `
                <div class="reference-detail">
                    <strong>${sub.name}:</strong> ${sub.desc}
                </div>
            `;
        });
        html += '</div>';
    }

    display.innerHTML = html;
}

// Class information data
const classInfo = {
    'barbarian': {
        name: 'Barbarian',
        hitDie: 'd12',
        primaryAbility: 'Strength',
        saves: 'Strength, Constitution',
        armor: 'Light armor, medium armor, shields',
        weapons: 'Simple weapons, martial weapons',
        skills: 'Choose 2 from Animal Handling, Athletics, Intimidation, Nature, Perception, Survival',
        description: 'A fierce warrior of primitive background who can enter a battle rage',
        features: [
            { level: 1, name: 'Rage', desc: 'In battle, you fight with primal ferocity. On your turn, you can enter a rage as a bonus action. Gain advantage on STR checks/saves, +2 melee damage with STR weapons, and resistance to physical damage. Lasts 1 minute.' },
            { level: 1, name: 'Unarmored Defense', desc: 'While not wearing armor, your AC equals 10 + DEX modifier + CON modifier + shield.' },
            { level: 1, name: 'Weapon Mastery', desc: '2024 PHB: You gain mastery with 2 weapons of your choice. When you attack with a weapon you have mastery with, you can use that weapon\'s special mastery property. You gain mastery with additional weapons at higher levels (3 at 4th level, 4 at 10th level).' },
            { level: 2, name: 'Reckless Attack', desc: 'You can throw aside all concern for defense. When you make your first attack on your turn, you can choose to attack recklessly, giving you advantage on melee weapon attacks using STR during this turn, but attack rolls against you have advantage until your next turn.' },
            { level: 2, name: 'Danger Sense', desc: 'You gain advantage on DEX saving throws against effects you can see, such as traps and spells. You can\'t be blinded, deafened, or incapacitated.' },
            { level: 3, name: 'Primal Path', desc: 'Choose a path that shapes your rage: Berserker, Totem Warrior, or other.' },
            { level: 5, name: 'Extra Attack', desc: 'You can attack twice when you take the Attack action.' },
            { level: 5, name: 'Fast Movement', desc: 'Your speed increases by 10 feet while not wearing heavy armor.' },
            { level: 7, name: 'Feral Instinct', desc: 'Advantage on initiative rolls. If surprised and not incapacitated, you can act normally on your first turn if you rage.' },
            { level: 9, name: 'Brutal Critical', desc: 'You can roll one additional weapon damage die when determining extra damage for a critical hit with a melee attack.' },
            { level: 11, name: 'Relentless Rage', desc: 'If you drop to 0 HP while raging and don\'t die outright, make a DC 10 CON save. On success, drop to 1 HP instead. DC increases by 5 for each subsequent use.' },
            { level: 15, name: 'Persistent Rage', desc: 'Your rage only ends early if you fall unconscious or choose to end it.' },
            { level: 18, name: 'Indomitable Might', desc: 'If your STR check total is less than your STR score, you can use your STR score instead.' },
            { level: 20, name: 'Primal Champion', desc: 'Your STR and CON scores increase by 4. Maximum for those scores is now 24.' }
        ],
        subclasses: [
            { name: 'Path of the Berserker', desc: 'Channels rage into violence. Frenzy lets you make an additional attack as a bonus action while raging, but causes exhaustion. Mindless Rage makes you immune to charm and fear while raging. Intimidating Presence lets you frighten enemies. Retaliation lets you make an opportunity attack when damaged by a creature within 5 feet.' },
            { name: 'Path of the Totem Warrior', desc: 'Draws on animal spirits. Choose Bear (resistance to all damage except psychic while raging), Eagle (enemies have disadvantage on opportunity attacks, can Dash as bonus action), or Wolf (allies have advantage on attacks against enemies within 5 feet of you). Gain additional totemic features at levels 6, 10, and 14.' },
            { name: 'Path of the Ancestral Guardian', desc: 'Consults with spirits of honored ancestors. Ancestral Protectors gives first creature you hit disadvantage on attacks against others. Spirit Shield reduces damage to nearby allies. Consult the Spirits lets you cast clairvoyance or augury as a ritual. Vengeful Ancestors punishes creatures that attack your allies.' },
            { name: 'Path of the Storm Herald', desc: 'Rage surrounds you with supernatural fury. Choose Desert (fire damage aura), Sea (lightning damage to one creature, resistance to lightning), or Tundra (temp HP to allies). Aura grows stronger at higher levels.' },
            { name: 'Path of the Zealot', desc: 'Fueled by divine fury. Deal extra radiant or necrotic damage on first hit each turn while raging. Free resurrection at 14th level. At 14th, rage beyond death - don\'t fall unconscious until rage ends even at 0 HP.' }
        ]
    },
    'bard': {
        name: 'Bard',
        hitDie: 'd8',
        primaryAbility: 'Charisma',
        saves: 'Dexterity, Charisma',
        armor: 'Light armor',
        weapons: 'Simple weapons, hand crossbows, longswords, rapiers, shortswords',
        skills: 'Choose any 3',
        description: 'An inspiring magician whose power echoes the music of creation',
        features: [
            { level: 1, name: 'Spellcasting', desc: 'You can cast bard spells using CHA as your spellcasting ability. You know a number of spells and can cast them using spell slots. You can use a musical instrument as a spellcasting focus.' },
            { level: 1, name: 'Bardic Inspiration (d6)', desc: 'You can inspire others through words or music. As a bonus action, give one creature within 60 feet an Inspiration die (d6). Within 10 minutes, they can add it to one ability check, attack roll, or saving throw. You can use this feature a number of times equal to your CHA modifier (minimum 1), regaining uses on a long rest.' },
            { level: 2, name: 'Jack of All Trades', desc: 'You can add half your proficiency bonus (rounded down) to any ability check you make that doesn\'t already include your proficiency bonus.' },
            { level: 2, name: 'Song of Rest', desc: 'During a short rest, you or any friendly creatures who hear your performance regain extra hit points equal to d6 + your bard level.' },
            { level: 3, name: 'Bard College', desc: 'Choose a college that shapes your bardic arts: Lore, Valor, or other.' },
            { level: 3, name: 'Expertise', desc: 'Choose two skill proficiencies. Your proficiency bonus is doubled for any ability check using those skills. At 10th level, choose two more.' },
            { level: 5, name: 'Bardic Inspiration (d8)', desc: 'Your Bardic Inspiration die becomes a d8.' },
            { level: 5, name: 'Font of Inspiration', desc: 'You regain all expended uses of Bardic Inspiration when you finish a short or long rest.' },
            { level: 6, name: 'Countercharm', desc: 'As an action, you can perform until the end of your next turn. Friendly creatures within 30 feet have advantage on saving throws against being frightened or charmed.' },
            { level: 10, name: 'Bardic Inspiration (d10)', desc: 'Your Bardic Inspiration die becomes a d10.' },
            { level: 10, name: 'Magical Secrets', desc: 'Choose two spells from any class. They count as bard spells for you. You learn two more at 14th and 18th level.' },
            { level: 14, name: 'Magical Secrets (2)', desc: 'Choose two more spells from any class.' },
            { level: 15, name: 'Bardic Inspiration (d12)', desc: 'Your Bardic Inspiration die becomes a d12.' },
            { level: 18, name: 'Magical Secrets (3)', desc: 'Choose two more spells from any class.' },
            { level: 20, name: 'Superior Inspiration', desc: 'When you roll initiative and have no uses of Bardic Inspiration left, you regain one use.' }
        ],
        subclasses: [
            { name: 'College of Lore', desc: 'Masters of knowledge and secrets. Gain Cutting Words to subtract Bardic Inspiration from enemy rolls. Learn 3 extra skills at 3rd level. Additional Magical Secrets at 6th level (4 levels early). Peerless Skill at 14th lets you add Bardic Inspiration to your own ability checks.' },
            { name: 'College of Valor', desc: 'Daring skalds who inspire battlefield prowess. Gain medium armor, shields, and martial weapon proficiency. Combat Inspiration lets allies add your Bardic Inspiration to damage or AC. Extra Attack at 6th level. Battle Magic at 14th lets you make a weapon attack as a bonus action after casting a spell.' },
            { name: 'College of Glamour', desc: 'Wield the beguiling magic of the Feywild. Mantle of Inspiration grants temp HP and movement to allies. Enthralling Performance can charm humanoids. Mantle of Majesty lets you cast command as a bonus action. Unbreakable Majesty causes attackers to make CHA saves or target someone else.' },
            { name: 'College of Swords', desc: 'Entertaining warriors who use weapon prowess and magic. Gain Fighting Style and use weapons as spellcasting focus. Blade Flourish adds Bardic Inspiration to damage and provides defensive, offensive, or mobile options. Extra Attack at 6th. Master\'s Flourish at 14th lets you add d6 to Blade Flourish damage.' },
            { name: 'College of Whispers', desc: 'Masters of fear and secrets. Psychic Blades adds Bardic Inspiration as psychic damage. Words of Terror frightens creatures. Mantle of Whispers lets you capture a dying creature\'s shadow to assume their persona. Shadow Lore at 14th magically charms and frightens creatures.' }
        ]
    },
    'cleric': {
        name: 'Cleric',
        hitDie: 'd8',
        primaryAbility: 'Wisdom',
        saves: 'Wisdom, Charisma',
        armor: 'Light armor, medium armor, shields',
        weapons: 'Simple weapons',
        skills: 'Choose 2 from History, Insight, Medicine, Persuasion, Religion',
        description: 'A priestly champion who wields divine magic in service of a higher power',
        features: [
            { level: 1, name: 'Spellcasting', desc: 'You can cast cleric spells using WIS as your spellcasting ability. You prepare spells from the cleric spell list each day. You can use a holy symbol as a spellcasting focus.' },
            { level: 1, name: 'Divine Domain', desc: 'Choose a domain related to your deity: Knowledge, Life, Light, Nature, Tempest, Trickery, War, or others. Your domain grants spells and features at 1st, 2nd, 6th, 8th, and 17th level.' },
            { level: 2, name: 'Channel Divinity (1/rest)', desc: 'You can channel divine energy directly from your deity. You can Turn Undead (frightens undead within 30 feet) or use your domain\'s Channel Divinity option. Regain uses after a short or long rest.' },
            { level: 5, name: 'Destroy Undead (CR 1/2)', desc: 'When an undead fails its save against your Turn Undead, it is instantly destroyed if its CR is 1/2 or lower. CR threshold increases at higher levels.' },
            { level: 6, name: 'Channel Divinity (2/rest)', desc: 'You can use Channel Divinity twice between rests.' },
            { level: 8, name: 'Destroy Undead (CR 1)', desc: 'Your Destroy Undead feature can destroy undead of CR 1 or lower.' },
            { level: 10, name: 'Divine Intervention', desc: 'You can call on your deity for aid. Roll percentile dice; if you roll equal to or less than your cleric level, your deity intervenes. On success, you can\'t use this again for 7 days; on failure, you can try again after a long rest.' },
            { level: 11, name: 'Destroy Undead (CR 2)', desc: 'Your Destroy Undead feature can destroy undead of CR 2 or lower.' },
            { level: 14, name: 'Destroy Undead (CR 3)', desc: 'Your Destroy Undead feature can destroy undead of CR 3 or lower.' },
            { level: 17, name: 'Destroy Undead (CR 4)', desc: 'Your Destroy Undead feature can destroy undead of CR 4 or lower.' },
            { level: 18, name: 'Channel Divinity (3/rest)', desc: 'You can use Channel Divinity three times between rests.' },
            { level: 20, name: 'Divine Intervention Improvement', desc: 'Your Divine Intervention automatically succeeds with no roll required.' }
        ],
        subclasses: [
            { name: 'Knowledge Domain', desc: 'Deities of knowledge value learning and understanding. Gain expertise in two skills and learn two languages. Channel Divinity: Knowledge of the Ages grants proficiency in any skill or tool for 10 minutes. Read Thoughts at 6th lets you read surface thoughts. At 17th, Visions of the Past reveals information about locations or objects.' },
            { name: 'Life Domain', desc: 'Focused on healing and vitality. Heavy armor proficiency. Disciple of Life adds 2+spell level to healing spells. Channel Divinity: Preserve Life heals up to 5×cleric level HP distributed among creatures. Blessed Healer at 6th heals you when you heal others. Supreme Healing at 17th maximizes healing spell dice.' },
            { name: 'Light Domain', desc: 'Gods of light promote ideals of rebirth and renewal. Gain light and fireball spells. Warding Flare imposes disadvantage on attacks against you. Channel Divinity: Radiance of the Dawn deals radiant damage to nearby creatures. Improved Flare at 6th protects allies. Corona of Light at 17th grants constant bright light and disadvantage on saves against your fire/radiant spells.' },
            { name: 'Tempest Domain', desc: 'Gods of storms and thunder. Heavy armor and martial weapon proficiency. Wrath of the Storm deals lightning/thunder damage to attackers. Channel Divinity: Destructive Wrath maximizes lightning/thunder damage. Thunderbolt Strike at 6th pushes creatures hit by lightning/thunder. Stormborn at 17th grants flying speed while outdoors.' },
            { name: 'War Domain', desc: 'Gods of war and combat. Heavy armor and martial weapon proficiency. War Priest lets you make extra weapon attacks as a bonus action. Channel Divinity: Guided Strike adds +10 to an attack roll. War God\'s Blessing at 6th grants allies +10 to attack rolls. Avatar of Battle at 17th grants resistance to nonmagical weapon damage.' }
        ]
    },
    'druid': {
        name: 'Druid',
        hitDie: 'd8',
        primaryAbility: 'Wisdom',
        saves: 'Intelligence, Wisdom',
        armor: 'Light armor, medium armor, shields (druids will not wear metal)',
        weapons: 'Clubs, daggers, darts, javelins, maces, quarterstaffs, scimitars, sickles, slings, spears',
        skills: 'Choose 2 from Arcana, Animal Handling, Insight, Medicine, Nature, Perception, Religion, Survival',
        description: 'A priest of the Old Faith, wielding the powers of nature and adopting animal forms',
        features: [
            { level: 1, name: 'Druidic', desc: 'You know Druidic, the secret language of druids. You can speak and leave hidden messages in it. Creatures that know Druidic automatically spot such messages. Others must succeed on a DC 15 WIS (Perception) check to notice but can\'t decode without magic.' },
            { level: 1, name: 'Spellcasting', desc: 'You can cast druid spells using WIS as your spellcasting ability. You prepare spells from the druid spell list each day. You can use a druidic focus as a spellcasting focus.' },
            { level: 2, name: 'Wild Shape', desc: 'As an action, you can magically assume the shape of a beast you\'ve seen. You can use this twice, regaining uses after a short or long rest. You can stay in beast form for a number of hours equal to half your druid level (rounded down). CR limit starts at 1/4 with no flying/swimming, increasing at higher levels.' },
            { level: 2, name: 'Druid Circle', desc: 'Choose a circle: Land, Moon, Dreams, Shepherd, Spores, or others. Your choice grants features at 2nd, 6th, 10th, and 14th level.' },
            { level: 4, name: 'Wild Shape Improvement', desc: 'You can use Wild Shape to transform into a beast with CR 1/2 or lower that doesn\'t have a flying speed. You can also swim in beast form.' },
            { level: 8, name: 'Wild Shape Improvement', desc: 'You can use Wild Shape to transform into a beast with CR 1 or lower. You can also fly in beast form.' },
            { level: 18, name: 'Timeless Body', desc: 'The primal magic you wield slows your aging. For every 10 years that pass, your body ages only 1 year.' },
            { level: 18, name: 'Beast Spells', desc: 'You can cast many druid spells in beast shape. You can perform somatic and verbal components while in beast form.' },
            { level: 20, name: 'Archdruid', desc: 'You can use Wild Shape an unlimited number of times. Additionally, you can ignore verbal and somatic components of druid spells, as well as material components that lack a cost. You gain this benefit in both normal and beast form.' }
        ],
        subclasses: [
            { name: 'Circle of the Land', desc: 'Druids tied to specific terrain types. Bonus cantrip at 2nd. Natural Recovery regains spell slots during short rest. Circle spells based on chosen land (Arctic, Coast, Desert, Forest, Grassland, Mountain, Swamp, Underdark). Land\'s Stride at 6th lets you move through nonmagical difficult terrain. Nature\'s Ward at 10th grants immunity to poison/disease and fey/elemental charm/frighten. Nature\'s Sanctuary at 14th causes beasts/plants to save or be unable to attack you.' },
            { name: 'Circle of the Moon', desc: 'Fierce guardians who take on powerful beast forms. Combat Wild Shape as a bonus action, can expend spell slots to heal in beast form. CR limit becomes druid level divided by 3. Primal Strike at 6th makes beast attacks magical. Elemental Wild Shape at 10th lets you transform into elementals. Thousand Forms at 14th grants at-will alter self.' },
            { name: 'Circle of Dreams', desc: 'Connected to the Feywild. Balm of the Summer Court heals and grants temp HP to allies. Hearth of Moonlight and Shadow at 6th creates a protected rest area. Hidden Paths at 10th lets you teleport and turn invisible. Walker in Dreams at 14th grants various teleportation and scrying abilities.' },
            { name: 'Circle of the Shepherd', desc: 'Commune with spirits of nature. Speech of the Woods grants beast speech. Spirit Totem summons beneficial auras (Bear: temp HP, Hawk: advantage on attacks, Unicorn: advantage on detection and healing boost). Mighty Summoner at 6th makes summoned creatures stronger. Guardian Spirit at 10th heals summoned creatures. Faithful Summons at 14th auto-summons animals when you\'re reduced to 0 HP.' },
            { name: 'Circle of Spores', desc: 'Find beauty in decay and leverage necrotic fungi. Halo of Spores deals poison damage to nearby creatures. Symbiotic Entity grants temp HP, extra necrotic damage, and extends Halo range. Fungal Infestation at 6th animates slain beasts/humanoids as zombies. Spreading Spores at 10th moves your Halo. Fungal Body at 14th grants immunities and critical immunity.' }
        ]
    },
    'fighter': {
        name: 'Fighter',
        hitDie: 'd10',
        primaryAbility: 'Strength or Dexterity',
        saves: 'Strength, Constitution',
        armor: 'All armor, shields',
        weapons: 'Simple weapons, martial weapons',
        skills: 'Choose 2 from Acrobatics, Animal Handling, Athletics, History, Insight, Intimidation, Perception, Survival',
        description: 'A master of martial combat, skilled with a variety of weapons and armor',
        features: [
            { level: 1, name: 'Fighting Style', desc: 'Choose a fighting style: Archery (+2 to ranged attacks), Defense (+1 AC in armor), Dueling (+2 damage with one-handed weapon), Great Weapon Fighting (reroll 1s and 2s on damage), Protection (impose disadvantage on attacks against allies), or Two-Weapon Fighting (add ability modifier to off-hand damage).' },
            { level: 1, name: 'Second Wind', desc: 'As a bonus action, regain HP equal to 1d10 + fighter level. You can use this once, regaining the use after a short or long rest.' },
            { level: 1, name: 'Weapon Mastery', desc: '2024 PHB: You gain mastery with 3 weapons of your choice. When you attack with a weapon you have mastery with, you can use that weapon\'s special mastery property. You gain mastery with additional weapons at higher levels (4 at 4th level, 5 at 10th level).' },
            { level: 2, name: 'Action Surge (one use)', desc: 'You can push yourself beyond normal limits. On your turn, you can take one additional action. You can use this once, regaining the use after a short or long rest.' },
            { level: 3, name: 'Martial Archetype', desc: 'Choose an archetype: Champion, Battle Master, Eldritch Knight, or others. Your archetype grants features at 3rd, 7th, 10th, 15th, and 18th level.' },
            { level: 5, name: 'Extra Attack', desc: 'You can attack twice, instead of once, when you take the Attack action on your turn.' },
            { level: 9, name: 'Indomitable (one use)', desc: 'You can reroll a failed saving throw. You must use the new roll. You can use this once, regaining the use after a long rest.' },
            { level: 11, name: 'Extra Attack (2)', desc: 'You can attack three times when you take the Attack action.' },
            { level: 13, name: 'Indomitable (two uses)', desc: 'You can use Indomitable twice between long rests.' },
            { level: 17, name: 'Action Surge (two uses)', desc: 'You can use Action Surge twice before needing a rest, but only once per turn.' },
            { level: 17, name: 'Indomitable (three uses)', desc: 'You can use Indomitable three times between long rests.' },
            { level: 20, name: 'Extra Attack (3)', desc: 'You can attack four times when you take the Attack action.' }
        ],
        subclasses: [
            { name: 'Champion', desc: 'Focuses on raw physical power. Improved Critical at 3rd makes you crit on 19-20. Remarkable Athlete at 7th adds half proficiency to STR/DEX/CON checks and increases running jump distance. Additional Fighting Style at 10th. Superior Critical at 15th makes you crit on 18-20. Survivor at 18th heals you at start of turn if below half HP.' },
            { name: 'Battle Master', desc: 'Employs martial techniques through superiority dice. Gain 4 maneuvers from a list (Trip Attack, Riposte, Parry, Precision Attack, etc.) and 4 d8 superiority dice. Student of War grants tool proficiency. Know Your Enemy at 7th reveals creature capabilities. Additional superiority dice and maneuvers at higher levels. Dice become d10 at 10th, d12 at 18th.' },
            { name: 'Eldritch Knight', desc: 'Combines martial prowess with wizard magic. Spellcasting using INT (draws from wizard spell list). Weapon Bond at 3rd prevents disarming. War Magic at 7th lets you cast a cantrip and make a weapon attack. Eldritch Strike at 10th gives enemies disadvantage on saves against your spells. Arcane Charge at 15th lets you teleport when you Action Surge. Improved War Magic at 18th allows spell + attack.' },
            { name: 'Samurai', desc: 'Embodies the ideals of honor and discipline. Fighting Spirit grants temp HP and advantage on attacks. Elegant Courtier at 7th adds WIS to CHA (Persuasion) checks and grants WIS save proficiency. Tireless Spirit at 10th regains Fighting Spirit on initiative if expended. Rapid Strike at 15th trades advantage for an extra attack. Strength Before Death at 18th lets you take a full turn immediately when reduced to 0 HP.' },
            { name: 'Cavalier', desc: 'Superior mounted combatant and defensive warrior. Bonus proficiency, Born to the Saddle, and Unwavering Mark at 3rd. Warding Maneuver at 7th lets you protect allies. Hold the Line at 10th reduces enemy speed to 0 on opportunity attacks. Ferocious Charger at 15th adds damage when moving and attacking. Vigilant Defender at 18th grants extra opportunity attacks.' }
        ]
    },
    'monk': {
        name: 'Monk',
        hitDie: 'd8',
        primaryAbility: 'Dexterity and Wisdom',
        saves: 'Strength, Dexterity',
        armor: 'None',
        weapons: 'Simple weapons, shortswords',
        skills: 'Choose 2 from Acrobatics, Athletics, History, Insight, Religion, Stealth',
        description: 'A master of martial arts, harnessing the power of the body in pursuit of physical and spiritual perfection',
        features: [
            { level: 1, name: 'Unarmored Defense', desc: 'While not wearing armor or wielding a shield, your AC equals 10 + DEX modifier + WIS modifier.' },
            { level: 1, name: 'Martial Arts', desc: 'You can use DEX instead of STR for attack/damage rolls of unarmed strikes and monk weapons. You can roll a d4 for damage instead of normal damage (die increases at higher levels). When you use Attack action with unarmed strike or monk weapon, you can make one unarmed strike as a bonus action.' },
            { level: 1, name: 'Weapon Mastery', desc: '2024 PHB: You gain mastery with 2 weapons of your choice (typically simple melee weapons or shortswords). When you attack with a weapon you have mastery with, you can use that weapon\'s special mastery property. You gain mastery with additional weapons at higher levels (3 at 4th level, 4 at 10th level).' },
            { level: 2, name: 'Focus Points', desc: 'You gain Focus Points equal to your monk level. Spend Focus Points to use: Flurry of Blows (2 unarmed strikes as bonus action). Patient Defense: Disengage as bonus action (free), or spend 1 Focus Point to Disengage AND Dodge as bonus action. Step of the Wind: Dash as bonus action (free), or spend 1 Focus Point to Disengage AND Dash as bonus action with doubled jump distance. Regain all Focus Points on short or long rest.' },
            { level: 2, name: 'Unarmored Movement', desc: 'Your speed increases by 10 feet while not wearing armor or wielding a shield. This bonus increases at certain monk levels. At 9th level, you gain the ability to move along vertical surfaces and across liquids.' },
            { level: 3, name: 'Monastic Tradition', desc: 'Choose a tradition: Open Hand, Shadow, Four Elements, Long Death, Sun Soul, or others. Your tradition grants features at 3rd, 6th, 11th, and 17th level.' },
            { level: 3, name: 'Deflect Missiles', desc: 'You can use your reaction to deflect or catch a missile when hit by a ranged weapon attack. Reduce damage by 1d10 + DEX modifier + monk level. If damage reduced to 0, you can catch it and spend 1 Focus Point to throw it back.' },
            { level: 4, name: 'Slow Fall', desc: 'You can use your reaction when you fall to reduce falling damage by an amount equal to 5 times your monk level.' },
            { level: 5, name: 'Extra Attack', desc: 'You can attack twice when you take the Attack action.' },
            { level: 5, name: 'Stunning Strike', desc: 'When you hit with a melee weapon attack, you can spend 1 Focus Point to attempt a stunning strike. Target must succeed on a CON save or be stunned until the end of your next turn.' },
            { level: 6, name: 'Empowered Strikes', desc: 'Your unarmed strikes count as magical for overcoming resistance and immunity to nonmagical attacks and damage.' },
            { level: 7, name: 'Evasion', desc: 'When subjected to an effect that allows a DEX save for half damage, you take no damage on success and half damage on failure.' },
            { level: 7, name: 'Stillness of Mind', desc: 'You can use your action to end one effect on yourself that is causing you to be charmed or frightened.' },
            { level: 10, name: 'Purity of Body', desc: 'You are immune to disease and poison.' },
            { level: 13, name: 'Tongue of the Sun and Moon', desc: 'You can understand all spoken languages and any creature that understands a language can understand what you say.' },
            { level: 14, name: 'Diamond Soul', desc: 'You gain proficiency in all saving throws. When you fail a save, you can spend 1 Focus Point to reroll it and take the second result.' },
            { level: 15, name: 'Perfect Focus', desc: 'When you roll Initiative and have 4 or fewer Focus Points and don\'t use Uncanny Metabolism, you regain expended Focus Points until you have 4.' },
            { level: 18, name: 'Empty Body', desc: 'You can spend 4 Focus Points to become invisible for 1 minute and gain resistance to all damage except force. You can also spend 8 Focus Points to cast astral projection without material components.' },
            { level: 20, name: 'Body and Mind', desc: 'You have developed your body and mind to new heights. Your Dexterity and Wisdom scores increase by 4, to a maximum of 25.' }
        ],
        subclasses: [
            { name: 'Way of the Open Hand', desc: 'Ultimate masters of martial arts combat. Open Hand Technique adds effects to Flurry of Blows (knock prone, push, prevent reactions). Wholeness of Body at 6th heals yourself as action. Tranquility at 11th grants sanctuary-like effect after long rest. Quivering Palm at 17th can kill with focused vibrations (spend 3 Focus Points, target makes CON save or drops to 0 HP).' },
            { name: 'Way of Shadow', desc: 'Employ stealth and subterfuge. Gain minor illusion cantrip. Shadow Arts lets you spend 2 Focus Points to cast darkness, darkvision, pass without trace, or silence. Shadow Step at 6th teleports between shadows and grants advantage on next attack. Cloak of Shadows at 11th grants invisibility. Opportunist at 17th lets you attack when enemies near you get hit.' },
            { name: 'Way of the Four Elements', desc: 'Harness elemental power. Discipline of the Elements grants elemental-themed abilities requiring Focus Points (Fangs of the Fire Snake, Fist of Unbroken Air, Shape the Flowing River, Sweeping Cinder Strike, etc.). Learn additional disciplines at 6th, 11th, and 17th level. Can cast spells like burning hands, fireball, or wall of fire using Focus Points.' },
            { name: 'Way of the Long Death', desc: 'Touch of Death grants temp HP when you reduce a creature to 0 HP. Hour of Reaping at 6th frightens creatures within 30 feet as action. Mastery of Death at 11th lets you drop to 1 HP instead of 0 by spending 1 Focus Point. Touch of the Long Death at 17th deals massive necrotic damage for 5-10 Focus Points (2d10 per Focus Point).' },
            { name: 'Way of the Sun Soul', desc: 'Channel radiant energy. Radiant Sun Bolt lets you make ranged spell attacks (30 feet) for radiant damage as monk weapons. Searing Arc Strike at 6th spends 2 Focus Points to cast burning hands (radiant). Searing Sunburst at 11th spends 2 Focus Points for AoE radiant damage. Sun Shield at 17th creates damaging light aura and grants resistance to radiant damage.' }
        ]
    },
    'paladin': {
        name: 'Paladin',
        hitDie: 'd10',
        primaryAbility: 'Strength and Charisma',
        saves: 'Wisdom, Charisma',
        armor: 'All armor, shields',
        weapons: 'Simple weapons, martial weapons',
        skills: 'Choose 2 from Athletics, Insight, Intimidation, Medicine, Persuasion, Religion',
        description: 'A holy warrior bound to a sacred oath, combining martial might with divine magic',
        features: [
            { level: 1, name: 'Divine Sense', desc: 'As an action, detect celestials, fiends, and undead within 60 feet (unless behind total cover). Also detect consecrated or desecrated locations. You can use this a number of times equal to 1 + CHA modifier, regaining uses after a long rest.' },
            { level: 1, name: 'Lay on Hands', desc: 'You have a pool of healing power equal to 5 × paladin level. As an action, touch a creature to restore HP up to the pool maximum. You can also cure one disease or neutralize one poison for 5 HP from the pool. Regain all HP after a long rest.' },
            { level: 1, name: 'Weapon Mastery', desc: '2024 PHB: You gain mastery with 2 weapons of your choice. When you attack with a weapon you have mastery with, you can use that weapon\'s special mastery property. You gain mastery with additional weapons at higher levels (3 at 4th level, 4 at 10th level).' },
            { level: 2, name: 'Fighting Style', desc: 'Choose a fighting style: Defense (+1 AC in armor), Dueling (+2 damage with one-handed weapon), Great Weapon Fighting (reroll 1s and 2s on damage), or Protection (impose disadvantage on attacks against allies).' },
            { level: 2, name: 'Spellcasting', desc: 'You can cast paladin spells using CHA as your spellcasting ability. You prepare spells from the paladin spell list each day. You can use a holy symbol as a spellcasting focus.' },
            { level: 2, name: 'Divine Smite', desc: 'As a bonus action after hitting with a melee weapon attack, you can expend one spell slot to deal extra radiant damage to the target: 2d8 for a 1st-level spell slot, plus 1d8 for each spell level higher than 1st (max 5d8). The damage increases by 1d8 if the target is an undead or fiend. You can use Divine Smite only once per turn.' },
            { level: 3, name: 'Divine Health', desc: 'You are immune to disease due to divine magic flowing through you.' },
            { level: 3, name: 'Sacred Oath', desc: 'Choose an oath: Devotion, Ancients, Vengeance, Conquest, Redemption, or others. Your oath grants spells and features at 3rd, 7th, 15th, and 20th level, plus Channel Divinity options.' },
            { level: 5, name: 'Extra Attack', desc: 'You can attack twice when you take the Attack action.' },
            { level: 6, name: 'Aura of Protection', desc: 'When you or a friendly creature within 10 feet must make a saving throw, they gain a bonus equal to your CHA modifier (minimum +1). You must be conscious. At 18th level, range increases to 30 feet.' },
            { level: 10, name: 'Aura of Courage', desc: 'You and friendly creatures within 10 feet can\'t be frightened while you are conscious. At 18th level, range increases to 30 feet.' },
            { level: 11, name: 'Improved Divine Smite', desc: 'You are so suffused with divine might that all your melee weapon strikes carry divine power. When you hit with a melee weapon, you deal an extra 1d8 radiant damage.' },
            { level: 14, name: 'Cleansing Touch', desc: 'You can use your action to end one spell on yourself or one willing creature you touch. You can use this a number of times equal to your CHA modifier (minimum 1), regaining uses after a long rest.' },
            { level: 18, name: 'Aura Improvements', desc: 'The range of your Aura of Protection and Aura of Courage increases to 30 feet.' }
        ],
        subclasses: [
            { name: 'Oath of Devotion', desc: 'Ancient ideals of justice, virtue, and order. Sacred Weapon makes weapon attacks magical and adds CHA to attack rolls. Turn the Unholy repels fiends and undead. Aura of Devotion at 7th grants immunity to charm within aura. Purity of Spirit at 15th makes you always under protection from evil and good. Holy Nimbus at 20th creates radiant aura dealing damage to enemies.' },
            { name: 'Oath of the Ancients', desc: 'Preserve light and life against forces of death. Nature\'s Wrath restrains creatures with spectral vines. Turn the Faithless repels fey and fiends. Aura of Warding at 7th grants resistance to spell damage. Undying Sentinel at 15th prevents death once per long rest. Elder Champion at 20th transforms you into an ancient force of nature.' },
            { name: 'Oath of Vengeance', desc: 'Punish wrongdoers by any means necessary. Abjure Enemy frightens one creature. Vow of Enmity gives advantage against one foe. Relentless Avenger at 7th grants free movement after opportunity attack. Soul of Vengeance at 15th lets you react when vow target attacks. Avenging Angel at 20th grants flight and frightening aura.' },
            { name: 'Oath of Conquest', desc: 'Crush the forces of chaos through strength. Conquering Presence frightens enemies. Guided Strike adds +10 to attack roll. Aura of Conquest at 7th reduces frightened enemies\' speed to 0 and deals psychic damage. Scornful Rebuke at 15th deals psychic damage to attackers. Invincible Conqueror at 20th grants resistance and extra attack.' },
            { name: 'Oath of Redemption', desc: 'Believe violence is a last resort. Emissary of Peace grants +5 to CHA (Persuasion) for 10 minutes. Rebuke the Violent deals damage to those who harm others. Protective Spirit at 7th heals you at end of turn if below half HP. Aura of the Guardian at 15th lets you take damage for allies. Emissary of Redemption at 20th grants resistance and reflects damage to attackers.' }
        ]
    },
    'ranger': {
        name: 'Ranger',
        hitDie: 'd10',
        primaryAbility: 'Dexterity and Wisdom',
        saves: 'Strength, Dexterity',
        armor: 'Light armor, medium armor, shields',
        weapons: 'Simple weapons, martial weapons',
        skills: 'Choose 3 from Animal Handling, Athletics, Insight, Investigation, Nature, Perception, Stealth, Survival',
        description: 'A warrior who uses martial prowess and nature magic to combat threats on the edges of civilization',
        features: [
            { level: 1, name: 'Favored Enemy', desc: 'Choose a type of favored enemy (aberrations, beasts, celestials, constructs, dragons, elementals, fey, fiends, giants, monstrosities, oozes, plants, or undead). You have advantage on WIS (Survival) checks to track them and INT checks to recall information. You learn one language of your choice. Choose additional favored enemies at 6th and 14th level.' },
            { level: 1, name: 'Natural Explorer', desc: 'You are a master of navigating the natural world. Choose favored terrain. While traveling in it: difficult terrain doesn\'t slow your group, your group can\'t get lost except by magic, you remain alert to danger even while doing other activities, you can move stealthily at normal pace alone, you find twice as much food/water, and you learn exact number, sizes, and how long ago creatures passed. Choose additional favored terrains at 6th and 10th level.' },
            { level: 1, name: 'Weapon Mastery', desc: '2024 PHB: You gain mastery with 2 weapons of your choice. When you attack with a weapon you have mastery with, you can use that weapon\'s special mastery property. You gain mastery with additional weapons at higher levels (3 at 4th level, 4 at 10th level).' },
            { level: 2, name: 'Fighting Style', desc: 'Choose a fighting style: Archery (+2 to ranged attacks), Defense (+1 AC in armor), Dueling (+2 damage with one-handed weapon), or Two-Weapon Fighting (add ability modifier to off-hand damage).' },
            { level: 2, name: 'Spellcasting', desc: 'You can cast ranger spells using WIS as your spellcasting ability. You know a number of spells from the ranger spell list.' },
            { level: 3, name: 'Ranger Archetype', desc: 'Choose an archetype: Hunter, Beast Master, Gloom Stalker, Horizon Walker, Monster Slayer, or others. Your archetype grants features at 3rd, 7th, 11th, and 15th level.' },
            { level: 3, name: 'Primeval Awareness', desc: 'You can use your action and expend one spell slot to sense whether any aberrations, celestials, dragons, elementals, fey, fiends, or undead are within 1 mile (or 6 miles in favored terrain). This doesn\'t reveal location or number.' },
            { level: 5, name: 'Extra Attack', desc: 'You can attack twice when you take the Attack action.' },
            { level: 8, name: 'Land\'s Stride', desc: 'Moving through nonmagical difficult terrain costs no extra movement. You can pass through nonmagical plants without being slowed and without taking damage if they have thorns, spines, etc. You have advantage on saves against magically created or manipulated plants.' },
            { level: 10, name: 'Hide in Plain Sight', desc: 'You can spend 1 minute creating camouflage for yourself. Once camouflaged, you gain +10 to DEX (Stealth) checks while remaining still and not taking actions/reactions.' },
            { level: 14, name: 'Vanish', desc: 'You can use the Hide action as a bonus action. You also can\'t be tracked by nonmagical means unless you choose to leave a trail.' },
            { level: 18, name: 'Feral Senses', desc: 'You gain preternatural senses. You can attack creatures you can\'t see (no disadvantage). You are aware of invisible creatures within 30 feet unless they successfully hide from you.' },
            { level: 20, name: 'Foe Slayer', desc: 'Once per turn when you hit a favored enemy, add your WIS modifier to the attack or damage roll.' }
        ],
        subclasses: [
            { name: 'Hunter', desc: 'Masters of hunting dangerous game. Hunter\'s Prey at 3rd offers Colossus Slayer (extra d8 to damaged creatures), Giant Killer (reaction attack against Large+ creatures), or Horde Breaker (extra attack against another creature). Defensive Tactics at 7th. Multiattack at 11th. Superior Hunter\'s Defense at 15th grants Evasion, Stand Against the Tide, or Uncanny Dodge.' },
            { name: 'Beast Master', desc: 'Bond with a beast companion. Ranger\'s Companion grants a Medium or smaller beast with CR 1/4 or less. It obeys your commands and acts on your initiative. Exceptional Training at 7th lets beast Dash/Disengage/Dodge/Help as bonus action. Bestial Fury at 11th lets companion attack twice. Share Spells at 15th lets you target companion with self spells.' },
            { name: 'Gloom Stalker', desc: 'At home in darkest places. Dread Ambusher grants +10 feet speed in first turn, extra attack in first turn, and +1d8 damage on that attack. Umbral Sight at 3rd grants darkvision and invisibility to darkvision. Iron Mind at 7th grants WIS save proficiency. Stalker\'s Flurry at 11th lets you make another attack when you miss. Shadowy Dodge at 15th imposes disadvantage on attacks when you can see attacker.' },
            { name: 'Horizon Walker', desc: 'Guards planar boundaries. Detect Portal senses nearby portals. Planar Warrior deals force damage as bonus action. Ethereal Step at 7th grants brief etherealness. Distant Strike at 11th teleports before each attack, extra attack if you hit 2+ creatures. Spectral Defense at 15th grants resistance as reaction.' },
            { name: 'Monster Slayer', desc: 'Specialized in hunting creatures that threaten civilization. Hunter\'s Sense reveals creature\'s resistances/immunities. Slayer\'s Prey marks targets for extra d6 damage. Supernatural Defense at 7th adds 1d6 to saves against target\'s abilities and grants advantage on escaping grapple. Magic-User\'s Nemesis at 11th foils enemy spells. Slayer\'s Counter at 15th lets you attack when targeted by spell.' }
        ]
    },
    'rogue': {
        name: 'Rogue',
        hitDie: 'd8',
        primaryAbility: 'Dexterity',
        saves: 'Dexterity, Intelligence',
        armor: 'Light armor',
        weapons: 'Simple weapons, hand crossbows, longswords, rapiers, shortswords',
        skills: 'Choose 4 from Acrobatics, Athletics, Deception, Insight, Intimidation, Investigation, Perception, Performance, Persuasion, Sleight of Hand, Stealth',
        description: 'A scoundrel who uses stealth and trickery to overcome obstacles and enemies',
        features: [
            { level: 1, name: 'Expertise', desc: 'Choose two skill proficiencies or one skill and thieves\' tools. Your proficiency bonus is doubled for any ability check using those proficiencies. At 6th level, choose two more.' },
            { level: 1, name: 'Sneak Attack', desc: 'Once per turn, deal extra damage to one creature you hit with an attack if you have advantage (or an ally is within 5 feet of target and you don\'t have disadvantage). Must use finesse or ranged weapon. Extra damage starts at 1d6 and increases as you level (2d6 at 3rd, 3d6 at 5th, etc., up to 10d6 at 19th).' },
            { level: 1, name: 'Thieves\' Cant', desc: 'You know thieves\' cant, a secret mix of dialect, jargon, and code. It takes four times longer to convey a message this way. You also understand secret signs and symbols used to convey short messages.' },
            { level: 1, name: 'Weapon Mastery', desc: '2024 PHB: You gain mastery with 2 weapons of your choice (typically finesse or ranged weapons). When you attack with a weapon you have mastery with, you can use that weapon\'s special mastery property. You gain mastery with additional weapons at higher levels (3 at 4th level, 4 at 10th level).' },
            { level: 2, name: 'Cunning Action', desc: 'You can use a bonus action to take the Dash, Disengage, or Hide action.' },
            { level: 3, name: 'Roguish Archetype', desc: 'Choose an archetype: Thief, Assassin, Arcane Trickster, or others. Your archetype grants features at 3rd, 9th, 13th, and 17th level.' },
            { level: 5, name: 'Uncanny Dodge', desc: 'When an attacker you can see hits you with an attack, you can use your reaction to halve the attack\'s damage against you.' },
            { level: 7, name: 'Evasion', desc: 'When subjected to an effect that allows a DEX save for half damage, you take no damage on success and half damage on failure.' },
            { level: 11, name: 'Reliable Talent', desc: 'Whenever you make an ability check using a skill you\'re proficient in, you treat a d20 roll of 9 or lower as a 10.' },
            { level: 14, name: 'Blindsense', desc: 'If you can hear, you are aware of the location of any hidden or invisible creature within 10 feet of you.' },
            { level: 15, name: 'Slippery Mind', desc: 'You gain proficiency in WIS saving throws.' },
            { level: 18, name: 'Elusive', desc: 'No attack roll has advantage against you while you aren\'t incapacitated.' },
            { level: 20, name: 'Stroke of Luck', desc: 'If you miss with an attack roll, you can turn it into a hit. Alternatively, if you fail an ability check, you can treat the d20 roll as a 20. Once used, can\'t use again until you finish a short or long rest.' }
        ],
        subclasses: [
            { name: 'Thief', desc: 'Masters of infiltration and treasure hunting. Fast Hands lets you use Cunning Action to make DEX (Sleight of Hand) checks, use thieves\' tools, or Use an Object. Second-Story Work at 3rd grants climbing speed equal to normal speed and increases running jump by DEX modifier feet. Supreme Sneak at 9th grants advantage on Stealth if you move no more than half speed. Use Magic Device at 13th lets you use magic items. Thief\'s Reflexes at 17th lets you take two turns in first round of combat.' },
            { name: 'Assassin', desc: 'Masters of dealing sudden death. Bonus proficiencies with disguise and poisoner\'s kits. Assassinate at 3rd grants advantage on attacks against creatures that haven\'t acted yet in combat, and hits against surprised creatures are critical hits. Infiltration Expertise at 9th creates false identities. Imposter at 13th lets you mimic others\' speech, writing, and behavior. Death Strike at 17th doubles damage against surprised creatures that fail CON save.' },
            { name: 'Arcane Trickster', desc: 'Combine roguish skills with magical study. Spellcasting using INT (draws from wizard spell list, focuses on enchantment and illusion). Mage Hand Legerdemain at 3rd makes mage hand invisible and lets you pick locks, disarm traps, and pickpocket. Magical Ambush at 9th grants disadvantage on saves against spells when you\'re hidden. Versatile Trickster at 13th uses mage hand to distract for advantage. Spell Thief at 17th steals knowledge of spells used against you.' },
            { name: 'Inquisitive', desc: 'Excel at rooting out secrets. Ear for Deceit gives minimum roll for Insight to detect lies. Eye for Detail lets you use Perception/Investigation as bonus action. Insightful Fighting at 3rd grants Sneak Attack without advantage if you succeed on Insight vs Deception. Steady Eye at 9th grants advantage on Perception/Investigation when moving at half speed. Unerring Eye at 13th senses illusions and shapeshifters. Eye for Weakness at 17th adds 3d6 to Sneak Attack if you use Insightful Fighting.' },
            { name: 'Swashbuckler', desc: 'Focused on elegant dueling. Fancy Footwork prevents opportunity attacks from creatures you attacked. Rakish Audacity adds CHA to initiative and lets you Sneak Attack targets 1-on-1. Panache at 9th charms or draws attention. Elegant Maneuver at 13th adds bonus action Dash/Disengage/Hide. Master Duelist at 17th grants advantage on attack if you miss.' }
        ]
    },
    'sorcerer': {
        name: 'Sorcerer',
        hitDie: 'd6',
        primaryAbility: 'Charisma',
        saves: 'Constitution, Charisma',
        armor: 'None',
        weapons: 'Daggers, darts, slings, quarterstaffs, light crossbows',
        skills: 'Choose 2 from Arcana, Deception, Insight, Intimidation, Persuasion, Religion',
        description: 'A spellcaster who draws on inherent magic from a gift or bloodline',
        features: [
            { level: 1, name: 'Spellcasting', desc: 'You can cast sorcerer spells using CHA as your spellcasting ability. You know a number of spells from the sorcerer spell list and can cast them using spell slots. You can use an arcane focus as a spellcasting focus.' },
            { level: 1, name: 'Sorcerous Origin', desc: 'Choose the origin of your power: Draconic Bloodline, Wild Magic, Divine Soul, Shadow Magic, Storm Sorcery, or others. Your origin grants features at 1st, 6th, 14th, and 18th level.' },
            { level: 2, name: 'Font of Magic', desc: 'You have sorcery points equal to your sorcerer level. You can transform sorcery points into spell slots and vice versa. Create spell slots (2 points = 1st level, 3 = 2nd, 5 = 3rd, 6 = 4th, 7 = 5th). Convert slots to points (slot level = points gained). Regain all sorcery points on a long rest.' },
            { level: 3, name: 'Metamagic', desc: 'You gain the ability to twist spells. Choose two Metamagic options from: Careful Spell (protect allies from AoE), Distant Spell (double range), Empowered Spell (reroll damage dice), Extended Spell (double duration), Heightened Spell (impose disadvantage on save), Quickened Spell (cast as bonus action), Subtle Spell (no components), or Twinned Spell (target second creature). Learn another at 10th and 17th level.' },
            { level: 10, name: 'Metamagic (2)', desc: 'You learn a third Metamagic option.' },
            { level: 17, name: 'Metamagic (3)', desc: 'You learn a fourth Metamagic option.' },
            { level: 20, name: 'Sorcerous Restoration', desc: 'When you finish a short rest, you regain 4 expended sorcery points.' }
        ],
        subclasses: [
            { name: 'Draconic Bloodline', desc: 'Magic stems from draconic heritage. Choose dragon type for damage resistance and bonus spells. Dragon Ancestor grants +1 HP per level and AC = 13 + DEX when not wearing armor. Elemental Affinity at 6th adds CHA modifier to one damage roll of your dragon type and grants resistance. Dragon Wings at 14th grants flying speed. Draconic Presence at 18th creates charm/frighten aura.' },
            { name: 'Wild Magic', desc: 'Magic is chaotic and unpredictable. Wild Magic Surge may occur when you cast 1st level+ spells (DM rolls d20, on 1 roll on surge table). Tides of Chaos at 1st grants advantage on one check/save/attack, recharge when surge occurs. Bend Luck at 6th adds/subtracts d4 from creature\'s roll. Controlled Chaos at 14th rolls twice on surge table. Spell Bombardment at 18th adds extra damage die when you roll max on damage dice.' },
            { name: 'Divine Soul', desc: 'Magic derives from divine source. Divine Magic adds cleric spell list to spells you can learn. Favored by the Gods at 1st lets you add 2d4 to failed save/attack. Empowered Healing at 6th rerolls healing dice. Otherworldly Wings at 14th grants flying speed. Unearthly Recovery at 18th heals you to half HP when reduced to 0 (once per long rest).' },
            { name: 'Shadow Magic', desc: 'Power from the Shadowfell. Eyes of the Dark grants darkvision 120 feet and cast darkness with sorcery points. Strength of the Grave at 1st lets you make CHA save to drop to 1 HP instead of 0. Hound of Ill Omen at 6th summons shadow hound to hunt a creature. Shadow Walk at 14th teleports through shadows. Umbral Form at 18th transforms into shadow form with resistance and phasing.' },
            { name: 'Storm Sorcery', desc: 'Innate magic of the storm. Wind Speaker grants Primordial language. Tempestuous Magic at 1st lets you fly 10 feet before/after casting 1st level+ spell. Heart of the Storm at 6th grants lightning/thunder resistance and damages nearby creatures when you cast lightning/thunder spells. Storm Guide at 6th controls wind and weather. Storm\'s Fury at 14th deals lightning to attackers. Wind Soul at 18th grants immunity, flying speed, and ability to fly others.' }
        ]
    },
    'warlock': {
        name: 'Warlock',
        hitDie: 'd8',
        primaryAbility: 'Charisma',
        saves: 'Wisdom, Charisma',
        armor: 'Light armor',
        weapons: 'Simple weapons',
        skills: 'Choose 2 from Arcana, Deception, History, Intimidation, Investigation, Nature, Religion',
        description: 'A wielder of magic derived from a bargain with an extraplanar entity',
        features: [
            { level: 1, name: 'Otherworldly Patron', desc: 'You have made a pact with a powerful entity: the Archfey, the Fiend, the Great Old One, the Celestial, the Hexblade, or others. Your patron grants you features at 1st, 6th, 10th, and 14th level, plus an expanded spell list.' },
            { level: 1, name: 'Pact Magic', desc: 'You can cast warlock spells using CHA as your spellcasting ability. You know a number of spells and have spell slots that recharge on a short or long rest. Unlike other casters, you have fewer slots but they\'re all the same level (scaling up to 5th level). You can use an arcane focus as a spellcasting focus.' },
            { level: 2, name: 'Eldritch Invocations', desc: 'You learn two eldritch invocations (Agonizing Blast, Armor of Shadows, Beast Speech, Beguiling Influence, Devil\'s Sight, Eldritch Sight, Eldritch Spear, Eyes of the Rune Keeper, Fiendish Vigor, Gaze of Two Minds, Mask of Many Faces, Misty Visions, Repelling Blast, Thief of Five Fates, etc.). Some have prerequisites. You learn additional invocations at 5th, 7th, 9th, 12th, 15th, and 18th level, and can replace one when you gain a level.' },
            { level: 3, name: 'Pact Boon', desc: 'Your patron grants a special boon. Pact of the Chain (familiar with special forms and abilities), Pact of the Blade (create magical weapon as action), or Pact of the Tome (Book of Shadows with 3 cantrips from any class).' },
            { level: 11, name: 'Mystic Arcanum (6th level)', desc: 'Your patron grants you a magical secret. Choose one 6th-level spell from the warlock spell list. You can cast it once without a spell slot, regaining the ability after a long rest.' },
            { level: 13, name: 'Mystic Arcanum (7th level)', desc: 'Choose one 7th-level spell from the warlock spell list. You can cast it once without a spell slot, regaining the ability after a long rest.' },
            { level: 15, name: 'Mystic Arcanum (8th level)', desc: 'Choose one 8th-level spell from the warlock spell list. You can cast it once without a spell slot, regaining the ability after a long rest.' },
            { level: 17, name: 'Mystic Arcanum (9th level)', desc: 'Choose one 9th-level spell from the warlock spell list. You can cast it once without a spell slot, regaining the ability after a long rest.' },
            { level: 20, name: 'Eldritch Master', desc: 'You can draw on your inner reserve of mystical power. You can spend 1 minute entreating your patron to regain all expended spell slots. Once used, you can\'t do so again until you finish a long rest.' }
        ],
        subclasses: [
            { name: 'The Archfey', desc: 'Pact with a lord/lady of the fey. Expanded spell list includes faerie fire, sleep, calm emotions, phantasmal force, blink, plant growth. Fey Presence at 1st frightens or charms nearby creatures. Misty Escape at 6th turns you invisible and teleports when damaged. Beguiling Defenses at 10th grants immunity to charm and reflects charm back. Dark Delirium at 14th charms creatures into illusory realm.' },
            { name: 'The Fiend', desc: 'Pact with demon, devil, or other fiendish entity. Expanded spells include burning hands, command, scorching ray, suggestion, fireball, stinking cloud. Dark One\'s Blessing grants temp HP when you reduce creatures to 0 HP. Dark One\'s Own Luck at 6th adds d10 to check/save. Fiendish Resilience at 10th grants damage resistance (choose type each rest). Hurl Through Hell at 14th banishes target through lower planes for massive psychic damage.' },
            { name: 'The Great Old One', desc: 'Pact with alien entity. Expanded spells include dissonant whispers, Tasha\'s hideous laughter, detect thoughts, phantasmal force, clairvoyance, sending. Awakened Mind at 1st grants telepathy 30 feet. Entropic Ward at 6th imposes disadvantage on attacks and grants advantage on one attack. Thought Shield at 10th grants psychic resistance and reflects psychic damage. Create Thrall at 14th charms incapacitated humanoid permanently.' },
            { name: 'The Celestial', desc: 'Pact with empyrean, ki-rin, unicorn, or other celestial. Expanded spells include cure wounds, guiding bolt, flaming sphere, lesser restoration, daylight, revivify. Bonus light and sacred flame cantrips. Healing Light grants pool of d6s to heal as bonus action. Radiant Soul at 6th adds CHA to fire/radiant spell damage and resistance to radiant. Celestial Resilience at 10th grants temp HP to you and allies on short/long rest. Searing Vengeance at 14th lets you explode with radiant damage when making death saves.' },
            { name: 'The Hexblade', desc: 'Pact with mysterious entity from Shadowfell. Expanded spells include shield, wrathful smite, blur, branding smite, blink, elemental weapon. Hexblade\'s Curse marks enemies for bonus damage, crit on 19-20, and heal on kill. Hex Warrior at 1st uses CHA for weapon attacks with one weapon and grants medium armor/shield/martial weapons. Accursed Specter at 6th raises slain humanoids as specters. Armor of Hexes at 10th makes cursed targets miss you 50% of the time. Master of Hexes at 14th transfers curse to new target when cursed creature dies.' }
        ]
    },
    'wizard': {
        name: 'Wizard',
        hitDie: 'd6',
        primaryAbility: 'Intelligence',
        saves: 'Intelligence, Wisdom',
        armor: 'None',
        weapons: 'Daggers, darts, slings, quarterstaffs, light crossbows',
        skills: 'Choose 2 from Arcana, History, Insight, Investigation, Medicine, Religion',
        description: 'A scholarly magic-user capable of manipulating the structures of reality',
        features: [
            { level: 1, name: 'Spellcasting', desc: 'You can cast wizard spells using INT as your spellcasting ability. You have a spellbook containing your spells. You prepare spells from your spellbook each day. You can copy spells you find into your spellbook (50gp and 2 hours per spell level). You can use an arcane focus as a spellcasting focus.' },
            { level: 1, name: 'Arcane Recovery', desc: 'During a short rest, you can recover expended spell slots. The spell slots can have a combined level equal to or less than half your wizard level (rounded up), and none can be 6th level or higher. You can use this once per day.' },
            { level: 2, name: 'Arcane Tradition', desc: 'Choose a tradition: Abjuration, Conjuration, Divination, Enchantment, Evocation, Illusion, Necromancy, Transmutation, or others. Your tradition grants features at 2nd, 6th, 10th, and 14th level.' },
            { level: 18, name: 'Spell Mastery', desc: 'Choose one 1st-level and one 2nd-level spell in your spellbook. You can cast them at their lowest level without expending a spell slot when you have them prepared. You can change these spells by studying for 8 hours.' },
            { level: 20, name: 'Signature Spells', desc: 'Choose two 3rd-level spells in your spellbook as your signature spells. You always have them prepared and can cast each once at 3rd level without expending a spell slot. When you do so, you can\'t do so again until you finish a short or long rest.' }
        ],
        subclasses: [
            { name: 'School of Abjuration', desc: 'Specialist in protective magic. Abjuration Savant reduces spell copy cost/time. Arcane Ward at 2nd creates protective barrier with 2×wizard level + INT HP, recharges when you cast abjuration spells. Projected Ward at 6th lets you shield others with your ward. Improved Abjuration at 10th adds proficiency bonus when countering spells. Spell Resistance at 14th grants advantage on spell saves and resistance to spell damage.' },
            { name: 'School of Conjuration', desc: 'Focus on summoning and teleportation. Conjuration Savant reduces spell copy cost/time. Minor Conjuration at 2nd creates inanimate objects. Benign Transposition at 6th lets you teleport or swap places. Focused Conjuration at 10th prevents concentration loss from damage when concentrating on conjuration. Durable Summons at 14th grants temp HP to conjured/summoned creatures.' },
            { name: 'School of Divination', desc: 'Peer into the future and uncover secrets. Divination Savant reduces spell copy cost/time. Portent at 2nd lets you roll 2d20 each day and replace any roll with one of those results. Expert Divination at 6th recovers spell slots when casting divination spells. The Third Eye at 10th grants darkvision, ethereal sight, greater comprehension, or see invisibility. Greater Portent at 14th grants 3 portent rolls instead of 2.' },
            { name: 'School of Enchantment', desc: 'Masters of charming and mind control. Enchantment Savant reduces spell copy cost/time. Hypnotic Gaze at 2nd charms creatures as action. Instinctive Charm at 6th redirects attacks to charm attacker. Split Enchantment at 10th lets you target two creatures with single-target enchantments. Alter Memories at 14th makes charmed creatures forget time spent charmed.' },
            { name: 'School of Evocation', desc: 'Focused on destructive elemental magic. Evocation Savant reduces spell copy cost/time. Sculpt Spells at 2nd lets allies automatically succeed on saves and take no damage from your evocations. Potent Cantrip at 6th makes creatures take half damage from your cantrips even on a successful save. Empowered Evocation at 10th adds INT modifier to one damage roll of wizard evocation spells. Overchannel at 14th maximizes spell damage (with consequences).' },
            { name: 'School of Illusion', desc: 'Weave reality from imagination. Illusion Savant reduces spell copy cost/time. Improved Minor Illusion at 2nd adds sound and image to minor illusion. Malleable Illusions at 6th lets you change illusions as action. Illusory Self at 10th creates duplicate to take attacks for you. Illusory Reality at 14th makes one object in illusion temporarily real.' },
            { name: 'School of Necromancy', desc: 'Explore the forces of life, death, and undeath. Necromancy Savant reduces spell copy cost/time. Grim Harvest at 2nd heals you when your spells kill creatures. Undead Thralls at 6th adds creatures to animate dead/create undead and gives them extra HP/damage. Inured to Undeath at 10th grants necrotic resistance and max HP can\'t be reduced. Command Undead at 14th attempts to control undead with Arcana check.' },
            { name: 'School of Transmutation', desc: 'Change matter and energy. Transmutation Savant reduces spell copy cost/time. Minor Alchemy at 2nd transforms materials. Transmuter\'s Stone at 6th creates stone granting darkvision, speed, proficiency, or resistance. Shapechanger at 10th lets you cast polymorph on yourself. Master Transmuter at 14th consumes stone for major transmutation (major transformation, panacea, restore life/youth, or raise dead).' }
        ]
    }
};

// Display class information
function displayClassInfo() {
    const select = document.getElementById('classInfoSelect');
    const display = document.getElementById('classInfoDisplay');
    const classKey = select.value;

    if (!classKey || !classInfo[classKey]) {
        display.innerHTML = '<p class="no-selection">Select a class to view its information</p>';
        return;
    }

    const info = classInfo[classKey];
    let html = `
        <div class="reference-card">
            <h3>${info.name}</h3>
            ${info.description ? `<p style="font-style: italic; margin-bottom: 15px; color: var(--text-dim);">${info.description}</p>` : ''}
            <div class="reference-detail">
                <strong>Hit Die:</strong> ${info.hitDie}
            </div>
            <div class="reference-detail">
                <strong>Primary Ability:</strong> ${info.primaryAbility}
            </div>
            <div class="reference-detail">
                <strong>Saving Throw Proficiencies:</strong> ${info.saves}
            </div>
            ${info.armor ? `<div class="reference-detail"><strong>Armor Proficiencies:</strong> ${info.armor}</div>` : ''}
            ${info.weapons ? `<div class="reference-detail"><strong>Weapon Proficiencies:</strong> ${info.weapons}</div>` : ''}
            ${info.skills ? `<div class="reference-detail"><strong>Skills:</strong> ${info.skills}</div>` : ''}
        </div>

        <div class="reference-card">
            <h3>Class Features</h3>
    `;

    info.features.forEach(feature => {
        if (feature.desc) {
            html += `
                <div class="reference-detail" style="margin-bottom: 15px;">
                    <strong>Level ${feature.level} - ${feature.name}:</strong> ${feature.desc}
                </div>
            `;
        } else {
            html += `
                <div class="reference-detail">
                    <strong>Level ${feature.level}:</strong> ${feature.name}
                </div>
            `;
        }
    });

    html += '</div>';

    if (info.subclasses && info.subclasses.length > 0) {
        html += `
            <div class="reference-card">
                <h3>Subclasses</h3>
        `;

        info.subclasses.forEach(subclass => {
            if (typeof subclass === 'object') {
                html += `
                    <div class="reference-detail" style="margin-bottom: 15px;">
                        <strong>${subclass.name}:</strong> ${subclass.desc}
                    </div>
                `;
            } else {
                html += `
                    <div class="reference-detail">
                        ${subclass}
                    </div>
                `;
            }
        });

        html += '</div>';
    }

    display.innerHTML = html;
}

// Shop Data
const shopData = {
    weapons: {
        name: 'Weapons',
        items: [
            { name: 'Club', subcategory: 'Simple Melee', cost: '0.1 gp', weight: '2 lb', damage: '1d4 bludgeoning', properties: 'Light', village: true, town: true, city: true },
            { name: 'Dagger', subcategory: 'Simple Melee', cost: '2 gp', weight: '1 lb', damage: '1d4 piercing', properties: 'Finesse, Light, Thrown (20/60)', village: true, town: true, city: true },
            { name: 'Greatclub', subcategory: 'Simple Melee', cost: '0.2 gp', weight: '10 lb', damage: '1d8 bludgeoning', properties: 'Two-Handed', village: true, town: true, city: true },
            { name: 'Handaxe', subcategory: 'Simple Melee', cost: '5 gp', weight: '2 lb', damage: '1d6 slashing', properties: 'Light, Thrown (20/60)', village: true, town: true, city: true },
            { name: 'Javelin', subcategory: 'Simple Melee', cost: '0.5 gp', weight: '2 lb', damage: '1d6 piercing', properties: 'Thrown (30/120)', village: true, town: true, city: true },
            { name: 'Light Hammer', subcategory: 'Simple Melee', cost: '2 gp', weight: '2 lb', damage: '1d4 bludgeoning', properties: 'Light, Thrown (20/60)', town: true, city: true },
            { name: 'Mace', subcategory: 'Simple Melee', cost: '5 gp', weight: '4 lb', damage: '1d6 bludgeoning', properties: '—', town: true, city: true },
            { name: 'Quarterstaff', subcategory: 'Simple Melee', cost: '0.2 gp', weight: '4 lb', damage: '1d6 bludgeoning', properties: 'Versatile (1d8)', village: true, town: true, city: true },
            { name: 'Sickle', subcategory: 'Simple Melee', cost: '1 gp', weight: '2 lb', damage: '1d4 slashing', properties: 'Light', village: true, town: true, city: true },
            { name: 'Spear', subcategory: 'Simple Melee', cost: '1 gp', weight: '3 lb', damage: '1d6 piercing', properties: 'Thrown (20/60), Versatile (1d8)', village: true, town: true, city: true },
            { name: 'Light Crossbow', subcategory: 'Simple Ranged', cost: '25 gp', weight: '5 lb', damage: '1d8 piercing', properties: 'Ammunition (80/320), Loading, Two-Handed', town: true, city: true },
            { name: 'Dart', subcategory: 'Simple Ranged', cost: '0.05 gp', weight: '0.25 lb', damage: '1d4 piercing', properties: 'Finesse, Thrown (20/60)', village: true, town: true, city: true },
            { name: 'Shortbow', subcategory: 'Simple Ranged', cost: '25 gp', weight: '2 lb', damage: '1d6 piercing', properties: 'Ammunition (80/320), Two-Handed', town: true, city: true },
            { name: 'Sling', subcategory: 'Simple Ranged', cost: '0.1 gp', weight: '—', damage: '1d4 bludgeoning', properties: 'Ammunition (30/120)', village: true, town: true, city: true },
            { name: 'Battleaxe', subcategory: 'Martial Melee', cost: '10 gp', weight: '4 lb', damage: '1d8 slashing', properties: 'Versatile (1d10)', town: true, city: true },
            { name: 'Flail', subcategory: 'Martial Melee', cost: '10 gp', weight: '2 lb', damage: '1d8 bludgeoning', properties: '—', town: true, city: true },
            { name: 'Glaive', subcategory: 'Martial Melee', cost: '20 gp', weight: '6 lb', damage: '1d10 slashing', properties: 'Heavy, Reach, Two-Handed', city: true },
            { name: 'Greataxe', subcategory: 'Martial Melee', cost: '30 gp', weight: '7 lb', damage: '1d12 slashing', properties: 'Heavy, Two-Handed', city: true },
            { name: 'Greatsword', subcategory: 'Martial Melee', cost: '50 gp', weight: '6 lb', damage: '2d6 slashing', properties: 'Heavy, Two-Handed', city: true },
            { name: 'Halberd', subcategory: 'Martial Melee', cost: '20 gp', weight: '6 lb', damage: '1d10 slashing', properties: 'Heavy, Reach, Two-Handed', city: true },
            { name: 'Lance', subcategory: 'Martial Melee', cost: '10 gp', weight: '6 lb', damage: '1d12 piercing', properties: 'Reach, Special', city: true },
            { name: 'Longsword', subcategory: 'Martial Melee', cost: '15 gp', weight: '3 lb', damage: '1d8 slashing', properties: 'Versatile (1d10)', town: true, city: true },
            { name: 'Maul', subcategory: 'Martial Melee', cost: '10 gp', weight: '10 lb', damage: '2d6 bludgeoning', properties: 'Heavy, Two-Handed', town: true, city: true },
            { name: 'Morningstar', subcategory: 'Martial Melee', cost: '15 gp', weight: '4 lb', damage: '1d8 piercing', properties: '—', town: true, city: true },
            { name: 'Pike', subcategory: 'Martial Melee', cost: '5 gp', weight: '18 lb', damage: '1d10 piercing', properties: 'Heavy, Reach, Two-Handed', town: true, city: true },
            { name: 'Rapier', subcategory: 'Martial Melee', cost: '25 gp', weight: '2 lb', damage: '1d8 piercing', properties: 'Finesse', city: true },
            { name: 'Scimitar', subcategory: 'Martial Melee', cost: '25 gp', weight: '3 lb', damage: '1d6 slashing', properties: 'Finesse, Light', city: true },
            { name: 'Shortsword', subcategory: 'Martial Melee', cost: '10 gp', weight: '2 lb', damage: '1d6 piercing', properties: 'Finesse, Light', town: true, city: true },
            { name: 'Trident', subcategory: 'Martial Melee', cost: '5 gp', weight: '4 lb', damage: '1d6 piercing', properties: 'Thrown (20/60), Versatile (1d8)', town: true, city: true },
            { name: 'War Pick', subcategory: 'Martial Melee', cost: '5 gp', weight: '2 lb', damage: '1d8 piercing', properties: '—', town: true, city: true },
            { name: 'Warhammer', subcategory: 'Martial Melee', cost: '15 gp', weight: '2 lb', damage: '1d8 bludgeoning', properties: 'Versatile (1d10)', town: true, city: true },
            { name: 'Whip', subcategory: 'Martial Melee', cost: '2 gp', weight: '3 lb', damage: '1d4 slashing', properties: 'Finesse, Reach', city: true },
            { name: 'Blowgun', subcategory: 'Martial Ranged', cost: '10 gp', weight: '1 lb', damage: '1 piercing', properties: 'Ammunition (25/100), Loading', city: true },
            { name: 'Hand Crossbow', subcategory: 'Martial Ranged', cost: '75 gp', weight: '3 lb', damage: '1d6 piercing', properties: 'Ammunition (30/120), Light, Loading', city: true },
            { name: 'Heavy Crossbow', subcategory: 'Martial Ranged', cost: '50 gp', weight: '18 lb', damage: '1d10 piercing', properties: 'Ammunition (100/400), Heavy, Loading, Two-Handed', city: true },
            { name: 'Longbow', subcategory: 'Martial Ranged', cost: '50 gp', weight: '2 lb', damage: '1d8 piercing', properties: 'Ammunition (150/600), Heavy, Two-Handed', city: true },
            { name: 'Net', subcategory: 'Martial Ranged', cost: '1 gp', weight: '3 lb', damage: '—', properties: 'Special, Thrown (5/15)', town: true, city: true }
        ]
    },
    armor: {
        name: 'Armor',
        items: [
            { name: 'Padded', subcategory: 'Light Armor', cost: '5 gp', weight: '8 lb', ac: '11 + Dex modifier', properties: 'Disadvantage on Stealth', village: true, town: true, city: true },
            { name: 'Leather', subcategory: 'Light Armor', cost: '10 gp', weight: '10 lb', ac: '11 + Dex modifier', properties: '—', village: true, town: true, city: true },
            { name: 'Studded Leather', subcategory: 'Light Armor', cost: '45 gp', weight: '13 lb', ac: '12 + Dex modifier', properties: '—', town: true, city: true },
            { name: 'Hide', subcategory: 'Medium Armor', cost: '10 gp', weight: '12 lb', ac: '12 + Dex modifier (max 2)', properties: '—', village: true, town: true, city: true },
            { name: 'Chain Shirt', subcategory: 'Medium Armor', cost: '50 gp', weight: '20 lb', ac: '13 + Dex modifier (max 2)', properties: '—', town: true, city: true },
            { name: 'Scale Mail', subcategory: 'Medium Armor', cost: '50 gp', weight: '45 lb', ac: '14 + Dex modifier (max 2)', properties: 'Disadvantage on Stealth', town: true, city: true },
            { name: 'Breastplate', subcategory: 'Medium Armor', cost: '400 gp', weight: '20 lb', ac: '14 + Dex modifier (max 2)', properties: '—', city: true },
            { name: 'Half Plate', subcategory: 'Medium Armor', cost: '750 gp', weight: '40 lb', ac: '15 + Dex modifier (max 2)', properties: 'Disadvantage on Stealth', city: true },
            { name: 'Ring Mail', subcategory: 'Heavy Armor', cost: '30 gp', weight: '40 lb', ac: '14', properties: 'Disadvantage on Stealth', town: true, city: true },
            { name: 'Chain Mail', subcategory: 'Heavy Armor', cost: '75 gp', weight: '55 lb', ac: '16', properties: 'Str 13, Disadvantage on Stealth', city: true },
            { name: 'Splint', subcategory: 'Heavy Armor', cost: '200 gp', weight: '60 lb', ac: '17', properties: 'Str 15, Disadvantage on Stealth', city: true },
            { name: 'Plate', subcategory: 'Heavy Armor', cost: '1,500 gp', weight: '65 lb', ac: '18', properties: 'Str 15, Disadvantage on Stealth', city: true },
            { name: 'Shield', subcategory: 'Shield', cost: '10 gp', weight: '6 lb', ac: '+2', properties: '—', village: true, town: true, city: true }
        ]
    },
    gear: {
        name: 'Adventuring Gear',
        items: [
            { name: 'Backpack', subcategory: 'Equipment Packs', cost: '2 gp', weight: '5 lb', description: 'Holds 1 cubic foot/30 pounds', village: true, town: true, city: true },
            { name: 'Bedroll', subcategory: 'Equipment', cost: '1 gp', weight: '7 lb', description: 'For camping', village: true, town: true, city: true },
            { name: 'Bell', subcategory: 'Equipment', cost: '1 gp', weight: '—', description: 'Makes noise', town: true, city: true },
            { name: 'Blanket', subcategory: 'Equipment', cost: '0.5 gp', weight: '3 lb', description: 'For warmth', village: true, town: true, city: true },
            { name: 'Block and Tackle', subcategory: 'Equipment', cost: '1 gp', weight: '5 lb', description: 'Pulley system', town: true, city: true },
            { name: 'Book', subcategory: 'Equipment', cost: '25 gp', weight: '5 lb', description: 'A book with blank pages', city: true },
            { name: 'Bottle, glass', subcategory: 'Equipment', cost: '2 gp', weight: '2 lb', description: 'Holds 1.5 pints', village: true, town: true, city: true },
            { name: 'Bucket', subcategory: 'Equipment', cost: '0.05 gp', weight: '2 lb', description: 'Holds 3 gallons', village: true, town: true, city: true },
            { name: 'Caltrops (bag of 20)', subcategory: 'Equipment', cost: '1 gp', weight: '2 lb', description: 'Area denial', town: true, city: true },
            { name: 'Candle', subcategory: 'Equipment', cost: '0.01 gp', weight: '—', description: 'Light source, 1 hour', village: true, town: true, city: true },
            { name: 'Chain (10 feet)', subcategory: 'Equipment', cost: '5 gp', weight: '10 lb', description: 'Can be burst with DC 20 Str check', town: true, city: true },
            { name: 'Chest', subcategory: 'Equipment', cost: '5 gp', weight: '25 lb', description: 'Holds 12 cubic feet/300 pounds', village: true, town: true, city: true },
            { name: 'Climber\'s Kit', subcategory: 'Equipment', cost: '25 gp', weight: '12 lb', description: 'Pitons, boot tips, gloves, harness', town: true, city: true },
            { name: 'Clothes, Common', subcategory: 'Equipment', cost: '0.5 gp', weight: '3 lb', description: 'Basic clothing', village: true, town: true, city: true },
            { name: 'Clothes, Costume', subcategory: 'Equipment', cost: '5 gp', weight: '4 lb', description: 'For disguises', town: true, city: true },
            { name: 'Clothes, Fine', subcategory: 'Equipment', cost: '15 gp', weight: '6 lb', description: 'Fancy clothing', city: true },
            { name: 'Clothes, Traveler\'s', subcategory: 'Equipment', cost: '2 gp', weight: '4 lb', description: 'Boots, coat, etc.', village: true, town: true, city: true },
            { name: 'Crowbar', subcategory: 'Equipment', cost: '2 gp', weight: '5 lb', description: 'Advantage on Str checks', village: true, town: true, city: true },
            { name: 'Flask or Tankard', subcategory: 'Equipment', cost: '0.02 gp', weight: '1 lb', description: 'Holds 1 pint', village: true, town: true, city: true },
            { name: 'Grappling Hook', subcategory: 'Equipment', cost: '2 gp', weight: '4 lb', description: 'For climbing', town: true, city: true },
            { name: 'Hammer', subcategory: 'Equipment', cost: '1 gp', weight: '3 lb', description: 'For hitting things', village: true, town: true, city: true },
            { name: 'Healer\'s Kit', subcategory: 'Equipment', cost: '5 gp', weight: '3 lb', description: '10 uses, stabilize dying', town: true, city: true },
            { name: 'Holy Symbol', subcategory: 'Equipment', cost: '5 gp', weight: '1 lb', description: 'Spellcasting focus', town: true, city: true },
            { name: 'Hourglass', subcategory: 'Equipment', cost: '25 gp', weight: '1 lb', description: 'Measures time', city: true },
            { name: 'Ink (1 ounce bottle)', subcategory: 'Equipment', cost: '10 gp', weight: '—', description: 'For writing', town: true, city: true },
            { name: 'Ink Pen', subcategory: 'Equipment', cost: '0.02 gp', weight: '—', description: 'For writing', town: true, city: true },
            { name: 'Ladder (10-foot)', subcategory: 'Equipment', cost: '0.1 gp', weight: '25 lb', description: 'For climbing', village: true, town: true, city: true },
            { name: 'Lamp', subcategory: 'Equipment', cost: '0.5 gp', weight: '1 lb', description: 'Light source, 6 hours/pint', village: true, town: true, city: true },
            { name: 'Lantern, Bullseye', subcategory: 'Equipment', cost: '10 gp', weight: '2 lb', description: '60 ft cone, 6 hours/pint', town: true, city: true },
            { name: 'Lantern, Hooded', subcategory: 'Equipment', cost: '5 gp', weight: '2 lb', description: '30 ft radius, 6 hours/pint', town: true, city: true },
            { name: 'Lock', subcategory: 'Equipment', cost: '10 gp', weight: '1 lb', description: 'DC 15 to pick', town: true, city: true },
            { name: 'Manacles', subcategory: 'Equipment', cost: '2 gp', weight: '6 lb', description: 'DC 20 Str or Dex to escape', town: true, city: true },
            { name: 'Mirror, steel', subcategory: 'Equipment', cost: '5 gp', weight: '0.5 lb', description: 'For looking', town: true, city: true },
            { name: 'Oil (flask)', subcategory: 'Equipment', cost: '0.1 gp', weight: '1 lb', description: 'Fuel or weapon', village: true, town: true, city: true },
            { name: 'Paper (one sheet)', subcategory: 'Equipment', cost: '0.2 gp', weight: '—', description: 'For writing', town: true, city: true },
            { name: 'Parchment (one sheet)', subcategory: 'Equipment', cost: '0.1 gp', weight: '—', description: 'For writing', town: true, city: true },
            { name: 'Perfume (vial)', subcategory: 'Equipment', cost: '5 gp', weight: '—', description: 'Smells nice', city: true },
            { name: 'Piton', subcategory: 'Equipment', cost: '0.05 gp', weight: '0.25 lb', description: 'For climbing', town: true, city: true },
            { name: 'Poison, Basic (vial)', subcategory: 'Equipment', cost: '100 gp', weight: '—', description: '1d4 poison damage', city: true },
            { name: 'Pouch', subcategory: 'Equipment', cost: '0.5 gp', weight: '1 lb', description: 'Holds 1/5 cubic foot/6 pounds', village: true, town: true, city: true },
            { name: 'Quiver', subcategory: 'Equipment', cost: '1 gp', weight: '1 lb', description: 'Holds 20 arrows', village: true, town: true, city: true },
            { name: 'Ram, Portable', subcategory: 'Equipment', cost: '4 gp', weight: '35 lb', description: '+4 bonus to break doors', town: true, city: true },
            { name: 'Rations (1 day)', subcategory: 'Equipment', cost: '0.5 gp', weight: '2 lb', description: 'Dried food', village: true, town: true, city: true },
            { name: 'Rope, hempen (50 feet)', subcategory: 'Equipment', cost: '1 gp', weight: '10 lb', description: '2 hit points, AC 11', village: true, town: true, city: true },
            { name: 'Rope, silk (50 feet)', subcategory: 'Equipment', cost: '10 gp', weight: '5 lb', description: '2 hit points, AC 11', city: true },
            { name: 'Sack', subcategory: 'Equipment', cost: '0.01 gp', weight: '0.5 lb', description: 'Holds 1 cubic foot/30 pounds', village: true, town: true, city: true },
            { name: 'Scale, Merchant\'s', subcategory: 'Equipment', cost: '5 gp', weight: '3 lb', description: 'Weighs things', town: true, city: true },
            { name: 'Sealing Wax', subcategory: 'Equipment', cost: '0.5 gp', weight: '—', description: 'For sealing letters', town: true, city: true },
            { name: 'Shovel', subcategory: 'Equipment', cost: '2 gp', weight: '5 lb', description: 'For digging', village: true, town: true, city: true },
            { name: 'Signal Whistle', subcategory: 'Equipment', cost: '0.05 gp', weight: '—', description: 'Makes noise', village: true, town: true, city: true },
            { name: 'Signet Ring', subcategory: 'Equipment', cost: '5 gp', weight: '—', description: 'For sealing', city: true },
            { name: 'Soap', subcategory: 'Equipment', cost: '0.02 gp', weight: '—', description: 'For cleaning', village: true, town: true, city: true },
            { name: 'Spellbook', subcategory: 'Equipment', cost: '50 gp', weight: '3 lb', description: 'For wizards', city: true },
            { name: 'Spikes, iron (10)', subcategory: 'Equipment', cost: '1 gp', weight: '5 lb', description: 'For securing', village: true, town: true, city: true },
            { name: 'Spyglass', subcategory: 'Equipment', cost: '1,000 gp', weight: '1 lb', description: 'See far away', city: true },
            { name: 'Tent, two-person', subcategory: 'Equipment', cost: '2 gp', weight: '20 lb', description: 'For camping', village: true, town: true, city: true },
            { name: 'Tinderbox', subcategory: 'Equipment', cost: '0.5 gp', weight: '1 lb', description: 'Start fires', village: true, town: true, city: true },
            { name: 'Torch', subcategory: 'Equipment', cost: '0.01 gp', weight: '1 lb', description: 'Light source, 1 hour', village: true, town: true, city: true },
            { name: 'Waterskin', subcategory: 'Equipment', cost: '0.2 gp', weight: '5 lb (full)', description: 'Holds 4 pints liquid', village: true, town: true, city: true },
            { name: 'Whetstone', subcategory: 'Equipment', cost: '0.01 gp', weight: '1 lb', description: 'Sharpen weapons', village: true, town: true, city: true }
        ]
    },
    tools: {
        name: 'Tools',
        items: [
            { name: 'Alchemist\'s Supplies', subcategory: 'Artisan\'s Tools', cost: '50 gp', weight: '8 lb', description: 'Create alchemical items', city: true },
            { name: 'Brewer\'s Supplies', subcategory: 'Artisan\'s Tools', cost: '20 gp', weight: '9 lb', description: 'Brew beer and ale', town: true, city: true },
            { name: 'Calligrapher\'s Supplies', subcategory: 'Artisan\'s Tools', cost: '10 gp', weight: '5 lb', description: 'Write decoratively', city: true },
            { name: 'Carpenter\'s Tools', subcategory: 'Artisan\'s Tools', cost: '8 gp', weight: '6 lb', description: 'Build wooden items', village: true, town: true, city: true },
            { name: 'Cartographer\'s Tools', subcategory: 'Artisan\'s Tools', cost: '15 gp', weight: '6 lb', description: 'Create maps', city: true },
            { name: 'Cobbler\'s Tools', subcategory: 'Artisan\'s Tools', cost: '5 gp', weight: '5 lb', description: 'Repair shoes', village: true, town: true, city: true },
            { name: 'Cook\'s Utensils', subcategory: 'Artisan\'s Tools', cost: '1 gp', weight: '8 lb', description: 'Prepare meals', village: true, town: true, city: true },
            { name: 'Glassblower\'s Tools', subcategory: 'Artisan\'s Tools', cost: '30 gp', weight: '5 lb', description: 'Work glass', city: true },
            { name: 'Jeweler\'s Tools', subcategory: 'Artisan\'s Tools', cost: '25 gp', weight: '2 lb', description: 'Work jewelry', city: true },
            { name: 'Leatherworker\'s Tools', subcategory: 'Artisan\'s Tools', cost: '5 gp', weight: '5 lb', description: 'Work leather', town: true, city: true },
            { name: 'Mason\'s Tools', subcategory: 'Artisan\'s Tools', cost: '10 gp', weight: '8 lb', description: 'Work stone', town: true, city: true },
            { name: 'Painter\'s Supplies', subcategory: 'Artisan\'s Tools', cost: '10 gp', weight: '5 lb', description: 'Create paintings', city: true },
            { name: 'Potter\'s Tools', subcategory: 'Artisan\'s Tools', cost: '10 gp', weight: '3 lb', description: 'Create pottery', village: true, town: true, city: true },
            { name: 'Smith\'s Tools', subcategory: 'Artisan\'s Tools', cost: '20 gp', weight: '8 lb', description: 'Work metal', town: true, city: true },
            { name: 'Tinker\'s Tools', subcategory: 'Artisan\'s Tools', cost: '50 gp', weight: '10 lb', description: 'Repair items', town: true, city: true },
            { name: 'Weaver\'s Tools', subcategory: 'Artisan\'s Tools', cost: '1 gp', weight: '5 lb', description: 'Work textiles', village: true, town: true, city: true },
            { name: 'Woodcarver\'s Tools', subcategory: 'Artisan\'s Tools', cost: '1 gp', weight: '5 lb', description: 'Carve wood', village: true, town: true, city: true },
            { name: 'Dice Set', subcategory: 'Gaming Set', cost: '0.1 gp', weight: '—', description: 'For gambling', village: true, town: true, city: true },
            { name: 'Playing Card Set', subcategory: 'Gaming Set', cost: '0.5 gp', weight: '—', description: 'For gambling', village: true, town: true, city: true },
            { name: 'Disguise Kit', subcategory: 'Other Tools', cost: '25 gp', weight: '3 lb', description: 'Create disguises', city: true },
            { name: 'Forgery Kit', subcategory: 'Other Tools', cost: '15 gp', weight: '5 lb', description: 'Forge documents', city: true },
            { name: 'Herbalism Kit', subcategory: 'Other Tools', cost: '5 gp', weight: '3 lb', description: 'Identify and use herbs', village: true, town: true, city: true },
            { name: 'Navigator\'s Tools', subcategory: 'Other Tools', cost: '25 gp', weight: '2 lb', description: 'Chart courses', city: true },
            { name: 'Poisoner\'s Kit', subcategory: 'Other Tools', cost: '50 gp', weight: '2 lb', description: 'Create poison', city: true },
            { name: 'Thieves\' Tools', subcategory: 'Other Tools', cost: '25 gp', weight: '1 lb', description: 'Pick locks', city: true }
        ]
    },
    food: {
        name: 'Food, Drink & Lodging',
        items: [
            { name: 'Ale (mug)', subcategory: 'Drink', cost: '0.04 gp', weight: '—', description: 'Per mug', village: true, town: true, city: true },
            { name: 'Wine, Common (pitcher)', subcategory: 'Drink', cost: '0.2 gp', weight: '—', description: 'Per pitcher', village: true, town: true, city: true },
            { name: 'Wine, Fine (bottle)', subcategory: 'Drink', cost: '10 gp', weight: '—', description: 'Per bottle', city: true },
            { name: 'Bread (loaf)', subcategory: 'Food', cost: '0.02 gp', weight: '0.5 lb', description: 'Fresh bread', village: true, town: true, city: true },
            { name: 'Cheese (hunk)', subcategory: 'Food', cost: '0.1 gp', weight: '0.5 lb', description: 'Cheese wedge', village: true, town: true, city: true },
            { name: 'Meat (chunk)', subcategory: 'Food', cost: '0.3 gp', weight: '0.5 lb', description: 'Cooked meat', village: true, town: true, city: true },
            { name: 'Inn Stay (per day), Squalid', subcategory: 'Lodging', cost: '0.07 gp', weight: '—', description: 'Poor conditions', village: true, town: true, city: true },
            { name: 'Inn Stay (per day), Poor', subcategory: 'Lodging', cost: '0.14 gp', weight: '—', description: 'Below average', village: true, town: true, city: true },
            { name: 'Inn Stay (per day), Modest', subcategory: 'Lodging', cost: '0.5 gp', weight: '—', description: 'Average quality', village: true, town: true, city: true },
            { name: 'Inn Stay (per day), Comfortable', subcategory: 'Lodging', cost: '0.8 gp', weight: '—', description: 'Good quality', town: true, city: true },
            { name: 'Inn Stay (per day), Wealthy', subcategory: 'Lodging', cost: '2 gp', weight: '—', description: 'High quality', city: true },
            { name: 'Inn Stay (per day), Aristocratic', subcategory: 'Lodging', cost: '4 gp', weight: '—', description: 'Luxury', city: true },
            { name: 'Meal, Squalid', subcategory: 'Meals', cost: '0.03 gp', weight: '—', description: 'Poor quality food', village: true, town: true, city: true },
            { name: 'Meal, Poor', subcategory: 'Meals', cost: '0.06 gp', weight: '—', description: 'Below average food', village: true, town: true, city: true },
            { name: 'Meal, Modest', subcategory: 'Meals', cost: '0.3 gp', weight: '—', description: 'Average quality food', village: true, town: true, city: true },
            { name: 'Meal, Comfortable', subcategory: 'Meals', cost: '0.5 gp', weight: '—', description: 'Good food', town: true, city: true },
            { name: 'Meal, Wealthy', subcategory: 'Meals', cost: '1 gp', weight: '—', description: 'Fine dining', city: true },
            { name: 'Meal, Aristocratic', subcategory: 'Meals', cost: '2 gp', weight: '—', description: 'Gourmet meal', city: true }
        ]
    },
    services: {
        name: 'Services',
        items: [
            { name: 'Coach cab (between towns)', subcategory: 'Transportation', cost: '0.03 gp per mile', weight: '—', description: 'Passenger transport', town: true, city: true },
            { name: 'Coach cab (within city)', subcategory: 'Transportation', cost: '0.01 gp', weight: '—', description: 'City transport', city: true },
            { name: 'Messenger', subcategory: 'Services', cost: '0.02 gp per mile', weight: '—', description: 'Delivers messages', village: true, town: true, city: true },
            { name: 'Road/gate toll', subcategory: 'Services', cost: '0.01 gp', weight: '—', description: 'Access fee', town: true, city: true },
            { name: 'Ship passage', subcategory: 'Transportation', cost: '0.1 gp per mile', weight: '—', description: 'Sea travel', city: true },
            { name: 'Skilled hireling (per day)', subcategory: 'Hireling', cost: '2 gp', weight: '—', description: 'Artisan, scribe, etc.', town: true, city: true },
            { name: 'Unskilled hireling (per day)', subcategory: 'Hireling', cost: '0.2 gp', weight: '—', description: 'Laborer', village: true, town: true, city: true }
        ]
    },
    transport: {
        name: 'Transportation & Mounts',
        items: [
            { name: 'Camel', subcategory: 'Mounts', cost: '50 gp', weight: '—', description: 'Speed 50 ft, Carry 480 lb', town: true, city: true },
            { name: 'Donkey or mule', subcategory: 'Mounts', cost: '8 gp', weight: '—', description: 'Speed 40 ft, Carry 420 lb', village: true, town: true, city: true },
            { name: 'Elephant', subcategory: 'Mounts', cost: '200 gp', weight: '—', description: 'Speed 40 ft, Carry 1,320 lb', city: true },
            { name: 'Horse, draft', subcategory: 'Mounts', cost: '50 gp', weight: '—', description: 'Speed 40 ft, Carry 540 lb', town: true, city: true },
            { name: 'Horse, riding', subcategory: 'Mounts', cost: '75 gp', weight: '—', description: 'Speed 60 ft, Carry 480 lb', town: true, city: true },
            { name: 'Mastiff', subcategory: 'Mounts', cost: '25 gp', weight: '—', description: 'Guard dog', town: true, city: true },
            { name: 'Pony', subcategory: 'Mounts', cost: '30 gp', weight: '—', description: 'Speed 40 ft, Carry 225 lb', village: true, town: true, city: true },
            { name: 'Warhorse', subcategory: 'Mounts', cost: '400 gp', weight: '—', description: 'Speed 60 ft, Carry 540 lb', city: true },
            { name: 'Barding (armor for mount)', subcategory: 'Tack and Harness', cost: '×4 armor cost', weight: '×2 armor weight', description: 'Armor for animals', city: true },
            { name: 'Bit and bridle', subcategory: 'Tack and Harness', cost: '2 gp', weight: '1 lb', description: 'Control mount', village: true, town: true, city: true },
            { name: 'Carriage', subcategory: 'Vehicles', cost: '100 gp', weight: '600 lb', description: 'Drawn vehicle', city: true },
            { name: 'Cart', subcategory: 'Vehicles', cost: '15 gp', weight: '200 lb', description: 'Simple vehicle', village: true, town: true, city: true },
            { name: 'Chariot', subcategory: 'Vehicles', cost: '250 gp', weight: '100 lb', description: 'Combat vehicle', city: true },
            { name: 'Feed (per day)', subcategory: 'Tack and Harness', cost: '0.05 gp', weight: '10 lb', description: 'Animal food', village: true, town: true, city: true },
            { name: 'Saddle, Exotic', subcategory: 'Tack and Harness', cost: '60 gp', weight: '40 lb', description: 'For unusual mounts', city: true },
            { name: 'Saddle, Military', subcategory: 'Tack and Harness', cost: '20 gp', weight: '30 lb', description: 'Combat saddle', town: true, city: true },
            { name: 'Saddle, Pack', subcategory: 'Tack and Harness', cost: '5 gp', weight: '15 lb', description: 'Cargo saddle', village: true, town: true, city: true },
            { name: 'Saddle, Riding', subcategory: 'Tack and Harness', cost: '10 gp', weight: '25 lb', description: 'Standard saddle', village: true, town: true, city: true },
            { name: 'Saddlebags', subcategory: 'Tack and Harness', cost: '4 gp', weight: '8 lb', description: 'Storage for mount', village: true, town: true, city: true },
            { name: 'Sled', subcategory: 'Vehicles', cost: '20 gp', weight: '300 lb', description: 'Snow vehicle', village: true, town: true, city: true },
            { name: 'Stabling (per day)', subcategory: 'Tack and Harness', cost: '0.5 gp', weight: '—', description: 'Housing for mount', village: true, town: true, city: true },
            { name: 'Wagon', subcategory: 'Vehicles', cost: '35 gp', weight: '400 lb', description: 'Large vehicle', village: true, town: true, city: true },
            { name: 'Galley', subcategory: 'Waterborne Vehicles', cost: '30,000 gp', weight: '—', description: 'Large ship (4 mph)', city: true },
            { name: 'Keelboat', subcategory: 'Waterborne Vehicles', cost: '3,000 gp', weight: '—', description: 'River boat (1 mph)', city: true },
            { name: 'Longship', subcategory: 'Waterborne Vehicles', cost: '10,000 gp', weight: '—', description: 'Sailing ship (3 mph)', city: true },
            { name: 'Rowboat', subcategory: 'Waterborne Vehicles', cost: '50 gp', weight: '100 lb', description: 'Small boat (1.5 mph)', town: true, city: true },
            { name: 'Sailing ship', subcategory: 'Waterborne Vehicles', cost: '10,000 gp', weight: '—', description: 'Ocean vessel (2 mph)', city: true },
            { name: 'Warship', subcategory: 'Waterborne Vehicles', cost: '25,000 gp', weight: '—', description: 'Military vessel (2.5 mph)', city: true }
        ]
    }
};

let currentShopCategory = 'weapons';
let currentSettlementFilter = 'all';

function switchShopCategory(category) {
    currentShopCategory = category;

    // Update active button
    document.querySelectorAll('.shop-tab-button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Render shop items
    renderShopItems();
}

function filterShopItems() {
    currentSettlementFilter = document.getElementById('settlementFilter').value;
    renderShopItems();
}

function renderShopItems() {
    const searchTerm = document.getElementById('shopSearch')?.value.toLowerCase() || '';
    const category = shopData[currentShopCategory];
    const content = document.getElementById('shopContent');

    if (!category || !content) return;

    let items = category.items;

    // Filter by search
    if (searchTerm) {
        items = items.filter(item =>
            item.name.toLowerCase().includes(searchTerm) ||
            item.subcategory.toLowerCase().includes(searchTerm) ||
            (item.description && item.description.toLowerCase().includes(searchTerm))
        );
    }

    // Filter by settlement
    if (currentSettlementFilter !== 'all') {
        items = items.filter(item => item[currentSettlementFilter]);
    }

    // Group by subcategory
    const groupedItems = {};
    items.forEach(item => {
        if (!groupedItems[item.subcategory]) {
            groupedItems[item.subcategory] = [];
        }
        groupedItems[item.subcategory].push(item);
    });

    // Render
    let html = `<h3>${category.name}</h3>`;

    Object.keys(groupedItems).forEach(subcategory => {
        html += `
            <div class="shop-subcategory">
                <h4>${subcategory}</h4>
                <div class="shop-items-grid">
        `;

        groupedItems[subcategory].forEach(item => {
            const availability = [];
            if (item.village) availability.push('Village');
            if (item.town) availability.push('Town');
            if (item.city) availability.push('City');

            html += `
                <div class="shop-item-card">
                    <div class="shop-item-header">
                        <strong>${item.name}</strong>
                        <span class="shop-item-cost">${item.cost}</span>
                    </div>
                    ${item.weight ? `<div class="shop-item-detail">Weight: ${item.weight}</div>` : ''}
                    ${item.damage ? `<div class="shop-item-detail">Damage: ${item.damage}</div>` : ''}
                    ${item.ac ? `<div class="shop-item-detail">AC: ${item.ac}</div>` : ''}
                    ${item.properties ? `<div class="shop-item-detail">Properties: ${item.properties}</div>` : ''}
                    ${item.description ? `<div class="shop-item-description">${item.description}</div>` : ''}
                    <div class="shop-item-availability">${availability.join(', ')}</div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    if (items.length === 0) {
        html += '<p style="text-align: center; color: var(--text-dim); padding: 40px;">No items found</p>';
    }

    content.innerHTML = html;
}

// Reference section spell filtering and rendering
function filterReferenceSpells() {
    renderReferenceSpells();
}

function renderReferenceSpells() {
    const searchTerm = document.getElementById('spellSearch')?.value.toLowerCase() || '';
    const levelFilter = document.getElementById('spellLevelFilter')?.value || 'all';
    const classFilter = document.getElementById('spellClassFilter')?.value || 'all';
    const schoolFilter = document.getElementById('spellSchoolFilter')?.value || 'all';
    const content = document.getElementById('spellContent');

    if (!content || typeof spellsData === 'undefined') return;

    let html = '';
    const levelNames = {
        'cantrip': 'Cantrips',
        'level1': '1st Level Spells',
        'level2': '2nd Level Spells',
        'level3': '3rd Level Spells',
        'level4': '4th Level Spells',
        'level5': '5th Level Spells',
        'level6': '6th Level Spells',
        'level7': '7th Level Spells',
        'level8': '8th Level Spells',
        'level9': '9th Level Spells'
    };

    // Iterate through spell levels
    Object.keys(spellsData).forEach(level => {
        // Skip if level filter is active and doesn't match
        if (levelFilter !== 'all' && levelFilter !== level) return;

        let spells = spellsData[level];

        // Filter by search term
        if (searchTerm) {
            spells = spells.filter(spell =>
                spell.name.toLowerCase().includes(searchTerm) ||
                spell.school.toLowerCase().includes(searchTerm) ||
                spell.desc.toLowerCase().includes(searchTerm) ||
                spell.classes.some(c => c.toLowerCase().includes(searchTerm))
            );
        }

        // Filter by class
        if (classFilter !== 'all') {
            spells = spells.filter(spell => spell.classes.includes(classFilter));
        }

        // Filter by school
        if (schoolFilter !== 'all') {
            spells = spells.filter(spell => spell.school === schoolFilter);
        }

        // Only render if there are spells
        if (spells.length > 0) {
            html += `
                <div class="spell-level-section">
                    <h3>${levelNames[level] || level}</h3>
                    <div class="spell-grid">
            `;

            spells.forEach(spell => {
                html += `
                    <div class="spell-card">
                        <div class="spell-header">
                            <strong>${spell.name}</strong>
                            <span class="spell-school">${spell.school}</span>
                        </div>
                        <div class="spell-classes">${spell.classes.join(', ')}</div>
                        <div class="spell-description">${spell.desc}</div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        }
    });

    if (html === '') {
        html = '<p style="text-align: center; color: var(--text-dim); padding: 40px;">No spells found</p>';
    }

    content.innerHTML = html;
}

// Difficulty slider update
const difficultySlider = document.getElementById('difficulty');
const difficultyIndicator = document.getElementById('difficultyIndicator');

const difficultyNames = ['Easy', 'Medium', 'Hard', 'Very Hard', 'You Gonna Die'];
const difficultyClasses = ['easy', 'medium', 'hard', 'very-hard', 'deadly'];

difficultySlider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    difficultyIndicator.textContent = difficultyNames[value];
    difficultyIndicator.className = 'difficulty-indicator ' + difficultyClasses[value];
});

// Monster count slider update
const monsterCountSlider = document.getElementById('monsterCount');
const monsterCountIndicator = document.getElementById('monsterCountIndicator');

const monsterCountLabels = ['Auto', '1', '2', '3', '4', '5'];

monsterCountSlider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    monsterCountIndicator.textContent = monsterCountLabels[value];
});

// CR to XP mapping
const CR_TO_XP = {
    "0": 10, "1/8": 25, "1/4": 50, "1/2": 100,
    "1": 200, "2": 450, "3": 700, "4": 1100, "5": 1800,
    "6": 2300, "7": 2900, "8": 3900, "9": 5000, "10": 5900,
    "11": 7200, "12": 8400, "13": 10000, "14": 11500, "15": 13000,
    "16": 15000, "17": 18000, "18": 20000, "19": 22000, "20": 25000,
    "21": 33000, "22": 41000, "23": 50000, "24": 62000, "30": 155000
};

// XP Budget per character
const XP_BUDGET = {
    1: { easy: 50, medium: 75, hard: 100, veryhard: 125, deadly: 150 },
    2: { easy: 100, medium: 150, hard: 200, veryhard: 250, deadly: 300 },
    3: { easy: 150, medium: 225, hard: 400, veryhard: 500, deadly: 600 },
    4: { easy: 250, medium: 375, hard: 500, veryhard: 625, deadly: 750 },
    5: { easy: 500, medium: 750, hard: 1100, veryhard: 1375, deadly: 1650 },
    6: { easy: 600, medium: 1000, hard: 1400, veryhard: 1750, deadly: 2100 },
    7: { easy: 750, medium: 1300, hard: 1700, veryhard: 2125, deadly: 2550 },
    8: { easy: 1000, medium: 1700, hard: 2100, veryhard: 2625, deadly: 3150 },
    9: { easy: 1300, medium: 2000, hard: 2600, veryhard: 3250, deadly: 3900 },
    10: { easy: 1600, medium: 2300, hard: 3100, veryhard: 3875, deadly: 4650 },
    11: { easy: 1900, medium: 2900, hard: 4100, veryhard: 5125, deadly: 6150 },
    12: { easy: 2200, medium: 3700, hard: 4700, veryhard: 5875, deadly: 7050 },
    13: { easy: 2600, medium: 4200, hard: 5400, veryhard: 6750, deadly: 8100 },
    14: { easy: 2900, medium: 4900, hard: 6200, veryhard: 7750, deadly: 9300 },
    15: { easy: 3300, medium: 5400, hard: 7800, veryhard: 9750, deadly: 11700 },
    16: { easy: 3800, medium: 6100, hard: 9800, veryhard: 12250, deadly: 14700 },
    17: { easy: 4500, medium: 7200, hard: 11700, veryhard: 14625, deadly: 17550 },
    18: { easy: 5000, medium: 8700, hard: 14200, veryhard: 17750, deadly: 21300 },
    19: { easy: 5500, medium: 10700, hard: 17200, veryhard: 21500, deadly: 25800 },
    20: { easy: 6400, medium: 13200, hard: 22000, veryhard: 27500, deadly: 33000 }
};

// Generate encounter
async function generateEncounter() {
    const partyLevel = parseInt(document.getElementById('partyLevel').value);
    const partySize = parseInt(document.getElementById('partySize').value);
    const difficultyValue = parseInt(document.getElementById('difficulty').value);
    const monsterCountValue = parseInt(document.getElementById('monsterCount').value);
    const monsterCountPref = monsterCountValue === 0 ? 'auto' : monsterCountValue.toString();

    const difficultyMap = ['easy', 'medium', 'hard', 'veryhard', 'deadly'];
    const difficulty = difficultyMap[difficultyValue];

    // Calculate XP budget
    const xpPerCharacter = XP_BUDGET[partyLevel][difficulty];
    const totalXPBudget = xpPerCharacter * partySize;

    // Determine CR range based on difficulty
    let minCR, maxCR;
    if (difficulty === 'easy') {
        minCR = Math.max(0, partyLevel - 3);
        maxCR = Math.max(1, partyLevel - 1);
    } else if (difficulty === 'medium') {
        minCR = Math.max(0, partyLevel - 2);
        maxCR = partyLevel;
    } else if (difficulty === 'hard') {
        minCR = Math.max(0, partyLevel - 1);
        maxCR = partyLevel + 1;
    } else if (difficulty === 'veryhard') {
        minCR = partyLevel;
        maxCR = partyLevel + 2;
    } else { // deadly
        minCR = partyLevel;
        maxCR = partyLevel + 3;
    }

    // Get eligible monsters
    const eligibleMonsters = allMonsters.filter(monster => {
        const cr = parseCR(monster.cr);
        return cr >= minCR && cr <= maxCR;
    });

    if (eligibleMonsters.length === 0) {
        document.getElementById('encounterResult').innerHTML =
            '<div class="error">No monsters found in CR range ' + minCR + '-' + maxCR + '</div>';
        return;
    }

    // Select monsters for encounter
    const encounter = selectMonstersForEncounter(eligibleMonsters, totalXPBudget, partySize, monsterCountPref);

    // Display encounter
    displayEncounter(encounter, {
        partyLevel,
        partySize,
        difficulty: difficultyNames[difficultyValue],
        xpBudget: totalXPBudget,
        difficultyClass: difficultyClasses[difficultyValue]
    });
}

// Select monsters for encounter
function selectMonstersForEncounter(eligibleMonsters, xpBudget, partySize, monsterCountPref) {
    const selectedMonsters = [];
    let totalXP = 0;

    // Determine max monsters based on preference
    const maxMonsters = monsterCountPref === 'auto'
        ? Math.min(partySize + 1, 5)
        : parseInt(monsterCountPref);

    // If specific count requested, try to build encounter with that many monsters
    if (monsterCountPref !== 'auto') {
        const targetCount = parseInt(monsterCountPref);
        const targetXPPerMonster = xpBudget / targetCount;

        // Find monsters closest to target XP
        const monsterPool = eligibleMonsters
            .map(m => ({
                ...m,
                xp: CR_TO_XP[m.cr],
                diff: Math.abs(CR_TO_XP[m.cr] - targetXPPerMonster)
            }))
            .sort((a, b) => a.diff - b.diff);

        // Pick best fitting monsters
        let remainingCount = targetCount;
        let remainingBudget = xpBudget;

        for (const monster of monsterPool) {
            if (remainingCount === 0) break;

            const avgBudgetPerRemaining = remainingBudget / remainingCount;

            if (monster.xp <= avgBudgetPerRemaining * 1.5) {
                const existing = selectedMonsters.find(sm => sm.name === monster.name);

                if (existing) {
                    existing.count++;
                } else {
                    selectedMonsters.push({
                        ...monster,
                        count: 1
                    });
                }

                totalXP += monster.xp;
                remainingBudget -= monster.xp;
                remainingCount--;
            }
        }

        if (selectedMonsters.length > 0) {
            return selectedMonsters;
        }
        // Fall back to auto if specific count didn't work
    }

    // Auto mode or fallback
    // Try to find single monster first (ideal for small parties)
    if (partySize <= 2 && monsterCountPref === 'auto') {
        const singleMonster = eligibleMonsters
            .map(m => ({ ...m, xp: CR_TO_XP[m.cr], diff: Math.abs(CR_TO_XP[m.cr] - xpBudget) }))
            .sort((a, b) => a.diff - b.diff)[0];

        if (singleMonster && singleMonster.diff <= xpBudget * 0.5) {
            return [{
                ...singleMonster,
                count: 1
            }];
        }
    }

    // For larger parties or if single monster not ideal, build encounter
    const monsterPool = [...eligibleMonsters]
        .map(m => ({ ...m, xp: CR_TO_XP[m.cr] }))
        .sort((a, b) => b.xp - a.xp); // Start with higher CR

    let remainingBudget = xpBudget;
    let attempts = 0;
    const maxAttempts = 100;

    while (remainingBudget > 0 && selectedMonsters.length < maxMonsters && attempts < maxAttempts) {
        attempts++;

        // Find monster that fits budget
        const suitableMonster = monsterPool.find(m => m.xp <= remainingBudget * 1.3);

        if (!suitableMonster) break;

        // Check if we already have this monster
        const existing = selectedMonsters.find(sm => sm.name === suitableMonster.name);

        if (existing) {
            existing.count++;
            totalXP += suitableMonster.xp;
            remainingBudget -= suitableMonster.xp;
        } else {
            selectedMonsters.push({
                ...suitableMonster,
                count: 1
            });
            totalXP += suitableMonster.xp;
            remainingBudget -= suitableMonster.xp;
        }

        // If we're close to budget, stop
        if (remainingBudget < xpBudget * 0.15) break;
    }

    return selectedMonsters;
}

// Current encounter storage
let currentEncounter = null;

// Display encounter
function displayEncounter(monsters, params) {
    const totalXP = monsters.reduce((sum, m) => sum + (m.xp * m.count), 0);
    const totalMonsters = monsters.reduce((sum, m) => sum + m.count, 0);

    const winChance = calculateWinChance(params.difficulty);

    // Store current encounter for saving
    currentEncounter = {
        monsters,
        params,
        totalXP,
        totalMonsters,
        winChance
    };

    const html = `
        <div class="encounter-header">
            <div class="encounter-title">
                ${params.difficulty} Encounter - Level ${params.partyLevel} Party (${params.partySize} players)
            </div>
            <div class="encounter-stats">
                <div class="encounter-stat">
                    <div class="encounter-stat-label">XP Budget</div>
                    <div class="encounter-stat-value">${params.xpBudget} XP</div>
                </div>
                <div class="encounter-stat">
                    <div class="encounter-stat-label">Actual XP</div>
                    <div class="encounter-stat-value">${totalXP} XP</div>
                </div>
                <div class="encounter-stat">
                    <div class="encounter-stat-label">Win Chance</div>
                    <div class="encounter-stat-value ${params.difficultyClass}">${winChance}%</div>
                </div>
            </div>
            <button class="save-encounter-btn" onclick="saveEncounterPrompt()">💾 Save Encounter</button>
        </div>

        <div class="encounter-monsters">
            ${monsters.map(monster => `
                <div class="encounter-monster-card" onclick="viewMonsterFromEncounter('${monster.name}')">
                    <div class="encounter-monster-header">
                        <div class="encounter-monster-name">
                            ${monster.count > 1 ? `${monster.count}× ` : ''}${monster.name}
                        </div>
                        <div class="encounter-monster-cr">CR ${monster.cr}</div>
                    </div>
                    <div class="encounter-monster-info">
                        ${monster.type} • ${monster.size}
                    </div>
                    <div class="encounter-monster-xp">
                        ${monster.xp} XP ${monster.count > 1 ? `(${monster.xp * monster.count} total)` : ''}
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="encounter-summary">
            <h3>Encounter Summary</h3>
            <div class="encounter-summary-grid">
                <div class="summary-item">
                    <span class="summary-label">Total Monsters:</span>
                    <span class="summary-value">${totalMonsters}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Total XP:</span>
                    <span class="summary-value">${totalXP} XP</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Difficulty:</span>
                    <span class="summary-value ${params.difficultyClass}">${params.difficulty}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Budget Used:</span>
                    <span class="summary-value">${Math.round((totalXP / params.xpBudget) * 100)}%</span>
                </div>
            </div>
        </div>
    `;

    document.getElementById('encounterResult').innerHTML = html;
}

// Calculate win chance based on difficulty
function calculateWinChance(difficulty) {
    const chances = {
        'Easy': 95,
        'Medium': 75,
        'Hard': 50,
        'Very Hard': 25,
        'You Gonna Die': 5
    };
    return chances[difficulty] || 50;
}

// View monster from encounter (switch to browser section and load monster)
function viewMonsterFromEncounter(name) {
    switchSection('browser');
    setTimeout(() => {
        loadMonster(name);
    }, 100);
}

// Subclass options for each class (D&D 2024)
const subclasses = {
    Barbarian: ['Path of the Berserker', 'Path of the Wild Heart', 'Path of the World Tree', 'Path of the Zealot'],
    Bard: ['College of Dance', 'College of Glamour', 'College of Lore', 'College of Valor'],
    Cleric: ['Life Domain', 'Light Domain', 'Trickery Domain', 'War Domain'],
    Druid: ['Circle of the Land', 'Circle of the Moon', 'Circle of the Sea', 'Circle of the Stars'],
    Fighter: ['Battle Master', 'Champion', 'Eldritch Knight', 'Psi Warrior'],
    Monk: ['Warrior of Mercy', 'Warrior of Shadow', 'Warrior of the Elements', 'Warrior of the Open Hand'],
    Paladin: ['Oath of Devotion', 'Oath of Glory', 'Oath of the Ancients', 'Oath of Vengeance'],
    Ranger: ['Beast Master', 'Fey Wanderer', 'Gloom Stalker', 'Hunter'],
    Rogue: ['Arcane Trickster', 'Assassin', 'Soulknife', 'Thief'],
    Sorcerer: ['Aberrant Sorcery', 'Clockwork Sorcery', 'Draconic Sorcery', 'Wild Magic Sorcery'],
    Warlock: ['Archfey Patron', 'Celestial Patron', 'Fiend Patron', 'Great Old One Patron'],
    Wizard: ['Abjurer', 'Diviner', 'Evoker', 'Illusionist']
};

// Class saving throw proficiencies (D&D 2024)
const classSavingThrows = {
    Barbarian: ['str', 'con'],
    Bard: ['dex', 'cha'],
    Cleric: ['wis', 'cha'],
    Druid: ['int', 'wis'],
    Fighter: ['str', 'con'],
    Monk: ['str', 'dex'],
    Paladin: ['wis', 'cha'],
    Ranger: ['str', 'dex'],
    Rogue: ['dex', 'int'],
    Sorcerer: ['con', 'cha'],
    Warlock: ['wis', 'cha'],
    Wizard: ['int', 'wis']
};

// Species subspecies options (D&D 2024)
const subspecies = {
    Aasimar: ['Celestial', 'Fallen', 'Protector', 'Scourge'],
    Dragonborn: ['Black Dragon', 'Blue Dragon', 'Brass Dragon', 'Bronze Dragon', 'Copper Dragon', 'Gold Dragon', 'Green Dragon', 'Red Dragon', 'Silver Dragon', 'White Dragon'],
    Dwarf: ['Hill Dwarf', 'Mountain Dwarf', 'Duergar'],
    Elf: ['High Elf', 'Wood Elf', 'Dark Elf (Drow)', 'Eladrin', 'Sea Elf'],
    Gnome: ['Forest Gnome', 'Rock Gnome', 'Deep Gnome (Svirfneblin)'],
    Goliath: ['Cloud Giant', 'Fire Giant', 'Frost Giant', 'Hill Giant', 'Stone Giant', 'Storm Giant'],
    'Half-Elf': [],
    Halfling: ['Lightfoot', 'Stout'],
    Human: [],
    Orc: [],
    Tiefling: ['Asmodeus', 'Baalzebul', 'Dispater', 'Fierna', 'Glasya', 'Levistus', 'Mammon', 'Mephistopheles', 'Zariel']
};

// Update subspecies dropdown based on selected species
function updateSubspeciesOptions() {
    const speciesSelect = document.getElementById('charSpecies');
    const subspeciesSelect = document.getElementById('charSubspecies');

    if (!speciesSelect || !subspeciesSelect) return;

    const selectedSpecies = speciesSelect.value;

    // Clear current options
    subspeciesSelect.innerHTML = '<option value="">Select subspecies</option>';

    // Add subspecies options for selected species
    if (selectedSpecies && subspecies[selectedSpecies] && subspecies[selectedSpecies].length > 0) {
        subspecies[selectedSpecies].forEach(sub => {
            const option = document.createElement('option');
            option.value = sub;
            option.textContent = sub;
            subspeciesSelect.appendChild(option);
        });
        subspeciesSelect.disabled = false;
    } else {
        subspeciesSelect.disabled = true;
    }
}

// Update subclass dropdown based on selected class
function updateSubclassOptions() {
    const classSelect = document.getElementById('charClass');
    const subclassSelect = document.getElementById('charSubclass');

    if (!classSelect || !subclassSelect) return;

    const selectedClass = classSelect.value;

    // Clear current options
    subclassSelect.innerHTML = '<option value="">Select subclass</option>';

    // Add subclass options for selected class
    if (selectedClass && subclasses[selectedClass]) {
        subclasses[selectedClass].forEach(subclass => {
            const option = document.createElement('option');
            option.value = subclass;
            option.textContent = subclass;
            subclassSelect.appendChild(option);
        });
        subclassSelect.disabled = false;
    } else {
        subclassSelect.disabled = true;
    }

    // Update saving throw proficiency indicators
    updateSavingThrowProficiencies();
}

// Update saving throw proficiency indicators based on class
function updateSavingThrowProficiencies() {
    const classSelect = document.getElementById('charClass');
    if (!classSelect) return;

    const selectedClass = classSelect.value;
    const proficientSaves = classSavingThrows[selectedClass] || [];

    // Update all save items
    ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(ability => {
        const saveItem = document.getElementById(`save${ability.charAt(0).toUpperCase() + ability.slice(1)}`);
        if (saveItem) {
            const parentDiv = saveItem.closest('.save-item');
            if (parentDiv) {
                if (proficientSaves.includes(ability)) {
                    parentDiv.classList.add('class-proficient');
                    // Auto-check the proficiency
                    saveItem.checked = true;
                } else {
                    parentDiv.classList.remove('class-proficient');
                    // Uncheck if not proficient
                    saveItem.checked = false;
                }
            }
        }
    });

    // Trigger character sheet update
    updateCharacterSheet();
}

// Class to Hit Die mapping (2024 PHB)
const classHitDice = {
    'Barbarian': 'd12',
    'Bard': 'd8',
    'Cleric': 'd8',
    'Druid': 'd8',
    'Fighter': 'd10',
    'Monk': 'd8',
    'Paladin': 'd10',
    'Ranger': 'd10',
    'Rogue': 'd8',
    'Sorcerer': 'd6',
    'Warlock': 'd8',
    'Wizard': 'd6'
};

function updateHitDie() {
    const classSelect = document.getElementById('charClass');
    const hitDiceInput = document.getElementById('hitDice');

    if (!classSelect || !hitDiceInput) return;

    const selectedClass = classSelect.value;
    const hitDie = classHitDice[selectedClass];

    if (hitDie) {
        hitDiceInput.value = hitDie;
    }

    // Also update saving throw proficiencies
    updateSavingThrowProficiencies();
}

function updateProficiencyBonus() {
    const levelInput = document.getElementById('charLevel');
    const profBonusInput = document.getElementById('profBonus');

    if (!levelInput || !profBonusInput) return;

    const level = parseInt(levelInput.value) || 1;

    // Calculate proficiency bonus based on level (D&D 5e/2024)
    const profBonus = Math.ceil(level / 4) + 1;

    profBonusInput.value = profBonus;

    // Trigger character sheet update
    updateCharacterSheet();
}

// Character Sheet - Calculate ability modifier
function calcModifier(score) {
    return Math.floor((score - 10) / 2);
}

function formatModifier(mod) {
    return mod >= 0 ? `+${mod}` : `${mod}`;
}

// Skill to ability mapping
const skillAbilities = {
    Acrobatics: 'dex',
    AnimalHandling: 'wis',
    Arcana: 'int',
    Athletics: 'str',
    Deception: 'cha',
    History: 'int',
    Insight: 'wis',
    Intimidation: 'cha',
    Investigation: 'int',
    Medicine: 'wis',
    Nature: 'int',
    Perception: 'wis',
    Performance: 'cha',
    Persuasion: 'cha',
    Religion: 'int',
    SleightOfHand: 'dex',
    Stealth: 'dex',
    Survival: 'wis'
};

// Update character sheet calculations
function updateCharacterSheet() {
    // Get ability scores
    const abilities = {
        str: parseInt(document.getElementById('str')?.value || 10),
        dex: parseInt(document.getElementById('dex')?.value || 10),
        con: parseInt(document.getElementById('con')?.value || 10),
        int: parseInt(document.getElementById('int')?.value || 10),
        wis: parseInt(document.getElementById('wis')?.value || 10),
        cha: parseInt(document.getElementById('cha')?.value || 10)
    };

    const profBonus = parseInt(document.getElementById('profBonus')?.value || 2);

    // Update ability modifiers
    Object.keys(abilities).forEach(ability => {
        const mod = calcModifier(abilities[ability]);
        const modElement = document.getElementById(`${ability}Mod`);
        if (modElement) {
            modElement.textContent = formatModifier(mod);
        }
    });

    // Update initiative (DEX modifier)
    const initiativeElement = document.getElementById('initiative');
    if (initiativeElement) {
        initiativeElement.value = formatModifier(calcModifier(abilities.dex));
    }

    // Update saving throw bonuses
    ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(ability => {
        const abilityMod = calcModifier(abilities[ability]);
        const saveCheckbox = document.getElementById(`save${ability.charAt(0).toUpperCase() + ability.slice(1)}`);
        const isProficient = saveCheckbox?.checked || false;
        const bonus = isProficient ? abilityMod + profBonus : abilityMod;

        const bonusElement = document.getElementById(`bonusSave${ability.charAt(0).toUpperCase() + ability.slice(1)}`);
        if (bonusElement) {
            bonusElement.textContent = formatModifier(bonus);
        }
    });

    // Update skill bonuses
    Object.keys(skillAbilities).forEach(skill => {
        const ability = skillAbilities[skill];
        const abilityMod = calcModifier(abilities[ability]);
        const isProficient = document.getElementById(`skill${skill}`)?.checked || false;
        const bonus = isProficient ? abilityMod + profBonus : abilityMod;

        const bonusElement = document.getElementById(`bonus${skill}`);
        if (bonusElement) {
            bonusElement.textContent = formatModifier(bonus);
        }
    });
}

// Add event listeners for character sheet
function initCharacterSheet() {
    // Class change listener for subclass dropdown
    const classSelect = document.getElementById('charClass');
    if (classSelect) {
        classSelect.addEventListener('change', updateSubclassOptions);
    }

    // Ability score inputs
    ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(ability => {
        const input = document.getElementById(ability);
        if (input) {
            input.addEventListener('input', updateCharacterSheet);
        }
    });

    // Proficiency bonus
    const profBonusInput = document.getElementById('profBonus');
    if (profBonusInput) {
        profBonusInput.addEventListener('input', updateCharacterSheet);
    }

    // Saving throw checkboxes
    ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(ability => {
        const checkbox = document.getElementById(`save${ability.charAt(0).toUpperCase() + ability.slice(1)}`);
        if (checkbox) {
            checkbox.addEventListener('change', updateCharacterSheet);
        }
    });

    // Skill checkboxes
    Object.keys(skillAbilities).forEach(skill => {
        const checkbox = document.getElementById(`skill${skill}`);
        if (checkbox) {
            checkbox.addEventListener('change', updateCharacterSheet);
        }
    });

    // Initial calculation
    updateCharacterSheet();
    updateSubclassOptions();
}

// D&D 2024 Feats
const featsData = {
    origin: [
        { name: 'Alert', prereq: 'None', desc: 'You gain a +5 bonus to Initiative rolls and you can\'t be surprised.' },
        { name: 'Crafter', prereq: 'None', desc: 'You gain proficiency with three Artisan\'s Tools of your choice. Your crafting time is reduced by 20%.' },
        { name: 'Healer', prereq: 'None', desc: 'As an action, you can use a Healer\'s Kit to restore 1d8 + 4 + the creature\'s number of Hit Dice HP to a creature. Once per turn, when you restore HP to a creature using any means other than natural healing, you can restore an extra 1d6 + your Proficiency Bonus HP.' },
        { name: 'Lucky', prereq: 'None', desc: 'You have 3 Luck Points. When you make an attack roll, ability check, or saving throw, you can expend 1 Luck Point to give yourself Advantage. You can also expend 1 Luck Point when an attack roll is made against you to impose Disadvantage on that roll. You regain all expended Luck Points when you finish a Long Rest.' },
        { name: 'Magic Initiate', prereq: 'None', desc: 'Choose a class: Cleric, Druid, or Wizard. You learn two cantrips and one 1st-level spell from that class\'s spell list. You can cast the 1st-level spell once per Long Rest without expending a spell slot. Your spellcasting ability is the same as that class.' },
        { name: 'Musician', prereq: 'None', desc: 'You gain proficiency with three Musical Instruments of your choice. After a Short or Long Rest, you can give Inspiration to allies who heard your performance. Number of allies equals your Proficiency Bonus.' },
        { name: 'Savage Attacker', prereq: 'None', desc: 'Once per turn when you hit with a melee weapon attack, you can reroll the weapon\'s damage dice and use either result.' },
        { name: 'Skilled', prereq: 'None', desc: 'You gain proficiency in three skills of your choice, or in two skills and one set of tools of your choice.' },
        { name: 'Tavern Brawler', prereq: 'None', desc: 'You gain proficiency with improvised weapons. Your Unarmed Strike uses a d4 for damage. When you hit with an Unarmed Strike as part of the Attack action on your turn, you can deal damage to the target and also grapple it (no action required).' },
        { name: 'Tough', prereq: 'None', desc: 'Your Hit Point maximum increases by an amount equal to twice your character level when you gain this feat. Whenever you gain a character level thereafter, your Hit Point maximum increases by an additional 2 Hit Points.' }
    ],
    general: [
        { name: 'Ability Score Improvement', prereq: '4th level', desc: 'Increase one ability score of your choice by 2, or increase two ability scores by 1 each. You can\'t increase an ability score above 20 using this feat.' },
        { name: 'Actor', prereq: '4th level', desc: 'Increase your Charisma by 1. You have Advantage on Deception and Performance checks when trying to pass yourself off as someone else. You can mimic another person\'s speech or sounds made by creatures after hearing them for at least 1 minute.' },
        { name: 'Athlete', prereq: '4th level, Strength or Dexterity 13+', desc: 'Increase Strength or Dexterity by 1. Climbing doesn\'t cost extra movement. You need only 5 feet of running start for long jumps. You have Advantage on ability checks to escape a grapple.' },
        { name: 'Charger', prereq: '4th level', desc: 'When you take the Dash action, you can make one melee weapon attack or shove a creature as a Bonus Action. If you move at least 10 feet straight toward the target, you either gain +5 to the attack\'s damage or push the target 10 feet (your choice).' },
        { name: 'Chef', prereq: '4th level', desc: 'Increase Constitution or Wisdom by 1. You gain proficiency with Cook\'s Utensils. During a Short Rest, you can cook food for 4 + Proficiency Bonus creatures; those who spend Hit Dice regain extra 1d8 HP. With 1 hour work or after a Long Rest, you can cook treats equal to your Proficiency Bonus that grant Temp HP equal to your Proficiency Bonus when eaten (treats last 8 hours).' },
        { name: 'Crossbow Expert', prereq: '4th level', desc: 'You ignore the Loading property of crossbows. Being within 5 feet of a hostile creature doesn\'t impose Disadvantage on your ranged attack rolls. When you use the Attack action to attack with a one-handed weapon, you can make a ranged attack with a hand crossbow as a Bonus Action.' },
        { name: 'Crusher', prereq: '4th level', desc: 'Increase Strength or Constitution by 1. Once per turn when you hit with Bludgeoning damage, you can move the target 5 feet if it\'s no more than one size larger. When you score a Critical Hit with Bludgeoning damage, attack rolls against that creature have Advantage until the start of your next turn.' },
        { name: 'Defensive Duelist', prereq: '4th level, Dexterity 13+', desc: 'When wielding a Finesse weapon and another creature hits you with a melee attack, you can use your Reaction to add your Proficiency Bonus to your AC for that attack, potentially causing it to miss.' },
        { name: 'Dual Wielder', prereq: '4th level', desc: 'You gain +1 AC while wielding separate melee weapons in each hand. You can draw or stow two weapons when you would normally draw or stow one. You can engage in two-weapon fighting even when the weapons you are wielding aren\'t Light.' },
        { name: 'Durable', prereq: '4th level', desc: 'Increase Constitution by 1. When you roll a Hit Die to regain HP, the minimum number of HP you regain equals twice your Constitution modifier.' },
        { name: 'Elemental Adept', prereq: '4th level, Spellcasting or Pact Magic feature', desc: 'Choose acid, cold, fire, lightning, or thunder. Spells you cast ignore Resistance to that damage type. When you roll damage for a spell that deals that type, you can treat any 1 on a damage die as a 2.' },
        { name: 'Fey Touched', prereq: '4th level', desc: 'Increase Intelligence, Wisdom, or Charisma by 1. You learn Misty Step and one 1st-level spell from the Divination or Enchantment school. You can cast each spell once per Long Rest without a spell slot. Your spellcasting ability is the ability increased by this feat.' },
        { name: 'Grappler', prereq: '4th level, Strength or Dexterity 13+', desc: 'Increase Strength or Dexterity by 1. When you hit with an Unarmed Strike as part of the Attack action, you can deal damage and also use the Grapple option (once per turn). You have Advantage on attack rolls against creatures you have Grappled. Moving a Grappled creature of your size or smaller doesn\'t cost extra movement.' },
        { name: 'Great Weapon Master', prereq: '4th level', desc: 'When you score a Critical Hit or reduce a creature to 0 HP with a melee weapon, you can make one melee weapon attack as a Bonus Action. Before you make a melee attack with a Heavy weapon, you can take a -5 penalty to the attack roll. If the attack hits, you add +10 to the attack\'s damage.' },
        { name: 'Heavily Armored', prereq: '4th level, Medium Armor proficiency', desc: 'Increase Strength by 1. You gain proficiency with Heavy Armor.' },
        { name: 'Heavy Armor Master', prereq: '4th level, Heavy Armor proficiency', desc: 'Increase Strength by 1. While wearing Heavy Armor, bludgeoning, piercing, and slashing damage you take from nonmagical weapons is reduced by 3.' },
        { name: 'Inspiring Leader', prereq: '4th level, Charisma 13+', desc: 'You can spend 10 minutes inspiring companions. Choose up to 6 creatures who can hear and understand you. Each gains temporary HP equal to your level + your Charisma modifier. A creature can\'t gain temp HP from this feat again until finishing a Short or Long Rest.' },
        { name: 'Keen Mind', prereq: '4th level', desc: 'Increase Intelligence by 1. You can accurately recall anything you\'ve seen or heard in the past month. You always know which way is north and hours until the next sunrise or sunset.' },
        { name: 'Lightly Armored', prereq: '4th level', desc: 'Increase Strength or Dexterity by 1. You gain training with Light Armor and Shields.' },
        { name: 'Mage Slayer', prereq: '4th level', desc: 'When a creature within 5 feet casts a spell, you can use your Reaction to make a melee weapon attack against it. When you damage a concentrating creature, it has Disadvantage on the saving throw. You have Advantage on saves against spells cast by creatures within 5 feet.' },
        { name: 'Martial Weapon Training', prereq: '4th level', desc: 'Increase Strength or Dexterity by 1. You gain proficiency with Martial weapons.' },
        { name: 'Medium Armor Master', prereq: '4th level, Medium Armor proficiency', desc: 'Increase Strength or Dexterity by 1. While wearing Medium Armor, you can add up to 3 (instead of 2) to AC if you have 16+ Dexterity. Wearing Medium Armor doesn\'t impose Disadvantage on Stealth checks.' },
        { name: 'Mobile', prereq: '4th level', desc: 'Your Speed increases by 10 feet. When you use Dash, difficult terrain doesn\'t cost extra movement. When you make a melee attack against a creature, you don\'t provoke opportunity attacks from that creature until the end of your turn.' },
        { name: 'Moderately Armored', prereq: '4th level, Light Armor training', desc: 'Increase Strength or Dexterity by 1. You gain training with Medium Armor.' },
        { name: 'Mounted Combatant', prereq: '4th level', desc: 'You have Advantage on melee attacks against unmounted creatures smaller than your mount. You can force an attack targeting your mount to target you instead. If your mount is subjected to an effect that allows a Dex save for half damage, it takes no damage on success (instead of half).' },
        { name: 'Observant', prereq: '4th level', desc: 'Increase Intelligence or Wisdom by 1. If you can see a creature\'s mouth while it speaks a language you understand, you can interpret what it\'s saying by reading its lips. You have +5 bonus to passive Perception and passive Investigation.' },
        { name: 'Piercer', prereq: '4th level', desc: 'Increase Strength or Dexterity by 1. Once per turn when you hit with Piercing damage, you can reroll one damage die and use either result. When you score a Critical Hit with Piercing damage, roll one additional damage die.' },
        { name: 'Poisoner', prereq: '4th level', desc: 'Increase Dexterity or Intelligence by 1. Your Poison damage ignores Poison Resistance. You gain proficiency with Poisoner\'s Kit. You can create poison doses equal to your Proficiency Bonus in 1 hour. As a Bonus Action, apply poison to weapon/ammo (lasts 1 minute or until damage dealt). Target makes Constitution save or takes 2d8 Poison damage and gains Poisoned condition until end of its next turn.' },
        { name: 'Polearm Master', prereq: '4th level', desc: 'When you take the Attack action with a glaive, halberd, pike, or quarterstaff, you can use a Bonus Action to make a melee attack with the opposite end (uses d4 for damage). While wielding a glaive, halberd, pike, or quarterstaff, creatures provoke opportunity attacks when they enter your reach.' },
        { name: 'Resilient', prereq: '4th level', desc: 'Increase one ability score by 1. You gain proficiency in saving throws using the chosen ability.' },
        { name: 'Ritual Caster', prereq: '4th level, Intelligence, Wisdom, or Charisma 13+', desc: 'Choose a class. You learn two 1st-level spells with the Ritual tag from that class. You can cast them as rituals. You can add other ritual spells you find to your ritual book.' },
        { name: 'Sentinel', prereq: '4th level', desc: 'When you hit a creature with an opportunity attack, its Speed becomes 0 until the end of the current turn. Creatures provoke opportunity attacks even if they Disengage. When a creature within 5 feet makes an attack against a target other than you, you can use your Reaction to make a melee weapon attack against the attacking creature.' },
        { name: 'Shadow Touched', prereq: '4th level', desc: 'Increase Intelligence, Wisdom, or Charisma by 1. You learn Invisibility and one 1st-level spell from the Illusion or Necromancy school. You can cast each once per Long Rest without a spell slot. Your spellcasting ability is the ability increased by this feat.' },
        { name: 'Sharpshooter', prereq: '4th level', desc: 'Your ranged weapon attacks ignore half and three-quarters cover. Before you make a ranged weapon attack, you can take a -5 penalty to the attack roll. If it hits, you add +10 to the attack\'s damage.' },
        { name: 'Shield Master', prereq: '4th level', desc: 'If you take the Attack action, you can use a Bonus Action to shove a creature within 5 feet (must be holding a shield). If you\'re holding a shield and subjected to an effect that allows a Dex save for half damage, you can use your Reaction to take no damage on success (instead of half). If holding a shield, you gain the shield\'s AC bonus against effects that target only you and allow a Dex save.' },
        { name: 'Skill Expert', prereq: '4th level', desc: 'Increase one ability score by 1. You gain proficiency in one skill of your choice. Choose one skill in which you have proficiency but lack Expertise. You gain Expertise with that skill.' },
        { name: 'Skulker', prereq: '4th level, Dexterity 13+', desc: 'You can Hide when lightly obscured. Missing with a ranged weapon attack doesn\'t reveal your position. Dim light doesn\'t impose Disadvantage on Perception checks.' },
        { name: 'Slasher', prereq: '4th level', desc: 'Increase Strength or Dexterity by 1. Once per turn when you hit with Slashing damage, you can reduce the target\'s Speed by 10 feet until the start of your next turn. When you score a Critical Hit with Slashing damage, the target has Disadvantage on attack rolls until the start of your next turn.' },
        { name: 'Speedy', prereq: '4th level, Dexterity or Constitution 13+', desc: 'Increase Dexterity or Constitution by 1. Your Speed increases by 10 feet. When you take the Dash action, difficult terrain doesn\'t cost extra movement. Opportunity Attacks against you have Disadvantage.' },
        { name: 'Spell Sniper', prereq: '4th level, Spellcasting or Pact Magic feature', desc: 'When you cast a spell that requires a ranged attack roll, the spell\'s range is doubled. Your ranged spell attacks ignore half and three-quarters cover. You learn one cantrip that requires an attack roll from any class\'s spell list.' },
        { name: 'Telekinetic', prereq: '4th level', desc: 'Increase Intelligence, Wisdom, or Charisma by 1. You learn Mage Hand (invisible when you cast it). As a Bonus Action, you can try to shove a creature within 30 feet using telekinesis (Strength save vs your spell save DC).' },
        { name: 'Telepathic', prereq: '4th level', desc: 'Increase Intelligence, Wisdom, or Charisma by 1. You can speak telepathically to any creature within 60 feet. You can cast Detect Thoughts once per Long Rest without a spell slot (spell save DC uses the ability increased by this feat).' },
        { name: 'War Caster', prereq: '4th level, Spellcasting or Pact Magic feature', desc: 'You have Advantage on Constitution saves to maintain concentration. You can perform somatic components even when holding weapons or a shield. When a creature provokes an opportunity attack, you can use your Reaction to cast a spell targeting only that creature (spell must have 1 action casting time and target only that creature).' },
        { name: 'Weapon Master', prereq: '4th level', desc: 'Increase Strength or Dexterity by 1. You gain the Mastery property for one Simple or Martial weapon you\'re proficient with. You can change the weapon after each Long Rest.' }
    ]
};

let selectedSpells = [];

function openSpellSelector() {
    const charClass = document.getElementById('charClass')?.value || '';
    const filterSpan = document.getElementById('currentClassFilter');
    if (charClass && filterSpan) {
        filterSpan.textContent = `(Filtering for ${charClass})`;
    } else if (filterSpan) {
        filterSpan.textContent = '';
    }

    document.getElementById('spellModal').classList.add('active');
    const searchInput = document.getElementById('spellSearch');
    if (searchInput) searchInput.value = '';
    const showAllCheckbox = document.getElementById('showAllClassSpells');
    if (showAllCheckbox) showAllCheckbox.checked = false;
    renderSpellLists();
}

function closeSpellSelector() {
    document.getElementById('spellModal').classList.remove('active');
}

function switchSpellTab(level) {
    // Remove active from all tabs
    document.querySelectorAll('#spellModal .modal-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.spell-tab-content').forEach(content => content.classList.remove('active'));

    // Add active to selected tab
    const tabMap = {
        'cantrip': 0, 'level1': 1, 'level2': 2, 'level3': 3, 'level4': 4,
        'level5': 5, 'level6': 6, 'level7': 7, 'level8': 8, 'level9': 9
    };

    const buttons = document.querySelectorAll('#spellModal .modal-tab-btn');
    buttons[tabMap[level]].classList.add('active');
    document.getElementById(`${level}SpellsTab`).classList.add('active');
}

function filterSpells() {
    renderSpellLists();
}

function renderSpellLists() {
    const levels = ['cantrip', 'level1', 'level2', 'level3', 'level4', 'level5', 'level6', 'level7', 'level8', 'level9'];
    const levelNames = {
        'cantrip': 'Cantrip',
        'level1': '1st Level',
        'level2': '2nd Level',
        'level3': '3rd Level',
        'level4': '4th Level',
        'level5': '5th Level',
        'level6': '6th Level',
        'level7': '7th Level',
        'level8': '8th Level',
        'level9': '9th Level'
    };

    const searchTerm = document.getElementById('spellSearch')?.value.toLowerCase() || '';
    const showAllClasses = document.getElementById('showAllClassSpells')?.checked || false;
    const charClass = document.getElementById('charClass')?.value || '';

    // When searching, show ALL matching spells in ALL tabs
    if (searchTerm) {
        const allMatchingSpells = [];
        levels.forEach(level => {
            const spells = spellsData[level] || [];
            spells.forEach(spell => {
                const matchesSearch = spell.name.toLowerCase().includes(searchTerm) ||
                    spell.desc.toLowerCase().includes(searchTerm) ||
                    spell.school.toLowerCase().includes(searchTerm);

                // Also apply class filter if needed
                const matchesClass = showAllClasses || !charClass ||
                    (spell.classes && spell.classes.includes(charClass));

                if (matchesSearch && matchesClass) {
                    allMatchingSpells.push({ ...spell, level: levelNames[level], levelKey: level });
                }
            });
        });

        // Show ALL matching spells in EVERY tab (ignore level when searching)
        levels.forEach(level => {
            const listElement = document.getElementById(`${level}SpellsList`);
            if (!listElement) return;

            if (allMatchingSpells.length === 0) {
                listElement.innerHTML = '<p style="color: var(--text-dim); padding: 20px; text-align: center;">No spells found</p>';
                return;
            }

            listElement.innerHTML = allMatchingSpells.map(spell => `
                <div class="spell-option ${selectedSpells.some(s => s.name === spell.name) ? 'selected' : ''}" onclick="selectSpell('${spell.name.replace(/'/g, "\\'")}', '${spell.level}')">
                    <h4>${spell.name}</h4>
                    <div class="spell-meta">${spell.school} • ${spell.level}${spell.classes ? ' • ' + spell.classes.join(', ') : ''}</div>
                    <p>${spell.desc}</p>
                </div>
            `).join('');
        });
    } else {
        // No search - normal filtering by level and class
        levels.forEach(level => {
            const listElement = document.getElementById(`${level}SpellsList`);
            if (!listElement) return;

            let spells = spellsData[level] || [];

            // Filter by class if not showing all
            if (!showAllClasses && charClass && spells.length > 0 && spells[0].classes) {
                spells = spells.filter(spell => spell.classes && spell.classes.includes(charClass));
            }

            if (spells.length === 0) {
                listElement.innerHTML = '<p style="color: var(--text-dim); padding: 20px; text-align: center;">No spells found</p>';
                return;
            }

            listElement.innerHTML = spells.map(spell => `
                <div class="spell-option ${selectedSpells.some(s => s.name === spell.name) ? 'selected' : ''}" onclick="selectSpell('${spell.name.replace(/'/g, "\\'")}', '${levelNames[level]}')">
                    <h4>${spell.name}</h4>
                    <div class="spell-meta">${spell.school} • ${levelNames[level]}${spell.classes ? ' • ' + spell.classes.join(', ') : ''}</div>
                    <p>${spell.desc}</p>
                </div>
            `).join('');
        });
    }
}

function selectSpell(spellName, levelName) {
    const allSpells = [
        ...spellsData.cantrip, ...spellsData.level1, ...spellsData.level2,
        ...spellsData.level3, ...spellsData.level4, ...spellsData.level5,
        ...spellsData.level6, ...spellsData.level7, ...spellsData.level8, ...spellsData.level9
    ];
    const spell = allSpells.find(s => s.name === spellName);

    if (!spell) return;

    // Check if already selected
    if (selectedSpells.some(s => s.name === spellName)) {
        selectedSpells = selectedSpells.filter(s => s.name !== spellName);
    } else {
        selectedSpells.push({ ...spell, level: levelName });
    }

    renderSelectedSpells();
    renderSpellLists();
    saveUserData();
}

function removeSpell(spellName) {
    selectedSpells = selectedSpells.filter(s => s.name !== spellName);
    renderSelectedSpells();
    renderSpellLists();
    saveUserData();
}

function renderSelectedSpells() {
    const container = document.getElementById('selectedSpells');

    if (selectedSpells.length === 0) {
        container.innerHTML = '<p class="no-spells">No spells selected. Click "Add Spell" to browse available spells.</p>';
        return;
    }

    // Sort spells by level
    const sortedSpells = [...selectedSpells].sort((a, b) => {
        const levelOrder = {
            'Cantrip': 0, '1st Level': 1, '2nd Level': 2, '3rd Level': 3, '4th Level': 4, '5th Level': 5,
            '6th Level': 6, '7th Level': 7, '8th Level': 8, '9th Level': 9
        };
        return levelOrder[a.level] - levelOrder[b.level];
    });

    container.innerHTML = sortedSpells.map(spell => `
        <div class="spell-card">
            <div class="spell-card-header">
                <div>
                    <h4>${spell.name}</h4>
                    <div class="spell-level">${spell.level} • ${spell.school}</div>
                </div>
                <button class="spell-remove" onclick="removeSpell('${spell.name}')">&times;</button>
            </div>
            <p>${spell.desc}</p>
        </div>
    `).join('');
}

let selectedFeats = [];

function openFeatSelector() {
    document.getElementById('featModal').classList.add('active');
    renderFeatLists();
}

function closeFeatSelector() {
    document.getElementById('featModal').classList.remove('active');
}

function switchFeatTab(tab) {
    // Remove active from all tabs
    document.querySelectorAll('.modal-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.feat-tab-content').forEach(content => content.classList.remove('active'));

    // Add active to selected tab
    if (tab === 'origin') {
        document.querySelector('.modal-tab-btn:first-child').classList.add('active');
        document.getElementById('originFeatsTab').classList.add('active');
    } else {
        document.querySelector('.modal-tab-btn:last-child').classList.add('active');
        document.getElementById('generalFeatsTab').classList.add('active');
    }
}

function renderFeatLists() {
    const originList = document.getElementById('originFeatsList');
    const generalList = document.getElementById('generalFeatsList');

    originList.innerHTML = featsData.origin.map(feat => `
        <div class="feat-option ${selectedFeats.some(f => f.name === feat.name) ? 'selected' : ''}" onclick="selectFeat('${feat.name}', 'Origin')">
            <h4>${feat.name}</h4>
            <div class="feat-prereq">${feat.prereq}</div>
            <p>${feat.desc}</p>
        </div>
    `).join('');

    generalList.innerHTML = featsData.general.map(feat => `
        <div class="feat-option ${selectedFeats.some(f => f.name === feat.name) ? 'selected' : ''}" onclick="selectFeat('${feat.name}', 'General')">
            <h4>${feat.name}</h4>
            <div class="feat-prereq">Prerequisite: ${feat.prereq}</div>
            <p>${feat.desc}</p>
        </div>
    `).join('');
}

function selectFeat(featName, type) {
    const allFeats = [...featsData.origin, ...featsData.general];
    const feat = allFeats.find(f => f.name === featName);

    if (!feat) return;

    // Check if already selected
    if (selectedFeats.some(f => f.name === featName)) {
        selectedFeats = selectedFeats.filter(f => f.name !== featName);
    } else {
        selectedFeats.push({ ...feat, type });
    }

    renderSelectedFeats();
    renderFeatLists();
}

function removeFeat(featName) {
    selectedFeats = selectedFeats.filter(f => f.name !== featName);
    renderSelectedFeats();
    renderFeatLists();
}

function renderSelectedFeats() {
    const container = document.getElementById('selectedFeats');

    if (selectedFeats.length === 0) {
        container.innerHTML = '<p class="no-feats">No feats selected. Click "Add Feat" to browse available feats.</p>';
        return;
    }

    container.innerHTML = selectedFeats.map(feat => `
        <div class="feat-card">
            <div class="feat-card-header">
                <div>
                    <h4>${feat.name}</h4>
                    <div class="feat-type">${feat.type} Feat</div>
                </div>
                <button class="feat-remove" onclick="removeFeat('${feat.name}')">&times;</button>
            </div>
            <p>${feat.desc}</p>
        </div>
    `).join('');
}

// Equipment System - Armor, Weapons, and Inventory
let armorIdCounter = 0;
let weaponIdCounter = 0;
let inventoryIdCounter = 0;

function addArmorItem() {
    // Clear previous input
    document.getElementById('armorName').value = '';
    document.getElementById('armorAC').value = 10;
    document.getElementById('armorBonus').value = '';
    document.getElementById('armorNotes').value = '';

    // Show modal
    document.getElementById('addArmorModal').classList.add('active');
    setTimeout(() => document.getElementById('armorName').focus(), 100);
}

function closeAddArmorModal() {
    document.getElementById('addArmorModal').classList.remove('active');
}

function confirmAddArmor() {
    const name = document.getElementById('armorName').value.trim();
    const ac = document.getElementById('armorAC').value;
    const bonus = document.getElementById('armorBonus').value.trim();
    const notes = document.getElementById('armorNotes').value.trim();

    if (!name) {
        alert('Please enter an armor name');
        return;
    }

    const char = characters[currentCharacterIndex];
    if (!char.armor) {
        char.armor = [];
    }

    char.armor.push({
        id: armorIdCounter++,
        name: name,
        ac: ac,
        bonus: bonus,
        notes: notes
    });

    renderArmor();
    saveUserData();
    closeAddArmorModal();
}

function addWeaponItem() {
    // Clear previous input
    document.getElementById('weaponName').value = '';
    document.getElementById('weaponDie').value = 'd8';
    document.getElementById('weaponBonus').value = '';
    document.getElementById('weaponNotes').value = '';

    // Show modal
    document.getElementById('addWeaponModal').classList.add('active');
    setTimeout(() => document.getElementById('weaponName').focus(), 100);
}

function closeAddWeaponModal() {
    document.getElementById('addWeaponModal').classList.remove('active');
}

function confirmAddWeapon() {
    const name = document.getElementById('weaponName').value.trim();
    const die = document.getElementById('weaponDie').value;
    const bonus = document.getElementById('weaponBonus').value.trim();
    const notes = document.getElementById('weaponNotes').value.trim();

    if (!name) {
        alert('Please enter a weapon name');
        return;
    }

    const char = characters[currentCharacterIndex];
    if (!char.weapons) {
        char.weapons = [];
    }

    char.weapons.push({
        id: weaponIdCounter++,
        name: name,
        die: die,
        bonus: bonus,
        notes: notes
    });

    renderWeapons();
    saveUserData();
    closeAddWeaponModal();
}

function deleteArmorItem(id) {
    const char = characters[currentCharacterIndex];
    if (!char.armor) return;

    char.armor = char.armor.filter(item => item.id !== id);
    renderArmor();
    saveUserData();
}

function deleteWeaponItem(id) {
    const char = characters[currentCharacterIndex];
    if (!char.weapons) return;

    char.weapons = char.weapons.filter(item => item.id !== id);
    renderWeapons();
    saveUserData();
}

function renderArmor() {
    const char = characters[currentCharacterIndex];
    const container = document.getElementById('armorList');

    if (!char.armor || char.armor.length === 0) {
        container.innerHTML = '<p class="no-items">No armor items. Click "+ Add Armor" to add one.</p>';
        return;
    }

    container.innerHTML = char.armor.map(item => `
        <div class="equipment-item">
            <div class="equipment-item-main">
                <div class="equipment-item-info">
                    <strong>${item.name}</strong>
                    <div class="equipment-details">
                        <span class="equipment-detail">AC: ${item.ac}</span>
                        ${item.bonus ? `<span class="equipment-detail">Bonus: ${item.bonus}</span>` : ''}
                    </div>
                </div>
                <button class="equipment-delete" onclick="deleteArmorItem(${item.id})">&times;</button>
            </div>
            ${item.notes ? `
                <details class="equipment-notes">
                    <summary>Notes</summary>
                    <p>${item.notes}</p>
                </details>
            ` : ''}
        </div>
    `).join('');
}

function renderWeapons() {
    const char = characters[currentCharacterIndex];
    const container = document.getElementById('weaponsList');

    if (!char.weapons || char.weapons.length === 0) {
        container.innerHTML = '<p class="no-items">No weapons. Click "+ Add Weapon" to add one.</p>';
        return;
    }

    container.innerHTML = char.weapons.map(item => `
        <div class="equipment-item">
            <div class="equipment-item-main">
                <div class="equipment-item-info">
                    <strong>${item.name}</strong>
                    <div class="equipment-details">
                        <span class="equipment-detail">Damage: ${item.die}</span>
                        ${item.bonus ? `<span class="equipment-detail">Bonus: ${item.bonus}</span>` : ''}
                    </div>
                </div>
                <button class="equipment-delete" onclick="deleteWeaponItem(${item.id})">&times;</button>
            </div>
            ${item.notes ? `
                <details class="equipment-notes">
                    <summary>Notes</summary>
                    <p>${item.notes}</p>
                </details>
            ` : ''}
        </div>
    `).join('');
}

// Currency System
function saveCurrency() {
    const char = characters[currentCharacterIndex];
    if (!char.currency) {
        char.currency = {};
    }

    char.currency.cp = parseInt(document.getElementById('currencyCP')?.value) || 0;
    char.currency.sp = parseInt(document.getElementById('currencySP')?.value) || 0;
    char.currency.ep = parseInt(document.getElementById('currencyEP')?.value) || 0;
    char.currency.gp = parseInt(document.getElementById('currencyGP')?.value) || 0;
    char.currency.pp = parseInt(document.getElementById('currencyPP')?.value) || 0;

    saveUserData();
}

function loadCurrency() {
    const char = characters[currentCharacterIndex];
    const currency = char.currency || {};

    if (document.getElementById('currencyCP')) document.getElementById('currencyCP').value = currency.cp || 0;
    if (document.getElementById('currencySP')) document.getElementById('currencySP').value = currency.sp || 0;
    if (document.getElementById('currencyEP')) document.getElementById('currencyEP').value = currency.ep || 0;
    if (document.getElementById('currencyGP')) document.getElementById('currencyGP').value = currency.gp || 0;
    if (document.getElementById('currencyPP')) document.getElementById('currencyPP').value = currency.pp || 0;
}

// Inventory System
function addInventoryItem() {
    // Clear previous input
    document.getElementById('inventoryName').value = '';
    document.getElementById('inventoryQuantity').value = '1';
    document.getElementById('inventoryValue').value = '';
    document.getElementById('inventoryCurrency').value = 'gp';
    document.getElementById('inventoryNotes').value = '';

    // Show modal
    document.getElementById('addInventoryModal').classList.add('active');
    setTimeout(() => document.getElementById('inventoryName').focus(), 100);
}

function closeAddInventoryModal() {
    document.getElementById('addInventoryModal').classList.remove('active');
}

function confirmAddInventory() {
    const name = document.getElementById('inventoryName').value.trim();
    const quantity = parseInt(document.getElementById('inventoryQuantity').value) || 1;
    const valueAmount = document.getElementById('inventoryValue').value.trim();
    const valueCurrency = document.getElementById('inventoryCurrency').value;
    const notes = document.getElementById('inventoryNotes').value.trim();

    if (!name) {
        alert('Please enter an item name');
        return;
    }

    const char = characters[currentCharacterIndex];
    if (!char.inventory) {
        char.inventory = [];
    }

    // Format value string
    let valueString = '';
    if (valueAmount && parseInt(valueAmount) > 0) {
        valueString = `${valueAmount} ${valueCurrency.toUpperCase()}`;
    }

    char.inventory.push({
        id: inventoryIdCounter++,
        name: name,
        quantity: quantity,
        value: valueString,
        notes: notes
    });

    renderInventory();
    saveUserData();
    closeAddInventoryModal();
}

function deleteInventoryItem(id) {
    const char = characters[currentCharacterIndex];
    if (!char.inventory) return;

    char.inventory = char.inventory.filter(item => item.id !== id);
    renderInventory();
    saveUserData();
}

function updateInventoryQuantity(id, newQuantity) {
    const char = characters[currentCharacterIndex];
    if (!char.inventory) return;

    const item = char.inventory.find(i => i.id === id);
    if (item) {
        item.quantity = Math.max(1, parseInt(newQuantity) || 1);
        renderInventory();
        saveUserData();
    }
}

function renderInventory() {
    const char = characters[currentCharacterIndex];
    const container = document.getElementById('inventoryList');

    if (!char.inventory || char.inventory.length === 0) {
        container.innerHTML = '<p class="no-items">No items in inventory. Click "+ Add Item" to add one.</p>';
        return;
    }

    container.innerHTML = char.inventory.map(item => `
        <div class="equipment-item">
            <div class="equipment-item-main">
                <div class="equipment-item-info">
                    <div class="inventory-name-qty">
                        <strong>${item.name}</strong>
                        <div class="inventory-quantity">
                            <label>Qty:</label>
                            <input type="number" class="qty-input" min="1" value="${item.quantity || 1}" onchange="updateInventoryQuantity(${item.id}, this.value)" />
                        </div>
                    </div>
                    ${item.value ? `<div class="equipment-details">
                        <span class="equipment-detail">Value: ${item.value}</span>
                    </div>` : ''}
                </div>
                <button class="equipment-delete" onclick="deleteInventoryItem(${item.id})">&times;</button>
            </div>
            ${item.notes ? `
                <details class="equipment-notes">
                    <summary>Notes</summary>
                    <p>${item.notes}</p>
                </details>
            ` : ''}
        </div>
    `).join('');
}

// Dice Roller Functions
let savedDiceConfigurations = [];

function saveDiceConfiguration() {
    const config = {
        d4: parseInt(document.getElementById('d4Count')?.value) || 0,
        d6: parseInt(document.getElementById('d6Count')?.value) || 0,
        d8: parseInt(document.getElementById('d8Count')?.value) || 0,
        d10: parseInt(document.getElementById('d10Count')?.value) || 0,
        d12: parseInt(document.getElementById('d12Count')?.value) || 0,
        d20: parseInt(document.getElementById('d20Count')?.value) || 0,
        d100: parseInt(document.getElementById('d100Count')?.value) || 0
    };

    // Check if any dice are set
    const hasAnyDice = Object.values(config).some(count => count > 0);
    if (!hasAnyDice) {
        alert('Please set at least one die before saving');
        return;
    }

    // Generate a default name for the configuration
    const configParts = [];
    if (config.d4 > 0) configParts.push(`${config.d4}d4`);
    if (config.d6 > 0) configParts.push(`${config.d6}d6`);
    if (config.d8 > 0) configParts.push(`${config.d8}d8`);
    if (config.d10 > 0) configParts.push(`${config.d10}d10`);
    if (config.d12 > 0) configParts.push(`${config.d12}d12`);
    if (config.d20 > 0) configParts.push(`${config.d20}d20`);
    if (config.d100 > 0) configParts.push(`${config.d100}d%`);

    const defaultName = configParts.join(' + ');

    // Store config temporarily and show modal
    window.tempDiceConfig = config;
    document.getElementById('diceConfigName').value = defaultName;
    document.getElementById('saveDiceConfigModal').classList.add('active');
    setTimeout(() => document.getElementById('diceConfigName').focus(), 100);
}

function closeSaveDiceConfigModal() {
    document.getElementById('saveDiceConfigModal').classList.remove('active');
    window.tempDiceConfig = null;
}

function confirmSaveDiceConfig() {
    const name = document.getElementById('diceConfigName').value.trim();

    if (!name) {
        alert('Please enter a name for the configuration');
        return;
    }

    const config = window.tempDiceConfig;
    config.name = name;
    config.id = Date.now();

    savedDiceConfigurations.push(config);
    saveDiceConfigurationsToStorage();
    renderSavedDiceDropdown();
    closeSaveDiceConfigModal();
}

function loadSavedDice() {
    const select = document.getElementById('savedDiceSelect');
    const selectedId = parseInt(select.value);

    if (!selectedId) return;

    const config = savedDiceConfigurations.find(c => c.id === selectedId);
    if (!config) return;

    document.getElementById('d4Count').value = config.d4 || 0;
    document.getElementById('d6Count').value = config.d6 || 0;
    document.getElementById('d8Count').value = config.d8 || 0;
    document.getElementById('d10Count').value = config.d10 || 0;
    document.getElementById('d12Count').value = config.d12 || 0;
    document.getElementById('d20Count').value = config.d20 || 0;
    document.getElementById('d100Count').value = config.d100 || 0;
}

function deleteSavedDice() {
    const select = document.getElementById('savedDiceSelect');
    const selectedId = parseInt(select.value);

    if (!selectedId) {
        alert('Please select a configuration to delete');
        return;
    }

    const config = savedDiceConfigurations.find(c => c.id === selectedId);
    if (!config) return;

    // Store the config to delete and show modal
    window.tempDeleteDiceConfigId = selectedId;
    document.getElementById('deleteDiceConfigName').textContent = config.name;
    document.getElementById('deleteDiceConfigModal').classList.add('active');
}

function closeDeleteDiceConfigModal() {
    document.getElementById('deleteDiceConfigModal').classList.remove('active');
    window.tempDeleteDiceConfigId = null;
}

function confirmDeleteDiceConfig() {
    const configId = window.tempDeleteDiceConfigId;
    if (!configId) return;

    savedDiceConfigurations = savedDiceConfigurations.filter(c => c.id !== configId);
    saveDiceConfigurationsToStorage();
    renderSavedDiceDropdown();
    closeDeleteDiceConfigModal();
}

function renderSavedDiceDropdown() {
    const select = document.getElementById('savedDiceSelect');
    select.innerHTML = '<option value="">Select a saved configuration...</option>';

    savedDiceConfigurations.forEach(config => {
        const option = document.createElement('option');
        option.value = config.id;
        option.textContent = config.name;
        select.appendChild(option);
    });
}

async function saveDiceConfigurationsToStorage() {
    if (!currentUser) return;

    try {
        const response = await fetch('/api/save-dice-configs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                accountName: currentUser,
                diceConfigs: savedDiceConfigurations
            })
        });

        if (!response.ok) {
            console.error('Failed to save dice configurations');
        }
    } catch (error) {
        console.error('Error saving dice configurations:', error);
    }
}

async function loadDiceConfigurationsFromStorage() {
    if (!currentUser) return;

    try {
        const response = await fetch(`/api/get-dice-configs?accountName=${encodeURIComponent(currentUser)}`);
        if (response.ok) {
            const data = await response.json();
            savedDiceConfigurations = data.diceConfigs || [];
            renderSavedDiceDropdown();
        }
    } catch (error) {
        console.error('Error loading dice configurations:', error);
    }
}

function rollDice() {
    const diceTypes = [
        { name: 'd4', sides: 4, id: 'd4Count' },
        { name: 'd6', sides: 6, id: 'd6Count' },
        { name: 'd8', sides: 8, id: 'd8Count' },
        { name: 'd10', sides: 10, id: 'd10Count' },
        { name: 'd12', sides: 12, id: 'd12Count' },
        { name: 'd20', sides: 20, id: 'd20Count' },
        { name: 'd%', sides: 100, id: 'd100Count' }
    ];

    const resultsContainer = document.getElementById('diceResults');
    let hasResults = false;
    let resultsHTML = '';
    let grandTotal = 0;

    diceTypes.forEach(dice => {
        const count = parseInt(document.getElementById(dice.id)?.value) || 0;
        if (count > 0) {
            hasResults = true;
            const rolls = [];
            let total = 0;

            for (let i = 0; i < count; i++) {
                const roll = Math.floor(Math.random() * dice.sides) + 1;
                rolls.push(roll);
                total += roll;
            }

            grandTotal += total;

            resultsHTML += `
                <div class="dice-result-section">
                    <div class="dice-result-header">${count}${dice.name}</div>
                    <div class="dice-roll-list">
                        ${rolls.map((roll, idx) => `<div class="dice-roll-item">Roll ${idx + 1}: ${roll}</div>`).join('')}
                    </div>
                    <div class="dice-result-total">Total: <span>${total}</span></div>
                </div>
            `;
        }
    });

    if (hasResults) {
        resultsHTML += `<div class="grand-total">Grand Total: ${grandTotal}</div>`;
        resultsContainer.innerHTML = resultsHTML;
    } else {
        resultsContainer.innerHTML = '<p class="no-results">Please set at least one die count before rolling</p>';
    }
}

function clearDice() {
    const diceIds = ['d4Count', 'd6Count', 'd8Count', 'd10Count', 'd12Count', 'd20Count', 'd100Count'];
    diceIds.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = '0';
    });

    document.getElementById('diceResults').innerHTML = '<p class="no-results">Set dice counts above and click "Roll Dice" to see results</p>';
}

// Custom Encounter Builder
let customEncounterMonsters = [];

function toggleEncounterBuilder() {
    const panel = document.getElementById('encounterBuilderPanel');
    const icon = document.getElementById('builderToggleIcon');

    if (panel.classList.contains('active')) {
        panel.classList.remove('active');
        icon.textContent = '▶';
    } else {
        panel.classList.add('active');
        icon.textContent = '▼';
    }
}

function addMonsterToBuilder(monsterName) {
    const monster = allMonsters.find(m => m.name === monsterName);
    if (!monster) return;

    // Check if monster already exists in builder
    const existing = customEncounterMonsters.find(m => m.name === monster.name);
    if (existing) {
        existing.count++;
    } else {
        customEncounterMonsters.push({
            name: monster.name,
            cr: monster.cr,
            type: monster.type,
            size: monster.size,
            xp: CR_TO_XP[monster.cr] || 0,
            count: 1
        });
    }

    renderCustomEncounterBuilder();

    // Show panel if hidden
    const panel = document.getElementById('encounterBuilderPanel');
    if (!panel.classList.contains('active')) {
        toggleEncounterBuilder();
    }
}

function renderCustomEncounterBuilder() {
    const listDiv = document.getElementById('builderMonstersList');
    const totalMonstersSpan = document.getElementById('builderTotalMonsters');
    const totalXPSpan = document.getElementById('builderTotalXP');

    if (customEncounterMonsters.length === 0) {
        listDiv.innerHTML = '<p class="no-monsters-selected">No monsters selected. Click "Add to Encounter" on any monster.</p>';
        totalMonstersSpan.textContent = '0';
        totalXPSpan.textContent = '0';
        return;
    }

    const totalMonsters = customEncounterMonsters.reduce((sum, m) => sum + m.count, 0);
    const totalXP = customEncounterMonsters.reduce((sum, m) => sum + (m.xp * m.count), 0);

    totalMonstersSpan.textContent = totalMonsters;
    totalXPSpan.textContent = totalXP.toLocaleString();

    listDiv.innerHTML = customEncounterMonsters.map(monster => `
        <div class="builder-monster-item">
            <div class="builder-monster-info">
                <div class="builder-monster-name">${monster.count > 1 ? `${monster.count}× ` : ''}${monster.name}</div>
                <div class="builder-monster-details">CR ${monster.cr} • ${monster.type} • ${monster.xp} XP ${monster.count > 1 ? `(${monster.xp * monster.count} total)` : ''}</div>
            </div>
            <div class="builder-monster-controls">
                <button class="builder-control-btn" onclick="decrementBuilderMonster('${monster.name.replace(/'/g, "\\'")}')">−</button>
                <span class="builder-count">${monster.count}</span>
                <button class="builder-control-btn" onclick="incrementBuilderMonster('${monster.name.replace(/'/g, "\\'")}')">+</button>
                <button class="builder-remove-btn" onclick="removeBuilderMonster('${monster.name.replace(/'/g, "\\'")}')">🗑️</button>
            </div>
        </div>
    `).join('');
}

function incrementBuilderMonster(monsterName) {
    const monster = customEncounterMonsters.find(m => m.name === monsterName);
    if (monster) {
        monster.count++;
        renderCustomEncounterBuilder();
    }
}

function decrementBuilderMonster(monsterName) {
    const monster = customEncounterMonsters.find(m => m.name === monsterName);
    if (monster) {
        monster.count--;
        if (monster.count <= 0) {
            removeBuilderMonster(monsterName);
        } else {
            renderCustomEncounterBuilder();
        }
    }
}

function removeBuilderMonster(monsterName) {
    customEncounterMonsters = customEncounterMonsters.filter(m => m.name !== monsterName);
    renderCustomEncounterBuilder();
}

function clearCustomEncounter() {
    if (customEncounterMonsters.length === 0) return;

    if (confirm('Clear all monsters from the encounter builder?')) {
        customEncounterMonsters = [];
        renderCustomEncounterBuilder();
    }
}

function viewCustomEncounter() {
    if (customEncounterMonsters.length === 0) {
        alert('Add at least one monster to the encounter builder first');
        return;
    }

    // Calculate encounter stats
    const totalXP = customEncounterMonsters.reduce((sum, m) => sum + (m.xp * m.count), 0);
    const totalMonsters = customEncounterMonsters.reduce((sum, m) => sum + m.count, 0);

    // Determine difficulty based on XP (rough estimation)
    let difficulty = 'Custom';
    let difficultyClass = 'medium';

    // Display the encounter
    const params = {
        difficulty,
        difficultyClass,
        partyLevel: 'N/A',
        partySize: 'N/A',
        xpBudget: totalXP
    };

    displayEncounter(customEncounterMonsters, params);

    // Switch to encounter tab
    switchSection('encounter');
}

function saveCustomEncounter() {
    if (customEncounterMonsters.length === 0) {
        alert('Add at least one monster to the encounter builder first');
        return;
    }

    // Set up the current encounter for saving
    const totalXP = customEncounterMonsters.reduce((sum, m) => sum + (m.xp * m.count), 0);
    const totalMonsters = customEncounterMonsters.reduce((sum, m) => sum + m.count, 0);

    currentEncounter = {
        monsters: customEncounterMonsters,
        params: {
            difficulty: 'Custom',
            difficultyClass: 'medium',
            partyLevel: 'N/A',
            partySize: 'N/A',
            xpBudget: totalXP
        },
        totalXP,
        totalMonsters,
        winChance: 50
    };

    saveEncounterPrompt();
}

// Saved Encounters Functions
let savedEncounters = [];

function saveEncounterPrompt() {
    if (!currentEncounter) {
        alert('No encounter to save');
        return;
    }

    // Populate folder dropdown
    const folderSelect = document.getElementById('encounterFolder');
    const folders = [...new Set(savedEncounters.map(e => e.folder).filter(f => f))];

    folderSelect.innerHTML = '<option value="">No Folder</option>';
    folders.forEach(folder => {
        const option = document.createElement('option');
        option.value = folder;
        option.textContent = folder;
        folderSelect.appendChild(option);
    });

    // Generate default name
    const monsterNames = currentEncounter.monsters.map(m => m.name).join(', ');
    const defaultName = monsterNames.length > 30 ? monsterNames.substring(0, 30) + '...' : monsterNames;
    document.getElementById('encounterName').value = defaultName;
    document.getElementById('newFolderName').value = '';

    document.getElementById('saveEncounterModal').classList.add('active');
}

function closeSaveEncounterModal() {
    document.getElementById('saveEncounterModal').classList.remove('active');
}

async function confirmSaveEncounter() {
    const name = document.getElementById('encounterName').value.trim();
    const folder = document.getElementById('encounterFolder').value;
    const newFolder = document.getElementById('newFolderName').value.trim();

    if (!name) {
        alert('Please enter an encounter name');
        return;
    }

    const encounterData = {
        id: Date.now().toString(),
        name,
        folder: newFolder || folder || '',
        ...currentEncounter
    };

    savedEncounters.push(encounterData);
    await saveEncountersToStorage();
    renderSavedEncountersDropdowns();
    closeSaveEncounterModal();
}

async function saveEncountersToStorage() {
    if (!currentUser) return;

    try {
        const response = await fetch('/api/save-encounters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                accountName: currentUser,
                encounters: savedEncounters
            })
        });

        if (!response.ok) {
            console.error('Failed to save encounters');
        }
    } catch (error) {
        console.error('Error saving encounters:', error);
    }
}

async function loadEncountersFromStorage() {
    if (!currentUser) return;

    try {
        const response = await fetch(`/api/get-encounters?accountName=${encodeURIComponent(currentUser)}`);
        if (response.ok) {
            const data = await response.json();
            savedEncounters = data.encounters || [];
            renderSavedEncountersDropdowns();
        }
    } catch (error) {
        console.error('Error loading encounters:', error);
    }
}

function renderSavedEncountersDropdowns() {
    const folderSelect = document.getElementById('savedFolderSelect');
    const encounterSelect = document.getElementById('savedEncounterSelect');

    // Get unique folders
    const folders = [...new Set(savedEncounters.map(e => e.folder).filter(f => f))];

    // Populate folder dropdown
    folderSelect.innerHTML = '<option value="">All Encounters</option>';
    folders.forEach(folder => {
        const option = document.createElement('option');
        option.value = folder;
        option.textContent = folder;
        folderSelect.appendChild(option);
    });

    // Populate encounter dropdown
    loadSavedEncountersInFolder();
}

function loadSavedEncountersInFolder() {
    const folderSelect = document.getElementById('savedFolderSelect');
    const encounterSelect = document.getElementById('savedEncounterSelect');
    const selectedFolder = folderSelect.value;

    const filtered = selectedFolder
        ? savedEncounters.filter(e => e.folder === selectedFolder)
        : savedEncounters;

    encounterSelect.innerHTML = '<option value="">Select a saved encounter...</option>';
    filtered.forEach(encounter => {
        const option = document.createElement('option');
        option.value = encounter.id;
        option.textContent = encounter.name;
        encounterSelect.appendChild(option);
    });
}

function loadSavedEncounter() {
    const encounterSelect = document.getElementById('savedEncounterSelect');
    const encounterId = encounterSelect.value;

    if (!encounterId) return;

    const encounter = savedEncounters.find(e => e.id === encounterId);
    if (encounter) {
        displayEncounter(encounter.monsters, encounter.params);
    }
}

function deleteSavedEncounter() {
    const encounterSelect = document.getElementById('savedEncounterSelect');
    const encounterId = encounterSelect.value;

    if (!encounterId) {
        alert('Please select an encounter to delete');
        return;
    }

    const encounter = savedEncounters.find(e => e.id === encounterId);
    if (encounter) {
        window.tempDeleteEncounterId = encounterId;
        document.getElementById('deleteEncounterName').textContent = encounter.name;
        document.getElementById('deleteEncounterModal').classList.add('active');
    }
}

function closeDeleteEncounterModal() {
    document.getElementById('deleteEncounterModal').classList.remove('active');
}

async function confirmDeleteEncounter() {
    const encounterId = window.tempDeleteEncounterId;
    if (!encounterId) return;

    savedEncounters = savedEncounters.filter(e => e.id !== encounterId);
    await saveEncountersToStorage();
    renderSavedEncountersDropdowns();
    closeDeleteEncounterModal();
}

// Traits System
const classTraitsByLevel = {
    Barbarian: {
        1: [{ name: 'Rage', notes: 'Enter a rage as a bonus action. Gain advantage on STR checks/saves, +2 rage damage, resistance to physical damage. Lasts 1 minute, 2 rages per day.' },
            { name: 'Unarmored Defense', notes: 'AC = 10 + DEX + CON when not wearing armor.' },
            { name: 'Weapon Mastery', notes: 'Choose 2 weapons. You gain their mastery property.' }],
        2: [{ name: 'Danger Sense', notes: 'Advantage on DEX saves against effects you can see.' },
            { name: 'Reckless Attack', notes: 'Gain advantage on melee attack rolls using STR during your turn, but attack rolls against you have advantage until your next turn.' }],
        3: [{ name: 'Primal Knowledge', notes: 'Gain proficiency in one skill from: Animal Handling, Athletics, Intimidation, Nature, Perception, or Survival.' }],
        5: [{ name: 'Extra Attack', notes: 'Attack twice when you take the Attack action.' },
            { name: 'Fast Movement', notes: 'Speed increases by 10 feet while not wearing heavy armor.' }],
        7: [{ name: 'Feral Instinct', notes: 'Advantage on initiative rolls. Can enter rage as a reaction when surprised.' }],
        9: [{ name: 'Brutal Strike', notes: 'Once per turn when you hit with a melee attack using STR during your rage, deal extra damage or apply special effects.' }],
        11: [{ name: 'Relentless Rage', notes: 'If you drop to 0 HP while raging and don\'t die, make a DC 10 CON save. On success, drop to 1 HP instead. DC increases by 5 each time.' }],
        15: [{ name: 'Persistent Rage', notes: 'Your rage only ends early if you fall unconscious or choose to end it.' }],
        17: [{ name: 'Improved Brutal Strike', notes: 'Your Brutal Strike can be used twice per turn and damage increases.' }],
        20: [{ name: 'Primal Champion', notes: 'Your STR and CON scores increase by 4. Maximum for those scores is now 25.' }]
    },
    Bard: {
        1: [{ name: 'Bardic Inspiration', notes: 'Use bonus action to give ally 1d6 to add to ability check, attack roll, or save within 10 minutes. Number of uses = Charisma modifier.' },
            { name: 'Spellcasting', notes: 'You can cast bard spells. CHA is your spellcasting ability.' }],
        2: [{ name: 'Jack of All Trades', notes: 'Add half proficiency bonus to any ability check that doesn\'t already include it.' },
            { name: 'Song of Rest', notes: 'During a short rest, you and allies who hear your performance regain extra HP equal to your bard level.' }],
        3: [{ name: 'Expertise', notes: 'Choose 2 skills you\'re proficient in. Double proficiency bonus for those skills.' }],
        5: [{ name: 'Font of Inspiration', notes: 'Regain all expended Bardic Inspiration uses when you finish a short or long rest.' }],
        6: [{ name: 'Countercharm', notes: 'Grant yourself and allies within 30ft advantage on saves against frightened and charmed.' }],
        10: [{ name: 'Magical Secrets', notes: 'Learn 2 spells from any class. They count as bard spells for you.' }],
        14: [{ name: 'Superior Inspiration', notes: 'When you roll initiative with no Bardic Inspiration uses left, regain one use.' }],
        18: [{ name: 'Additional Magical Secrets', notes: 'Learn 2 more spells from any class.' }],
        20: [{ name: 'Words of Creation', notes: 'Bardic Inspiration dice become d12s. When a creature uses your inspiration and fails, they can keep the die.' }]
    },
    Cleric: {
        1: [{ name: 'Spellcasting', notes: 'You can cast cleric spells. WIS is your spellcasting ability. You can use a holy symbol as a focus.' },
            { name: 'Divine Order', notes: 'Choose Protector or Thaumaturge for different benefits.' }],
        2: [{ name: 'Channel Divinity', notes: 'Use your Channel Divinity to fuel divine effects. Turn Undead: Force undead within 30ft to flee. Regain uses on short/long rest.' }],
        5: [{ name: 'Sear Undead', notes: 'When you use Turn Undead, each turned undead takes radiant damage equal to your Cleric level.' }],
        7: [{ name: 'Blessed Strikes', notes: 'Once per turn when you deal damage with a cantrip or weapon attack, deal extra 1d8 radiant damage.' }],
        10: [{ name: 'Divine Intervention', notes: 'Call on your deity for aid. Roll d100. If roll ≤ Cleric level, deity intervenes. Can\'t use again for 7 days if successful, or try again after long rest if failed.' }],
        14: [{ name: 'Improved Blessed Strikes', notes: 'Your Blessed Strikes damage increases to 2d8.' }],
        18: [{ name: 'Greater Divine Intervention', notes: 'Your Divine Intervention succeeds automatically, no roll needed. Afterward, can\'t use it again for 2d4 days.' }],
        20: [{ name: 'Divine Intervention Improvement', notes: 'Can use Divine Intervention once per day with no need to roll.' }]
    },
    Druid: {
        1: [{ name: 'Spellcasting', notes: 'You can cast druid spells. WIS is your spellcasting ability. You can use a druidic focus.' },
            { name: 'Druidic', notes: 'You know Druidic, the secret language of druids.' },
            { name: 'Primal Order', notes: 'Choose Magician or Warden for different benefits.' }],
        2: [{ name: 'Wild Shape', notes: 'Use action to transform into a beast you\'ve seen (CR ≤ 1/4). Can stay for hours equal to half druid level. 2 uses, regain on short/long rest.' },
            { name: 'Wild Companion', notes: 'Use Wild Shape to summon a fey spirit that takes animal form (use Find Familiar spell).' }],
        4: [{ name: 'Wild Shape Improvement', notes: 'Can transform into beasts with CR up to 1/2 and swim speed.' }],
        7: [{ name: 'Elemental Fury', notes: 'Once per turn when you deal damage with a cantrip or attack, add your WIS modifier to damage.' }],
        8: [{ name: 'Wild Shape Improvement', notes: 'Can transform into beasts with CR up to 1 and fly speed.' }],
        10: [{ name: 'Elemental Strikes', notes: 'While in Wild Shape, your attacks count as magical.' }],
        14: [{ name: 'Improved Elemental Fury', notes: 'Your Elemental Fury damage increases by your WIS modifier (total 2× WIS).' }],
        18: [{ name: 'Beast Spells', notes: 'You can cast many druid spells while in Wild Shape.' }],
        20: [{ name: 'Archdruid', notes: 'Unlimited Wild Shape uses. Ignore verbal and somatic components of druid spells. You can\'t be aged magically.' }]
    },
    Fighter: {
        1: [{ name: 'Fighting Style', notes: 'Choose a fighting style: Archery, Defense, Dueling, Great Weapon Fighting, Protection, or Two-Weapon Fighting.' },
            { name: 'Second Wind', notes: 'Use bonus action to regain 1d10 + fighter level HP. Can use once per short/long rest.' },
            { name: 'Weapon Mastery', notes: 'Choose 3 weapons. You gain their mastery property.' }],
        2: [{ name: 'Action Surge', notes: 'Take one additional action on your turn. Can use once per short/long rest.' },
            { name: 'Tactical Mind', notes: 'When you fail an INT, WIS, or CHA check, use bonus action to add 1d10. Can use a number of times = INT modifier (min 1), regain on long rest.' }],
        4: [{ name: 'Tactical Shift', notes: 'After hitting with an attack, use a bonus action to move half speed without provoking opportunity attacks.' }],
        5: [{ name: 'Extra Attack', notes: 'Attack twice when you take the Attack action.' }],
        9: [{ name: 'Indomitable', notes: 'Reroll a failed saving throw. Can use once per long rest.' }],
        11: [{ name: 'Two Extra Attacks', notes: 'Attack three times when you take the Attack action.' }],
        13: [{ name: 'Studied Attacks', notes: 'Once per turn when you miss with an attack, you can make it hit instead. Can use a number of times = INT modifier (min 1), regain on long rest.' }],
        17: [{ name: 'Action Surge (2 uses)', notes: 'Can use Action Surge twice per short/long rest.' }],
        20: [{ name: 'Three Extra Attacks', notes: 'Attack four times when you take the Attack action.' }]
    },
    Monk: {
        1: [{ name: 'Martial Arts', notes: 'Use DEX instead of STR for unarmed strikes and monk weapons. Unarmed damage = 1d6. When you use Attack action with unarmed or monk weapon, make one unarmed strike as bonus action.' },
            { name: 'Unarmored Defense', notes: 'AC = 10 + DEX + WIS when not wearing armor or shield.' }],
        2: [{ name: 'Focus Points', notes: 'You have Focus Points = monk level. Flurry of Blows: Spend 1 Focus Point for 2 unarmed strikes as bonus action. Patient Defense: Disengage as bonus action (free) or spend 1 Focus Point to Disengage + Dodge. Step of the Wind: Dash as bonus action (free) or spend 1 Focus Point to Disengage + Dash with doubled jump. Regain on short/long rest.' },
            { name: 'Uncanny Metabolism', notes: 'Once per long rest when you roll initiative, you can regain all expended Focus Points and regain HP equal to your monk level + your Martial Arts die.' },
            { name: 'Unarmored Movement', notes: 'Speed increases while not wearing armor or wielding a shield: +10ft (level 2), +15ft (level 6), +20ft (level 10), +25ft (level 14), +30ft (level 18).' }],
        3: [{ name: 'Deflect Attacks', notes: 'Use reaction to reduce damage from attack by 1d10 + DEX + monk level. If reduced to 0, spend 1 Focus Point to redirect at attacker (melee) or another target (ranged).' }],
        4: [{ name: 'Slow Fall', notes: 'Use reaction when falling to reduce fall damage by 5× monk level.' }],
        5: [{ name: 'Extra Attack', notes: 'Attack twice when you take the Attack action.' },
            { name: 'Stunning Strike', notes: 'Once per turn when you hit with a melee weapon or unarmed strike, spend 1 Focus Point to force target to make CON save or be stunned until end of your next turn.' }],
        6: [{ name: 'Empowered Strikes', notes: 'Your unarmed strikes count as magical.' }],
        7: [{ name: 'Evasion', notes: 'When you succeed on DEX save that deals half damage on success, take no damage instead. On fail, take half damage.' }],
        10: [{ name: 'Self-Restoration', notes: 'As action, end one condition on yourself: charmed, frightened, or poisoned. Also, spend 4 Focus Points to end one level of exhaustion.' }],
        13: [{ name: 'Deflect Energy', notes: 'When you take acid, cold, fire, lightning, or thunder damage, use reaction to reduce damage by 1d10 + WIS + monk level. Spend 1 Focus Point to reflect it.' }],
        14: [{ name: 'Disciplined Survivor', notes: 'Death saves use WIS modifier instead of no modifier. When you start turn with 0 HP and succeed on death save, stand up with HP = monk level.' }],
        15: [{ name: 'Perfect Focus', notes: 'When you roll initiative with fewer than 4 Focus Points, regain Focus Points until you have 4.' }],
        18: [{ name: 'Superior Defense', notes: 'At start of turn, spend 3 Focus Points to give yourself resistance to all damage except Force damage until start of next turn.' }],
        20: [{ name: 'Body and Mind', notes: 'Martial Arts damage becomes 1d12. At end of turn if bloodied, regain Focus Points = WIS modifier (min 1).' }]
    },
    Paladin: {
        1: [{ name: 'Lay on Hands', notes: 'Touch a creature to restore HP. Have pool of HP = 5× paladin level. Restore any amount from pool. Can also cure one disease or neutralize poison (costs 5 HP from pool). Regain on long rest.' },
            { name: 'Spellcasting', notes: 'You can cast paladin spells. CHA is your spellcasting ability.' },
            { name: 'Weapon Mastery', notes: 'Choose 2 weapons. You gain their mastery property.' }],
        2: [{ name: 'Fighting Style', notes: 'Choose a fighting style: Blessed Warrior, Defense, Dueling, Great Weapon Fighting, or Protection.' },
            { name: 'Paladin\'s Smite', notes: 'As bonus action, expend spell slot to deal extra radiant damage (2d8 for 1st level slot, +1d8 per higher level) on next attack that hits. Lasts until end of turn.' }],
        3: [{ name: 'Channel Divinity', notes: 'Gain Channel Divinity options based on your Sacred Oath. Regain on short/long rest.' },
            { name: 'Harness Divine Power', notes: 'Use Channel Divinity to regain one expended spell slot (max level = half proficiency bonus).' }],
        5: [{ name: 'Extra Attack', notes: 'Attack twice when you take the Attack action.' },
            { name: 'Faithful Steed', notes: 'Cast Find Steed spell once per long rest without using a spell slot.' }],
        6: [{ name: 'Aura of Protection', notes: 'You and allies within 10ft add your CHA modifier to saving throws.' }],
        10: [{ name: 'Aura of Courage', notes: 'You and allies within 10ft can\'t be frightened.' }],
        11: [{ name: 'Radiant Strikes', notes: 'Your attacks with weapons deal extra 1d8 radiant damage.' }],
        14: [{ name: 'Restoring Touch', notes: 'Use Lay on Hands to end one spell on the target (costs HP from pool = spell level × 5).' }],
        18: [{ name: 'Aura Expansion', notes: 'Your Aura of Protection and Aura of Courage range increases to 30ft.' }],
        19: [{ name: 'Epic Boon', notes: 'Gain an Epic Boon feat of your choice.' }],
        20: [{ name: 'Sacred Oath Feature', notes: 'Gain 20th level feature from your Sacred Oath.' }]
    },
    Ranger: {
        1: [{ name: 'Spellcasting', notes: 'You can cast ranger spells. WIS is your spellcasting ability.' },
            { name: 'Favored Enemy', notes: 'Choose Celestial, Construct, Dragon, Elemental, Fey, Fiend, Giant, Monstrosity, Ooze, Plant, or Undead. Advantage on Survival checks to track and INT checks to recall info about them.' },
            { name: 'Deft Explorer', notes: 'Expertise in one skill. Your walking speed increases by 5ft.' },
            { name: 'Weapon Mastery', notes: 'Choose 2 weapons. You gain their mastery property.' }],
        2: [{ name: 'Fighting Style', notes: 'Choose a fighting style: Archery, Defense, Dueling, or Two-Weapon Fighting.' }],
        3: [{ name: 'Primeval Awareness', notes: 'Use action to sense whether favored enemies are within 1 mile (or 6 miles if favored terrain). Learn number, distance, and direction.' }],
        5: [{ name: 'Extra Attack', notes: 'Attack twice when you take the Attack action.' }],
        6: [{ name: 'Roving', notes: 'Walking speed increases by 5ft (total +10ft). Gain climbing and swimming speed = walking speed.' }],
        8: [{ name: 'Land\'s Stride', notes: 'Moving through nonmagical difficult terrain costs no extra movement. Advantage on saves against plants that impede movement.' }],
        10: [{ name: 'Tireless', notes: 'As action, give yourself temporary HP = 1d8 + WIS modifier. Can use a number of times = proficiency bonus, regain on long rest. Also reduce exhaustion on short rest.' }],
        13: [{ name: 'Nature\'s Veil', notes: 'Use bonus action to become invisible until start of next turn. Can use a number of times = proficiency bonus, regain on long rest.' }],
        14: [{ name: 'Vanish', notes: 'Use Hide action as bonus action. Can\'t be tracked by nonmagical means unless you choose to leave a trail.' }],
        18: [{ name: 'Feral Senses', notes: 'Gain blindsight with 30ft range. You can detect creatures within range that aren\'t behind total cover.' }],
        20: [{ name: 'Foe Slayer', notes: 'Once per turn when you hit a creature with a weapon attack, add WIS modifier to damage.' }]
    },
    Rogue: {
        1: [{ name: 'Expertise', notes: 'Choose 2 skills you\'re proficient in. Double proficiency bonus for those skills.' },
            { name: 'Sneak Attack', notes: 'Once per turn, deal extra 1d6 damage to one creature you hit with an attack if you have advantage or an ally is within 5ft of target. Increases at higher levels.' },
            { name: 'Thieves\' Cant', notes: 'Know thieves\' cant, a secret mix of dialect and jargon.' },
            { name: 'Weapon Mastery', notes: 'Choose 2 weapons. You gain their mastery property.' }],
        2: [{ name: 'Cunning Action', notes: 'Use bonus action to Dash, Disengage, or Hide.' }],
        3: [{ name: 'Steady Aim', notes: 'As bonus action, give yourself advantage on next attack roll this turn. Speed must be 0 this turn.' }],
        5: [{ name: 'Uncanny Dodge', notes: 'Use reaction to halve damage from an attack you can see.' }],
        7: [{ name: 'Evasion', notes: 'When you succeed on DEX save that deals half damage on success, take no damage instead. On fail, take half damage.' },
            { name: 'Reliable Talent', notes: 'When making ability check with skill you\'re proficient in, treat d20 roll of 9 or lower as 10.' }],
        11: [{ name: 'Improved Cunning Action', notes: 'Cunning Action can now also be used to Aim (Steady Aim), Use an Object, or make a DEX (Sleight of Hand) check.' }],
        14: [{ name: 'Devious Strikes', notes: 'When you deal Sneak Attack, you can choose to forgo some damage to apply special effect: Daze, Knock Out, or Obscure.' }],
        15: [{ name: 'Slippery Mind', notes: 'Gain proficiency in WIS saves.' }],
        18: [{ name: 'Elusive', notes: 'No attack roll has advantage against you while you aren\'t incapacitated.' }],
        20: [{ name: 'Stroke of Luck', notes: 'Turn a miss into a hit, or treat failed ability check as a 20. Once per short/long rest.' }]
    },
    Sorcerer: {
        1: [{ name: 'Spellcasting', notes: 'You can cast sorcerer spells. CHA is your spellcasting ability.' },
            { name: 'Innate Sorcery', notes: 'As bonus action, release magic within for 1 minute. While active: spells with 1 action cast time can be cast with bonus action (once per turn), +1 bonus to spell attack rolls and save DC. Can use a number of times = proficiency bonus, regain on long rest.' }],
        2: [{ name: 'Font of Magic', notes: 'You have sorcery points = sorcerer level. Regain on long rest. Can convert spell slots to points and vice versa.' },
            { name: 'Metamagic', notes: 'Choose 2 metamagic options. You can use sorcery points to alter your spells: Careful, Distant, Empowered, Extended, Heightened, Quickened, Seeking, Subtle, Transmuted, or Twinned.' }],
        3: [{ name: 'Additional Metamagic', notes: 'Choose 1 additional metamagic option.' }],
        5: [{ name: 'Sorcerous Restoration', notes: 'When you finish short rest, regain sorcery points = half sorcerer level (rounded down, min 1).' }],
        7: [{ name: 'Sorcery Incarnate', notes: 'When using Innate Sorcery, you can use one metamagic option without spending sorcery points. Do this once per long rest.' }],
        10: [{ name: 'Additional Metamagic', notes: 'Choose 1 additional metamagic option.' }],
        17: [{ name: 'Additional Metamagic', notes: 'Choose 1 additional metamagic option.' }],
        20: [{ name: 'Arcane Apotheosis', notes: 'While Innate Sorcery is active, you can use one metamagic on each spell you cast without spending extra sorcery points (but only one metamagic per spell).' }]
    },
    Warlock: {
        1: [{ name: 'Pact Magic', notes: 'You can cast warlock spells. CHA is your spellcasting ability. Regain all spell slots on short/long rest.' },
            { name: 'Eldritch Invocations', notes: 'Choose 2 eldritch invocations. These grant you special abilities.' }],
        2: [{ name: 'Magical Cunning', notes: 'Use bonus action to regain expended spell slots (total level ≤ half warlock level). Once per long rest.' }],
        3: [{ name: 'Pact Boon', notes: 'Choose Pact of the Blade, Pact of the Chain, or Pact of the Tome for additional abilities.' }],
        5: [{ name: 'Additional Invocation', notes: 'Choose 1 additional eldritch invocation.' }],
        7: [{ name: 'Additional Invocation', notes: 'Choose 1 additional eldritch invocation.' }],
        9: [{ name: 'Contact Patron', notes: 'Cast Contact Other Plane without components or exhaustion. Once per long rest. Also choose 1 additional invocation.' }],
        11: [{ name: 'Mystic Arcanum (6th level)', notes: 'Choose one 6th-level spell from warlock list. You can cast it once per long rest without using a spell slot.' }],
        12: [{ name: 'Additional Invocation', notes: 'Choose 1 additional eldritch invocation.' }],
        13: [{ name: 'Mystic Arcanum (7th level)', notes: 'Choose one 7th-level spell from warlock list. You can cast it once per long rest without using a spell slot.' }],
        15: [{ name: 'Mystic Arcanum (8th level)', notes: 'Choose one 8th-level spell from warlock list. You can cast it once per long rest without using a spell slot. Also choose 1 additional invocation.' }],
        17: [{ name: 'Mystic Arcanum (9th level)', notes: 'Choose one 9th-level spell from warlock list. You can cast it once per long rest without using a spell slot.' }],
        18: [{ name: 'Additional Invocation', notes: 'Choose 1 additional eldritch invocation.' }],
        20: [{ name: 'Eldritch Master', notes: 'Use action to regain all expended Mystic Arcanum uses. Once per long rest.' }]
    },
    Wizard: {
        1: [{ name: 'Spellcasting', notes: 'You can cast wizard spells. INT is your spellcasting ability. You have a spellbook. Ritual Casting: can cast wizard ritual spells as rituals.' },
            { name: 'Arcane Recovery', notes: 'Once per day during short rest, recover spell slots (total level ≤ half wizard level, max 5th level slots).' }],
        2: [{ name: 'Scholar', notes: 'Gain proficiency in one skill from: Arcana, History, Investigation, Medicine, Nature, or Religion. Gain Expertise in that skill (double proficiency bonus).' }],
        3: [{ name: 'Memorize Spell', notes: 'When you finish a short rest, replace one prepared spell with another from your spellbook.' }],
        5: [{ name: 'Spell Mastery', notes: 'Choose one 1st-level and one 2nd-level wizard spell in your spellbook. You can cast them at their lowest level without expending a spell slot. Can change choices during long rest.' }],
        18: [{ name: 'Signature Spells', notes: 'Choose two 3rd-level wizard spells in your spellbook as signature spells. You always have them prepared and can cast each once per short rest without using a spell slot.' }],
        20: [{ name: 'Epic Boon', notes: 'Gain an Epic Boon feat of your choice.' }]
    }
};

const speciesTraits = {
    Dragonborn: [
        { name: 'Draconic Ancestry', notes: 'Your breath weapon and damage resistance are determined by your dragon type.' },
        { name: 'Breath Weapon', notes: 'Exhale destructive energy (type based on ancestry). 30ft line (DEX save) or 15ft cone (DEX save). Damage = 1d10 at 1st level, 2d10 at 5th, 3d10 at 11th, 4d10 at 17th. Uses = proficiency bonus, regain on long rest.' },
        { name: 'Damage Resistance', notes: 'Resistant to damage type associated with your draconic ancestry.' },
        { name: 'Darkvision', notes: 'See in dim light within 60 feet as if bright light, darkness as dim light.' }
    ],
    Dwarf: [
        { name: 'Darkvision', notes: 'See in dim light within 120 feet as if bright light, darkness as dim light.' },
        { name: 'Dwarven Resilience', notes: 'Advantage on saving throws against poison, resistance to poison damage.' },
        { name: 'Dwarven Toughness', notes: 'HP maximum increases by 1 per level.' },
        { name: 'Stonecunning', notes: 'Whenever you make an INT (History) check related to origin of stonework, add double proficiency bonus.' }
    ],
    Elf: [
        { name: 'Darkvision', notes: 'See in dim light within 60 feet as if bright light, darkness as dim light.' },
        { name: 'Fey Ancestry', notes: 'Advantage on saves against charmed, magic can\'t put you to sleep.' },
        { name: 'Keen Senses', notes: 'Proficiency in Perception skill.' },
        { name: 'Trance', notes: 'Don\'t need to sleep. Meditate 4 hours instead of 8-hour sleep.' }
    ],
    Human: [
        { name: 'Resourceful', notes: 'Gain Inspiration whenever you finish a Long Rest.' },
        { name: 'Skillful', notes: 'Gain proficiency in one skill of your choice.' },
        { name: 'Versatile', notes: 'Gain an Origin feat of your choice.' }
    ],
    Halfling: [
        { name: 'Brave', notes: 'Advantage on saves against frightened condition.' },
        { name: 'Halfling Nimbleness', notes: 'Can move through space of any creature larger than you.' },
        { name: 'Luck', notes: 'When you roll a 1 on d20 for attack, check, or save, reroll and use the new roll.' },
        { name: 'Naturally Stealthy', notes: 'Can attempt to hide even when obscured only by a creature one size larger.' }
    ],
    Tiefling: [
        { name: 'Darkvision', notes: 'See in dim light within 60 feet as if bright light, darkness as dim light.' },
        { name: 'Fiendish Legacy', notes: 'Choose a fiendish lineage determining your resistance and spells.' },
        { name: 'Otherworldly Presence', notes: 'Know Thaumaturgy cantrip. Starting at 3rd level, cast spells based on your lineage. CHA is spellcasting ability.' }
    ],
    Goliath: [
        { name: 'Giant Ancestry', notes: 'Choose one giant ancestry: Cloud, Fire, Frost, Hill, Stone, or Storm. You gain a supernatural gift usable proficiency bonus times per long rest.' },
        { name: 'Large Form (Level 5+)', notes: 'At 5th level, as a bonus action, you can change your size to Large if there is enough space. Lasts 10 minutes. Can use proficiency bonus times per long rest.' },
        { name: 'Powerful Build', notes: 'Count as one size larger when determining carrying capacity and weight you can push, drag, or lift.' }
    ],
    'Goliath (Cloud Giant)': [
        { name: 'Cloud\'s Jaunt', notes: 'As a bonus action, magically teleport up to 30 feet to an unoccupied space you can see. Uses = proficiency bonus, regain on long rest.' },
        { name: 'Giant Ancestry', notes: 'You have Cloud Giant ancestry, granting you the Cloud\'s Jaunt ability.' },
        { name: 'Large Form (Level 5+)', notes: 'At 5th level, as a bonus action, you can change your size to Large if there is enough space. Lasts 10 minutes. Can use proficiency bonus times per long rest.' },
        { name: 'Powerful Build', notes: 'Count as one size larger when determining carrying capacity and weight you can push, drag, or lift.' }
    ],
    'Goliath (Fire Giant)': [
        { name: 'Fire\'s Burn', notes: 'When you hit a target with an attack roll and deal damage, you can also deal 1d10 fire damage to that target. Uses = proficiency bonus, regain on long rest.' },
        { name: 'Giant Ancestry', notes: 'You have Fire Giant ancestry, granting you the Fire\'s Burn ability.' },
        { name: 'Large Form (Level 5+)', notes: 'At 5th level, as a bonus action, you can change your size to Large if there is enough space. Lasts 10 minutes. Can use proficiency bonus times per long rest.' },
        { name: 'Powerful Build', notes: 'Count as one size larger when determining carrying capacity and weight you can push, drag, or lift.' }
    ],
    'Goliath (Frost Giant)': [
        { name: 'Frost\'s Chill', notes: 'When you hit a target with an attack roll and deal damage, you can also deal 1d6 cold damage to that target and reduce its speed by 10 feet until the start of your next turn. Uses = proficiency bonus, regain on long rest.' },
        { name: 'Giant Ancestry', notes: 'You have Frost Giant ancestry, granting you the Frost\'s Chill ability.' },
        { name: 'Large Form (Level 5+)', notes: 'At 5th level, as a bonus action, you can change your size to Large if there is enough space. Lasts 10 minutes. Can use proficiency bonus times per long rest.' },
        { name: 'Powerful Build', notes: 'Count as one size larger when determining carrying capacity and weight you can push, drag, or lift.' }
    ],
    'Goliath (Hill Giant)': [
        { name: 'Hill\'s Tumble', notes: 'When you hit a Large or smaller creature with an attack roll and deal damage, you can give that target the Prone condition. Uses = proficiency bonus, regain on long rest.' },
        { name: 'Giant Ancestry', notes: 'You have Hill Giant ancestry, granting you the Hill\'s Tumble ability.' },
        { name: 'Large Form (Level 5+)', notes: 'At 5th level, as a bonus action, you can change your size to Large if there is enough space. Lasts 10 minutes. Can use proficiency bonus times per long rest.' },
        { name: 'Powerful Build', notes: 'Count as one size larger when determining carrying capacity and weight you can push, drag, or lift.' }
    ],
    'Goliath (Stone Giant)': [
        { name: 'Stone\'s Endurance', notes: 'When you take damage, you can use your reaction to roll 1d12, add your CON modifier, and reduce the damage by that total. Uses = proficiency bonus, regain on long rest.' },
        { name: 'Giant Ancestry', notes: 'You have Stone Giant ancestry, granting you the Stone\'s Endurance ability.' },
        { name: 'Large Form (Level 5+)', notes: 'At 5th level, as a bonus action, you can change your size to Large if there is enough space. Lasts 10 minutes. Can use proficiency bonus times per long rest.' },
        { name: 'Powerful Build', notes: 'Count as one size larger when determining carrying capacity and weight you can push, drag, or lift.' }
    ],
    'Goliath (Storm Giant)': [
        { name: 'Storm\'s Thunder', notes: 'When you take damage from a creature within 60 feet of you, you can use your reaction to deal 1d8 thunder damage to that creature. Uses = proficiency bonus, regain on long rest.' },
        { name: 'Giant Ancestry', notes: 'You have Storm Giant ancestry, granting you the Storm\'s Thunder ability.' },
        { name: 'Large Form (Level 5+)', notes: 'At 5th level, as a bonus action, you can change your size to Large if there is enough space. Lasts 10 minutes. Can use proficiency bonus times per long rest.' },
        { name: 'Powerful Build', notes: 'Count as one size larger when determining carrying capacity and weight you can push, drag, or lift.' }
    ],
    Gnome: [
        { name: 'Darkvision', notes: 'See in dim light within 60 feet as if bright light, darkness as dim light.' },
        { name: 'Gnome Cunning', notes: 'Advantage on INT, WIS, and CHA saves against magic.' },
        { name: 'Small Size', notes: 'You are Small. Speed is 25 feet.' }
    ],
    'Half-Elf': [
        { name: 'Darkvision', notes: 'See in dim light within 60 feet as if bright light, darkness as dim light.' },
        { name: 'Fey Ancestry', notes: 'Advantage on saves against charmed, magic can\'t put you to sleep.' },
        { name: 'Skill Versatility', notes: 'Gain proficiency in two skills of your choice.' }
    ],
    'Half-Orc': [
        { name: 'Darkvision', notes: 'See in dim light within 60 feet as if bright light, darkness as dim light.' },
        { name: 'Relentless Endurance', notes: 'When reduced to 0 HP but not killed outright, drop to 1 HP instead. Can\'t use again until you finish a long rest.' },
        { name: 'Savage Attacks', notes: 'When you score a critical hit with a melee weapon, roll one of the weapon\'s damage dice one additional time and add it to the extra damage.' },
        { name: 'Adrenaline Rush', notes: 'Use bonus action to move up to your speed toward an enemy. Can use proficiency bonus times per long rest.' }
    ],
    Orc: [
        { name: 'Darkvision', notes: 'See in dim light within 60 feet as if bright light, darkness as dim light.' },
        { name: 'Powerful Build', notes: 'Count as one size larger when determining carrying capacity and weight you can push, drag, or lift.' },
        { name: 'Relentless Endurance', notes: 'When reduced to 0 HP but not killed outright, drop to 1 HP instead. Can\'t use again until you finish a long rest.' },
        { name: 'Adrenaline Rush', notes: 'Use bonus action to move up to your speed toward an enemy. Can use proficiency bonus times per long rest.' }
    ],
    Aasimar: [
        { name: 'Darkvision', notes: 'See in dim light within 60 feet as if bright light, darkness as dim light.' },
        { name: 'Celestial Resistance', notes: 'Resistance to necrotic damage and radiant damage.' },
        { name: 'Healing Hands', notes: 'Touch a creature to restore HP = your level. Can use a number of times = proficiency bonus, regain on long rest.' },
        { name: 'Light Bearer', notes: 'You know the Light cantrip. CHA is your spellcasting ability for it.' }
    ]
};

function addCustomTrait() {
    document.getElementById('traitName').value = '';
    document.getElementById('traitNotes').value = '';
    document.getElementById('addTraitModal').classList.add('active');
}

function closeAddTraitModal() {
    document.getElementById('addTraitModal').classList.remove('active');
}

function confirmAddTrait() {
    const name = document.getElementById('traitName').value.trim();
    const notes = document.getElementById('traitNotes').value.trim();

    if (!name) {
        alert('Please enter a trait name');
        return;
    }

    const char = characters[currentCharacterIndex];
    if (!char.traits) char.traits = [];

    char.traits.push({
        id: Date.now().toString(),
        name,
        notes,
        type: 'custom'
    });

    renderTraits();
    closeAddTraitModal();
    saveUserData();
}

function renderTraits() {
    const char = characters[currentCharacterIndex];
    const listDiv = document.getElementById('traitsList');

    if (!char.traits || char.traits.length === 0) {
        listDiv.innerHTML = '<p class="no-traits">No features or traits added. Use auto-populate buttons or add manually.</p>';
        return;
    }

    listDiv.innerHTML = char.traits.map(trait => `
        <div class="trait-item">
            <div class="trait-header" onclick="toggleTraitNotes('${trait.id}')">
                <span class="trait-name">${trait.name}</span>
                <div class="trait-controls">
                    <span class="trait-toggle-icon" id="toggle-${trait.id}">▼</span>
                    <button class="trait-delete-btn" onclick="event.stopPropagation(); deleteTrait('${trait.id}')">&times;</button>
                </div>
            </div>
            <div class="trait-notes" id="notes-${trait.id}">
                ${trait.notes || 'No description available'}
            </div>
        </div>
    `).join('');
}

function toggleTraitNotes(traitId) {
    const notesDiv = document.getElementById(`notes-${traitId}`);
    const toggleIcon = document.getElementById(`toggle-${traitId}`);

    if (notesDiv.style.display === 'none') {
        notesDiv.style.display = 'block';
        toggleIcon.textContent = '▼';
    } else {
        notesDiv.style.display = 'none';
        toggleIcon.textContent = '▶';
    }
}

function deleteTrait(traitId) {
    const char = characters[currentCharacterIndex];
    if (!char.traits) return;

    char.traits = char.traits.filter(t => t.id !== traitId);
    renderTraits();
    saveUserData();
}

function autoPopulateClassTraits() {
    const char = characters[currentCharacterIndex];
    const className = document.getElementById('charClass').value;
    const level = parseInt(document.getElementById('charLevel').value) || 1;

    if (!className) {
        alert('Please select a class first');
        return;
    }

    if (!char.traits) char.traits = [];

    // Remove old class traits
    char.traits = char.traits.filter(t => t.type !== 'class');

    // Add class traits up to current level
    const classTraits = classTraitsByLevel[className];
    if (classTraits) {
        for (let lvl = 1; lvl <= level; lvl++) {
            if (classTraits[lvl]) {
                classTraits[lvl].forEach(trait => {
                    char.traits.push({
                        id: `class-${lvl}-${trait.name.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}-${Math.random()}`,
                        name: `${trait.name} (Lvl ${lvl})`,
                        notes: trait.notes,
                        type: 'class'
                    });
                });
            }
        }
        console.log(`Added ${char.traits.filter(t => t.type === 'class').length} class traits for ${className} level ${level}`);
    } else {
        alert(`Class trait data not available for ${className}`);
        return;
    }

    // Update HP, proficiency, and counters
    updateCharacterStats();
    applyTraitEffectsToCharacterSheet();
    createCountersFromTraits();
    renderTraits();
    saveUserData();
}

function autoPopulateSpeciesTraits() {
    const char = characters[currentCharacterIndex];
    const species = document.getElementById('charSpecies').value;

    if (!species) {
        alert('Please select a species first');
        return;
    }

    if (!char.traits) char.traits = [];

    // Remove old species traits
    char.traits = char.traits.filter(t => t.type !== 'species');

    // Add species traits
    const traits = speciesTraits[species];
    if (traits) {
        traits.forEach(trait => {
            char.traits.push({
                id: `species-${trait.name}-${Date.now()}`,
                name: trait.name,
                notes: trait.notes,
                type: 'species'
            });
        });
    }

    createCountersFromTraits();
    applyTraitEffectsToCharacterSheet();
    renderTraits();
    saveUserData();
}

function applyTraitEffectsToCharacterSheet() {
    const char = characters[currentCharacterIndex];
    if (!char.traits) return;

    const className = document.getElementById('charClass').value;
    const level = parseInt(document.getElementById('charLevel').value) || 1;

    // Get ability scores
    const dexScore = parseInt(document.getElementById('dex').value) || 10;
    const dexMod = Math.floor((dexScore - 10) / 2);
    const conScore = parseInt(document.getElementById('con').value) || 10;
    const conMod = Math.floor((conScore - 10) / 2);
    const wisScore = parseInt(document.getElementById('wis').value) || 10;
    const wisMod = Math.floor((wisScore - 10) / 2);

    let baseSpeed = 30; // Default speed
    let speedBonus = 0;
    let hasUnarmoredDefense = false;
    let unarmoredDefenseFormula = '';

    // Check each trait for effects
    char.traits.forEach(trait => {
        const name = trait.name.toLowerCase();
        const notes = (trait.notes || '').toLowerCase();

        // Fast Movement (Barbarian)
        if (name.includes('fast movement') && notes.includes('speed increases by 10')) {
            speedBonus += 10;
        }

        // Unarmored Movement (Monk) - scales with level
        if (name.includes('unarmored movement')) {
            if (level >= 18) {
                speedBonus += 30;
            } else if (level >= 14) {
                speedBonus += 25;
            } else if (level >= 10) {
                speedBonus += 20;
            } else if (level >= 6) {
                speedBonus += 15;
            } else if (level >= 2) {
                speedBonus += 10;
            }
        }

        // Roving (Ranger) - +5ft at level 1, +10ft at level 6
        if (name.includes('deft explorer') && notes.includes('speed increases by 5')) {
            speedBonus += 5;
        }
        if (name.includes('roving') && notes.includes('speed increases by 5')) {
            speedBonus += 5;
        }

        // Unarmored Defense (Barbarian)
        if (name.includes('unarmored defense') && notes.includes('ac = 10 + dex + con')) {
            hasUnarmoredDefense = true;
            const unarmoredAC = 10 + dexMod + conMod;
            unarmoredDefenseFormula = `AC = 10 + DEX (${dexMod >= 0 ? '+' : ''}${dexMod}) + CON (${conMod >= 0 ? '+' : ''}${conMod}) = ${unarmoredAC}`;

            // Update AC field
            if (document.getElementById('ac')) {
                document.getElementById('ac').value = unarmoredAC;
            }
        }

        // Unarmored Defense (Monk)
        if (name.includes('unarmored defense') && notes.includes('ac = 10 + dex + wis')) {
            hasUnarmoredDefense = true;
            const unarmoredAC = 10 + dexMod + wisMod;
            unarmoredDefenseFormula = `AC = 10 + DEX (${dexMod >= 0 ? '+' : ''}${dexMod}) + WIS (${wisMod >= 0 ? '+' : ''}${wisMod}) = ${unarmoredAC}`;

            // Update AC field
            if (document.getElementById('ac')) {
                document.getElementById('ac').value = unarmoredAC;
            }
        }

        // Dwarven Toughness - HP bonus
        if (name.includes('dwarven toughness') && notes.includes('hp maximum increases by 1 per level')) {
            // This is handled by Set HP button, but we can add a note
            console.log('Dwarven Toughness: Add +' + level + ' to max HP');
        }
    });

    // Apply speed changes
    const totalSpeed = baseSpeed + speedBonus;
    if (document.getElementById('speed')) {
        document.getElementById('speed').value = totalSpeed;
    }

    // Log unarmored defense info
    if (hasUnarmoredDefense) {
        console.log('Unarmored Defense applied:', unarmoredDefenseFormula);
    }

    // Update attack bonuses
    updateAttackBonuses();
}

function updateAttackBonuses() {
    // Get ability scores
    const strScore = parseInt(document.getElementById('str').value) || 10;
    const strMod = Math.floor((strScore - 10) / 2);
    const dexScore = parseInt(document.getElementById('dex').value) || 10;
    const dexMod = Math.floor((dexScore - 10) / 2);

    // Get proficiency bonus
    const profBonus = parseInt(document.getElementById('profBonus').value) || 2;

    // Calculate attack bonuses
    const meleeBonus = profBonus + strMod;
    const rangedBonus = profBonus + dexMod;
    const finesseBonus = profBonus + Math.max(strMod, dexMod);

    // Update display
    if (document.getElementById('meleeAttackBonus')) {
        document.getElementById('meleeAttackBonus').textContent = meleeBonus >= 0 ? `+${meleeBonus}` : meleeBonus;
    }
    if (document.getElementById('rangedAttackBonus')) {
        document.getElementById('rangedAttackBonus').textContent = rangedBonus >= 0 ? `+${rangedBonus}` : rangedBonus;
    }
    if (document.getElementById('finesseAttackBonus')) {
        document.getElementById('finesseAttackBonus').textContent = finesseBonus >= 0 ? `+${finesseBonus}` : finesseBonus;
    }

    // Update formulas
    if (document.getElementById('meleeAttackFormula')) {
        document.getElementById('meleeAttackFormula').textContent = `Prof (${profBonus >= 0 ? '+' : ''}${profBonus}) + STR (${strMod >= 0 ? '+' : ''}${strMod})`;
    }
    if (document.getElementById('rangedAttackFormula')) {
        document.getElementById('rangedAttackFormula').textContent = `Prof (${profBonus >= 0 ? '+' : ''}${profBonus}) + DEX (${dexMod >= 0 ? '+' : ''}${dexMod})`;
    }
    if (document.getElementById('finesseAttackFormula')) {
        const usedMod = Math.max(strMod, dexMod);
        const usedStat = usedMod === strMod ? 'STR' : 'DEX';
        document.getElementById('finesseAttackFormula').textContent = `Prof (${profBonus >= 0 ? '+' : ''}${profBonus}) + ${usedStat} (${usedMod >= 0 ? '+' : ''}${usedMod})`;
    }
}

function createCountersFromTraits() {
    const char = characters[currentCharacterIndex];
    if (!char.traits) return;

    const level = parseInt(document.getElementById('charLevel').value) || 1;
    const profBonus = Math.ceil(level / 4) + 1;

    // Get ability modifiers
    const chaScore = parseInt(document.getElementById('cha').value) || 10;
    const chaMod = Math.floor((chaScore - 10) / 2);
    const intScore = parseInt(document.getElementById('int').value) || 10;
    const intMod = Math.floor((intScore - 10) / 2);
    const wisScore = parseInt(document.getElementById('wis').value) || 10;
    const wisMod = Math.floor((wisScore - 10) / 2);

    // Initialize counters array if needed
    if (!char.counters) char.counters = [];

    // Remove old auto-generated counters
    char.counters = char.counters.filter(c => !c.autoGenerated);

    // Parse traits and create counters based on common patterns
    char.traits.forEach(trait => {
        const name = trait.name.toLowerCase();
        const notes = (trait.notes || '').toLowerCase();

        // Rage (Barbarian)
        if (name.includes('rage') && notes.includes('rages per day')) {
            const ragesMatch = notes.match(/(\d+)\s+rages?\s+per\s+day/i);
            if (ragesMatch) {
                char.counters.push({
                    id: `auto-rage-${Date.now()}`,
                    name: 'Rage',
                    max: parseInt(ragesMatch[1]),
                    current: parseInt(ragesMatch[1]),
                    autoGenerated: true
                });
            }
        }

        // Bardic Inspiration
        if (name.includes('bardic inspiration')) {
            char.counters.push({
                id: `auto-bardic-${Date.now()}`,
                name: 'Bardic Inspiration',
                max: Math.max(1, chaMod),
                current: Math.max(1, chaMod),
                autoGenerated: true
            });
        }

        // Channel Divinity (Cleric/Paladin)
        if (name.includes('channel divinity') && trait.type === 'class') {
            const usesPerRest = level >= 18 ? 3 : (level >= 6 ? 2 : 1);
            char.counters.push({
                id: `auto-channel-${Date.now()}`,
                name: 'Channel Divinity',
                max: usesPerRest,
                current: usesPerRest,
                autoGenerated: true
            });
        }

        // Wild Shape (Druid)
        if (name.includes('wild shape') && notes.includes('2 uses')) {
            char.counters.push({
                id: `auto-wildshape-${Date.now()}`,
                name: 'Wild Shape',
                max: 2,
                current: 2,
                autoGenerated: true
            });
        }

        // Focus Points (Monk) - Focus Points equal to monk level
        if (name.includes('focus points') && trait.type === 'class') {
            const focusPoints = level;
            char.counters.push({
                id: `auto-focus-${Date.now()}`,
                name: 'Focus Points',
                max: focusPoints,
                current: focusPoints,
                autoGenerated: true
            });
        }

        // Lay on Hands (Paladin)
        if (name.includes('lay on hands')) {
            const poolHP = 5 * level;
            char.counters.push({
                id: `auto-layonhands-${Date.now()}`,
                name: 'Lay on Hands HP Pool',
                max: poolHP,
                current: poolHP,
                autoGenerated: true
            });
        }

        // Action Surge (Fighter)
        if (name.includes('action surge')) {
            const uses = level >= 17 ? 2 : 1;
            char.counters.push({
                id: `auto-actionsurge-${Date.now()}`,
                name: 'Action Surge',
                max: uses,
                current: uses,
                autoGenerated: true
            });
        }

        // Second Wind (Fighter)
        if (name.includes('second wind')) {
            char.counters.push({
                id: `auto-secondwind-${Date.now()}`,
                name: 'Second Wind',
                max: 1,
                current: 1,
                autoGenerated: true
            });
        }

        // Indomitable (Fighter)
        if (name.includes('indomitable')) {
            const uses = level >= 17 ? 3 : (level >= 13 ? 2 : 1);
            char.counters.push({
                id: `auto-indomitable-${Date.now()}`,
                name: 'Indomitable',
                max: uses,
                current: uses,
                autoGenerated: true
            });
        }

        // Breath Weapon (Dragonborn)
        if (name.includes('breath weapon') && trait.type === 'species') {
            char.counters.push({
                id: `auto-breathweapon-${Date.now()}`,
                name: 'Breath Weapon',
                max: profBonus,
                current: profBonus,
                autoGenerated: true
            });
        }

        // Sorcery Points
        if (name.includes('font of magic')) {
            char.counters.push({
                id: `auto-sorcery-${Date.now()}`,
                name: 'Sorcery Points',
                max: level,
                current: level,
                autoGenerated: true
            });
        }

        // Innate Sorcery (Sorcerer)
        if (name.includes('innate sorcery')) {
            char.counters.push({
                id: `auto-innatesorcery-${Date.now()}`,
                name: 'Innate Sorcery',
                max: profBonus,
                current: profBonus,
                autoGenerated: true
            });
        }

        // Little Giant (Goliath)
        if (name.includes('little giant') && trait.type === 'species') {
            char.counters.push({
                id: `auto-littlegiant-${Date.now()}`,
                name: 'Little Giant',
                max: profBonus,
                current: profBonus,
                autoGenerated: true
            });
        }

        // Relentless Endurance (Half-Orc, Orc)
        if (name.includes('relentless endurance') && trait.type === 'species') {
            char.counters.push({
                id: `auto-relentless-${Date.now()}`,
                name: 'Relentless Endurance',
                max: 1,
                current: 1,
                autoGenerated: true
            });
        }

        // Adrenaline Rush (Half-Orc, Orc)
        if (name.includes('adrenaline rush') && trait.type === 'species') {
            char.counters.push({
                id: `auto-adrenaline-${Date.now()}`,
                name: 'Adrenaline Rush',
                max: profBonus,
                current: profBonus,
                autoGenerated: true
            });
        }

        // Healing Hands (Aasimar)
        if (name.includes('healing hands') && trait.type === 'species') {
            char.counters.push({
                id: `auto-healinghands-${Date.now()}`,
                name: 'Healing Hands',
                max: profBonus,
                current: profBonus,
                autoGenerated: true
            });
        }

        // Goliath Giant Ancestry Abilities
        if (trait.type === 'species') {
            // Cloud's Jaunt
            if (name.includes('cloud\'s jaunt')) {
                char.counters.push({
                    id: `auto-cloudsjaunt-${Date.now()}`,
                    name: 'Cloud\'s Jaunt',
                    max: profBonus,
                    current: profBonus,
                    autoGenerated: true
                });
            }
            // Fire's Burn
            if (name.includes('fire\'s burn')) {
                char.counters.push({
                    id: `auto-firesburn-${Date.now()}`,
                    name: 'Fire\'s Burn',
                    max: profBonus,
                    current: profBonus,
                    autoGenerated: true
                });
            }
            // Frost's Chill
            if (name.includes('frost\'s chill')) {
                char.counters.push({
                    id: `auto-frostschill-${Date.now()}`,
                    name: 'Frost\'s Chill',
                    max: profBonus,
                    current: profBonus,
                    autoGenerated: true
                });
            }
            // Hill's Tumble
            if (name.includes('hill\'s tumble')) {
                char.counters.push({
                    id: `auto-hillstumble-${Date.now()}`,
                    name: 'Hill\'s Tumble',
                    max: profBonus,
                    current: profBonus,
                    autoGenerated: true
                });
            }
            // Stone's Endurance
            if (name.includes('stone\'s endurance')) {
                char.counters.push({
                    id: `auto-stonesendurance-${Date.now()}`,
                    name: 'Stone\'s Endurance',
                    max: profBonus,
                    current: profBonus,
                    autoGenerated: true
                });
            }
            // Storm's Thunder
            if (name.includes('storm\'s thunder')) {
                char.counters.push({
                    id: `auto-stormsthunder-${Date.now()}`,
                    name: 'Storm\'s Thunder',
                    max: profBonus,
                    current: profBonus,
                    autoGenerated: true
                });
            }
            // Large Form (Level 5+)
            if (name.includes('large form') && level >= 5) {
                char.counters.push({
                    id: `auto-largeform-${Date.now()}`,
                    name: 'Large Form',
                    max: profBonus,
                    current: profBonus,
                    autoGenerated: true
                });
            }
        }
    });

    console.log(`Created ${char.counters.filter(c => c.autoGenerated).length} auto-generated counters`);

    // Render the counters
    if (typeof renderCounters === 'function') {
        renderCounters();
    }
}

function setHPFromClass() {
    const level = parseInt(document.getElementById('charLevel').value) || 1;
    const className = document.getElementById('charClass').value;
    const conScore = parseInt(document.getElementById('con').value) || 10;
    const conMod = Math.floor((conScore - 10) / 2);

    if (!className) {
        alert('Please select a class first');
        return;
    }

    const hitDice = {
        'Barbarian': 12,
        'Fighter': 10,
        'Paladin': 10,
        'Ranger': 10,
        'Bard': 8,
        'Cleric': 8,
        'Druid': 8,
        'Monk': 8,
        'Rogue': 8,
        'Sorcerer': 6,
        'Warlock': 8,
        'Wizard': 6
    };

    const hitDie = hitDice[className] || 8;

    // Level 1: maximum hit die + CON mod
    const hpAtLevel1 = hitDie + conMod;

    // Level 2+: (hit die / 2 + 1) + CON mod per level
    const avgRoll = Math.floor(hitDie / 2) + 1;
    const hpFromLevels = (level - 1) * (avgRoll + conMod);

    const totalHP = Math.max(1, hpAtLevel1 + hpFromLevels);

    if (document.getElementById('hpMax')) {
        document.getElementById('hpMax').value = totalHP;
    }
    if (document.getElementById('hpCurrent')) {
        document.getElementById('hpCurrent').value = totalHP;
    }

    // Update hit dice display
    if (document.getElementById('hitDice')) {
        document.getElementById('hitDice').value = `${level}d${hitDie}`;
    }

    saveUserData();
}

function updateCharacterStats() {
    const char = characters[currentCharacterIndex];
    const level = parseInt(document.getElementById('charLevel').value) || 1;

    // Update proficiency bonus
    const profBonus = Math.ceil(level / 4) + 1;
    if (document.getElementById('profBonus')) {
        document.getElementById('profBonus').value = profBonus;
    }
}

// Spell Save DC Calculator
function updateSpellSaveDC() {
    const char = characters[currentCharacterIndex];
    const spellcastingAbility = document.getElementById('spellcastingAbility').value;

    if (!spellcastingAbility) {
        document.getElementById('spellSaveDC').textContent = '--';
        document.getElementById('spellAttackBonus').textContent = '--';
        return;
    }

    // Get ability score
    const abilityScore = parseInt(document.getElementById(spellcastingAbility).value) || 10;
    const abilityMod = Math.floor((abilityScore - 10) / 2);

    // Get proficiency bonus
    const profBonus = parseInt(document.getElementById('profBonus').value) || 2;

    // Calculate Spell Save DC = 8 + proficiency bonus + ability modifier
    const spellSaveDC = 8 + profBonus + abilityMod;

    // Calculate Spell Attack Bonus = proficiency bonus + ability modifier
    const spellAttackBonus = profBonus + abilityMod;

    // Display values
    document.getElementById('spellSaveDC').textContent = spellSaveDC;
    document.getElementById('spellAttackBonus').textContent = spellAttackBonus >= 0 ? `+${spellAttackBonus}` : spellAttackBonus;

    // Save spellcasting ability to character
    if (char) {
        char.spellcastingAbility = spellcastingAbility;
        saveUserData();
    }
}

// Auto-select spellcasting ability based on class
function autoSelectSpellcastingAbility() {
    const className = document.getElementById('charClass').value;
    const spellcastingAbilityMap = {
        'Bard': 'cha',
        'Cleric': 'wis',
        'Druid': 'wis',
        'Paladin': 'cha',
        'Ranger': 'wis',
        'Sorcerer': 'cha',
        'Warlock': 'cha',
        'Wizard': 'int'
    };

    const ability = spellcastingAbilityMap[className];
    if (ability && document.getElementById('spellcastingAbility')) {
        document.getElementById('spellcastingAbility').value = ability;
        updateSpellSaveDC();
    }
}

// Concentration Checker Functions
function updateConSaveBonus() {
    // Get CON modifier
    const conScore = parseInt(document.getElementById('con').value) || 10;
    const conMod = Math.floor((conScore - 10) / 2);

    // Get proficiency bonus
    const profBonus = parseInt(document.getElementById('profBonus').value) || 2;

    // Check if proficient in CON saves
    const isProficient = document.getElementById('saveCon')?.checked || false;

    // Calculate save bonus
    const saveBonus = isProficient ? conMod + profBonus : conMod;

    // Update display
    if (document.getElementById('conSaveBonus')) {
        document.getElementById('conSaveBonus').value = saveBonus >= 0 ? `+${saveBonus}` : saveBonus;
    }

    return saveBonus;
}

function checkConcentration() {
    const damage = parseInt(document.getElementById('damageTaken').value) || 0;

    // Concentration DC is 10 or half the damage taken, whichever is higher
    const concentrationDC = Math.max(10, Math.floor(damage / 2));

    // Update DC display
    if (document.getElementById('concentrationDC')) {
        document.getElementById('concentrationDC').textContent = concentrationDC;
    }

    // Update CON save bonus
    updateConSaveBonus();

    // Clear previous roll result
    if (document.getElementById('concentrationRollResult')) {
        document.getElementById('concentrationRollResult').innerHTML = '';
    }
}

function toggleConcentrationAdvantage(type) {
    const advCheckbox = document.getElementById('concentrationAdvantage');
    const disCheckbox = document.getElementById('concentrationDisadvantage');

    if (type === 'advantage' && advCheckbox.checked) {
        disCheckbox.checked = false;
    } else if (type === 'disadvantage' && disCheckbox.checked) {
        advCheckbox.checked = false;
    }
}

function rollConcentrationSave() {
    const damage = parseInt(document.getElementById('damageTaken').value) || 0;
    const concentrationDC = Math.max(10, Math.floor(damage / 2));
    const saveBonus = updateConSaveBonus();

    // Check for advantage/disadvantage
    const hasAdvantage = document.getElementById('concentrationAdvantage')?.checked || false;
    const hasDisadvantage = document.getElementById('concentrationDisadvantage')?.checked || false;

    let roll1 = Math.floor(Math.random() * 20) + 1;
    let roll2, finalRoll, rollDisplay;

    if (hasAdvantage || hasDisadvantage) {
        // Roll 2d20
        roll2 = Math.floor(Math.random() * 20) + 1;
        finalRoll = hasAdvantage ? Math.max(roll1, roll2) : Math.min(roll1, roll2);

        const roll1Display = roll1 === 20 ? '<span class="crit-success">20</span>' :
                            roll1 === 1 ? '<span class="crit-fail">1</span>' : roll1;
        const roll2Display = roll2 === 20 ? '<span class="crit-success">20</span>' :
                            roll2 === 1 ? '<span class="crit-fail">1</span>' : roll2;

        const finalRollDisplay = finalRoll === 20 ? '<span class="crit-success">NAT 20!</span>' :
                                 finalRoll === 1 ? '<span class="crit-fail">NAT 1!</span>' : finalRoll;

        rollDisplay = `<span class="roll-die-adv">[${roll1Display}, ${roll2Display}] → ${finalRollDisplay}</span>`;
    } else {
        // Roll 1d20
        finalRoll = roll1;
        rollDisplay = finalRoll === 20 ? '<span class="crit-success">NAT 20!</span>' :
                      finalRoll === 1 ? '<span class="crit-fail">NAT 1!</span>' : `${finalRoll}`;
    }

    const total = finalRoll + saveBonus;

    // Determine success or failure
    const success = total >= concentrationDC;

    // Display result
    const resultDiv = document.getElementById('concentrationRollResult');
    if (resultDiv) {
        const resultClass = success ? 'concentration-success' : 'concentration-failure';
        const resultText = success ? 'MAINTAINED' : 'BROKEN';

        resultDiv.innerHTML = `
            <div class="concentration-roll-display">
                <div class="roll-breakdown">
                    <span class="roll-die">${rollDisplay}</span>
                    <span class="roll-bonus">${saveBonus >= 0 ? '+' : ''}${saveBonus}</span>
                    <span class="roll-equals">=</span>
                    <span class="roll-total">${total}</span>
                </div>
                <div class="concentration-result-text ${resultClass}">
                    ${resultText}
                </div>
            </div>
        `;
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const spellModal = document.getElementById('spellModal');
    const featModal = document.getElementById('featModal');
    const counterModal = document.getElementById('addCounterModal');
    const editCounterModal = document.getElementById('editCounterModal');
    const deleteModal = document.getElementById('deleteCounterModal');
    const armorModal = document.getElementById('addArmorModal');
    const weaponModal = document.getElementById('addWeaponModal');
    const inventoryModal = document.getElementById('addInventoryModal');
    const diceConfigModal = document.getElementById('saveDiceConfigModal');
    const deleteDiceConfigModal = document.getElementById('deleteDiceConfigModal');
    const saveEncounterModal = document.getElementById('saveEncounterModal');
    const deleteEncounterModal = document.getElementById('deleteEncounterModal');
    const addTraitModal = document.getElementById('addTraitModal');

    if (e.target === spellModal) {
        closeSpellSelector();
    }
    if (e.target === featModal) {
        closeFeatSelector();
    }
    if (e.target === counterModal) {
        closeAddCounterModal();
    }
    if (e.target === editCounterModal) {
        closeEditCounterModal();
    }
    if (e.target === deleteModal) {
        closeDeleteCounterModal();
    }
    if (e.target === armorModal) {
        closeAddArmorModal();
    }
    if (e.target === weaponModal) {
        closeAddWeaponModal();
    }
    if (e.target === diceConfigModal) {
        closeSaveDiceConfigModal();
    }
    if (e.target === deleteDiceConfigModal) {
        closeDeleteDiceConfigModal();
    }
    if (e.target === saveEncounterModal) {
        closeSaveEncounterModal();
    }
    if (e.target === deleteEncounterModal) {
        closeDeleteEncounterModal();
    }
    if (e.target === addTraitModal) {
        closeAddTraitModal();
    }
});

// Allow Enter key to submit counter form
document.addEventListener('DOMContentLoaded', () => {
    const counterNameInput = document.getElementById('counterName');
    const counterMaxInput = document.getElementById('counterMax');

    if (counterNameInput) {
        counterNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                confirmAddCounter();
            }
        });
    }

    if (counterMaxInput) {
        counterMaxInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                confirmAddCounter();
            }
        });
    }

    // Load saved dice configurations
    loadDiceConfigurationsFromStorage();

    // Load saved encounters
    loadEncountersFromStorage();
});

// Player Section switching
function switchPlayerSection(section) {
    // Remove active from all section tabs
    document.querySelectorAll('#playertoolsTab .section-tab-button').forEach(btn => btn.classList.remove('active'));

    // Remove active from player sections
    document.querySelectorAll('.player-section').forEach(content => content.classList.remove('active'));

    // Find and activate the correct button and section
    const buttons = document.querySelectorAll('#playertoolsTab .section-tab-button');
    const sections = {
        'character': 'characterSection',
        'equipment': 'equipmentSection',
        'inventory': 'inventorySection',
        'spells': 'spellsSection',
        'feats': 'featsSection',
        'counters': 'countersSection'
    };

    // Activate the section
    const sectionId = sections[section];
    if (sectionId) {
        document.getElementById(sectionId).classList.add('active');

        // Activate the corresponding button
        buttons.forEach(btn => {
            if (btn.textContent.toLowerCase().includes(section) ||
                (section === 'character' && btn.textContent.includes('Character Sheet'))) {
                btn.classList.add('active');
            }
        });
    }
}

// Counters System
let counters = []; // Legacy - will be migrated to per-character
let counterIdCounter = 0;
let currentCounterCharacterIndex = 0;

function addCounter() {
    // Clear previous input
    document.getElementById('counterName').value = '';
    document.getElementById('counterMax').value = 3;

    // Show modal
    document.getElementById('addCounterModal').classList.add('active');

    // Focus on name input
    setTimeout(() => {
        document.getElementById('counterName').focus();
    }, 100);
}

function closeAddCounterModal() {
    document.getElementById('addCounterModal').classList.remove('active');
}

function confirmAddCounter() {
    const name = document.getElementById('counterName').value.trim();
    const max = parseInt(document.getElementById('counterMax').value);

    if (!name) {
        alert('Please enter a counter name');
        return;
    }

    if (isNaN(max) || max < 1) {
        alert('Please enter a valid maximum value (minimum 1)');
        return;
    }

    const counter = {
        id: counterIdCounter++,
        name: name,
        current: max,
        max: max
    };

    // Get current character's counters
    if (!characters[currentCounterCharacterIndex].counters) {
        characters[currentCounterCharacterIndex].counters = [];
    }
    characters[currentCounterCharacterIndex].counters.push(counter);

    renderCounters();
    closeAddCounterModal();
    saveUserData();
}

// Spell slots by class and level (D&D 2024 PHB)
const spellSlotsByClassAndLevel = {
    'Bard': [[2],[3],[4,2],[4,3],[4,3,2],[4,3,3],[4,3,3,1],[4,3,3,2],[4,3,3,3,1],[4,3,3,3,2],[4,3,3,3,2,1],[4,3,3,3,2,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1,1],[4,3,3,3,2,1,1,1],[4,3,3,3,2,1,1,1,1],[4,3,3,3,3,1,1,1,1],[4,3,3,3,3,2,1,1,1],[4,3,3,3,3,2,2,1,1]],
    'Cleric': [[2],[3],[4,2],[4,3],[4,3,2],[4,3,3],[4,3,3,1],[4,3,3,2],[4,3,3,3,1],[4,3,3,3,2],[4,3,3,3,2,1],[4,3,3,3,2,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1,1],[4,3,3,3,2,1,1,1],[4,3,3,3,2,1,1,1,1],[4,3,3,3,3,1,1,1,1],[4,3,3,3,3,2,1,1,1],[4,3,3,3,3,2,2,1,1]],
    'Druid': [[2],[3],[4,2],[4,3],[4,3,2],[4,3,3],[4,3,3,1],[4,3,3,2],[4,3,3,3,1],[4,3,3,3,2],[4,3,3,3,2,1],[4,3,3,3,2,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1,1],[4,3,3,3,2,1,1,1],[4,3,3,3,2,1,1,1,1],[4,3,3,3,3,1,1,1,1],[4,3,3,3,3,2,1,1,1],[4,3,3,3,3,2,2,1,1]],
    'Sorcerer': [[2],[3],[4,2],[4,3],[4,3,2],[4,3,3],[4,3,3,1],[4,3,3,2],[4,3,3,3,1],[4,3,3,3,2],[4,3,3,3,2,1],[4,3,3,3,2,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1,1],[4,3,3,3,2,1,1,1],[4,3,3,3,2,1,1,1,1],[4,3,3,3,3,1,1,1,1],[4,3,3,3,3,2,1,1,1],[4,3,3,3,3,2,2,1,1]],
    'Wizard': [[2],[3],[4,2],[4,3],[4,3,2],[4,3,3],[4,3,3,1],[4,3,3,2],[4,3,3,3,1],[4,3,3,3,2],[4,3,3,3,2,1],[4,3,3,3,2,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1,1],[4,3,3,3,2,1,1,1],[4,3,3,3,2,1,1,1,1],[4,3,3,3,3,1,1,1,1],[4,3,3,3,3,2,1,1,1],[4,3,3,3,3,2,2,1,1]],
    'Paladin': [[0],[0],[2],[3],[4,2],[4,2],[4,3],[4,3],[4,3,2],[4,3,2],[4,3,3],[4,3,3],[4,3,3,1],[4,3,3,1],[4,3,3,2],[4,3,3,2],[4,3,3,3,1],[4,3,3,3,1],[4,3,3,3,2],[4,3,3,3,2]],
    'Ranger': [[0],[0],[2],[3],[4,2],[4,2],[4,3],[4,3],[4,3,2],[4,3,2],[4,3,3],[4,3,3],[4,3,3,1],[4,3,3,1],[4,3,3,2],[4,3,3,2],[4,3,3,3,1],[4,3,3,3,1],[4,3,3,3,2],[4,3,3,3,2]],
    'Warlock': [[1],[2],[2],[2],[2],[2],[2],[2],[2],[2],[3],[3],[3],[3],[3],[3],[4],[4],[4],[4]]
};

// Auto-populate counters for HP, Temp HP, and spell slots
function autoPopulateCounters() {
    // Get the character whose counters we're updating
    const char = characters[currentCounterCharacterIndex];
    if (!char) {
        alert('No character selected');
        return;
    }

    // If we're auto-populating for the currently displayed character,
    // read values directly from the DOM to get the latest edits
    let charClass, charLevel, maxHP;

    if (currentCounterCharacterIndex === currentCharacterIndex) {
        // Save current character first to ensure data is synced
        saveCurrentCharacter();

        // Read from DOM for most up-to-date values
        const classInput = document.getElementById('charClass');
        const levelInput = document.getElementById('charLevel');
        const hpMaxInput = document.getElementById('hpMax');

        charClass = classInput ? classInput.value : (char.class || '');
        charLevel = levelInput ? parseInt(levelInput.value) || 1 : (parseInt(char.level) || 1);
        maxHP = hpMaxInput ? parseInt(hpMaxInput.value) || 10 : (parseInt(char.maxHp || char.hp) || 10);
    } else {
        // For other characters, use saved data
        charClass = char.class || '';
        charLevel = parseInt(char.level) || 1;
        maxHP = parseInt(char.maxHp || char.hp) || 10;
    }

    if (!charClass) {
        alert('Please select a class first');
        return;
    }

    // Initialize counters array
    if (!char.counters) {
        char.counters = [];
    }

    // Ensure counterIdCounter is properly initialized for this character
    if (char.counters.length > 0) {
        const maxId = Math.max(...char.counters.map(c => c.id || 0));
        counterIdCounter = Math.max(counterIdCounter, maxId + 1);
    }

    // Update or create HP counter
    let hpCounter = char.counters.find(c => c.name === 'Hit Points');
    if (hpCounter) {
        hpCounter.max = maxHP;
        hpCounter.current = maxHP;
    } else {
        char.counters.push({
            id: counterIdCounter++,
            name: 'Hit Points',
            current: maxHP,
            max: maxHP
        });
    }

    // Update or create Temp HP counter
    let tempHPCounter = char.counters.find(c => c.name === 'Temporary HP');
    if (!tempHPCounter) {
        char.counters.push({
            id: counterIdCounter++,
            name: 'Temporary HP',
            current: 0,
            max: 99
        });
    }

    // Update or create spell slot counters based on class and level
    const spellSlots = spellSlotsByClassAndLevel[charClass];

    // If this class doesn't have spell slots, remove any existing spell slot counters
    if (!spellSlots) {
        char.counters = char.counters.filter(c => !c.name.startsWith('Spell Slots - Level'));
    } else if (charLevel >= 1 && charLevel <= 20) {
        const slotsForLevel = spellSlots[charLevel - 1];

        // First, remove any spell slot counters for levels we no longer have
        for (let spellLevel = 1; spellLevel <= 9; spellLevel++) {
            const counterName = `Spell Slots - Level ${spellLevel}`;
            const counterIndex = char.counters.findIndex(c => c.name === counterName);

            if (counterIndex !== -1) {
                const shouldHaveSlots = slotsForLevel && slotsForLevel[spellLevel - 1] > 0;
                if (!shouldHaveSlots) {
                    // Remove this counter as we no longer have slots for this level
                    char.counters.splice(counterIndex, 1);
                }
            }
        }

        // Then update or create counters for slots we do have
        if (slotsForLevel) {
            slotsForLevel.forEach((slots, index) => {
                if (slots > 0) {
                    const spellLevel = index + 1;
                    const counterName = `Spell Slots - Level ${spellLevel}`;
                    let slotCounter = char.counters.find(c => c.name === counterName);

                    if (slotCounter) {
                        slotCounter.max = slots;
                        slotCounter.current = slots;
                    } else {
                        char.counters.push({
                            id: counterIdCounter++,
                            name: counterName,
                            current: slots,
                            max: slots
                        });
                    }
                }
            });
        }
    }

    renderCounters();
    saveUserData();
}

// Get counters for current counter character
function getCurrentCharacterCounters() {
    if (!characters[currentCounterCharacterIndex]) return [];
    if (!characters[currentCounterCharacterIndex].counters) {
        characters[currentCounterCharacterIndex].counters = [];
    }
    return characters[currentCounterCharacterIndex].counters;
}

function switchCounterCharacter() {
    const select = document.getElementById('counterCharacterSelect');
    currentCounterCharacterIndex = parseInt(select.value);

    // Initialize counterIdCounter based on this character's existing counters
    const char = characters[currentCounterCharacterIndex];
    if (char && char.counters && char.counters.length > 0) {
        const maxId = Math.max(...char.counters.map(c => c.id || 0));
        counterIdCounter = maxId + 1;
    }

    renderCounters();
}

function updateCounterCharacterSelector() {
    const select = document.getElementById('counterCharacterSelect');
    if (!select) return;

    select.innerHTML = characters.map((char, index) => {
        const charName = char.name || `Character ${index + 1}`;
        return `<option value="${index}">${charName}</option>`;
    }).join('');
    select.value = currentCounterCharacterIndex;
}

function incrementCounter(id) {
    const counters = getCurrentCharacterCounters();
    const counter = counters.find(c => c.id === id);
    if (counter && counter.current < counter.max) {
        counter.current++;
        renderCounters();
        saveUserData();
    }
}

function decrementCounter(id) {
    const counters = getCurrentCharacterCounters();
    const counter = counters.find(c => c.id === id);
    if (counter && counter.current > 0) {
        counter.current--;
        renderCounters();
        saveUserData();
    }
}

function resetCounter(id) {
    const counters = getCurrentCharacterCounters();
    const counter = counters.find(c => c.id === id);
    if (counter) {
        counter.current = counter.max;
        renderCounters();
        saveUserData();
    }
}

let counterToDelete = null;

function deleteCounter(id) {
    counterToDelete = id;
    document.getElementById('deleteCounterModal').classList.add('active');
}

function closeDeleteCounterModal() {
    document.getElementById('deleteCounterModal').classList.remove('active');
    counterToDelete = null;
}

function confirmDeleteCounter() {
    if (counterToDelete !== null) {
        const counters = getCurrentCharacterCounters();
        const index = counters.findIndex(c => c.id === counterToDelete);
        if (index !== -1) {
            counters.splice(index, 1);
        }
        renderCounters();
        closeDeleteCounterModal();
        saveUserData();
    }
}

let counterToEdit = null;

function editCounter(id) {
    const counters = getCurrentCharacterCounters();
    const counter = counters.find(c => c.id === id);

    if (!counter) return;

    counterToEdit = id;
    document.getElementById('editCounterName').value = counter.name;
    document.getElementById('editCounterMax').value = counter.max;
    document.getElementById('editCounterModal').classList.add('active');

    // Focus on name input
    setTimeout(() => {
        document.getElementById('editCounterName').focus();
    }, 100);
}

function closeEditCounterModal() {
    document.getElementById('editCounterModal').classList.remove('active');
    counterToEdit = null;
}

function confirmEditCounter() {
    if (counterToEdit === null) return;

    const name = document.getElementById('editCounterName').value.trim();
    const max = parseInt(document.getElementById('editCounterMax').value);

    if (!name) {
        alert('Please enter a counter name');
        return;
    }

    if (isNaN(max) || max < 1) {
        alert('Please enter a valid maximum value (minimum 1)');
        return;
    }

    const counters = getCurrentCharacterCounters();
    const counter = counters.find(c => c.id === counterToEdit);

    if (counter) {
        counter.name = name;
        counter.max = max;

        // Adjust current value if it exceeds new max
        if (counter.current > max) {
            counter.current = max;
        }

        renderCounters();
        closeEditCounterModal();
        saveUserData();
    }
}

function resetAllCounters() {
    const counters = getCurrentCharacterCounters();
    counters.forEach(counter => {
        counter.current = counter.max;
    });
    renderCounters();
    saveUserData();
}

function renderCounters() {
    const container = document.getElementById('countersList');
    const resetAllBtn = document.getElementById('resetAllBtn');
    const counters = getCurrentCharacterCounters();

    if (counters.length === 0) {
        container.innerHTML = '<p class="no-counters">No counters yet. Click "Add Counter" to create one.</p>';
        resetAllBtn.style.display = 'none';
        return;
    }

    resetAllBtn.style.display = 'inline-block';

    container.innerHTML = counters.map(counter => `
        <div class="counter-card">
            <div class="counter-card-header">
                <div class="counter-name">${counter.name}</div>
                <div class="counter-header-buttons">
                    <button class="counter-edit" onclick="editCounter(${counter.id})" title="Edit">✏️</button>
                    <button class="counter-delete" onclick="deleteCounter(${counter.id})">&times;</button>
                </div>
            </div>
            <div class="counter-display">
                <input type="number"
                    class="counter-value-input"
                    value="${counter.current}"
                    min="0"
                    max="${counter.max}"
                    oninput="updateCounterInput(${counter.id}, this.value)"
                    onblur="setCounterValue(${counter.id}, this.value)" />
                <div class="counter-max">/ ${counter.max}</div>
            </div>
            <div class="counter-controls">
                <button class="counter-btn" onclick="decrementCounter(${counter.id})">−</button>
                <button class="counter-btn" onclick="incrementCounter(${counter.id})">+</button>
            </div>
            <button class="counter-reset" onclick="resetCounter(${counter.id})">Reset to Max</button>
        </div>
    `).join('');
}

function setCounterValue(id, value) {
    const counters = getCurrentCharacterCounters();
    const counter = counters.find(c => c.id === id);
    if (counter) {
        const newValue = parseInt(value);
        if (!isNaN(newValue) && newValue >= 0) {
            counter.current = Math.min(newValue, counter.max);
            // Don't re-render on direct input - just save
            saveUserData();
        }
    }
}

function updateCounterInput(id, value) {
    const counters = getCurrentCharacterCounters();
    const counter = counters.find(c => c.id === id);
    if (counter) {
        const newValue = parseInt(value);
        if (!isNaN(newValue) && newValue >= 0) {
            counter.current = Math.min(newValue, counter.max);
        }
    }
}

// Login System
let currentUser = null;

// Check for existing login on page load
async function checkLogin() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        if (savedUser.toLowerCase() === 'admin') {
            showAdminPage();
        } else {
            showMainApp();
            updateUserDisplay();
            await loadUserData();
        }
    } else {
        showLoginScreen();
    }
}

// Get all accounts from server
async function getAccounts() {
    try {
        const response = await fetch('/api/accounts');
        return await response.json();
    } catch (error) {
        console.error('Error fetching accounts:', error);
        return [];
    }
}

// Create account on server
async function createAccountOnServer(name, password) {
    try {
        const response = await fetch('/api/accounts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

// Get single account from server
async function getAccount(name) {
    try {
        const response = await fetch(`/api/accounts/${encodeURIComponent(name)}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error fetching account:', error);
        return null;
    }
}

// Update account data on server
async function updateAccountData(name, data) {
    try {
        const response = await fetch(`/api/accounts/${encodeURIComponent(name)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data })
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating account:', error);
    }
}

// Delete account from server
async function deleteAccountFromServer(name) {
    try {
        const response = await fetch(`/api/accounts/${encodeURIComponent(name)}`, {
            method: 'DELETE'
        });
        return await response.json();
    } catch (error) {
        console.error('Error deleting account:', error);
        throw error;
    }
}

// Show login modal
function showLoginModal() {
    document.getElementById('loginModal').classList.add('active');
    document.getElementById('loginAccountName').value = '';
    document.getElementById('loginPassword').value = '';
    setTimeout(() => {
        document.getElementById('loginAccountName').focus();
    }, 100);
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
}

// Show signup modal
function showSignupModal(skipClear = false) {
    document.getElementById('signupModal').classList.add('active');
    if (!skipClear) {
        document.getElementById('signupAccountName').value = '';
        document.getElementById('signupPassword').value = '';
    }
    setTimeout(() => {
        document.getElementById('signupAccountName').focus();
    }, 100);
}

function closeSignupModal() {
    document.getElementById('signupModal').classList.remove('active');
}

// Attempt login
async function attemptLogin() {
    const nameInput = document.getElementById('loginAccountName');
    const passwordInput = document.getElementById('loginPassword');

    const name = nameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!name) {
        alert('Please enter an account name');
        return;
    }

    // Check for admin login (case-insensitive)
    if (name.toLowerCase() === 'admin') {
        currentUser = 'Admin';
        localStorage.setItem('currentUser', 'Admin');
        closeLoginModal();
        showAdminPage();
        return;
    }

    const account = await getAccount(name);

    if (!account) {
        document.getElementById('accountNotFoundName').textContent = name;
        document.getElementById('accountNotFoundModal').classList.add('active');
        return;
    }

    // Check password if account has one
    if (account.hasPassword) {
        if (account.password === password) {
            login(name);
            closeLoginModal();
        } else {
            document.getElementById('incorrectPasswordModal').classList.add('active');
        }
    } else {
        // No password required
        login(name);
        closeLoginModal();
    }
}

// Create new account
async function createAccount() {
    const nameInput = document.getElementById('signupAccountName');
    const passwordInput = document.getElementById('signupPassword');

    const name = nameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!name) {
        alert('Please enter an account name');
        return;
    }

    try {
        await createAccountOnServer(name, password);

        // Auto-login to new account
        currentUser = name;
        localStorage.setItem('currentUser', name);
        closeSignupModal();
        showMainApp();
        updateUserDisplay();
        await loadUserData();
    } catch (error) {
        alert(error.message);
    }
}

// Login to account
function login(accountName) {
    currentUser = accountName;
    localStorage.setItem('currentUser', accountName);
    showMainApp();
    updateUserDisplay();
    loadUserData();
}

// Logout
function logout() {
    saveUserData(); // Save before logging out
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLoginScreen();
}

// Show/hide screens
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('adminPage').style.display = 'none';
}

function showMainApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('adminPage').style.display = 'none';
}

function showAdminPage() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('adminPage').style.display = 'block';
    renderAdminAccounts();
}

// Update user display in header
function updateUserDisplay() {
    const userDisplay = document.getElementById('currentUser');
    if (currentUser) {
        userDisplay.textContent = `User: ${currentUser}`;
    }
}

// Save user data
async function saveUserData() {
    if (!currentUser || currentUser === 'admin') return;

    // Save current character data from form
    saveCurrentCharacter();

    // Update account data on server with all characters
    const data = {
        characters: characters,
        currentCharacterIndex: currentCharacterIndex,
        counters: counters
    };

    await updateAccountData(currentUser, data);
}

// Load user data
async function loadUserData() {
    if (!currentUser || currentUser === 'admin') return;

    const account = await getAccount(currentUser);

    if (!account || !account.data) return;

    const data = account.data;

    // Load characters array (or migrate from old single character format)
    if (data.characters && Array.isArray(data.characters)) {
        characters = data.characters;
        currentCharacterIndex = data.currentCharacterIndex || 0;
    } else if (data.character) {
        // Migrate old format to new array format
        characters = [data.character];
        currentCharacterIndex = 0;
    } else {
        characters = [createEmptyCharacter()];
        currentCharacterIndex = 0;
    }

    updateCharacterSelector();
    loadCurrentCharacter();

    // Load counters
    if (data.counters) {
        counters = data.counters;
        counterIdCounter = Math.max(...counters.map(c => c.id), 0) + 1;
        renderCounters();
    }

    // Migrate old global spells/feats to current character if they exist
    if (data.spells && !characters[currentCharacterIndex].spells) {
        characters[currentCharacterIndex].spells = data.spells;
        selectedSpells = data.spells;
        renderSelectedSpells();
    }

    if (data.feats && !characters[currentCharacterIndex].feats) {
        characters[currentCharacterIndex].feats = data.feats;
        selectedFeats = data.feats;
        renderSelectedFeats();
    }
}

// Auto-save data when inputs change
function setupAutoSave() {
    // Character sheet inputs
    const autoSaveInputs = [
        'charName', 'charClass', 'charSubclass', 'charLevel', 'charSpecies', 'charBackground',
        'str', 'dex', 'con', 'int', 'wis', 'cha',
        'ac', 'hp', 'maxHp', 'speed', 'profBonus',
        'equipment', 'notes'
    ];

    autoSaveInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', () => {
                if (currentUser) saveUserData();
            });
        }
    });

    // Skill checkboxes
    Object.keys(skillAbilities).forEach(skill => {
        const checkbox = document.getElementById(`skill${skill}`);
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                if (currentUser) saveUserData();
            });
        }
    });
}

// Allow Enter key on login/signup modals
document.addEventListener('DOMContentLoaded', () => {
    const loginAccountName = document.getElementById('loginAccountName');
    const loginPassword = document.getElementById('loginPassword');
    const signupAccountName = document.getElementById('signupAccountName');
    const signupPassword = document.getElementById('signupPassword');

    if (loginAccountName) {
        loginAccountName.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                attemptLogin();
            }
        });
    }

    if (loginPassword) {
        loginPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                attemptLogin();
            }
        });
    }

    if (signupAccountName) {
        signupAccountName.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                createAccount();
            }
        });
    }

    if (signupPassword) {
        signupPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                createAccount();
            }
        });
    }
});

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const adminDeleteModal = document.getElementById('adminDeleteModal');
    const accountNotFoundModal = document.getElementById('accountNotFoundModal');
    const incorrectPasswordModal = document.getElementById('incorrectPasswordModal');
    const deleteCharacterModal = document.getElementById('deleteCharacterModal');

    if (e.target === loginModal) {
        closeLoginModal();
    }
    if (e.target === signupModal) {
        closeSignupModal();
    }
    if (e.target === adminDeleteModal) {
        closeAdminDeleteModal();
    }
    if (e.target === accountNotFoundModal) {
        closeAccountNotFoundModal();
    }
    if (e.target === incorrectPasswordModal) {
        closeIncorrectPasswordModal();
    }
    if (e.target === deleteCharacterModal) {
        closeDeleteCharacterModal();
    }
});

// Handle Enter key for error modals
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const accountNotFoundModal = document.getElementById('accountNotFoundModal');
        const incorrectPasswordModal = document.getElementById('incorrectPasswordModal');

        if (accountNotFoundModal && accountNotFoundModal.classList.contains('active')) {
            e.preventDefault();
            e.stopPropagation();
            goToSignup();
        } else if (incorrectPasswordModal && incorrectPasswordModal.classList.contains('active')) {
            e.preventDefault();
            e.stopPropagation();
            closeIncorrectPasswordModal();
        }
    }
});

// Admin Functions
let accountToDelete = null;

async function renderAdminAccounts() {
    const accounts = await getAccounts();
    const container = document.getElementById('adminAccountsList');

    if (accounts.length === 0) {
        container.innerHTML = '<p class="no-accounts">No user accounts exist yet.</p>';
        return;
    }

    container.innerHTML = accounts.map(account => `
        <div class="admin-account-card">
            <div class="admin-account-info">
                <div class="admin-account-name">${account.name}</div>
                <div class="admin-account-details">
                    <div class="admin-account-detail">
                        ${account.hasPassword ? '🔒 Password Protected' : '🔓 No Password'}
                    </div>
                    <div class="admin-account-detail">
                        📊 ${account.data?.counters?.length || 0} Counters
                    </div>
                    <div class="admin-account-detail">
                        ⚔️ ${account.data?.feats?.length || 0} Feats
                    </div>
                    <div class="admin-account-detail">
                        ${account.data?.character?.name ? '📜 ' + account.data.character.name : '📜 No Character'}
                    </div>
                </div>
            </div>
            <div class="admin-account-actions">
                <button class="admin-delete-btn" onclick="adminDeleteAccount('${account.name}')">Delete Account</button>
            </div>
        </div>
    `).join('');
}

function adminDeleteAccount(accountName) {
    accountToDelete = accountName;
    document.getElementById('adminDeleteAccountName').textContent = `Account: ${accountName}`;
    document.getElementById('adminDeleteModal').classList.add('active');
}

function closeAdminDeleteModal() {
    document.getElementById('adminDeleteModal').classList.remove('active');
    accountToDelete = null;
}

async function confirmAdminDelete() {
    if (!accountToDelete) return;

    await deleteAccountFromServer(accountToDelete);

    closeAdminDeleteModal();
    await renderAdminAccounts();
}

// Account Not Found Modal Functions
function closeAccountNotFoundModal() {
    const modal = document.getElementById('accountNotFoundModal');
    modal.classList.remove('active');
    // Force display none immediately
    setTimeout(() => {
        if (!modal.classList.contains('active')) {
            modal.style.display = 'none';
        }
    }, 0);
}

function goToSignup() {
    // Pre-fill the signup form with the attempted username FIRST
    const attemptedName = document.getElementById('accountNotFoundName').textContent;

    // Store it temporarily
    const nameToUse = attemptedName;

    closeAccountNotFoundModal();
    closeLoginModal();

    // Small delay to ensure modals close before opening signup
    setTimeout(() => {
        const modal = document.getElementById('accountNotFoundModal');
        modal.style.display = 'none'; // Force hide
        document.getElementById('signupAccountName').value = nameToUse;
        document.getElementById('signupPassword').value = '';
        showSignupModal(true); // Pass true to skip clearing the fields
    }, 50);
}

// Incorrect Password Modal Functions
function closeIncorrectPasswordModal() {
    document.getElementById('incorrectPasswordModal').classList.remove('active');
    // Clear password field and focus it
    const passwordInput = document.getElementById('loginPassword');
    passwordInput.value = '';
    setTimeout(() => passwordInput.focus(), 100);
}

// Bender Easter Egg
function showBender() {
    document.getElementById('benderOverlay').classList.add('active');
}

function hideBender() {
    document.getElementById('benderOverlay').classList.remove('active');
}

// Multiple Character Sheets Support
let characters = []; // Array of character data
let currentCharacterIndex = 0; // Currently selected character

// Switch between characters
function switchCharacter() {
    const select = document.getElementById('characterSelect');
    currentCharacterIndex = parseInt(select.value);
    loadCurrentCharacter();
}

// Add a new character
function addNewCharacter() {
    const newCharacter = createEmptyCharacter();
    characters.push(newCharacter);
    currentCharacterIndex = characters.length - 1;
    updateCharacterSelector();
    loadCurrentCharacter();
    saveUserData();
}

// Delete current character
function deleteCharacter() {
    if (characters.length <= 1) {
        alert('You must have at least one character sheet.');
        return;
    }

    const charName = characters[currentCharacterIndex].name || `Character ${currentCharacterIndex + 1}`;
    document.getElementById('deleteCharacterName').textContent = charName;
    document.getElementById('deleteCharacterModal').classList.add('active');
}

function closeDeleteCharacterModal() {
    document.getElementById('deleteCharacterModal').classList.remove('active');
}

function confirmDeleteCharacter() {
    characters.splice(currentCharacterIndex, 1);
    if (currentCharacterIndex >= characters.length) {
        currentCharacterIndex = characters.length - 1;
    }
    updateCharacterSelector();
    loadCurrentCharacter();
    saveUserData();
    closeDeleteCharacterModal();
}

// Create an empty character object
function createEmptyCharacter() {
    return {
        name: '',
        class: '',
        subclass: '',
        level: 1,
        species: '',
        background: '',
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10,
        ac: 10,
        hp: 10,
        maxHp: 10,
        speed: 30,
        profBonus: 2,
        saves: {},
        skills: {},
        equipment: '',
        notes: ''
    };
}

// Update character selector dropdown
function updateCharacterSelector() {
    const select = document.getElementById('characterSelect');
    select.innerHTML = characters.map((char, index) => {
        const charName = char.name || `Character ${index + 1}`;
        return `<option value="${index}">${charName}</option>`;
    }).join('');
    select.value = currentCharacterIndex;

    // Also update counter character selector
    updateCounterCharacterSelector();
}

// Load current character into the form
function loadCurrentCharacter() {
    if (characters.length === 0) {
        characters.push(createEmptyCharacter());
        currentCharacterIndex = 0;
    }

    const char = characters[currentCharacterIndex];

    if (document.getElementById('charName')) document.getElementById('charName').value = char.name || '';
    if (document.getElementById('charClass')) document.getElementById('charClass').value = char.class || '';
    if (document.getElementById('charLevel')) document.getElementById('charLevel').value = char.level || 1;
    if (document.getElementById('charSpecies')) document.getElementById('charSpecies').value = char.species || '';
    if (document.getElementById('charBackground')) document.getElementById('charBackground').value = char.background || '';

    updateSubclassOptions();
    if (document.getElementById('charSubclass')) document.getElementById('charSubclass').value = char.subclass || '';

    updateSubspeciesOptions();
    if (document.getElementById('charSubspecies')) document.getElementById('charSubspecies').value = char.subspecies || '';

    if (document.getElementById('str')) document.getElementById('str').value = char.str || 10;
    if (document.getElementById('dex')) document.getElementById('dex').value = char.dex || 10;
    if (document.getElementById('con')) document.getElementById('con').value = char.con || 10;
    if (document.getElementById('int')) document.getElementById('int').value = char.int || 10;
    if (document.getElementById('wis')) document.getElementById('wis').value = char.wis || 10;
    if (document.getElementById('cha')) document.getElementById('cha').value = char.cha || 10;

    if (document.getElementById('ac')) document.getElementById('ac').value = char.ac || 10;
    if (document.getElementById('hpCurrent')) document.getElementById('hpCurrent').value = char.hp || 10;
    if (document.getElementById('hpMax')) document.getElementById('hpMax').value = char.maxHp || 10;
    if (document.getElementById('hpTemp')) document.getElementById('hpTemp').value = char.tempHp || 0;
    if (document.getElementById('hitDice')) document.getElementById('hitDice').value = char.hitDice || 'd8';
    if (document.getElementById('speed')) document.getElementById('speed').value = char.speed || 30;
    if (document.getElementById('profBonus')) document.getElementById('profBonus').value = char.profBonus || 2;

    if (char.saves) {
        ['Str', 'Dex', 'Con', 'Int', 'Wis', 'Cha'].forEach(ability => {
            const checkbox = document.getElementById(`save${ability}`);
            if (checkbox) {
                checkbox.checked = char.saves[ability.toLowerCase()] || false;
            }
        });
    }

    if (char.skills) {
        Object.keys(char.skills).forEach(skill => {
            const checkbox = document.getElementById(`skill${skill}`);
            if (checkbox) {
                checkbox.checked = char.skills[skill];
            }
        });
    }

    if (document.getElementById('equipment')) document.getElementById('equipment').value = char.equipment || '';
    if (document.getElementById('notes')) document.getElementById('notes').value = char.notes || '';

    // Load character-specific spells and feats
    selectedSpells = char.spells || [];
    selectedFeats = char.feats || [];
    renderSelectedSpells();
    renderSelectedFeats();

    // Load character traits
    renderTraits();

    // Load spellcasting ability and update spell save DC
    if (document.getElementById('spellcastingAbility')) {
        document.getElementById('spellcastingAbility').value = char.spellcastingAbility || '';
        updateSpellSaveDC();
    }

    // Update concentration save bonus
    updateConSaveBonus();

    // Load character-specific armor, weapons, and inventory
    renderArmor();
    renderWeapons();
    renderInventory();
    loadCurrency();

    // Initialize counterIdCounter based on this character's existing counters
    if (char.counters && char.counters.length > 0) {
        const maxId = Math.max(...char.counters.map(c => c.id || 0));
        counterIdCounter = maxId + 1;
    }

    updateCharacterSheet();
}

// Save current character data from form
function saveCurrentCharacter() {
    if (characters.length === 0) return;

    const char = characters[currentCharacterIndex];

    char.name = document.getElementById('charName')?.value || '';
    char.class = document.getElementById('charClass')?.value || '';
    char.subclass = document.getElementById('charSubclass')?.value || '';
    char.level = document.getElementById('charLevel')?.value || 1;
    char.species = document.getElementById('charSpecies')?.value || '';
    char.subspecies = document.getElementById('charSubspecies')?.value || '';
    char.background = document.getElementById('charBackground')?.value || '';

    char.str = document.getElementById('str')?.value || 10;
    char.dex = document.getElementById('dex')?.value || 10;
    char.con = document.getElementById('con')?.value || 10;
    char.int = document.getElementById('int')?.value || 10;
    char.wis = document.getElementById('wis')?.value || 10;
    char.cha = document.getElementById('cha')?.value || 10;

    char.ac = document.getElementById('ac')?.value || 10;
    char.hp = document.getElementById('hpCurrent')?.value || 10;
    char.maxHp = document.getElementById('hpMax')?.value || 10;
    char.tempHp = document.getElementById('hpTemp')?.value || 0;
    char.hitDice = document.getElementById('hitDice')?.value || 'd8';
    char.speed = document.getElementById('speed')?.value || 30;
    char.profBonus = document.getElementById('profBonus')?.value || 2;

    char.saves = {};
    ['Str', 'Dex', 'Con', 'Int', 'Wis', 'Cha'].forEach(ability => {
        const checkbox = document.getElementById(`save${ability}`);
        if (checkbox) {
            char.saves[ability.toLowerCase()] = checkbox.checked;
        }
    });

    char.skills = {};
    Object.keys(skillAbilities).forEach(skill => {
        const checkbox = document.getElementById(`skill${skill}`);
        if (checkbox) {
            char.skills[skill] = checkbox.checked;
        }
    });

    char.equipment = document.getElementById('equipment')?.value || '';
    char.notes = document.getElementById('notes')?.value || '';
    char.spells = selectedSpells;
    char.feats = selectedFeats;

    updateCharacterSelector();
}

// ============================================
// Campaign Management Functions
// ============================================

let campaigns = JSON.parse(localStorage.getItem('campaigns')) || {};
let currentCampaignId = null;

// Load campaigns list into dropdown
function loadCampaignsList() {
    const select = document.getElementById('campaignSelect');
    if (!select) return;

    select.innerHTML = '<option value="">Select a campaign...</option>';

    Object.keys(campaigns).forEach(id => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = campaigns[id].name;
        select.appendChild(option);
    });
}

// Show create campaign modal
function showCreateCampaignModal() {
    document.getElementById('createCampaignModal').style.display = 'flex';
    document.getElementById('newCampaignName').value = '';
    document.getElementById('newCampaignDescription').value = '';
}

// Close create campaign modal
function closeCreateCampaignModal() {
    document.getElementById('createCampaignModal').style.display = 'none';
}

// Confirm create campaign
function confirmCreateCampaign() {
    const name = document.getElementById('newCampaignName').value.trim();
    const description = document.getElementById('newCampaignDescription').value.trim();

    if (!name) {
        alert('Please enter a campaign name.');
        return;
    }

    const id = 'campaign_' + Date.now();
    campaigns[id] = {
        name: name,
        description: description,
        characters: []
    };

    localStorage.setItem('campaigns', JSON.stringify(campaigns));
    closeCreateCampaignModal();
    loadCampaignsList();

    // Select the newly created campaign
    document.getElementById('campaignSelect').value = id;
    loadCampaign();
}

// Load selected campaign
function loadCampaign() {
    const select = document.getElementById('campaignSelect');
    const campaignId = select.value;

    if (!campaignId) {
        document.getElementById('campaignDetails').style.display = 'none';
        document.getElementById('campaignEmptyState').style.display = 'block';
        currentCampaignId = null;
        return;
    }

    currentCampaignId = campaignId;
    const campaign = campaigns[campaignId];

    document.getElementById('campaignName').textContent = campaign.name;
    document.getElementById('campaignDescription').textContent = campaign.description || 'No description';
    document.getElementById('campaignDetails').style.display = 'block';
    document.getElementById('campaignEmptyState').style.display = 'none';

    loadAllAvailableCharacters();
    renderCampaignCharacters();
}

// Load all available characters from all accounts
let allAvailableCharacters = [];

async function loadAllAvailableCharacters() {
    allAvailableCharacters = [];

    try {
        // Fetch all accounts from server
        const accounts = await getAccounts();

        if (!accounts || !Array.isArray(accounts)) {
            populateCharacterSelect([]);
            return;
        }

        // Extract characters from each account
        accounts.forEach(account => {
            if (account.name && account.data && account.data.characters && Array.isArray(account.data.characters)) {
                account.data.characters.forEach(character => {
                    if (character.name) {
                        allAvailableCharacters.push({
                            username: account.name,
                            charName: character.name,
                            class: character.class || 'N/A',
                            level: character.level || 1,
                            species: character.species || 'N/A'
                        });
                    }
                });
            }
        });

        // Populate the select dropdown
        populateCharacterSelect(allAvailableCharacters);
    } catch (error) {
        console.error('Error loading available characters:', error);
        populateCharacterSelect([]);
    }
}

// Populate character select dropdown
function populateCharacterSelect(characters) {
    const select = document.getElementById('availableCharactersSelect');
    if (!select) return;

    select.innerHTML = '';

    if (characters.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No characters available';
        select.appendChild(option);
        return;
    }

    characters.forEach(char => {
        const option = document.createElement('option');
        option.value = JSON.stringify({ username: char.username, charName: char.charName });
        option.textContent = `${char.charName} (@${char.username}) - ${char.class} ${char.level} (${char.species})`;
        select.appendChild(option);
    });
}

// Filter character list based on search input
function filterCharacterList() {
    const searchTerm = document.getElementById('characterSearchInput')?.value.toLowerCase() || '';

    if (!searchTerm) {
        populateCharacterSelect(allAvailableCharacters);
        return;
    }

    const filtered = allAvailableCharacters.filter(char =>
        char.charName.toLowerCase().includes(searchTerm) ||
        char.username.toLowerCase().includes(searchTerm) ||
        char.class.toLowerCase().includes(searchTerm) ||
        char.species.toLowerCase().includes(searchTerm)
    );

    populateCharacterSelect(filtered);
}

// Delete campaign
function deleteCampaign() {
    if (!currentCampaignId) {
        alert('Please select a campaign to delete.');
        return;
    }

    const campaign = campaigns[currentCampaignId];
    if (confirm(`Are you sure you want to delete the campaign "${campaign.name}"? This action cannot be undone.`)) {
        delete campaigns[currentCampaignId];
        localStorage.setItem('campaigns', JSON.stringify(campaigns));
        currentCampaignId = null;
        loadCampaignsList();
        document.getElementById('campaignDetails').style.display = 'none';
        document.getElementById('campaignEmptyState').style.display = 'block';
        document.getElementById('campaignSelect').value = '';
    }
}

// Add character to campaign
function addCharacterToCampaign() {
    if (!currentCampaignId) {
        alert('Please select a campaign first.');
        return;
    }

    const select = document.getElementById('availableCharactersSelect');
    const selectedValue = select.value;

    if (!selectedValue) {
        alert('Please select a character to add.');
        return;
    }

    // Parse the selected character data
    let charData;
    try {
        charData = JSON.parse(selectedValue);
    } catch (e) {
        alert('Invalid character selection.');
        return;
    }

    const { username, charName } = charData;

    // Check if character is already in campaign
    const campaign = campaigns[currentCampaignId];
    const exists = campaign.characters.some(c => c.username === username && c.charName === charName);

    if (exists) {
        alert('This character is already in the campaign.');
        return;
    }

    // Add character reference to campaign
    campaign.characters.push({
        username: username,
        charName: charName,
        addedDate: new Date().toISOString()
    });

    localStorage.setItem('campaigns', JSON.stringify(campaigns));

    // Clear search and reload list
    document.getElementById('characterSearchInput').value = '';
    loadAllAvailableCharacters();

    renderCampaignCharacters();
}

// Remove character from campaign
function removeCharacterFromCampaign(username, charName) {
    if (!currentCampaignId) return;

    if (confirm(`Remove ${charName} (${username}) from this campaign?`)) {
        const campaign = campaigns[currentCampaignId];
        campaign.characters = campaign.characters.filter(c =>
            !(c.username === username && c.charName === charName)
        );

        localStorage.setItem('campaigns', JSON.stringify(campaigns));
        renderCampaignCharacters();
    }
}

// Render campaign characters list
async function renderCampaignCharacters() {
    const container = document.getElementById('campaignCharactersList');
    if (!currentCampaignId) return;

    const campaign = campaigns[currentCampaignId];

    if (campaign.characters.length === 0) {
        container.innerHTML = '<p class="no-characters">No characters in this campaign yet.</p>';
        return;
    }

    // Show loading message
    container.innerHTML = '<p class="no-characters">Loading characters...</p>';

    try {
        // Fetch all character data from server
        const characterDataPromises = campaign.characters.map(async (charRef) => {
            const account = await getAccount(charRef.username);

            if (!account || !account.data) {
                return {
                    error: true,
                    errorMessage: 'Account not found',
                    username: charRef.username,
                    charName: charRef.charName
                };
            }

            const character = account.data.characters?.find(c => c.name === charRef.charName);

            if (!character) {
                return {
                    error: true,
                    errorMessage: 'Character not found',
                    username: charRef.username,
                    charName: charRef.charName
                };
            }

            return {
                error: false,
                username: charRef.username,
                character: character
            };
        });

        const characterDataResults = await Promise.all(characterDataPromises);

        // Build HTML
        let html = '';

        characterDataResults.forEach(result => {
            if (result.error) {
                html += `
                    <div class="character-card error">
                        <div class="char-card-header">
                            <strong>${result.charName}</strong>
                            <span class="char-username">@${result.username} (${result.errorMessage})</span>
                        </div>
                        <button class="remove-char-btn" onclick="removeCharacterFromCampaign('${result.username}', '${result.charName}')">Remove</button>
                    </div>
                `;
            } else {
                const character = result.character;
                const charId = `char-${result.username}-${character.name}`.replace(/[^a-zA-Z0-9-]/g, '_');

                html += `
                    <div class="character-card">
                        <div class="char-card-header" onclick="toggleCharacterDetails('${charId}')">
                            <div>
                                <strong>${character.name}</strong>
                                <span class="char-username">@${result.username}</span>
                            </div>
                            <span class="expand-icon" id="${charId}-icon">▼</span>
                        </div>
                        <div class="char-card-info">
                            <div class="char-info-row">
                                <span class="label">Class:</span> ${character.class || 'N/A'} ${character.level ? `(Lvl ${character.level})` : ''}
                            </div>
                            <div class="char-info-row">
                                <span class="label">Species:</span> ${character.species || 'N/A'}
                            </div>
                            <div class="char-info-row">
                                <span class="label">HP:</span> ${character.hp || 0} / ${character.maxHp || 0}
                            </div>
                            <div class="char-info-row">
                                <span class="label">AC:</span> ${character.ac || 10}
                            </div>
                        </div>
                        <div class="char-card-stats">
                            <div class="stat-mini">
                                <div class="stat-label">STR</div>
                                <div class="stat-value">${character.str || 10}</div>
                            </div>
                            <div class="stat-mini">
                                <div class="stat-label">DEX</div>
                                <div class="stat-value">${character.dex || 10}</div>
                            </div>
                            <div class="stat-mini">
                                <div class="stat-label">CON</div>
                                <div class="stat-value">${character.con || 10}</div>
                            </div>
                            <div class="stat-mini">
                                <div class="stat-label">INT</div>
                                <div class="stat-value">${character.int || 10}</div>
                            </div>
                            <div class="stat-mini">
                                <div class="stat-label">WIS</div>
                                <div class="stat-value">${character.wis || 10}</div>
                            </div>
                            <div class="stat-mini">
                                <div class="stat-label">CHA</div>
                                <div class="stat-value">${character.cha || 10}</div>
                            </div>
                        </div>

                        <!-- Expandable Details Section -->
                        <div id="${charId}-details" class="char-details-section" style="display: none;">

                            <!-- Feats -->
                            <div class="char-detail-block">
                                <h5>Feats</h5>
                                ${character.feats && character.feats.length > 0 ? `
                                    <ul class="char-detail-list">
                                        ${character.feats.map(feat => `<li><strong>${feat.name}</strong>: ${feat.desc || ''}</li>`).join('')}
                                    </ul>
                                ` : '<p class="no-data">No feats</p>'}
                            </div>

                            <!-- Spells -->
                            <div class="char-detail-block">
                                <h5>Spells</h5>
                                ${character.spells && character.spells.length > 0 ? `
                                    <ul class="char-detail-list">
                                        ${character.spells.map(spell => `<li><strong>${spell.name}</strong> (${spell.level || 'Cantrip'})</li>`).join('')}
                                    </ul>
                                ` : '<p class="no-data">No spells</p>'}
                            </div>

                            <!-- Equipment -->
                            <div class="char-detail-block">
                                <h5>Equipment</h5>
                                ${character.equipment ? `<p class="char-equipment-text">${character.equipment}</p>` : '<p class="no-data">No equipment listed</p>'}
                            </div>

                            <!-- Inventory -->
                            <div class="char-detail-block">
                                <h5>Inventory</h5>
                                ${character.inventory && character.inventory.length > 0 ? `
                                    <ul class="char-detail-list">
                                        ${character.inventory.map(item => `
                                            <li>
                                                <strong>${item.name}</strong> ${item.quantity > 1 ? `(x${item.quantity})` : ''}
                                                ${item.value ? ` - ${item.value} ${item.currency || 'gp'}` : ''}
                                                ${item.notes ? `<br><span class="item-notes">${item.notes}</span>` : ''}
                                            </li>
                                        `).join('')}
                                    </ul>
                                ` : '<p class="no-data">No inventory items</p>'}
                            </div>
                        </div>

                        <button class="remove-char-btn" onclick="removeCharacterFromCampaign('${result.username}', '${character.name}')">Remove from Campaign</button>
                    </div>
                `;
            }
        });

        container.innerHTML = html;
    } catch (error) {
        console.error('Error rendering campaign characters:', error);
        container.innerHTML = '<p class="no-characters" style="color: var(--primary);">Error loading characters. Please try again.</p>';
    }
}

// Initialize
checkLogin();
loadMonsters();
initCharacterSheet();
setupAutoSave();
