# D&D 2024 Play Tools - Unit Tests

This directory contains comprehensive unit tests for the D&D 2024 Play Tools application, based on the Product Requirements Document (PRD).

## Test Files

### 1. `character.test.js` - Character Management Tests
Tests all character-related functionality including:

- **Character Creation**
  - All 12 D&D 2024 classes
  - All 11 D&D 2024 species
  - Level range validation (1-20)
  - Multiple characters per account

- **Ability Scores & Modifiers**
  - Ability modifier calculations
  - Valid score ranges (1-30)
  - Initiative from DEX modifier

- **Proficiency Bonus**
  - Level-based proficiency calculation
  - D&D 2024 progression (+2 to +6)

- **Saving Throws**
  - 2 proficient saves per class
  - Saving throw bonus calculations
  - Class-specific proficiencies

- **HP Calculation**
  - Class hit dice (d6, d8, d10, d12)
  - Level 1 maximum + CON modifier
  - Average HP progression formula

- **Spell System**
  - Spell Save DC (8 + prof + mod)
  - Spell Attack Bonus
  - Spellcasting ability selection

- **Concentration Checks**
  - DC calculation (max of 10 or damage/2)
  - Minimum DC of 10

- **Attack Bonuses**
  - Melee (Prof + STR)
  - Ranged (Prof + DEX)
  - Finesse (Prof + higher of STR/DEX)

- **Equipment & Inventory**
  - Armor with AC values
  - Weapons with damage dice
  - Currency tracking (5 types)
  - Inventory items with quantities

- **Counters & Resources**
  - Custom counters
  - Auto-generated counters:
    - Barbarian Rage
    - Monk Ki Points
    - Paladin Lay on Hands
    - Spell slots for casters

- **Traits & Features**
  - Custom traits
  - Trait types (class, species, feat, other)
  - Unarmored Defense calculations
  - Speed bonuses
  - Monk Unarmored Movement scaling

- **Feats System**
  - Origin Feats (9 total, no level req)
  - General Feats (31 total, 4th level req)

### 2. `encounter.test.js` - Encounter Generation Tests
Tests all encounter-related functionality including:

- **XP Budget Calculation**
  - Easy, Medium, Hard, Deadly difficulties
  - Party size scaling
  - Party level scaling
  - Difficulty multipliers

- **Win Chance Calculation**
  - 5 difficulty levels (95% to 5% win chance)
  - Default fallback for unknown difficulties

- **CR to XP Conversion**
  - CR 0 to CR 30
  - Fractional CRs (0.125, 0.25, 0.5)
  - High CR conversions (20+)

- **Monster Selection**
  - Monster creation with CR and XP
  - Multiple monsters of same type
  - Mixed monster groups
  - CR range selection for party level

- **Encounter Generation**
  - Valid encounter creation
  - Monster count preferences
  - XP budget adherence
  - Budget utilization percentage

- **Saved Encounters**
  - Name and folder organization
  - Multiple folders support
  - Generated vs custom encounters

- **Custom Encounter Builder**
  - Add monsters to custom encounter
  - Total XP calculation
  - Increment/decrement monster counts
  - Remove monsters
  - Clear all monsters

- **Monster Database**
  - Search by name
  - Filter by CR
  - Filter by type
  - All monster sizes (Tiny to Gargantuan)

- **Encounter Display**
  - Total monster count
  - Individual and total XP
  - Budget utilization percentage

### 3. `server.test.js` - Server API Tests
Tests all server-side functionality including:

- **Account Management API**
  - Create account (with/without password)
  - Reject duplicate accounts
  - Account name validation
  - Retrieve account by name
  - 404 for non-existent accounts
  - Password validation on login
  - Reject incorrect passwords
  - Delete accounts

- **Character Data Persistence**
  - Save character data
  - Update character data
  - Multiple characters per account
  - Save counters
  - Save feats
  - Save spells
  - Save equipment
  - Save inventory

- **Dice Configuration API**
  - Save dice configurations
  - Retrieve configurations
  - Delete configurations

- **Encounter Management API**
  - Save encounters with folders
  - Retrieve encounters
  - Filter by folder
  - Delete encounters
  - Create new folders

- **Monster API**
  - Retrieve monster by index
  - Retrieve monster by name (case-insensitive)
  - Return all monsters list
  - Group monsters by CR
  - Include monster metadata

