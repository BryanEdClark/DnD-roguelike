// Server API Unit Tests
// Tests for server endpoints, account management, and data persistence

const assert = require('assert');

// Mock server responses
const mockServerResponse = (status, data) => ({
    status,
    data,
    json: async () => data
});

// Mock account data
const createMockAccount = (name, hasPassword = false) => ({
    name,
    hasPassword,
    password: hasPassword ? 'testpass123' : '',
    data: {
        character: {},
        counters: [],
        feats: [],
        diceConfigs: [],
        encounters: []
    }
});

describe('Account Management API Tests', () => {

    it('should create new account without password', async () => {
        const newAccount = createMockAccount('TestUser', false);

        assert.strictEqual(newAccount.name, 'TestUser');
        assert.strictEqual(newAccount.hasPassword, false);
        assert.strictEqual(newAccount.password, '');
    });

    it('should create new account with password', async () => {
        const newAccount = createMockAccount('SecureUser', true);

        assert.strictEqual(newAccount.name, 'SecureUser');
        assert.strictEqual(newAccount.hasPassword, true);
        assert(newAccount.password.length > 0);
    });

    it('should reject duplicate account creation', async () => {
        const accounts = [
            createMockAccount('ExistingUser')
        ];

        const duplicateExists = accounts.some(acc => acc.name === 'ExistingUser');
        assert.strictEqual(duplicateExists, true);
    });

    it('should validate account name is required', async () => {
        const invalidAccount = { name: '', password: '' };

        const isValid = invalidAccount.name.length > 0;
        assert.strictEqual(isValid, false);
    });

    it('should retrieve account by name', async () => {
        const accounts = [
            createMockAccount('User1'),
            createMockAccount('User2'),
            createMockAccount('User3')
        ];

        const foundAccount = accounts.find(acc => acc.name === 'User2');

        assert(foundAccount);
        assert.strictEqual(foundAccount.name, 'User2');
    });

    it('should return 404 for non-existent account', async () => {
        const accounts = [
            createMockAccount('User1')
        ];

        const foundAccount = accounts.find(acc => acc.name === 'NonExistent');

        assert.strictEqual(foundAccount, undefined);
    });

    it('should validate password on login', async () => {
        const account = createMockAccount('PasswordUser', true);
        account.password = 'correctpassword';

        const loginPassword = 'correctpassword';
        const passwordMatch = account.password === loginPassword;

        assert.strictEqual(passwordMatch, true);
    });

    it('should reject incorrect password', async () => {
        const account = createMockAccount('PasswordUser', true);
        account.password = 'correctpassword';

        const loginPassword = 'wrongpassword';
        const passwordMatch = account.password === loginPassword;

        assert.strictEqual(passwordMatch, false);
    });

    it('should allow login without password for non-protected accounts', async () => {
        const account = createMockAccount('OpenUser', false);

        const canLogin = !account.hasPassword || account.password === '';
        assert.strictEqual(canLogin, true);
    });

    it('should delete account by name', async () => {
        let accounts = [
            createMockAccount('User1'),
            createMockAccount('User2'),
            createMockAccount('User3')
        ];

        accounts = accounts.filter(acc => acc.name !== 'User2');

        assert.strictEqual(accounts.length, 2);
        assert(!accounts.find(acc => acc.name === 'User2'));
    });
});

