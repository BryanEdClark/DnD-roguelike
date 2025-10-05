# E2E Tests - D&D 2024 Play Tools

Comprehensive end-to-end tests using Playwright to validate the entire application workflow based on the Product Requirements Document (PRD).

## Test Coverage

### 1. Account Management (`account-management.spec.js`)
**17 tests covering:**
- Login screen display
- Account creation (with/without password)
- Login functionality
- Password validation
- Account not found handling
- Duplicate account prevention
- Logout functionality
- Admin panel access
- Account list display in admin
- Account deletion from admin
- Admin refresh functionality

### 2. Character Management (`character-management.spec.js`)
**23 tests covering:**
- Character creation
- Class and subclass selection
- Species and subspecies selection
- Ability score modifier calculation
- Proficiency bonus calculation (levels 1-20)
- HP auto-calculation by class
- Initiative calculation
- Auto-populate class traits
- Auto-populate species traits
- Unarmored Defense application
- Attack bonus calculations (melee, ranged, finesse)
- Character data persistence
- Multiple character support
- Character deletion
- Saving throw calculations
- Skill proficiency and bonuses

### 3. Encounter Generation (`encounter-generation.spec.js`)
**27 tests covering:**
- Encounter generator interface
- Party settings configuration
- Difficulty level selection (5 levels)
- XP budget calculation
- Monster detail display
- Specific monster count preferences
- Monster stat block viewing
- Encounter saving with folders
- Encounter loading
- Encounter deletion
- Monster browser display
- Monster search by name
- Monster filtering by CR
- Stat block viewing
- Add monster to encounter builder
- Custom encounter builder
- Monster count adjustment
- Monster removal
- Clear all monsters
- Custom encounter saving

### 4. Spells and Features (`spells-and-features.spec.js`)
**34 tests covering:**

**Spell System:**
- Spell Save DC calculation
- Spell Attack Bonus calculation
- Spell selector modal
- Spell search functionality
- Spell filtering by level
- Adding/removing spells
- Concentration checks
- Concentration DC calculation

**Feats:**
- Feat selector modal
- Origin feats display
- General feats display
- Adding/removing feats

**Counters:**
- Manual counter creation
- Counter increment/decrement
- Auto-populate counters (Barbarian, Monk)
- Ki Points calculation
- Reset all counters
- Counter deletion

**Equipment & Inventory:**
- Adding armor with AC
- Adding weapons with damage dice
- Deleting equipment
- Currency tracking (5 types)
- Inventory item management
- Item quantity adjustment
- Item deletion

### 5. Dice Roller (`dice-roller.spec.js`)
**18 tests covering:**
- All dice types display (d4, d6, d8, d10, d12, d20, d%)
- Setting dice quantities
- Rolling dice with results
- Individual die results display
- Total calculation (single/multiple dice types)
- Clearing dice counts
- Saving dice configurations
- Loading saved configurations
- Auto-generated configuration names
- Deleting configurations
- Die range validation
- d100 (percentile) handling
- Roll history
- Configuration persistence
- Multiple rolls with same configuration

## Running E2E Tests

### Prerequisites
- Node.js installed
- Server running on port 3000 (auto-started by Playwright)
- Playwright browsers installed

### Install Playwright Browsers
```bash
npx playwright install
```

### Run All E2E Tests
```bash
npm run test:e2e
```

### Run Specific Test Suite
```bash
# Account management tests only
npx playwright test account-management

# Character management tests only
npx playwright test character-management

# Encounter generation tests only
npx playwright test encounter-generation

# Spells and features tests only
npx playwright test spells-and-features

# Dice roller tests only
npx playwright test dice-roller
```

### Run in UI Mode (Interactive)
```bash
npx playwright test --ui
```

### Run in Debug Mode
```bash
npx playwright test --debug
```

### Run in Headed Mode (See Browser)
```bash
npx playwright test --headed
```

### Run Specific Test
```bash
npx playwright test -g "should create new account without password"
```

## Test Organization

Each test file follows this structure:

```javascript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Login, navigate to page, etc.
  });

  test('should do something specific', async ({ page }) => {
    // Test implementation
    await page.click('...');
    await expect(page.locator('...')).toBeVisible();
  });
});
```

## Key Patterns Used

### Account Creation & Login
```javascript
const accountName = `TestUser_${Date.now()}`;
await page.click('text=Sign Up');
await page.fill('#signupAccountName', accountName);
await page.click('#signupModal button:has-text("Create Account")');
await page.waitForSelector('.container', { state: 'visible' });
```

### Navigation
```javascript
await page.click('text=Player Tools');
await page.click('text=Spells');
await page.waitForTimeout(500);
```

### Form Interactions
```javascript
await page.fill('#charName', 'Aragorn');
await page.selectOption('#charClass', 'Ranger');
await page.check('#strSaveProf');
```

