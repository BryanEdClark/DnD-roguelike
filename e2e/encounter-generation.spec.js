// E2E Tests for Encounter Generation
// Tests DM tools including encounter builder and monster browser

const { test, expect } = require('@playwright/test');

test.describe('Encounter Generation', () => {

  test.beforeEach(async ({ page }) => {
    // Create account and login
    await page.goto('/');
    const accountName = `DMTest_${Date.now()}`;
    await page.click('text=Sign Up');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal button:has-text("Create Account")');
    await page.waitForSelector('.container', { state: 'visible' });

    // Navigate to DM Tools
    await page.click('text=DM Tools');
    await page.waitForSelector('#dmTools', { state: 'visible' });
  });

  test('should display encounter generator interface', async ({ page }) => {
    await expect(page.locator('h2:has-text("Generate Encounter")')).toBeVisible();
    await expect(page.locator('#partyLevel')).toBeVisible();
    await expect(page.locator('#partySize')).toBeVisible();
    await expect(page.locator('#difficultySlider')).toBeVisible();
  });

  test('should generate encounter with party settings', async ({ page }) => {
    // Set party details
    await page.selectOption('#partyLevel', '5');
    await page.selectOption('#partySize', '4');

    // Set difficulty (Medium = index 1)
    await page.locator('#difficultySlider').evaluate(el => el.value = 1);
    await page.waitForTimeout(300);

    // Set monster count to auto
    await page.selectOption('#monsterCountPreference', 'auto');

    // Generate encounter
    await page.click('button:has-text("Generate Encounter")');
    await page.waitForTimeout(1000);

    // Should display encounter results
    await expect(page.locator('.encounter-results')).toBeVisible();
    await expect(page.locator('.difficulty-badge')).toBeVisible();
    await expect(page.locator('.win-chance')).toBeVisible();
  });

  test('should show correct difficulty levels', async ({ page }) => {
    await page.selectOption('#partyLevel', '5');
    await page.selectOption('#partySize', '4');

    // Test each difficulty level
    const difficulties = [
      { index: 0, name: 'Easy', chance: '95%' },
      { index: 1, name: 'Medium', chance: '75%' },
      { index: 2, name: 'Hard', chance: '50%' },
      { index: 3, name: 'Very Hard', chance: '25%' },
      { index: 4, name: 'You Gonna Die', chance: '5%' }
    ];

    for (const diff of difficulties) {
      await page.locator('#difficultySlider').evaluate((el, val) => el.value = val, diff.index);
      await page.waitForTimeout(200);

      const diffText = await page.textContent('.difficulty-display');
      expect(diffText).toContain(diff.name);
    }
  });

  test('should calculate and display XP budget', async ({ page }) => {
    await page.selectOption('#partyLevel', '5');
    await page.selectOption('#partySize', '4');
    await page.locator('#difficultySlider').evaluate(el => el.value = 1); // Medium
    await page.waitForTimeout(300);

    await page.click('button:has-text("Generate Encounter")');
    await page.waitForTimeout(1000);

    // Should show XP budget
    await expect(page.locator('.xp-budget')).toBeVisible();

    // Budget for level 5, party of 4, medium = 500 × 4 = 2000
    const budgetText = await page.textContent('.xp-budget');
    expect(budgetText).toContain('2000');
  });

  test('should display monster details in encounter', async ({ page }) => {
    await page.selectOption('#partyLevel', '3');
    await page.selectOption('#partySize', '4');
    await page.click('button:has-text("Generate Encounter")');
    await page.waitForTimeout(1000);

    // Should show monster cards
    const monsterCards = await page.$$('.monster-card');
    expect(monsterCards.length).toBeGreaterThan(0);

    // Each card should have name, CR, and XP
    await expect(page.locator('.monster-card .monster-name').first()).toBeVisible();
    await expect(page.locator('.monster-card .monster-cr').first()).toBeVisible();
    await expect(page.locator('.monster-card .monster-xp').first()).toBeVisible();
  });

  test('should respect specific monster count preference', async ({ page }) => {
    await page.selectOption('#partyLevel', '5');
    await page.selectOption('#partySize', '4');

    // Set specific monster count
    await page.selectOption('#monsterCountPreference', '3');
    await page.click('button:has-text("Generate Encounter")');
    await page.waitForTimeout(1000);

    // Count monster types in encounter
    const monsterCards = await page.$$('.monster-card');
    expect(monsterCards.length).toBeLessThanOrEqual(3);
  });

  test('should click monster to view full stat block', async ({ page }) => {
    await page.selectOption('#partyLevel', '5');
    await page.selectOption('#partySize', '4');
    await page.click('button:has-text("Generate Encounter")');
    await page.waitForTimeout(1000);

    // Click first monster
    await page.click('.monster-card .monster-name');
    await page.waitForTimeout(500);

    // Should show stat block with details
    await expect(page.locator('.monster-stats')).toBeVisible();
    await expect(page.locator('.monster-stats .ac-value')).toBeVisible();
    await expect(page.locator('.monster-stats .hp-value')).toBeVisible();
  });

  test('should save generated encounter', async ({ page }) => {
    await page.selectOption('#partyLevel', '5');
    await page.selectOption('#partySize', '4');
    await page.click('button:has-text("Generate Encounter")');
    await page.waitForTimeout(1000);

    // Click save button
    await page.click('button:has-text("Save Encounter")');

    // Fill save modal
    await page.fill('#encounterName', 'Test Encounter');
    await page.selectOption('#encounterFolder', { index: 0 }); // Select default folder
    await page.click('#saveEncounterModal button:has-text("Save")');

    await page.waitForTimeout(500);

    // Should show success indication
    // Can be checked by verifying modal closed
    await expect(page.locator('#saveEncounterModal')).not.toBeVisible();
  });

  test('should load saved encounter', async ({ page }) => {
    // First save an encounter
    await page.selectOption('#partyLevel', '5');
    await page.selectOption('#partySize', '4');
    await page.click('button:has-text("Generate Encounter")');
    await page.waitForTimeout(1000);

    const encounterName = `Saved_${Date.now()}`;
    await page.click('button:has-text("Save Encounter")');
    await page.fill('#encounterName', encounterName);
    await page.click('#saveEncounterModal button:has-text("Save")');
    await page.waitForTimeout(500);

    // Now load it
    await page.click('button:has-text("Load Encounter")');
    await page.waitForTimeout(500);

    // Select the saved encounter
    await page.selectOption('#loadEncounterSelect', encounterName);
    await page.click('#loadEncounterModal button:has-text("Load")');
    await page.waitForTimeout(500);

    // Should display the encounter
    await expect(page.locator('.encounter-results')).toBeVisible();
  });

  test('should delete saved encounter', async ({ page }) => {
    // Save an encounter first
    await page.selectOption('#partyLevel', '5');
    await page.click('button:has-text("Generate Encounter")');
    await page.waitForTimeout(1000);

    const encounterName = `ToDelete_${Date.now()}`;
    await page.click('button:has-text("Save Encounter")');
    await page.fill('#encounterName', encounterName);
    await page.click('#saveEncounterModal button:has-text("Save")');
    await page.waitForTimeout(500);

    // Open load modal and delete
    await page.click('button:has-text("Load Encounter")');
    await page.waitForTimeout(500);

    await page.selectOption('#loadEncounterSelect', encounterName);
    await page.click('button:has-text("Delete Encounter")');

    // Confirm deletion
    await page.click('#deleteEncounterModal button:has-text("Delete")');
    await page.waitForTimeout(500);

    // Encounter should be removed from dropdown
    const options = await page.$$eval('#loadEncounterSelect option', opts =>
      opts.map(o => o.textContent)
    );
    expect(options).not.toContain(encounterName);
  });
});

