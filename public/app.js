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

// Main tab switching (DM Tools / Player Tools)
function switchTab(tab) {
    // Remove active class from all main tabs and content
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to selected tab
    if (tab === 'dmtools') {
        document.querySelector('.tab-button:first-child').classList.add('active');
        document.getElementById('dmtoolsTab').classList.add('active');
        // Default to encounter generator when switching to DM Tools
        switchSection('encounter');
    } else if (tab === 'playertools') {
        document.querySelector('.tab-button:last-child').classList.add('active');
        document.getElementById('playertoolsTab').classList.add('active');
    }
}

// Section switching within DM Tools
function switchSection(section) {
    // Remove active class from all section tabs
    document.querySelectorAll('.section-tab-button').forEach(btn => btn.classList.remove('active'));

    // Remove active class from encounter and browser tabs
    document.getElementById('encounterTab').classList.remove('active');
    document.getElementById('browserTab').classList.remove('active');

    // Add active class to selected section
    if (section === 'encounter') {
        document.querySelector('.section-tab-button:first-child').classList.add('active');
        document.getElementById('encounterTab').classList.add('active');
    } else if (section === 'browser') {
        document.querySelector('.section-tab-button:last-child').classList.add('active');
        document.getElementById('browserTab').classList.add('active');
    }
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

// Display encounter
function displayEncounter(monsters, params) {
    const totalXP = monsters.reduce((sum, m) => sum + (m.xp * m.count), 0);
    const totalMonsters = monsters.reduce((sum, m) => sum + m.count, 0);

    const winChance = calculateWinChance(params.difficulty);

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
        { name: 'Tavern Brawler', prereq: 'None', desc: 'You gain proficiency with improvised weapons. Your Unarmed Strike uses a d4 for damage. When you hit with an Unarmed Strike as part of the Attack action on your turn, you can deal damage to the target and also grapple it (no action required).' }
    ],
    general: [
        { name: 'Ability Score Improvement', prereq: '4th level', desc: 'Increase one ability score of your choice by 2, or increase two ability scores by 1 each. You can\'t increase an ability score above 20 using this feat.' },
        { name: 'Actor', prereq: '4th level', desc: 'Increase your Charisma by 1. You have Advantage on Deception and Performance checks when trying to pass yourself off as someone else. You can mimic another person\'s speech or sounds made by creatures after hearing them for at least 1 minute.' },
        { name: 'Athlete', prereq: '4th level, Strength or Dexterity 13+', desc: 'Increase Strength or Dexterity by 1. Climbing doesn\'t cost extra movement. You need only 5 feet of running start for long jumps. You have Advantage on ability checks to escape a grapple.' },
        { name: 'Charger', prereq: '4th level', desc: 'When you take the Dash action, you can make one melee weapon attack or shove a creature as a Bonus Action. If you move at least 10 feet straight toward the target, you either gain +5 to the attack\'s damage or push the target 10 feet (your choice).' },
        { name: 'Crossbow Expert', prereq: '4th level', desc: 'You ignore the Loading property of crossbows. Being within 5 feet of a hostile creature doesn\'t impose Disadvantage on your ranged attack rolls. When you use the Attack action to attack with a one-handed weapon, you can make a ranged attack with a hand crossbow as a Bonus Action.' },
        { name: 'Defensive Duelist', prereq: '4th level, Dexterity 13+', desc: 'When wielding a Finesse weapon and another creature hits you with a melee attack, you can use your Reaction to add your Proficiency Bonus to your AC for that attack, potentially causing it to miss.' },
        { name: 'Dual Wielder', prereq: '4th level', desc: 'You gain +1 AC while wielding separate melee weapons in each hand. You can draw or stow two weapons when you would normally draw or stow one. You can engage in two-weapon fighting even when the weapons you are wielding aren\'t Light.' },
        { name: 'Durable', prereq: '4th level', desc: 'Increase Constitution by 1. When you roll a Hit Die to regain HP, the minimum number of HP you regain equals twice your Constitution modifier.' },
        { name: 'Elemental Adept', prereq: '4th level, Spellcasting or Pact Magic feature', desc: 'Choose acid, cold, fire, lightning, or thunder. Spells you cast ignore Resistance to that damage type. When you roll damage for a spell that deals that type, you can treat any 1 on a damage die as a 2.' },
        { name: 'Fey Touched', prereq: '4th level', desc: 'Increase Intelligence, Wisdom, or Charisma by 1. You learn Misty Step and one 1st-level spell from the Divination or Enchantment school. You can cast each spell once per Long Rest without a spell slot. Your spellcasting ability is the ability increased by this feat.' },
        { name: 'Great Weapon Master', prereq: '4th level', desc: 'When you score a Critical Hit or reduce a creature to 0 HP with a melee weapon, you can make one melee weapon attack as a Bonus Action. Before you make a melee attack with a Heavy weapon, you can take a -5 penalty to the attack roll. If the attack hits, you add +10 to the attack\'s damage.' },
        { name: 'Heavily Armored', prereq: '4th level, Medium Armor proficiency', desc: 'Increase Strength by 1. You gain proficiency with Heavy Armor.' },
        { name: 'Heavy Armor Master', prereq: '4th level, Heavy Armor proficiency', desc: 'Increase Strength by 1. While wearing Heavy Armor, bludgeoning, piercing, and slashing damage you take from nonmagical weapons is reduced by 3.' },
        { name: 'Inspiring Leader', prereq: '4th level, Charisma 13+', desc: 'You can spend 10 minutes inspiring companions. Choose up to 6 creatures who can hear and understand you. Each gains temporary HP equal to your level + your Charisma modifier. A creature can\'t gain temp HP from this feat again until finishing a Short or Long Rest.' },
        { name: 'Keen Mind', prereq: '4th level', desc: 'Increase Intelligence by 1. You can accurately recall anything you\'ve seen or heard in the past month. You always know which way is north and hours until the next sunrise or sunset.' },
        { name: 'Mage Slayer', prereq: '4th level', desc: 'When a creature within 5 feet casts a spell, you can use your Reaction to make a melee weapon attack against it. When you damage a concentrating creature, it has Disadvantage on the saving throw. You have Advantage on saves against spells cast by creatures within 5 feet.' },
        { name: 'Martial Adept', prereq: '4th level', desc: 'You learn two maneuvers from the Battle Master. If a maneuver requires a save, DC = 8 + Proficiency Bonus + Strength or Dexterity modifier. You gain one d6 Superiority Die (regains on Short/Long Rest).' },
        { name: 'Medium Armor Master', prereq: '4th level, Medium Armor proficiency', desc: 'Increase Strength or Dexterity by 1. While wearing Medium Armor, you can add up to 3 (instead of 2) to AC if you have 16+ Dexterity. Wearing Medium Armor doesn\'t impose Disadvantage on Stealth checks.' },
        { name: 'Mobile', prereq: '4th level', desc: 'Your Speed increases by 10 feet. When you use Dash, difficult terrain doesn\'t cost extra movement. When you make a melee attack against a creature, you don\'t provoke opportunity attacks from that creature until the end of your turn.' },
        { name: 'Mounted Combatant', prereq: '4th level', desc: 'You have Advantage on melee attacks against unmounted creatures smaller than your mount. You can force an attack targeting your mount to target you instead. If your mount is subjected to an effect that allows a Dex save for half damage, it takes no damage on success (instead of half).' },
        { name: 'Observant', prereq: '4th level', desc: 'Increase Intelligence or Wisdom by 1. If you can see a creature\'s mouth while it speaks a language you understand, you can interpret what it\'s saying by reading its lips. You have +5 bonus to passive Perception and passive Investigation.' },
        { name: 'Polearm Master', prereq: '4th level', desc: 'When you take the Attack action with a glaive, halberd, pike, or quarterstaff, you can use a Bonus Action to make a melee attack with the opposite end (uses d4 for damage). While wielding a glaive, halberd, pike, or quarterstaff, creatures provoke opportunity attacks when they enter your reach.' },
        { name: 'Resilient', prereq: '4th level', desc: 'Increase one ability score by 1. You gain proficiency in saving throws using the chosen ability.' },
        { name: 'Ritual Caster', prereq: '4th level, Intelligence, Wisdom, or Charisma 13+', desc: 'Choose a class. You learn two 1st-level spells with the Ritual tag from that class. You can cast them as rituals. You can add other ritual spells you find to your ritual book.' },
        { name: 'Sentinel', prereq: '4th level', desc: 'When you hit a creature with an opportunity attack, its Speed becomes 0 until the end of the current turn. Creatures provoke opportunity attacks even if they Disengage. When a creature within 5 feet makes an attack against a target other than you, you can use your Reaction to make a melee weapon attack against the attacking creature.' },
        { name: 'Shadow Touched', prereq: '4th level', desc: 'Increase Intelligence, Wisdom, or Charisma by 1. You learn Invisibility and one 1st-level spell from the Illusion or Necromancy school. You can cast each once per Long Rest without a spell slot. Your spellcasting ability is the ability increased by this feat.' },
        { name: 'Sharpshooter', prereq: '4th level', desc: 'Your ranged weapon attacks ignore half and three-quarters cover. Before you make a ranged weapon attack, you can take a -5 penalty to the attack roll. If it hits, you add +10 to the attack\'s damage.' },
        { name: 'Shield Master', prereq: '4th level', desc: 'If you take the Attack action, you can use a Bonus Action to shove a creature within 5 feet (must be holding a shield). If you\'re holding a shield and subjected to an effect that allows a Dex save for half damage, you can use your Reaction to take no damage on success (instead of half). If holding a shield, you gain the shield\'s AC bonus against effects that target only you and allow a Dex save.' },
        { name: 'Skulker', prereq: '4th level, Dexterity 13+', desc: 'You can Hide when lightly obscured. Missing with a ranged weapon attack doesn\'t reveal your position. Dim light doesn\'t impose Disadvantage on Perception checks.' },
        { name: 'Spell Sniper', prereq: '4th level, Spellcasting or Pact Magic feature', desc: 'When you cast a spell that requires a ranged attack roll, the spell\'s range is doubled. Your ranged spell attacks ignore half and three-quarters cover. You learn one cantrip that requires an attack roll from any class\'s spell list.' },
        { name: 'Telekinetic', prereq: '4th level', desc: 'Increase Intelligence, Wisdom, or Charisma by 1. You learn Mage Hand (invisible when you cast it). As a Bonus Action, you can try to shove a creature within 30 feet using telekinesis (Strength save vs your spell save DC).' },
        { name: 'Telepathic', prereq: '4th level', desc: 'Increase Intelligence, Wisdom, or Charisma by 1. You can speak telepathically to any creature within 60 feet. You can cast Detect Thoughts once per Long Rest without a spell slot (spell save DC uses the ability increased by this feat).' },
        { name: 'War Caster', prereq: '4th level, Spellcasting or Pact Magic feature', desc: 'You have Advantage on Constitution saves to maintain concentration. You can perform somatic components even when holding weapons or a shield. When a creature provokes an opportunity attack, you can use your Reaction to cast a spell targeting only that creature (spell must have 1 action casting time and target only that creature).' }
    ]
};

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

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const featModal = document.getElementById('featModal');
    const counterModal = document.getElementById('addCounterModal');
    const deleteModal = document.getElementById('deleteCounterModal');

    if (e.target === featModal) {
        closeFeatSelector();
    }
    if (e.target === counterModal) {
        closeAddCounterModal();
    }
    if (e.target === deleteModal) {
        closeDeleteCounterModal();
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
});

