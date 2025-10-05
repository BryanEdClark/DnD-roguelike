// E2E Tests for Spells, Feats, Counters, and Equipment
// Tests spell management, feat selection, resource tracking, and inventory

const { test, expect } = require('@playwright/test');

test.describe('Spell Management', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const accountName = `SpellTest_${Date.now()}`;
    await page.click('text=Sign Up');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal button:has-text("Create Account")');
    await page.waitForSelector('.container', { state: 'visible' });
    await page.click('text=Player Tools');
    await page.click('text=Spells');
    await page.waitForTimeout(500);
  });

  test('should calculate Spell Save DC correctly', async ({ page }) => {
    // Navigate to character sheet
    await page.click('text=Character Sheet');
    await page.selectOption('#charClass', 'Wizard');
    await page.selectOption('#charLevel', '5'); // +3 proficiency
    await page.fill('#int', '18'); // +4 modifier
    await page.waitForTimeout(500);

    // Navigate to Spells
    await page.click('text=Spells');
    await page.waitForTimeout(300);

    // Spell Save DC should be 8 + 3 + 4 = 15
    const spellSaveDC = await page.textContent('#spellSaveDC');
    expect(spellSaveDC).toBe('15');
  });

  test('should calculate Spell Attack Bonus correctly', async ({ page }) => {
    await page.click('text=Character Sheet');
    await page.selectOption('#charClass', 'Wizard');
    await page.selectOption('#charLevel', '5'); // +3 proficiency
    await page.fill('#int', '18'); // +4 modifier
    await page.waitForTimeout(500);

    await page.click('text=Spells');
    await page.waitForTimeout(300);

    // Spell Attack Bonus should be 3 + 4 = +7
    const spellAttackBonus = await page.textContent('#spellAttackBonus');
    expect(spellAttackBonus).toBe('+7');
  });

  test('should open spell selector modal', async ({ page }) => {
    await page.click('button:has-text("Add Spell")');
    await expect(page.locator('#spellSelectorModal')).toBeVisible();
  });

  test('should search for spells', async ({ page }) => {
    await page.click('button:has-text("Add Spell")');
    await page.fill('#spellSearch', 'fireball');
    await page.waitForTimeout(500);

    // Should show Fireball in results
    await expect(page.locator('.spell-result:has-text("Fireball")')).toBeVisible();
  });

  test('should filter spells by level tabs', async ({ page }) => {
    await page.click('button:has-text("Add Spell")');

    // Click Level 3 tab
    await page.click('.spell-level-tab:has-text("3")');
    await page.waitForTimeout(300);

    // Should show only level 3 spells
    const spellLevels = await page.$$eval('.spell-result .spell-level', els =>
      els.map(el => el.textContent)
    );

    spellLevels.forEach(level => {
      expect(level).toContain('3');
    });
  });

  test('should add spell to character', async ({ page }) => {
    await page.click('button:has-text("Add Spell")');
    await page.fill('#spellSearch', 'magic missile');
    await page.waitForTimeout(500);

    // Click first result to add
    await page.click('.spell-result:has-text("Magic Missile")');
    await page.waitForTimeout(500);

    // Close modal
    await page.click('#spellSelectorModal .modal-close');

    // Should appear in selected spells
    await expect(page.locator('.selected-spell:has-text("Magic Missile")')).toBeVisible();
  });

  test('should remove spell from character', async ({ page }) => {
    // Add a spell first
    await page.click('button:has-text("Add Spell")');
    await page.fill('#spellSearch', 'magic missile');
    await page.waitForTimeout(500);
    await page.click('.spell-result:has-text("Magic Missile")');
    await page.waitForTimeout(300);
    await page.click('#spellSelectorModal .modal-close');

    // Remove it
    await page.click('.selected-spell:has-text("Magic Missile") .remove-spell-btn');
    await page.waitForTimeout(300);

    // Should be gone
    await expect(page.locator('.selected-spell:has-text("Magic Missile")')).not.toBeVisible();
  });

  test('should perform concentration check', async ({ page }) => {
    await page.fill('#concentrationDamage', '20');
    await page.waitForTimeout(200);

    // DC should be 10 (max of 10 or 20/2)
    const dc = await page.textContent('#concentrationDC');
    expect(dc).toBe('10');

    // Roll CON save
    await page.click('button:has-text("Roll CON Save")');
    await page.waitForTimeout(300);

    // Should show result
    await expect(page.locator('.concentration-result')).toBeVisible();
  });

  test('should calculate concentration DC correctly for high damage', async ({ page }) => {
    await page.fill('#concentrationDamage', '50');
    await page.waitForTimeout(200);

    // DC should be 25 (50/2)
    const dc = await page.textContent('#concentrationDC');
    expect(dc).toBe('25');
  });
});

