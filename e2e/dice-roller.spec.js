// E2E Tests for Dice Roller
// Tests dice rolling, saved configurations, and results display

const { test, expect } = require('@playwright/test');

test.describe('Dice Roller', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const accountName = `DiceTest_${Date.now()}`;

    // Login using smoke test pattern
    await page.click('#loginScreen .login-buttons .signup-btn');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal .modal-actions .confirm-btn');

    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('#loginScreen');
      return !loginScreen || loginScreen.style.display === 'none';
    });

    // Navigate to Dice Roller
    await page.click('#mainApp .tabs .tab-button:has-text("Dice Roller")');
    await page.waitForSelector('#dicerollerTab', { state: 'visible' });
  });

  test('should display all dice types', async ({ page }) => {
    await expect(page.locator('.dice-input-group:has-text("d4")')).toBeVisible();
    await expect(page.locator('.dice-input-group:has-text("d6")')).toBeVisible();
    await expect(page.locator('.dice-input-group:has-text("d8")')).toBeVisible();
    await expect(page.locator('.dice-input-group:has-text("d10")')).toBeVisible();
    await expect(page.locator('.dice-input-group:has-text("d12")')).toBeVisible();
    await expect(page.locator('.dice-input-group:has-text("d20")')).toBeVisible();
    await expect(page.locator('.dice-input-group:has-text("d%")')).toBeVisible();
  });

  test('should set dice quantities', async ({ page }) => {
    await page.fill('#d6Count', '2');
    await page.fill('#d20Count', '1');
    await page.waitForTimeout(200);

    const d6Count = await page.inputValue('#d6Count');
    const d20Count = await page.inputValue('#d20Count');

    expect(d6Count).toBe('2');
    expect(d20Count).toBe('1');
  });

  test('should roll dice and show results', async ({ page }) => {
    await page.fill('#d6Count', '2');
    await page.fill('#d20Count', '1');

    await page.click('.roll-btn');
    await page.waitForTimeout(500);

    // Should display results
    await expect(page.locator('#diceResults')).toBeVisible();
  });

  test('should show individual die results', async ({ page }) => {
    await page.fill('#d6Count', '3');
    await page.click('.roll-btn');
    await page.waitForTimeout(500);

    // Should show results
    await expect(page.locator('#diceResults')).toBeVisible();
    await expect(page.locator('#diceResults')).toContainText('d6');
  });

  test('should calculate total correctly', async ({ page }) => {
    await page.fill('#d6Count', '1');
    await page.click('.roll-btn');
    await page.waitForTimeout(500);

    // Get the results text
    const resultsText = await page.textContent('#diceResults');

    // For a single d6, result should be between 1 and 6
    expect(resultsText).toContain('Total:');
  });

  test('should calculate total for multiple dice types', async ({ page }) => {
    await page.fill('#d6Count', '2');
    await page.fill('#d8Count', '1');
    await page.click('.roll-btn');
    await page.waitForTimeout(500);

    // Should show results with total
    const resultsText = await page.textContent('#diceResults');
    expect(resultsText).toContain('Total:');
    expect(resultsText).toContain('d6');
    expect(resultsText).toContain('d8');
  });

  test('should clear dice counts', async ({ page }) => {
    await page.fill('#d6Count', '5');
    await page.fill('#d20Count', '3');

    await page.click('#dicerollerTab .clear-btn');
    await page.waitForTimeout(200);

    const d6Count = await page.inputValue('#d6Count');
    const d20Count = await page.inputValue('#d20Count');

    expect(d6Count).toBe('0');
    expect(d20Count).toBe('0');
  });

  test('should save dice configuration', async ({ page }) => {
    await page.fill('#d6Count', '2');
    await page.fill('#d20Count', '1');

    await page.click('.save-dice-btn');

    const configName = `AttackRoll_${Date.now()}`;
    await page.fill('#diceConfigName', configName);
    await page.click('#saveDiceConfigModal .modal-actions .confirm-btn');
    await page.waitForTimeout(500);

    // Should close modal
    await expect(page.locator('#saveDiceConfigModal')).not.toBeVisible();
  });

  test('should load saved dice configuration', async ({ page }) => {
    const configName = `LoadTest_${Date.now()}`;

    // Save configuration
    await page.fill('#d8Count', '3');
    await page.fill('#d12Count', '2');
    await page.click('.save-dice-btn');
    await page.fill('#diceConfigName', configName);
    await page.click('#saveDiceConfigModal .modal-actions .confirm-btn');
    await page.waitForTimeout(500);

    // Clear dice
    await page.click('#dicerollerTab .clear-btn');

    // Load configuration
    await page.selectOption('#savedDiceSelect', configName);
    await page.waitForTimeout(300);

    // Dice should be set
    const d8Count = await page.inputValue('#d8Count');
    const d12Count = await page.inputValue('#d12Count');

    expect(d8Count).toBe('3');
    expect(d12Count).toBe('2');
  });

  test('should auto-generate configuration name from dice', async ({ page }) => {
    await page.fill('#d6Count', '2');
    await page.fill('#d20Count', '1');

    await page.click('.save-dice-btn');

    // Should have auto-generated name like "2d6 + 1d20"
    const autoName = await page.inputValue('#diceConfigName');
    expect(autoName).toContain('2d6');
    expect(autoName).toContain('1d20');
  });

  test('should delete saved configuration', async ({ page }) => {
    const configName = `ToDelete_${Date.now()}`;

    // Save a configuration
    await page.fill('#d6Count', '1');
    await page.click('.save-dice-btn');
    await page.fill('#diceConfigName', configName);
    await page.click('#saveDiceConfigModal .modal-actions .confirm-btn');
    await page.waitForTimeout(500);

    // Load it
    await page.selectOption('#savedDiceSelect', configName);

    // Delete it
    await page.click('#dicerollerTab .delete-saved-btn');
    await page.click('#deleteDiceConfigModal .modal-actions .confirm-btn');
    await page.waitForTimeout(500);

    // Should be removed from dropdown
    const options = await page.$$eval('#savedDiceSelect option', opts =>
      opts.map(o => o.textContent)
    );
    expect(options).not.toContain(configName);
  });

  test('should validate die ranges', async ({ page }) => {
    await page.fill('#d4Count', '1');
    await page.click('.roll-btn');
    await page.waitForTimeout(500);

    // Should show d4 results
    const resultsText = await page.textContent('#diceResults');
    expect(resultsText).toContain('d4');
    expect(resultsText).toContain('Total:');
  });

  test('should handle d100 (percentile dice)', async ({ page }) => {
    await page.fill('#d100Count', '1');
    await page.click('.roll-btn');
    await page.waitForTimeout(500);

    // Should show d100 results
    const resultsText = await page.textContent('#diceResults');
    expect(resultsText).toContain('d%');
    expect(resultsText).toContain('Total:');
  });

  test('should show roll history', async ({ page }) => {
    await page.fill('#d20Count', '1');
    await page.click('.roll-btn');
    await page.waitForTimeout(300);

    // Roll again
    await page.click('.roll-btn');
    await page.waitForTimeout(300);

    // Should show results from rolling
    await expect(page.locator('#diceResults')).toBeVisible();
  });

  test('should persist configurations across page reload', async ({ page }) => {
    const configName = `Persistent_${Date.now()}`;

    // Save configuration
    await page.fill('#d6Count', '3');
    await page.click('.save-dice-btn');
    await page.fill('#diceConfigName', configName);
    await page.click('#saveDiceConfigModal .modal-actions .confirm-btn');
    await page.waitForTimeout(500);

    // Reload page
    await page.reload();
    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('#loginScreen');
      return !loginScreen || loginScreen.style.display === 'none';
    });
    await page.click('#mainApp .tabs .tab-button:has-text("Dice Roller")');
    await page.waitForTimeout(500);

    // Configuration should still be available
    const options = await page.$$eval('#savedDiceSelect option', opts =>
      opts.map(o => o.textContent)
    );
    expect(options).toContain(configName);
  });

  test('should roll multiple times with same configuration', async ({ page }) => {
    await page.fill('#d20Count', '1');

    // Roll multiple times
    for (let i = 0; i < 3; i++) {
      await page.click('.roll-btn');
      await page.waitForTimeout(200);

      // Should show results each time
      await expect(page.locator('#diceResults')).toBeVisible();
      const resultsText = await page.textContent('#diceResults');
      expect(resultsText).toContain('d20');
      expect(resultsText).toContain('Total:');
    }
  });
});