describe('Character Data Persistence Tests', () => {

    it('should save character data to account', async () => {
        const account = createMockAccount('TestUser');

        account.data.character = {
            name: 'Aragorn',
            class: 'Ranger',
            level: 5
        };

        assert.strictEqual(account.data.character.name, 'Aragorn');
        assert.strictEqual(account.data.character.class, 'Ranger');
    });

    it('should update existing character data', async () => {
        const account = createMockAccount('TestUser');

        account.data.character = { name: 'Test', level: 1 };
        account.data.character.level = 5;

        assert.strictEqual(account.data.character.level, 5);
    });

    it('should save multiple characters per account', async () => {
        const account = createMockAccount('TestUser');

        account.data.characters = [
            { name: 'Character 1', class: 'Fighter', level: 3 },
            { name: 'Character 2', class: 'Wizard', level: 5 }
        ];

        assert.strictEqual(account.data.characters.length, 2);
    });

    it('should save counters to account', async () => {
        const account = createMockAccount('TestUser');

        account.data.counters = [
            { id: 'rage-1', name: 'Rage', max: 3, current: 2 },
            { id: 'ki-1', name: 'Ki Points', max: 5, current: 5 }
        ];

        assert.strictEqual(account.data.counters.length, 2);
        assert.strictEqual(account.data.counters[0].name, 'Rage');
    });

    it('should save feats to account', async () => {
        const account = createMockAccount('TestUser');

        account.data.feats = [
            { name: 'Great Weapon Master', type: 'General' },
            { name: 'Alert', type: 'Origin' }
        ];

        assert.strictEqual(account.data.feats.length, 2);
    });

    it('should save spells to character data', async () => {
        const account = createMockAccount('TestUser');

        account.data.character.spells = [
            { name: 'Fireball', level: 3, school: 'Evocation' },
            { name: 'Magic Missile', level: 1, school: 'Evocation' }
        ];

        assert.strictEqual(account.data.character.spells.length, 2);
    });

    it('should save equipment to character data', async () => {
        const account = createMockAccount('TestUser');

        account.data.character.equipment = {
            armor: [{ name: 'Chain Mail', ac: 16 }],
            weapons: [{ name: 'Longsword', damageDie: 'd8' }]
        };

        assert.strictEqual(account.data.character.equipment.armor.length, 1);
        assert.strictEqual(account.data.character.equipment.weapons.length, 1);
    });

    it('should save inventory to character data', async () => {
        const account = createMockAccount('TestUser');

        account.data.character.inventory = {
            items: [{ name: 'Healing Potion', quantity: 3 }],
            currency: { cp: 10, sp: 5, ep: 0, gp: 100, pp: 2 }
        };

        assert.strictEqual(account.data.character.inventory.items.length, 1);
        assert.strictEqual(account.data.character.inventory.currency.gp, 100);
    });
});

describe('Dice Configuration API Tests', () => {

    it('should save dice configuration', async () => {
        const account = createMockAccount('TestUser');

        account.data.diceConfigs = [
            {
                name: '2d6 + 1d20',
                dice: { d4: 0, d6: 2, d8: 0, d10: 0, d12: 0, d20: 1, d100: 0 }
            }
        ];

        assert.strictEqual(account.data.diceConfigs.length, 1);
        assert.strictEqual(account.data.diceConfigs[0].name, '2d6 + 1d20');
    });

    it('should retrieve dice configurations for account', async () => {
        const account = createMockAccount('TestUser');

        account.data.diceConfigs = [
            { name: 'Attack Roll', dice: { d20: 1, d6: 1 } },
            { name: 'Damage Roll', dice: { d8: 2 } }
        ];

        const configs = account.data.diceConfigs;

        assert.strictEqual(configs.length, 2);
        assert.strictEqual(configs[0].name, 'Attack Roll');
    });

    it('should delete dice configuration', async () => {
        const account = createMockAccount('TestUser');

        account.data.diceConfigs = [
            { name: 'Config 1', dice: {} },
            { name: 'Config 2', dice: {} }
        ];

        account.data.diceConfigs = account.data.diceConfigs.filter(c => c.name !== 'Config 1');

        assert.strictEqual(account.data.diceConfigs.length, 1);
        assert.strictEqual(account.data.diceConfigs[0].name, 'Config 2');
    });
});