test.describe('Feats System', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const accountName = `FeatTest_${Date.now()}`;
    await page.click('text=Sign Up');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal button:has-text("Create Account")');
    await page.waitForSelector('.container', { state: 'visible' });
    await page.click('text=Player Tools');
    await page.click('text=Feats');
    await page.waitForTimeout(500);
  });

  test('should open feat selector modal', async ({ page }) => {
    await page.click('button:has-text("Add Feat")');
    await expect(page.locator('#featSelectorModal')).toBeVisible();
  });

  test('should show Origin Feats tab', async ({ page }) => {
    await page.click('button:has-text("Add Feat")');
    await page.click('.feat-tab:has-text("Origin")');
    await page.waitForTimeout(300);

    // Should show origin feats (no level requirement)
    await expect(page.locator('.feat-item:has-text("Alert")')).toBeVisible();
  });

  test('should show General Feats tab', async ({ page }) => {
    await page.click('button:has-text("Add Feat")');
    await page.click('.feat-tab:has-text("General")');
    await page.waitForTimeout(300);

    // Should show general feats (4th level requirement)
    await expect(page.locator('.feat-item:has-text("Great Weapon Master")')).toBeVisible();
  });

  test('should add feat to character', async ({ page }) => {
    await page.click('button:has-text("Add Feat")');
    await page.click('.feat-tab:has-text("Origin")');
    await page.click('.feat-item:has-text("Lucky")');
    await page.waitForTimeout(500);

    // Close modal
    await page.click('#featSelectorModal .modal-close');

    // Should appear in selected feats
    await expect(page.locator('.selected-feat:has-text("Lucky")')).toBeVisible();
  });

  test('should remove feat from character', async ({ page }) => {
    // Add feat first
    await page.click('button:has-text("Add Feat")');
    await page.click('.feat-item:has-text("Alert")');
    await page.waitForTimeout(300);
    await page.click('#featSelectorModal .modal-close');

    // Remove it
    await page.click('.selected-feat:has-text("Alert") .remove-feat-btn');
    await page.waitForTimeout(300);

    // Should be gone
    await expect(page.locator('.selected-feat:has-text("Alert")')).not.toBeVisible();
  });
});

