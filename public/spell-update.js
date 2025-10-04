// REPLACE THE spellsData OBJECT AND ADD THESE FUNCTIONS TO app.js

// Updated spell filtering functions
function openSpellSelector() {
    const charClass = document.getElementById('charClass')?.value || '';
    const filterSpan = document.getElementById('currentClassFilter');
    if (charClass && filterSpan) {
        filterSpan.textContent = `(Filtering for ${charClass})`;
    } else if (filterSpan) {
        filterSpan.textContent = '';
    }

    document.getElementById('spellModal').classList.add('active');
    document.getElementById('spellSearch').value = '';
    document.getElementById('showAllClassSpells').checked = false;
    renderSpellLists();
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

    levels.forEach(level => {
        const listElement = document.getElementById(`${level}SpellsList`);

        let spells = spellsData[level];

        // Filter by class if not showing all
        if (!showAllClasses && charClass) {
            spells = spells.filter(spell => spell.classes.includes(charClass));
        }

        // Filter by search term
        if (searchTerm) {
            spells = spells.filter(spell =>
                spell.name.toLowerCase().includes(searchTerm) ||
                spell.desc.toLowerCase().includes(searchTerm) ||
                spell.school.toLowerCase().includes(searchTerm)
            );
        }

        if (spells.length === 0) {
            listElement.innerHTML = '<p style="color: var(--text-dim); padding: 20px; text-align: center;">No spells found</p>';
            return;
        }

        listElement.innerHTML = spells.map(spell => `
            <div class="spell-option ${selectedSpells.some(s => s.name === spell.name) ? 'selected' : ''}" onclick="selectSpell('${spell.name.replace(/'/g, "\\'")}', '${levelNames[level]}')">
                <h4>${spell.name}</h4>
                <div class="spell-meta">${spell.school} • ${levelNames[level]} • ${spell.classes.join(', ')}</div>
                <p>${spell.desc}</p>
            </div>
        `).join('');
    });
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
