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

// Main tab switching (DM Tools / Player Tools / Dice Roller)
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
        2: [{ name: 'Ki', notes: 'You have ki points = monk level. Spend ki to use Flurry of Blows, Patient Defense, or Step of the Wind. Regain on short/long rest.' },
            { name: 'Uncanny Metabolism', notes: 'At end of turn, if bloodied (half HP or less), regain ki points = proficiency bonus. Once per long rest.' },
            { name: 'Unarmored Movement', notes: 'Speed increases while not wearing armor or wielding a shield: +10ft (level 2), +15ft (level 6), +20ft (level 10), +25ft (level 14), +30ft (level 18).' }],
        3: [{ name: 'Deflect Attacks', notes: 'Use reaction to reduce damage from attack by 1d10 + DEX + monk level. If reduced to 0, spend 1 ki to redirect at attacker (melee) or another target (ranged).' }],
        4: [{ name: 'Slow Fall', notes: 'Use reaction when falling to reduce fall damage by 5× monk level.' }],
        5: [{ name: 'Extra Attack', notes: 'Attack twice when you take the Attack action.' },
            { name: 'Stunning Strike', notes: 'Once per turn when you hit with a melee weapon or unarmed strike, spend 1 ki to force target to make CON save or be stunned until end of your next turn.' }],
        6: [{ name: 'Empowered Strikes', notes: 'Your unarmed strikes count as magical.' }],
        7: [{ name: 'Evasion', notes: 'When you succeed on DEX save that deals half damage on success, take no damage instead. On fail, take half damage.' }],
        10: [{ name: 'Self-Restoration', notes: 'As action, end one condition on yourself: charmed, frightened, or poisoned. Also, spend 4 ki to end one level of exhaustion.' }],
        13: [{ name: 'Deflect Energy', notes: 'When you take acid, cold, fire, lightning, or thunder damage, use reaction to reduce damage by 1d10 + WIS + monk level. Spend 1 ki to reflect it.' }],
        14: [{ name: 'Disciplined Survivor', notes: 'Death saves use WIS modifier instead of no modifier. When you start turn with 0 HP and succeed on death save, stand up with HP = monk level.' }],
        15: [{ name: 'Perfect Focus', notes: 'When you roll initiative with no ki, regain 4 ki.' }],
        18: [{ name: 'Superior Defense', notes: 'At start of turn, spend 3 ki to give yourself resistance to all damage except Force damage until start of next turn.' }],
        20: [{ name: 'Body and Mind', notes: 'Martial Arts damage becomes 1d12. At end of turn if bloodied, regain ki = WIS modifier (min 1).' }]
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

        // Ki (Monk) - Ki points equal to monk level
        if (name.includes('ki') && trait.type === 'class') {
            const kiPoints = level;
            char.counters.push({
                id: `auto-ki-${Date.now()}`,
                name: 'Ki Points',
                max: kiPoints,
                current: kiPoints,
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
    // Save any changes to the current character sheet first
    if (currentCounterCharacterIndex === currentCharacterIndex) {
        saveCurrentCharacter();
    }

    // Get the character whose counters we're updating
    const char = characters[currentCounterCharacterIndex];
    if (!char) {
        alert('No character selected');
        return;
    }

    // Always get data from the counter character's saved data
    const charClass = char.class || '';
    const charLevel = parseInt(char.level) || 1;
    const maxHP = parseInt(char.maxHp || char.hp) || 10;

    if (!charClass) {
        alert('Please select a class first');
        return;
    }

    // Initialize counters array
    if (!char.counters) {
        char.counters = [];
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
                <input type="number" class="counter-value-input" value="${counter.current}" min="0" max="${counter.max}" onchange="setCounterValue(${counter.id}, this.value)" />
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
            renderCounters();
            saveUserData();
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

// Initialize
checkLogin();
loadMonsters();
initCharacterSheet();
setupAutoSave();