test.describe('Counters and Resources', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const accountName = `CounterTest_${Date.now()}`;
    await page.click('text=Sign Up');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal button:has-text("Create Account")');
    await page.waitForSelector('.container', { state: 'visible' });
    await page.click('text=Player Tools');
    await page.click('text=Counters');
    await page.waitForTimeout(500);
  });

  test('should create manual counter', async ({ page }) => {
    await page.click('button:has-text("Add Counter")');

    await page.fill('#counterName', 'Test Resource');
    await page.fill('#counterMax', '5');
    await page.click('#addCounterModal button:has-text("Add")');
    await page.waitForTimeout(500);

    // Should appear in counters list
    await expect(page.locator('.counter-item:has-text("Test Resource")')).toBeVisible();
  });

  test('should increment and decrement counter', async ({ page }) => {
    // Add counter
    await page.click('button:has-text("Add Counter")');
    await page.fill('#counterName', 'Test Counter');
    await page.fill('#counterMax', '5');
    await page.click('#addCounterModal button:has-text("Add")');
    await page.waitForTimeout(500);

    // Get initial value
    const initialValue = await page.textContent('.counter-item:has-text("Test Counter") .counter-current');

    // Decrement
    await page.click('.counter-item:has-text("Test Counter") .counter-decrement');
    await page.waitForTimeout(200);

    const decrementedValue = await page.textContent('.counter-item:has-text("Test Counter") .counter-current');
    expect(parseInt(decrementedValue)).toBe(parseInt(initialValue) - 1);

    // Increment
    await page.click('.counter-item:has-text("Test Counter") .counter-increment');
    await page.waitForTimeout(200);

    const finalValue = await page.textContent('.counter-item:has-text("Test Counter") .counter-current');
    expect(finalValue).toBe(initialValue);
  });

  test('should auto-populate counters for Barbarian', async ({ page }) => {
    // Set up Barbarian character
    await page.click('text=Character Sheet');
    await page.selectOption('#charClass', 'Barbarian');
    await page.selectOption('#charLevel', '3');
    await page.waitForTimeout(500);

    // Click auto-populate counters
    await page.click('text=Counters');
    await page.click('button:has-text("Auto-Populate")');
    await page.waitForTimeout(1000);

    // Should have Rage counter
    await expect(page.locator('.counter-item:has-text("Rage")')).toBeVisible();
  });

  test('should auto-populate Ki Points for Monk', async ({ page }) => {
    await page.click('text=Character Sheet');
    await page.selectOption('#charClass', 'Monk');
    await page.selectOption('#charLevel', '5');
    await page.waitForTimeout(500);

    await page.click('text=Counters');
    await page.click('button:has-text("Auto-Populate")');
    await page.waitForTimeout(1000);

    // Should have Ki Points = level
    const kiCounter = page.locator('.counter-item:has-text("Ki Points")');
    await expect(kiCounter).toBeVisible();

    const kiMax = await kiCounter.locator('.counter-max').textContent();
    expect(kiMax).toBe('5');
  });

  test('should reset all counters to max', async ({ page }) => {
    // Add counter
    await page.click('button:has-text("Add Counter")');
    await page.fill('#counterName', 'Test');
    await page.fill('#counterMax', '5');
    await page.click('#addCounterModal button:has-text("Add")');
    await page.waitForTimeout(500);

    // Decrement it
    await page.click('.counter-decrement');
    await page.click('.counter-decrement');
    await page.waitForTimeout(300);

    // Reset all
    await page.click('button:has-text("Reset All Counters")');
    await page.waitForTimeout(300);

    // Should be back at max
    const currentValue = await page.textContent('.counter-current');
    const maxValue = await page.textContent('.counter-max');
    expect(currentValue).toBe(maxValue);
  });

  test('should delete counter', async ({ page }) => {
    // Add counter
    await page.click('button:has-text("Add Counter")');
    await page.fill('#counterName', 'To Delete');
    await page.fill('#counterMax', '3');
    await page.click('#addCounterModal button:has-text("Add")');
    await page.waitForTimeout(500);

    // Delete it
    await page.click('.counter-item:has-text("To Delete") .counter-delete-btn');
    await page.click('#deleteCounterModal button:has-text("Delete")');
    await page.waitForTimeout(500);

    // Should be gone
    await expect(page.locator('.counter-item:has-text("To Delete")')).not.toBeVisible();
  });
});