test.describe('Monster Browser', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const accountName = `MonsterTest_${Date.now()}`;
    await page.click('text=Sign Up');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal button:has-text("Create Account")');
    await page.waitForSelector('.container', { state: 'visible' });
    await page.click('text=DM Tools');

    // Switch to Monster Browser tab
    await page.click('text=Monster Browser');
    await page.waitForTimeout(500);
  });

  test('should display monster list', async ({ page }) => {
    await expect(page.locator('.monster-list')).toBeVisible();

    // Should have monster cards
    const monsterCards = await page.$$('.monster-list-item');
    expect(monsterCards.length).toBeGreaterThan(0);
  });

  test('should search monsters by name', async ({ page }) => {
    await page.fill('#monsterSearch', 'goblin');
    await page.waitForTimeout(500);

    // Should filter to show only goblins
    const visibleMonsters = await page.$$('.monster-list-item:visible');
    expect(visibleMonsters.length).toBeGreaterThan(0);

    // First result should contain 'goblin'
    const firstMonsterName = await page.textContent('.monster-list-item:visible .monster-name');
    expect(firstMonsterName.toLowerCase()).toContain('goblin');
  });

  test('should filter monsters by CR', async ({ page }) => {
    await page.selectOption('#crFilter', '1');
    await page.waitForTimeout(500);

    // Should show only CR 1 monsters
    const crLabels = await page.$$eval('.monster-list-item:visible .monster-cr', els =>
      els.map(el => el.textContent)
    );

    crLabels.forEach(cr => {
      expect(cr).toContain('CR 1');
    });
  });

  test('should view monster stat block', async ({ page }) => {
    // Click first monster
    await page.click('.monster-list-item:first-child');
    await page.waitForTimeout(500);

    // Should show detailed stat block
    await expect(page.locator('.monster-stat-block')).toBeVisible();
    await expect(page.locator('.monster-stat-block .ability-scores')).toBeVisible();
    await expect(page.locator('.monster-stat-block .actions')).toBeVisible();
  });

  test('should add monster to custom encounter builder', async ({ page }) => {
    // Switch to encounter builder panel
    await page.click('text=Custom Encounter Builder');
    await page.waitForTimeout(500);

    // Go back to monster browser
    await page.click('text=Monster Browser');
    await page.waitForTimeout(300);

    // Click first monster
    await page.click('.monster-list-item:first-child');
    await page.waitForTimeout(300);

    // Click add to encounter
    await page.click('button:has-text("Add to Encounter")');
    await page.waitForTimeout(500);

    // Switch to encounter builder
    await page.click('text=Custom Encounter Builder');
    await page.waitForTimeout(300);

    // Should show monster in builder
    await expect(page.locator('.builder-monster-item')).toBeVisible();
  });
});