// Player Section switching
function switchPlayerSection(section) {
    // Remove active from all section tabs
    document.querySelectorAll('#playertoolsTab .section-tab-button').forEach(btn => btn.classList.remove('active'));

    // Remove active from player sections
    document.querySelectorAll('.player-section').forEach(content => content.classList.remove('active'));

    // Add active to selected section
    if (section === 'character') {
        document.querySelector('#playertoolsTab .section-tab-button:first-child').classList.add('active');
        document.getElementById('characterSection').classList.add('active');
    } else if (section === 'counters') {
        document.querySelector('#playertoolsTab .section-tab-button:last-child').classList.add('active');
        document.getElementById('countersSection').classList.add('active');
    }
}

// Counters System
let counters = [];
let counterIdCounter = 0;

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

    counters.push(counter);
    renderCounters();
    closeAddCounterModal();
}

function incrementCounter(id) {
    const counter = counters.find(c => c.id === id);
    if (counter && counter.current < counter.max) {
        counter.current++;
        renderCounters();
    }
}

function decrementCounter(id) {
    const counter = counters.find(c => c.id === id);
    if (counter && counter.current > 0) {
        counter.current--;
        renderCounters();
    }
}

function resetCounter(id) {
    const counter = counters.find(c => c.id === id);
    if (counter) {
        counter.current = counter.max;
        renderCounters();
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
        counters = counters.filter(c => c.id !== counterToDelete);
        renderCounters();
        closeDeleteCounterModal();
    }
}

