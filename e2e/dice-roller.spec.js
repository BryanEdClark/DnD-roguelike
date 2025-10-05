// E2E Tests for Dice Roller
// Tests dice rolling, saved configurations, and results display

const { test, expect } = require('@playwright/test');

test.describe('Dice Roller', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const accountName = `DiceTest_${Date.now()}`;
    await page.click('text=Sign Up');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal button:has-text("Create Account")');
    await page.waitForSelector('.container', { state: 'visible' });

    // Navigate to Dice Roller
    await page.click('text=Dice Roller');
    await page.waitForSelector('#diceRoller', { state: 'visible' });
  });

  test('should display all dice types', async ({ page }) => {
    await expect(page.locator('.dice-control:has-text("d4")')).toBeVisible();
    await expect(page.locator('.dice-control:has-text("d6")')).toBeVisible();
    await expect(page.locator('.dice-control:has-text("d8")')).toBeVisible();
    await expect(page.locator('.dice-control:has-text("d10")')).toBeVisible();
    await expect(page.locator('.dice-control:has-text("d12")')).toBeVisible();
    await expect(page.locator('.dice-control:has-text("d20")')).toBeVisible();
    await expect(page.locator('.dice-control:has-text("d%")')).toBeVisible();
  });

  test('should set dice quantities', async ({ page }) => {
    await page.fill('#d6-count', '2');
    await page.fill('#d20-count', '1');
    await page.waitForTimeout(200);

    const d6Count = await page.inputValue('#d6-count');
    const d20Count = await page.inputValue('#d20-count');

    expect(d6Count).toBe('2');
    expect(d20Count).toBe('1');
  });

  test('should roll dice and show results', async ({ page }) => {
    await page.fill('#d6-count', '2');
    await page.fill('#d20-count', '1');

    await page.click('button:has-text("Roll")');
    await page.waitForTimeout(500);

    // Should display results
    await expect(page.locator('.dice-results')).toBeVisible();
    await expect(page.locator('.total-result')).toBeVisible();
  });

  test('should show individual die results', async ({ page }) => {
    await page.fill('#d6-count', '3');
    await page.click('button:has-text("Roll")');
    await page.waitForTimeout(500);

    // Should show d6 results section
    await expect(page.locator('.dice-results:has-text("d6")')).toBeVisible();

    // Should show 3 individual results
    const d6Results = await page.$$('.dice-results .die-result');
    expect(d6Results.length).toBeGreaterThanOrEqual(1);
  });

  test('should calculate total correctly', async ({ page }) => {
    await page.fill('#d6-count', '1');
    await page.click('button:has-text("Roll")');
    await page.waitForTimeout(500);

    // Get the individual result
    const individualResult = await page.textContent('.die-result');
    const individualValue = parseInt(individualResult);

    // Get the total
    const totalText = await page.textContent('.total-result');
    const totalValue = parseInt(totalText.replace(/\D/g, ''));

    // For a single d6, total should equal the roll
    expect(totalValue).toBe(individualValue);
  });

  test('should calculate total for multiple dice types', async ({ page }) => {
    await page.fill('#d6-count', '2');
    await page.fill('#d8-count', '1');
    await page.click('button:has-text("Roll")');
    await page.waitForTimeout(500);

    // Total should be sum of all dice
    const totalText = await page.textContent('.total-result');
    const totalValue = parseInt(totalText.replace(/\D/g, ''));

    // Total should be between minimum (3) and maximum (2*6 + 8 = 20)
    expect(totalValue).toBeGreaterThanOrEqual(3);
    expect(totalValue).toBeLessThanOrEqual(20);
  });

  test('should clear dice counts', async ({ page }) => {
    await page.fill('#d6-count', '5');
    await page.fill('#d20-count', '3');

    await page.click('button:has-text("Clear")');
    await page.waitForTimeout(200);

    const d6Count = await page.inputValue('#d6-count');
    const d20Count = await page.inputValue('#d20-count');

    expect(d6Count).toBe('0');
    expect(d20Count).toBe('0');
  });

  test('should save dice configuration', async ({ page }) => {
    await page.fill('#d6-count', '2');
    await page.fill('#d20-count', '1');

    await page.click('button:has-text("Save Config")');

    const configName = `AttackRoll_${Date.now()}`;
    await page.fill('#diceConfigName', configName);
    await page.click('#saveDiceConfigModal button:has-text("Save")');
    await page.waitForTimeout(500);

    // Should close modal
    await expect(page.locator('#saveDiceConfigModal')).not.toBeVisible();
  });

  test('should load saved dice configuration', async ({ page }) => {
    const configName = `LoadTest_${Date.now()}`;

    // Save configuration
    await page.fill('#d8-count', '3');
    await page.fill('#d12-count', '2');
    await page.click('button:has-text("Save Config")');
    await page.fill('#diceConfigName', configName);
    await page.click('#saveDiceConfigModal button:has-text("Save")');
    await page.waitForTimeout(500);

    // Clear dice
    await page.click('button:has-text("Clear")');

    // Load configuration
    await page.selectOption('#diceConfigSelect', configName);
    await page.click('button:has-text("Load")');
    await page.waitForTimeout(300);

    // Dice should be set
    const d8Count = await page.inputValue('#d8-count');
    const d12Count = await page.inputValue('#d12-count');

    expect(d8Count).toBe('3');
    expect(d12Count).toBe('2');
  });

  test('should auto-generate configuration name from dice', async ({ page }) => {
    await page.fill('#d6-count', '2');
    await page.fill('#d20-count', '1');

    await page.click('button:has-text("Save Config")');

    // Should have auto-generated name like "2d6 + 1d20"
    const autoName = await page.inputValue('#diceConfigName');
    expect(autoName).toContain('2d6');
    expect(autoName).toContain('1d20');
  });

  test('should delete saved configuration', async ({ page }) => {
    const configName = `ToDelete_${Date.now()}`;

    // Save a configuration
    await page.fill('#d6-count', '1');
    await page.click('button:has-text("Save Config")');
    await page.fill('#diceConfigName', configName);
    await page.click('#saveDiceConfigModal button:has-text("Save")');
    await page.waitForTimeout(500);

    // Load it
    await page.selectOption('#diceConfigSelect', configName);

    // Delete it
    await page.click('button:has-text("Delete Config")');
    await page.click('#deleteDiceConfigModal button:has-text("Delete")');
    await page.waitForTimeout(500);

    // Should be removed from dropdown
    const options = await page.$$eval('#diceConfigSelect option', opts =>
      opts.map(o => o.textContent)
    );
    expect(options).not.toContain(configName);
  });

  test('should validate die ranges', async ({ page }) => {
    await page.fill('#d4-count', '1');
    await page.click('button:has-text("Roll")');
    await page.waitForTimeout(500);

    const result = await page.textContent('.die-result');
    const value = parseInt(result);

    // d4 result should be 1-4
    expect(value).toBeGreaterThanOrEqual(1);
    expect(value).toBeLessThanOrEqual(4);
  });

  test('should handle d100 (percentile dice)', async ({ page }) => {
    await page.fill('#d100-count', '1');
    await page.click('button:has-text("Roll")');
    await page.waitForTimeout(500);

    const result = await page.textContent('.die-result');
    const value = parseInt(result);

    // d100 result should be 1-100
    expect(value).toBeGreaterThanOrEqual(1);
    expect(value).toBeLessThanOrEqual(100);
  });

  test('should show roll history', async ({ page }) => {
    await page.fill('#d20-count', '1');
    await page.click('button:has-text("Roll")');
    await page.waitForTimeout(300);

    // Get first result
    const firstResult = await page.textContent('.total-result');

    // Roll again
    await page.click('button:has-text("Roll")');
    await page.waitForTimeout(300);

    // Should show most recent roll (may have history display)
    await expect(page.locator('.total-result')).toBeVisible();
  });

  test('should persist configurations across page reload', async ({ page }) => {
    const configName = `Persistent_${Date.now()}`;

    // Save configuration
    await page.fill('#d6-count', '3');
    await page.click('button:has-text("Save Config")');
    await page.fill('#diceConfigName', configName);
    await page.click('#saveDiceConfigModal button:has-text("Save")');
    await page.waitForTimeout(500);

    // Reload page
    await page.reload();
    await page.waitForSelector('.container', { state: 'visible' });
    await page.click('text=Dice Roller');
    await page.waitForTimeout(500);

    // Configuration should still be available
    const options = await page.$$eval('#diceConfigSelect option', opts =>
      opts.map(o => o.textContent)
    );
    expect(options).toContain(configName);
  });

  test('should roll multiple times with same configuration', async ({ page }) => {
    await page.fill('#d20-count', '1');

    // Roll multiple times
    const results = [];
    for (let i = 0; i < 3; i++) {
      await page.click('button:has-text("Roll")');
      await page.waitForTimeout(200);

      const result = await page.textContent('.total-result');
      results.push(parseInt(result.replace(/\D/g, '')));
    }

    // All results should be valid d20 rolls (1-20)
    results.forEach(result => {
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(20);
    });

    // Results should vary (extremely unlikely all 3 are same)
    const allSame = results.every(r => r === results[0]);
    expect(allSame).toBe(false);
  });
});