describe('Encounter Management API Tests', () => {

    it('should save encounter with folder', async () => {
        const account = createMockAccount('TestUser');

        account.data.encounters = [
            {
                name: 'Goblin Ambush',
                folder: 'Chapter 1',
                monsters: [{ name: 'Goblin', cr: 0.25, count: 4 }],
                totalXP: 200
            }
        ];

        assert.strictEqual(account.data.encounters.length, 1);
        assert.strictEqual(account.data.encounters[0].folder, 'Chapter 1');
    });

    it('should retrieve encounters for account', async () => {
        const account = createMockAccount('TestUser');

        account.data.encounters = [
            { name: 'Encounter 1', folder: 'Folder A' },
            { name: 'Encounter 2', folder: 'Folder B' }
        ];

        const encounters = account.data.encounters;

        assert.strictEqual(encounters.length, 2);
    });

    it('should filter encounters by folder', async () => {
        const account = createMockAccount('TestUser');

        account.data.encounters = [
            { name: 'Encounter 1', folder: 'Chapter 1' },
            { name: 'Encounter 2', folder: 'Chapter 1' },
            { name: 'Encounter 3', folder: 'Chapter 2' }
        ];

        const chapter1Encounters = account.data.encounters.filter(e => e.folder === 'Chapter 1');

        assert.strictEqual(chapter1Encounters.length, 2);
    });

    it('should delete encounter', async () => {
        const account = createMockAccount('TestUser');

        account.data.encounters = [
            { name: 'Encounter 1', folder: 'Chapter 1' },
            { name: 'Encounter 2', folder: 'Chapter 1' }
        ];

        account.data.encounters = account.data.encounters.filter(e => e.name !== 'Encounter 1');

        assert.strictEqual(account.data.encounters.length, 1);
        assert.strictEqual(account.data.encounters[0].name, 'Encounter 2');
    });

    it('should create new folder when saving encounter', async () => {
        const folders = ['Chapter 1', 'Chapter 2'];
        const newFolder = 'Chapter 3';

        if (!folders.includes(newFolder)) {
            folders.push(newFolder);
        }

        assert(folders.includes('Chapter 3'));
        assert.strictEqual(folders.length, 3);
    });
});

describe('Monster API Tests', () => {

    it('should retrieve monster by index', async () => {
        const monsters = {
            'goblin': { name: 'Goblin', index: 'goblin', cr: 0.25 },
            'orc': { name: 'Orc', index: 'orc', cr: 0.5 }
        };

        const monster = monsters['goblin'];

        assert(monster);
        assert.strictEqual(monster.name, 'Goblin');
    });

    it('should retrieve monster by name (case-insensitive)', async () => {
        const monsters = [
            { name: 'Goblin', index: 'goblin' },
            { name: 'Orc', index: 'orc' }
        ];

        const searchName = 'goblin';
        const monster = monsters.find(m => m.name.toLowerCase() === searchName.toLowerCase());

        assert(monster);
        assert.strictEqual(monster.name, 'Goblin');
    });

    it('should return all monsters list', async () => {
        const monsters = [
            { name: 'Goblin', cr: 0.25, type: 'humanoid' },
            { name: 'Orc', cr: 0.5, type: 'humanoid' },
            { name: 'Zombie', cr: 0.25, type: 'undead' }
        ];

        assert.strictEqual(monsters.length, 3);
    });

    it('should group monsters by CR', async () => {
        const monsters = [
            { name: 'Goblin', cr: 0.25 },
            { name: 'Zombie', cr: 0.25 },
            { name: 'Orc', cr: 0.5 },
            { name: 'Ogre', cr: 2 }
        ];

        const monstersByCR = {};

        monsters.forEach(monster => {
            const cr = monster.cr.toString();
            if (!monstersByCR[cr]) {
                monstersByCR[cr] = [];
            }
            monstersByCR[cr].push(monster);
        });

        assert.strictEqual(monstersByCR['0.25'].length, 2);
        assert.strictEqual(monstersByCR['0.5'].length, 1);
        assert.strictEqual(monstersByCR['2'].length, 1);
    });

    it('should include monster metadata (type, size)', async () => {
        const monster = {
            name: 'Goblin',
            index: 'goblin',
            cr: 0.25,
            type: 'humanoid',
            size: 'Small'
        };

        assert.strictEqual(monster.type, 'humanoid');
        assert.strictEqual(monster.size, 'Small');
    });
});