test.describe('Equipment and Inventory', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const accountName = `EquipTest_${Date.now()}`;
    await page.click('text=Sign Up');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal button:has-text("Create Account")');
    await page.waitForSelector('.container', { state: 'visible' });
    await page.click('text=Player Tools');
    await page.click('text=Equipment');
    await page.waitForTimeout(500);
  });

  test('should add armor', async ({ page }) => {
    await page.click('button:has-text("Add Armor")');

    await page.fill('#armorName', 'Chain Mail');
    await page.fill('#armorAC', '16');
    await page.fill('#armorBonus', '');
    await page.fill('#armorNotes', 'Heavy armor');

    await page.click('#addArmorModal button:has-text("Add")');
    await page.waitForTimeout(500);

    await expect(page.locator('.armor-item:has-text("Chain Mail")')).toBeVisible();
  });

  test('should add weapon', async ({ page }) => {
    await page.click('button:has-text("Add Weapon")');

    await page.fill('#weaponName', 'Longsword');
    await page.selectOption('#weaponDamageDie', 'd8');
    await page.fill('#weaponBonus', '+1');
    await page.fill('#weaponNotes', 'Versatile (d10)');

    await page.click('#addWeaponModal button:has-text("Add")');
    await page.waitForTimeout(500);

    await expect(page.locator('.weapon-item:has-text("Longsword")')).toBeVisible();
  });

  test('should delete armor', async ({ page }) => {
    // Add armor first
    await page.click('button:has-text("Add Armor")');
    await page.fill('#armorName', 'Test Armor');
    await page.fill('#armorAC', '14');
    await page.click('#addArmorModal button:has-text("Add")');
    await page.waitForTimeout(500);

    // Delete it
    await page.click('.armor-item:has-text("Test Armor") .delete-armor-btn');
    await page.waitForTimeout(300);

    await expect(page.locator('.armor-item:has-text("Test Armor")')).not.toBeVisible();
  });

  test('should track currency', async ({ page }) => {
    await page.click('text=Inventory');
    await page.waitForTimeout(300);

    await page.fill('#cp', '10');
    await page.fill('#sp', '5');
    await page.fill('#gp', '100');
    await page.waitForTimeout(500);

    // Reload and check persistence
    await page.reload();
    await page.waitForSelector('.container', { state: 'visible' });
    await page.click('text=Player Tools');
    await page.click('text=Inventory');
    await page.waitForTimeout(500);

    const gpValue = await page.inputValue('#gp');
    expect(gpValue).toBe('100');
  });

  test('should add inventory item', async ({ page }) => {
    await page.click('text=Inventory');
    await page.click('button:has-text("Add Item")');

    await page.fill('#itemName', 'Healing Potion');
    await page.fill('#itemQuantity', '3');
    await page.fill('#itemValue', '50');
    await page.selectOption('#itemCurrency', 'gp');
    await page.fill('#itemNotes', 'Heals 2d4+2');

    await page.click('#addItemModal button:has-text("Add")');
    await page.waitForTimeout(500);

    await expect(page.locator('.inventory-item:has-text("Healing Potion")')).toBeVisible();
  });

  test('should adjust item quantity', async ({ page }) => {
    await page.click('text=Inventory');
    await page.click('button:has-text("Add Item")');
    await page.fill('#itemName', 'Arrow');
    await page.fill('#itemQuantity', '20');
    await page.click('#addItemModal button:has-text("Add")');
    await page.waitForTimeout(500);

    // Increment
    await page.click('.inventory-item:has-text("Arrow") .quantity-increment');
    await page.waitForTimeout(200);

    const quantity = await page.textContent('.inventory-item:has-text("Arrow") .item-quantity');
    expect(quantity).toBe('21');
  });

  test('should delete inventory item', async ({ page }) => {
    await page.click('text=Inventory');
    await page.click('button:has-text("Add Item")');
    await page.fill('#itemName', 'To Delete');
    await page.fill('#itemQuantity', '1');
    await page.click('#addItemModal button:has-text("Add")');
    await page.waitForTimeout(500);

    await page.click('.inventory-item:has-text("To Delete") .delete-item-btn');
    await page.waitForTimeout(300);

    await expect(page.locator('.inventory-item:has-text("To Delete")')).not.toBeVisible();
  });
});
