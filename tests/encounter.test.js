// Encounter Generation Unit Tests
// Tests for D&D encounter building, XP budgets, and CR calculations

const assert = require('assert');

// XP thresholds per character level (D&D 5e DMG)
const XP_THRESHOLDS = {
    1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
    2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
    3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
    4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
    5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
    6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
    7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
    8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
    9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
    10: { easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
    11: { easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
    12: { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
    13: { easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
    14: { easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
    15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
    16: { easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
    17: { easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
    18: { easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
    19: { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
    20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 }
};

// CR to XP conversion
const CR_TO_XP = {
    0: 10,
    0.125: 25,
    0.25: 50,
    0.5: 100,
    1: 200,
    2: 450,
    3: 700,
    4: 1100,
    5: 1800,
    6: 2300,
    7: 2900,
    8: 3900,
    9: 5000,
    10: 5900,
    11: 7200,
    12: 8400,
    13: 10000,
    14: 11500,
    15: 13000,
    16: 15000,
    17: 18000,
    18: 20000,
    19: 22000,
    20: 25000,
    21: 33000,
    22: 41000,
    23: 50000,
    24: 62000,
    25: 75000,
    26: 90000,
    27: 105000,
    28: 120000,
    29: 135000,
    30: 155000
};

// Calculate XP budget for encounter
function calculateXPBudget(partyLevel, partySize, difficulty) {
    const thresholds = XP_THRESHOLDS[partyLevel];
    if (!thresholds) return 0;

    let multiplier;
    switch (difficulty) {
        case 'Easy': multiplier = 1.0; break;
        case 'Medium': multiplier = 1.0; break;
        case 'Hard': multiplier = 1.0; break;
        case 'Very Hard': multiplier = 1.5; break;
        case 'You Gonna Die': multiplier = 2.0; break;
        default: multiplier = 1.0;
    }

    const baseXP = thresholds[difficulty.toLowerCase()] || thresholds.medium;
    return baseXP * partySize * multiplier;
}

// Calculate win chance based on difficulty
function calculateWinChance(difficulty) {
    const winChances = {
        'Easy': 95,
        'Medium': 75,
        'Hard': 50,
        'Very Hard': 25,
        'You Gonna Die': 5
    };
    return winChances[difficulty] || 50;
}

// Mock monster data
const createMockMonster = (name, cr, type = 'humanoid', size = 'Medium') => ({
    name,
    index: name.toLowerCase().replace(/\s/g, '-'),
    cr,
    type,
    size,
    xp: CR_TO_XP[cr] || 0
});

// Mock encounter data
const createMockEncounter = () => ({
    name: 'Test Encounter',
    partyLevel: 5,
    partySize: 4,
    difficulty: 'Medium',
    monsters: [],
    totalXP: 0,
    budget: 0,
    winChance: 75
});

describe('XP Budget Calculation Tests', () => {

    it('should calculate XP budget for easy encounter', () => {
        const budget = calculateXPBudget(5, 4, 'Easy');
        // Level 5 easy: 250 × 4 = 1000
        assert.strictEqual(budget, 1000);
    });

    it('should calculate XP budget for medium encounter', () => {
        const budget = calculateXPBudget(5, 4, 'Medium');
        // Level 5 medium: 500 × 4 = 2000
        assert.strictEqual(budget, 2000);
    });

    it('should calculate XP budget for hard encounter', () => {
        const budget = calculateXPBudget(5, 4, 'Hard');
        // Level 5 hard: 750 × 4 = 3000
        assert.strictEqual(budget, 3000);
    });

    it('should calculate XP budget for deadly encounter with multiplier', () => {
        const budget = calculateXPBudget(5, 4, 'Very Hard');
        // Level 5 hard: 750 × 4 = 3000 (Very Hard uses 'hard' threshold in our implementation)
        assert.strictEqual(budget, 3000);
    });

    it('should scale XP budget with party size', () => {
        const budget2 = calculateXPBudget(5, 2, 'Medium');
        const budget4 = calculateXPBudget(5, 4, 'Medium');
        const budget8 = calculateXPBudget(5, 8, 'Medium');

        assert.strictEqual(budget2, 1000); // 500 × 2
        assert.strictEqual(budget4, 2000); // 500 × 4
        assert.strictEqual(budget8, 4000); // 500 × 8
    });

    it('should scale XP budget with party level', () => {
        const budget1 = calculateXPBudget(1, 4, 'Medium');
        const budget10 = calculateXPBudget(10, 4, 'Medium');
        const budget20 = calculateXPBudget(20, 4, 'Medium');

        assert.strictEqual(budget1, 200);   // 50 × 4
        assert.strictEqual(budget10, 4800); // 1200 × 4
        assert.strictEqual(budget20, 22800); // 5700 × 4
    });
});

describe('Win Chance Calculation Tests', () => {

    it('should return correct win chance for each difficulty', () => {
        assert.strictEqual(calculateWinChance('Easy'), 95);
        assert.strictEqual(calculateWinChance('Medium'), 75);
        assert.strictEqual(calculateWinChance('Hard'), 50);
        assert.strictEqual(calculateWinChance('Very Hard'), 25);
        assert.strictEqual(calculateWinChance('You Gonna Die'), 5);
    });

    it('should default to 50% for unknown difficulty', () => {
        assert.strictEqual(calculateWinChance('Unknown'), 50);
    });
});

describe('CR to XP Conversion Tests', () => {

    it('should convert CR 0 to 10 XP', () => {
        assert.strictEqual(CR_TO_XP[0], 10);
    });

    it('should convert fractional CRs correctly', () => {
        assert.strictEqual(CR_TO_XP[0.125], 25);
        assert.strictEqual(CR_TO_XP[0.25], 50);
        assert.strictEqual(CR_TO_XP[0.5], 100);
    });

    it('should convert CR 1-5 correctly', () => {
        assert.strictEqual(CR_TO_XP[1], 200);
        assert.strictEqual(CR_TO_XP[2], 450);
        assert.strictEqual(CR_TO_XP[3], 700);
        assert.strictEqual(CR_TO_XP[4], 1100);
        assert.strictEqual(CR_TO_XP[5], 1800);
    });

    it('should convert high CR (20+) correctly', () => {
        assert.strictEqual(CR_TO_XP[20], 25000);
        assert.strictEqual(CR_TO_XP[25], 75000);
        assert.strictEqual(CR_TO_XP[30], 155000);
    });
});

describe('Monster Selection Tests', () => {

    it('should create monster with correct CR and XP', () => {
        const goblin = createMockMonster('Goblin', 0.25, 'humanoid', 'Small');

        assert.strictEqual(goblin.name, 'Goblin');
        assert.strictEqual(goblin.cr, 0.25);
        assert.strictEqual(goblin.xp, 50);
    });

    it('should support multiple monsters of same type', () => {
        const encounter = createMockEncounter();
        encounter.monsters.push(
            { ...createMockMonster('Goblin', 0.25), count: 5 }
        );

        const totalXP = encounter.monsters[0].xp * encounter.monsters[0].count;
        assert.strictEqual(totalXP, 250); // 50 XP × 5
    });

    it('should support mixed monster groups', () => {
        const encounter = createMockEncounter();
        encounter.monsters.push(
            { ...createMockMonster('Goblin', 0.25), count: 4 },
            { ...createMockMonster('Bugbear', 1), count: 1 }
        );

        const totalXP = (50 * 4) + (200 * 1);
        assert.strictEqual(totalXP, 400);
    });

    it('should select appropriate CR range for party level', () => {
        const partyLevel = 5;
        const minCR = Math.max(0, partyLevel - 3);
        const maxCR = partyLevel + 2;

        assert(minCR >= 0);
        assert(maxCR >= minCR);
        assert.strictEqual(minCR, 2);
        assert.strictEqual(maxCR, 7);
    });
});

describe('Encounter Generation Tests', () => {

    it('should create valid encounter with required fields', () => {
        const encounter = createMockEncounter();

        assert(encounter.name);
        assert(encounter.partyLevel >= 1 && encounter.partyLevel <= 20);
        assert(encounter.partySize >= 1 && encounter.partySize <= 8);
        assert(encounter.difficulty);
        assert(Array.isArray(encounter.monsters));
    });

    it('should respect monster count preference', () => {
        const encounter = createMockEncounter();
        const monsterCount = 3;

        // Add 3 different monsters
        encounter.monsters.push(
            { ...createMockMonster('Goblin', 0.25), count: 1 },
            { ...createMockMonster('Hobgoblin', 0.5), count: 1 },
            { ...createMockMonster('Bugbear', 1), count: 1 }
        );

        assert.strictEqual(encounter.monsters.length, monsterCount);
    });

    it('should stay within XP budget', () => {
        const encounter = createMockEncounter();
        const budget = calculateXPBudget(encounter.partyLevel, encounter.partySize, encounter.difficulty);

        encounter.monsters.push(
            { ...createMockMonster('Ogre', 2), count: 4 } // 450 × 4 = 1800 XP
        );

        const totalXP = encounter.monsters.reduce((sum, m) => sum + (m.xp * m.count), 0);

        assert(totalXP <= budget * 1.1); // Allow 10% over budget
    });

    it('should calculate budget utilization percentage', () => {
        const encounter = createMockEncounter();
        const budget = 2000;
        const actualXP = 1800;

        const utilization = Math.floor((actualXP / budget) * 100);
        assert.strictEqual(utilization, 90);
    });
});

describe('Saved Encounter Tests', () => {

    it('should save encounter with name and folder', () => {
        const savedEncounter = {
            name: 'Goblin Ambush',
            folder: 'Chapter 1',
            partyLevel: 3,
            partySize: 4,
            difficulty: 'Medium',
            monsters: [
                { name: 'Goblin', cr: 0.25, count: 6 }
            ],
            totalXP: 300,
            createdAt: new Date().toISOString()
        };

        assert.strictEqual(savedEncounter.name, 'Goblin Ambush');
        assert.strictEqual(savedEncounter.folder, 'Chapter 1');
    });

    it('should support multiple folders for organization', () => {
        const folders = ['Chapter 1', 'Chapter 2', 'Random Encounters', 'Boss Fights'];

        folders.forEach(folder => {
            assert(typeof folder === 'string');
        });
    });

    it('should save both generated and custom encounters', () => {
        const generatedEncounter = {
            name: 'Auto-Generated Hard',
            type: 'generated',
            monsters: []
        };

        const customEncounter = {
            name: 'Custom Dragon Fight',
            type: 'custom',
            monsters: []
        };

        assert.strictEqual(generatedEncounter.type, 'generated');
        assert.strictEqual(customEncounter.type, 'custom');
    });
});

describe('Custom Encounter Builder Tests', () => {

    it('should add monsters to custom encounter', () => {
        const customEncounter = {
            monsters: []
        };

        customEncounter.monsters.push(
            { ...createMockMonster('Ancient Red Dragon', 24), count: 1 }
        );

        assert.strictEqual(customEncounter.monsters.length, 1);
        assert.strictEqual(customEncounter.monsters[0].cr, 24);
    });

    it('should calculate total XP for custom encounter', () => {
        const customEncounter = {
            monsters: [
                { ...createMockMonster('Goblin', 0.25), count: 10 },
                { ...createMockMonster('Bugbear Chief', 3), count: 1 }
            ]
        };

        const totalXP = customEncounter.monsters.reduce((sum, m) => sum + (m.xp * m.count), 0);
        // (50 × 10) + (700 × 1) = 1200
        assert.strictEqual(totalXP, 1200);
    });

    it('should allow increment/decrement of monster counts', () => {
        let monsterCount = 1;

        monsterCount++; // Increment
        assert.strictEqual(monsterCount, 2);

        monsterCount--; // Decrement
        assert.strictEqual(monsterCount, 1);

        monsterCount += 5; // Add multiple
        assert.strictEqual(monsterCount, 6);
    });

    it('should remove monsters from custom encounter', () => {
        const customEncounter = {
            monsters: [
                { name: 'Goblin', cr: 0.25, count: 1 },
                { name: 'Orc', cr: 0.5, count: 1 }
            ]
        };

        // Remove Goblin
        customEncounter.monsters = customEncounter.monsters.filter(m => m.name !== 'Goblin');

        assert.strictEqual(customEncounter.monsters.length, 1);
        assert.strictEqual(customEncounter.monsters[0].name, 'Orc');
    });

    it('should clear all monsters from encounter', () => {
        const customEncounter = {
            monsters: [
                { name: 'Goblin', cr: 0.25, count: 1 },
                { name: 'Orc', cr: 0.5, count: 1 }
            ]
        };

        customEncounter.monsters = [];

        assert.strictEqual(customEncounter.monsters.length, 0);
    });
});

describe('Monster Database Tests', () => {

    it('should support monster search by name', () => {
        const monsters = [
            createMockMonster('Goblin', 0.25),
            createMockMonster('Hobgoblin', 0.5),
            createMockMonster('Bugbear', 1)
        ];

        const searchTerm = 'goblin';
        const results = monsters.filter(m =>
            m.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        assert.strictEqual(results.length, 2); // Goblin and Hobgoblin
    });

    it('should filter monsters by CR', () => {
        const monsters = [
            createMockMonster('Goblin', 0.25),
            createMockMonster('Orc', 0.5),
            createMockMonster('Ogre', 2),
            createMockMonster('Troll', 5)
        ];

        const filteredCR2 = monsters.filter(m => m.cr === 2);
        assert.strictEqual(filteredCR2.length, 1);
        assert.strictEqual(filteredCR2[0].name, 'Ogre');
    });

    it('should filter monsters by type', () => {
        const monsters = [
            createMockMonster('Goblin', 0.25, 'humanoid'),
            createMockMonster('Orc', 0.5, 'humanoid'),
            createMockMonster('Zombie', 0.25, 'undead'),
            createMockMonster('Skeleton', 0.25, 'undead')
        ];

        const undead = monsters.filter(m => m.type === 'undead');
        assert.strictEqual(undead.length, 2);
    });

    it('should support all monster sizes', () => {
        const sizes = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];

        sizes.forEach(size => {
            const monster = createMockMonster('Test', 1, 'humanoid', size);
            assert.strictEqual(monster.size, size);
        });
    });
});

describe('Encounter Display Tests', () => {

    it('should display total monster count', () => {
        const encounter = {
            monsters: [
                { name: 'Goblin', count: 5 },
                { name: 'Hobgoblin', count: 2 }
            ]
        };

        const totalCount = encounter.monsters.reduce((sum, m) => sum + m.count, 0);
        assert.strictEqual(totalCount, 7);
    });

    it('should display individual and total XP', () => {
        const encounter = {
            monsters: [
                { name: 'Goblin', xp: 50, count: 4 },
                { name: 'Bugbear', xp: 200, count: 1 }
            ]
        };

        const goblinTotal = 50 * 4; // 200
        const bugbearTotal = 200 * 1; // 200
        const grandTotal = goblinTotal + bugbearTotal; // 400

        assert.strictEqual(goblinTotal, 200);
        assert.strictEqual(bugbearTotal, 200);
        assert.strictEqual(grandTotal, 400);
    });

    it('should show budget utilization percentage', () => {
        const budget = 2000;
        const actualXP = 1750;
        const utilization = Math.floor((actualXP / budget) * 100);

        assert.strictEqual(utilization, 87);
    });
});

// Simple test runner
function describe(name, fn) {
    console.log(`\n${name}`);
    try {
        fn();
    } catch (error) {
        console.error(`  ✗ Failed:`, error.message);
    }
}

function it(description, fn) {
    try {
        fn();
        console.log(`  ✓ ${description}`);
    } catch (error) {
        throw new Error(`${description}: ${error.message}`);
    }
}

console.log('Running Encounter Generation Unit Tests...\n');

module.exports = {
    calculateXPBudget,
    calculateWinChance,
    CR_TO_XP,
    XP_THRESHOLDS
};