### Assertions
```javascript
await expect(page.locator('.current-user')).toContainText(accountName);
await expect(page.locator('#spellSaveDC')).toBeVisible();
const value = await page.textContent('#profBonus');
expect(value).toBe('3');
```

## Test Data Strategy

### Unique Identifiers
All test accounts use timestamps to ensure uniqueness:
```javascript
const accountName = `TestUser_${Date.now()}`;
```

### Cleanup
Tests are isolated - each creates its own account. No shared state between tests.

### Timeouts
Strategic waits ensure:
- Auto-save completes: `await page.waitForTimeout(1000);`
- UI updates render: `await page.waitForTimeout(500);`
- Modals open/close: `await page.waitForTimeout(300);`

## Configuration

See `playwright.config.js` for:
- Browser settings (currently Chromium)
- Timeout configurations (60s per test)
- Screenshot/video on failure
- HTML report generation
- Auto-start server

## Debugging Failed Tests

### View HTML Report
```bash
npx playwright show-report
```

### Screenshots and Videos
Failed tests automatically capture:
- Screenshots: `test-results/[test-name]/test-failed-1.png`
- Videos: `test-results/[test-name]/video.webm`

### Trace Viewer
```bash
npx playwright show-trace trace.zip
```

## CI/CD Integration

Tests are CI-ready:
- Retry on failure (2 retries on CI)
- Headless by default
- HTML report generation
- Screenshot/video artifacts

### GitHub Actions Example
```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Test Scenarios Validated

### Critical User Flows
1. ✅ Complete character creation workflow
2. ✅ Auto-calculation of all stats (HP, AC, saves, skills)
3. ✅ Spell Save DC and Attack Bonus calculations
4. ✅ Encounter generation with XP budgets
5. ✅ Saving and loading encounters
6. ✅ Counter auto-population for classes
7. ✅ Dice rolling with saved configurations
8. ✅ Data persistence across page reloads
9. ✅ Admin account management
10. ✅ Password protection validation

### D&D 2024 Rules Validation
- ✅ Proficiency bonus progression (levels 1-20)
- ✅ HP calculation by class hit die
- ✅ Ability modifier formula: `floor((score - 10) / 2)`
- ✅ Spell Save DC: `8 + proficiency + casting modifier`
- ✅ Concentration DC: `max(10, damage / 2)`
- ✅ Attack bonuses: `proficiency + ability modifier`
- ✅ Unarmored Defense formulas
- ✅ XP budget calculations
- ✅ CR to XP conversions

## Coverage Summary

| Category | Tests | Coverage |
|----------|-------|----------|
| Account Management | 17 | Login, signup, admin, password validation |
| Character Creation | 23 | Classes, species, stats, auto-calc |
| Encounters | 27 | Generation, saving, monster browser |
| Spells & Features | 34 | Spells, feats, counters, equipment |
| Dice Roller | 18 | All dice types, configs, rolling |
| **Total** | **119** | **Full application workflow** |

## Known Limitations

1. **Timing Sensitivity**: Some tests use fixed timeouts. Slower machines may need adjustments.
2. **Browser Support**: Currently only tests Chromium. Firefox/Safari available but commented out.
3. **Test Isolation**: Each test creates a new account. No cleanup (accounts persist in `accounts.json`).
4. **Monster Data**: Assumes monster cache exists. First run may take longer.

## Best Practices

1. **Use Data Attributes**: Target elements by data-* attributes for stability
2. **Avoid Hardcoded Waits**: Prefer `waitForSelector` over `waitForTimeout`
3. **Unique Test Data**: Always use timestamps for unique identifiers
4. **Descriptive Names**: Test names clearly state expected behavior
5. **Arrange-Act-Assert**: Follow AAA pattern in all tests

## Troubleshooting

### Tests Timeout
- Increase timeout in `playwright.config.js`
- Check server is running on port 3000
- Verify monster cache is loaded

### Element Not Found
- Check selector accuracy
- Wait for element to be visible: `await page.waitForSelector(...)`
- Use Playwright Inspector: `npx playwright test --debug`

### Flaky Tests
- Add appropriate waits after actions
- Check for race conditions in auto-save
- Use `--repeat-each=10` to identify flaky tests

## Contributing

When adding new tests:

1. Create test in appropriate spec file
2. Use `test.describe` for logical grouping
3. Add `beforeEach` setup for common actions
4. Use unique test data (timestamps)
5. Add assertions for expected behavior
6. Update this README with new coverage

## Related Documentation

- [PRD.md](../PRD.md) - Product Requirements
- [playwright.config.js](../playwright.config.js) - Playwright configuration
- [tests/README.md](../tests/README.md) - Unit tests documentation