- **Data Persistence & Auto-Save**
  - Persist to JSON file
  - Load from JSON file
  - Handle empty files gracefully
  - Validate account structure
  - Backward compatibility

- **API Error Handling**
  - 400 for missing fields
  - 404 for non-existent resources
  - 409 for duplicate creation
  - 500 for server errors

- **Admin Panel API**
  - Retrieve all accounts
  - Admin delete any account
  - Account overview with character count

## Running Tests

### Run All Tests
```bash
node tests/character.test.js
node tests/encounter.test.js
node tests/server.test.js
```

### Run Individual Test File
```bash
node tests/character.test.js
```

## Test Coverage

The tests cover all major features documented in the PRD:

### D&D 2024 Rules Implementation ✅
- All 12 classes with correct hit dice and saving throws
- All 11 species with subspecies
- Proficiency bonus progression
- Spell Save DC formula (2024)
- Concentration mechanics
- HP calculation (2024 rules)

### Character Management ✅
- Character creation and validation
- Ability scores and modifiers
- Saving throws and skills
- HP calculation and tracking
- Equipment and inventory
- Spell management
- Feats tracking
- Counters and resources
- Traits and features

### Encounter System ✅
- XP budget calculations
- CR-based monster selection
- Difficulty scaling
- Win chance calculations
- Saved encounters with folders
- Custom encounter builder
- Monster database queries

### Server & Persistence ✅
- Account creation and authentication
- Data persistence to JSON
- API endpoint validation
- Error handling
- Admin panel functionality
- Auto-save triggers

## Test Utilities

Each test file exports utility functions for reuse:

### `character.test.js` exports:
- `getModifier(score)` - Calculate ability modifier
- `getProficiencyBonus(level)` - Calculate proficiency bonus
- `calculateHP(className, level, conModifier)` - Calculate HP
- `calculateSpellSaveDC(profBonus, spellcastingMod)` - Calculate Spell Save DC
- `calculateConcentrationDC(damage)` - Calculate concentration DC

### `encounter.test.js` exports:
- `calculateXPBudget(partyLevel, partySize, difficulty)` - Calculate XP budget
- `calculateWinChance(difficulty)` - Get win chance percentage
- `CR_TO_XP` - CR to XP conversion table
- `XP_THRESHOLDS` - XP thresholds by level and difficulty

### `server.test.js` exports:
- `createMockAccount(name, hasPassword)` - Create mock account
- `mockServerResponse(status, data)` - Create mock server response

## Test Framework

These tests use Node.js's built-in `assert` module for simplicity and no external dependencies.

### Test Structure
```javascript
describe('Test Suite Name', () => {
    it('should do something specific', () => {
        const result = someFunction();
        assert.strictEqual(result, expectedValue);
    });
});
```

## Assertions Used

- `assert.strictEqual(actual, expected)` - Strict equality check
- `assert(condition)` - Truthy check
- `assert(condition, message)` - Truthy check with message
- `Array.isArray()` - Array type check
- `typeof` - Type checking

## Expected Output

When tests pass, you'll see:
```
Running Character Management Unit Tests...

Character Creation Tests
  ✓ should create a valid character with all required fields
  ✓ should support all 12 D&D 2024 classes
  ✓ should support all 11 D&D 2024 species
  ...

✓ All character creation tests passed
✓ All ability score and modifier tests passed
...
```

## Adding New Tests

To add new tests:

1. Create a new `describe()` block for your test suite
2. Add individual test cases with `it()`
3. Use `assert` to validate expected behavior
4. Export any reusable utilities

Example:
```javascript
describe('New Feature Tests', () => {
    it('should validate new feature behavior', () => {
        const result = newFeature();
        assert.strictEqual(result, expected);
    });
});
```

## Notes

- Tests are designed to validate D&D 2024 rules accuracy
- All calculations match official D&D 2024 formulas
- Server tests validate data persistence and API behavior
- Tests can be run without a running server (use mocks)
- No database required - tests use in-memory data structures

## Related Documentation

- [PRD.md](../PRD.md) - Product Requirements Document
- [README.md](../README.md) - Project README
- [server.js](../server.js) - Server implementation
- [public/app.js](../public/app.js) - Client-side implementation