function resetAllCounters() {
    counters.forEach(counter => {
        counter.current = counter.max;
    });
    renderCounters();
}

function renderCounters() {
    const container = document.getElementById('countersList');
    const resetAllBtn = document.getElementById('resetAllBtn');

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
                <button class="counter-delete" onclick="deleteCounter(${counter.id})">&times;</button>
            </div>
            <div class="counter-display">
                <div class="counter-value">${counter.current}</div>
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

// Login System
let currentUser = null;

// Check for existing login on page load
async function checkLogin() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        if (savedUser === 'admin') {
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

    // Check for admin login
    if (name === 'admin' && password === 'admin') {
        currentUser = 'admin';
        localStorage.setItem('currentUser', 'admin');
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

    // Gather character sheet data
    const characterData = {
        name: document.getElementById('charName')?.value || '',
        class: document.getElementById('charClass')?.value || '',
        subclass: document.getElementById('charSubclass')?.value || '',
        level: document.getElementById('charLevel')?.value || 1,
        species: document.getElementById('charSpecies')?.value || '',
        background: document.getElementById('charBackground')?.value || '',

        // Ability scores
        str: document.getElementById('str')?.value || 10,
        dex: document.getElementById('dex')?.value || 10,
        con: document.getElementById('con')?.value || 10,
        int: document.getElementById('int')?.value || 10,
        wis: document.getElementById('wis')?.value || 10,
        cha: document.getElementById('cha')?.value || 10,

        // Combat stats
        ac: document.getElementById('ac')?.value || 10,
        hp: document.getElementById('hp')?.value || 10,
        maxHp: document.getElementById('maxHp')?.value || 10,
        speed: document.getElementById('speed')?.value || 30,
        profBonus: document.getElementById('profBonus')?.value || 2,

        // Skills
        skills: {}
    };

    // Save skill proficiencies
    Object.keys(skillAbilities).forEach(skill => {
        const checkbox = document.getElementById(`skill${skill}`);
        if (checkbox) {
            characterData.skills[skill] = checkbox.checked;
        }
    });

    // Equipment and notes
    characterData.equipment = document.getElementById('equipment')?.value || '';
    characterData.notes = document.getElementById('notes')?.value || '';

    // Update account data on server
    const data = {
        character: characterData,
        counters: counters,
        feats: selectedFeats
    };

    await updateAccountData(currentUser, data);
}

// Load user data
async function loadUserData() {
    if (!currentUser || currentUser === 'admin') return;

    const account = await getAccount(currentUser);

    if (!account || !account.data) return;

    const data = account.data;

    // Load character sheet
    if (data.character) {
        const char = data.character;

        if (document.getElementById('charName')) document.getElementById('charName').value = char.name || '';
        if (document.getElementById('charClass')) document.getElementById('charClass').value = char.class || '';
        if (document.getElementById('charLevel')) document.getElementById('charLevel').value = char.level || 1;
        if (document.getElementById('charSpecies')) document.getElementById('charSpecies').value = char.species || '';
        if (document.getElementById('charBackground')) document.getElementById('charBackground').value = char.background || '';

        // Trigger subclass update
        updateSubclassOptions();
        if (document.getElementById('charSubclass')) document.getElementById('charSubclass').value = char.subclass || '';

        // Ability scores
        if (document.getElementById('str')) document.getElementById('str').value = char.str || 10;
        if (document.getElementById('dex')) document.getElementById('dex').value = char.dex || 10;
        if (document.getElementById('con')) document.getElementById('con').value = char.con || 10;
        if (document.getElementById('int')) document.getElementById('int').value = char.int || 10;
        if (document.getElementById('wis')) document.getElementById('wis').value = char.wis || 10;
        if (document.getElementById('cha')) document.getElementById('cha').value = char.cha || 10;

        // Combat stats
        if (document.getElementById('ac')) document.getElementById('ac').value = char.ac || 10;
        if (document.getElementById('hp')) document.getElementById('hp').value = char.hp || 10;
        if (document.getElementById('maxHp')) document.getElementById('maxHp').value = char.maxHp || 10;
        if (document.getElementById('speed')) document.getElementById('speed').value = char.speed || 30;
        if (document.getElementById('profBonus')) document.getElementById('profBonus').value = char.profBonus || 2;

        // Skills
        if (char.skills) {
            Object.keys(char.skills).forEach(skill => {
                const checkbox = document.getElementById(`skill${skill}`);
                if (checkbox) {
                    checkbox.checked = char.skills[skill];
                }
            });
        }

        // Equipment and notes
        if (document.getElementById('equipment')) document.getElementById('equipment').value = char.equipment || '';
        if (document.getElementById('notes')) document.getElementById('notes').value = char.notes || '';

        // Update calculations
        updateCharacterSheet();
    }

    // Load counters
    if (data.counters) {
        counters = data.counters;
        counterIdCounter = Math.max(...counters.map(c => c.id), 0) + 1;
        renderCounters();
    }

    // Load feats
    if (data.feats) {
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

// Initialize
checkLogin();
loadMonsters();
initCharacterSheet();
setupAutoSave();