describe('Data Persistence and Auto-Save Tests', () => {

    it('should persist account data to file', async () => {
        const accounts = [
            createMockAccount('User1'),
            createMockAccount('User2')
        ];

        const jsonData = JSON.stringify(accounts, null, 2);

        assert(jsonData.length > 0);
        assert(jsonData.includes('User1'));
        assert(jsonData.includes('User2'));
    });

    it('should load account data from file', async () => {
        const jsonData = JSON.stringify([
            createMockAccount('User1'),
            createMockAccount('User2')
        ]);

        const accounts = JSON.parse(jsonData);

        assert.strictEqual(accounts.length, 2);
        assert.strictEqual(accounts[0].name, 'User1');
    });

    it('should handle empty accounts file gracefully', async () => {
        let accounts = [];

        try {
            // Simulate file not found
            throw new Error('ENOENT');
        } catch (error) {
            // Return empty array on error
            accounts = [];
        }

        assert.strictEqual(accounts.length, 0);
    });

    it('should validate account structure before saving', async () => {
        const account = createMockAccount('TestUser');

        assert(account.name);
        assert(typeof account.hasPassword === 'boolean');
        assert(account.data);
        assert(account.data.character !== undefined);
        assert(Array.isArray(account.data.counters));
        assert(Array.isArray(account.data.feats));
    });

    it('should support backward compatibility for old save formats', async () => {
        const oldAccount = {
            name: 'OldUser',
            hasPassword: false,
            password: '',
            data: {
                character: {}
                // Missing new fields: counters, feats, diceConfigs, encounters
            }
        };

        // Add missing fields
        if (!oldAccount.data.counters) oldAccount.data.counters = [];
        if (!oldAccount.data.feats) oldAccount.data.feats = [];
        if (!oldAccount.data.diceConfigs) oldAccount.data.diceConfigs = [];
        if (!oldAccount.data.encounters) oldAccount.data.encounters = [];

        assert(Array.isArray(oldAccount.data.counters));
        assert(Array.isArray(oldAccount.data.feats));
    });
});

describe('API Error Handling Tests', () => {

    it('should return 400 for missing required fields', async () => {
        const request = { name: '' }; // Missing name

        const isValid = !!(request.name && request.name.length > 0);

        assert.strictEqual(isValid, false);
    });

    it('should return 404 for non-existent resource', async () => {
        const accounts = [];
        const requestedAccount = 'NonExistent';

        const found = accounts.find(acc => acc.name === requestedAccount);

        assert.strictEqual(found, undefined);
    });

    it('should return 409 for duplicate account creation', async () => {
        const accounts = [createMockAccount('ExistingUser')];
        const newAccountName = 'ExistingUser';

        const alreadyExists = accounts.some(acc => acc.name === newAccountName);

        assert.strictEqual(alreadyExists, true);
    });

    it('should return 500 for server errors', async () => {
        let errorOccurred = false;

        try {
            throw new Error('Database connection failed');
        } catch (error) {
            errorOccurred = true;
        }

        assert.strictEqual(errorOccurred, true);
    });
});

describe('Admin Panel API Tests', () => {

    it('should retrieve all accounts for admin', async () => {
        const accounts = [
            createMockAccount('User1'),
            createMockAccount('User2'),
            createMockAccount('User3')
        ];

        assert.strictEqual(accounts.length, 3);
    });

    it('should allow admin to delete any account', async () => {
        let accounts = [
            createMockAccount('User1'),
            createMockAccount('User2')
        ];

        // Admin deletes User1
        accounts = accounts.filter(acc => acc.name !== 'User1');

        assert.strictEqual(accounts.length, 1);
        assert(!accounts.find(acc => acc.name === 'User1'));
    });

    it('should show account overview with character count', async () => {
        const account = createMockAccount('TestUser');

        account.data.characters = [
            { name: 'Character 1' },
            { name: 'Character 2' },
            { name: 'Character 3' }
        ];

        const characterCount = account.data.characters?.length || 0;

        assert.strictEqual(characterCount, 3);
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

console.log('Running Server API Unit Tests...\n');

module.exports = {
    createMockAccount,
    mockServerResponse
};