test.describe('Custom Encounter Builder', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const accountName = `BuilderTest_${Date.now()}`;
    await page.click('text=Sign Up');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal button:has-text("Create Account")');
    await page.waitForSelector('.container', { state: 'visible' });
    await page.click('text=DM Tools');
    await page.click('text=Custom Encounter Builder');
    await page.waitForTimeout(500);
  });

  test('should display empty builder initially', async ({ page }) => {
    await expect(page.locator('.builder-monster-list')).toBeVisible();
    await expect(page.locator('.no-monsters-selected')).toBeVisible();
  });

  test('should show total XP calculation', async ({ page }) => {
    await expect(page.locator('#builderTotalXP')).toBeVisible();

    // Initially should be 0
    const initialXP = await page.textContent('#builderTotalXP');
    expect(initialXP).toBe('0');
  });

  test('should increment/decrement monster count', async ({ page }) => {
    // Add a monster first (via monster browser)
    await page.click('text=Monster Browser');
    await page.click('.monster-list-item:first-child');
    await page.click('button:has-text("Add to Encounter")');
    await page.click('text=Custom Encounter Builder');
    await page.waitForTimeout(500);

    // Get initial count
    const initialCount = await page.textContent('.builder-count');

    // Increment
    await page.click('.builder-control-btn:has-text("+")');
    await page.waitForTimeout(200);

    const newCount = await page.textContent('.builder-count');
    expect(parseInt(newCount)).toBe(parseInt(initialCount) + 1);

    // Decrement
    await page.click('.builder-control-btn:has-text("−")');
    await page.waitForTimeout(200);

    const finalCount = await page.textContent('.builder-count');
    expect(finalCount).toBe(initialCount);
  });

  test('should remove monster from builder', async ({ page }) => {
    // Add a monster
    await page.click('text=Monster Browser');
    await page.click('.monster-list-item:first-child');
    await page.click('button:has-text("Add to Encounter")');
    await page.click('text=Custom Encounter Builder');
    await page.waitForTimeout(500);

    // Remove it
    await page.click('.builder-remove-btn');
    await page.waitForTimeout(300);

    // Should show empty state
    await expect(page.locator('.no-monsters-selected')).toBeVisible();
  });

  test('should clear all monsters', async ({ page }) => {
    // Add multiple monsters
    await page.click('text=Monster Browser');
    await page.click('.monster-list-item:nth-child(1)');
    await page.click('button:has-text("Add to Encounter")');
    await page.click('.monster-list-item:nth-child(2)');
    await page.click('button:has-text("Add to Encounter")');
    await page.click('text=Custom Encounter Builder');
    await page.waitForTimeout(500);

    // Clear all
    await page.click('button:has-text("Clear All")');
    await page.waitForTimeout(300);

    // Should be empty
    await expect(page.locator('.no-monsters-selected')).toBeVisible();
  });

  test('should save custom encounter', async ({ page }) => {
    // Add a monster
    await page.click('text=Monster Browser');
    await page.click('.monster-list-item:first-child');
    await page.click('button:has-text("Add to Encounter")');
    await page.click('text=Custom Encounter Builder');
    await page.waitForTimeout(500);

    // Save encounter
    await page.click('button:has-text("Save Custom Encounter")');

    const encounterName = `Custom_${Date.now()}`;
    await page.fill('#encounterName', encounterName);
    await page.click('#saveEncounterModal button:has-text("Save")');
    await page.waitForTimeout(500);

    // Should close modal
    await expect(page.locator('#saveEncounterModal')).not.toBeVisible();
  });
});
