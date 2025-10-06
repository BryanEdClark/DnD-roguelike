// E2E Tests for Spells, Feats, Counters, and Equipment
// Tests spell management, feat selection, resource tracking, and inventory

const { test, expect } = require('@playwright/test');

test.describe('Spell Management', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const accountName = `SpellTest_${Date.now()}`;

    // Login using smoke test pattern
    await page.click('#loginScreen .login-buttons .signup-btn');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal .modal-actions .confirm-btn');

    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('#loginScreen');
      return !loginScreen || loginScreen.style.display === 'none';
    });

    // Navigate to Player Tools tab
    await page.click('#mainApp .tabs .tab-button:has-text("Player Tools")');
    await expect(page.locator('#playertoolsTab')).toBeVisible();

    // Navigate to Spells section
    await page.click('.section-tab-button:has-text("Spells")');
    await page.waitForTimeout(500);
  });

  test('should calculate Spell Save DC correctly', async ({ page }) => {
    // Navigate to character sheet
    await page.click('.section-tab-button:has-text("Character Sheet")');
    await page.selectOption('#charClass', 'Wizard');
    await page.fill('#charLevel', '5'); // +3 proficiency
    await page.fill('#int', '18'); // +4 modifier
    await page.waitForTimeout(500);

    // Navigate to Spells
    await page.click('.section-tab-button:has-text("Spells")');
    await page.waitForTimeout(300);

    // Spell Save DC should be 8 + 3 + 4 = 15
    const spellSaveDC = await page.textContent('#spellSaveDC');
    expect(spellSaveDC).toBe('15');
  });

  test('should calculate Spell Attack Bonus correctly', async ({ page }) => {
    await page.click('.section-tab-button:has-text("Character Sheet")');
    await page.selectOption('#charClass', 'Wizard');
    await page.fill('#charLevel', '5'); // +3 proficiency
    await page.fill('#int', '18'); // +4 modifier
    await page.waitForTimeout(500);

    await page.click('.section-tab-button:has-text("Spells")');
    await page.waitForTimeout(300);

    // Spell Attack Bonus should be 3 + 4 = +7
    const spellAttackBonus = await page.textContent('#spellAttackBonus');
    expect(spellAttackBonus).toBe('+7');
  });

  test('should open spell selector modal', async ({ page }) => {
    await page.click('.spell-add-btn:has-text("Add Spell")');
    await expect(page.locator('#spellModal')).toBeVisible();
  });

  test('should search for spells', async ({ page }) => {
    await page.click('.spell-add-btn:has-text("Add Spell")');
    await page.fill('#spellSearch', 'fireball');
    await page.waitForTimeout(1000);

    // Should show Fireball in results - look within the modal body
    await expect(page.locator('#spellModal .spell-card-header:has-text("Fireball")')).toBeVisible({ timeout: 10000 });
  });

  test('should filter spells by level tabs', async ({ page }) => {
    await page.click('.spell-add-btn:has-text("Add Spell")');

    // Click Level 3 tab
    await page.click('.modal-tab-btn:has-text("3")');
    await page.waitForTimeout(300);

    // Should show level 3 spells tab content
    await expect(page.locator('#level3SpellsTab')).toBeVisible();
  });

  test('should add spell to character', async ({ page }) => {
    await page.click('.spell-add-btn:has-text("Add Spell")');
    await page.fill('#spellSearch', 'magic missile');
    await page.waitForTimeout(500);

    // Click first result to add
    await page.click('.spell-card:has-text("Magic Missile")');
    await page.waitForTimeout(500);

    // Close modal
    await page.click('#spellModal .modal-close');

    // Should appear in selected spells
    await expect(page.locator('.selected-spell:has-text("Magic Missile")')).toBeVisible();
  });

  test('should remove spell from character', async ({ page }) => {
    // Add a spell first
    await page.click('.spell-add-btn:has-text("Add Spell")');
    await page.fill('#spellSearch', 'magic missile');
    await page.waitForTimeout(500);
    await page.click('.spell-card:has-text("Magic Missile")');
    await page.waitForTimeout(300);
    await page.click('#spellModal .modal-close');

    // Remove it
    await page.click('.selected-spell:has-text("Magic Missile") .remove-spell-btn');
    await page.waitForTimeout(300);

    // Should be gone
    await expect(page.locator('.selected-spell:has-text("Magic Missile")')).not.toBeVisible();
  });

  test('should perform concentration check', async ({ page }) => {
    await page.fill('#damageTaken', '20');
    await page.waitForTimeout(200);

    // DC should be 10 (max of 10 or 20/2)
    const dc = await page.textContent('#concentrationDC');
    expect(dc).toBe('10');

    // Roll CON save
    await page.click('.concentration-roll-btn');
    await page.waitForTimeout(300);

    // Should show result
    await expect(page.locator('#concentrationRollResult')).toBeVisible();
  });

  test('should calculate concentration DC correctly for high damage', async ({ page }) => {
    await page.fill('#damageTaken', '50');
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

    // Login using smoke test pattern
    await page.click('#loginScreen .login-buttons .signup-btn');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal .modal-actions .confirm-btn');

    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('#loginScreen');
      return !loginScreen || loginScreen.style.display === 'none';
    });

    // Navigate to Player Tools tab
    await page.click('#mainApp .tabs .tab-button:has-text("Player Tools")');
    await expect(page.locator('#playertoolsTab')).toBeVisible();

    // Navigate to Feats section
    await page.click('.section-tab-button:has-text("Feats")');
    await page.waitForTimeout(500);
  });

  test('should open feat selector modal', async ({ page }) => {
    await page.click('.feat-add-btn:has-text("Add Feat")');
    await expect(page.locator('#featModal')).toBeVisible();
  });

  test('should show Origin Feats tab', async ({ page }) => {
    await page.click('.feat-add-btn:has-text("Add Feat")');
    await page.click('.modal-tab-btn:has-text("Origin")');
    await page.waitForTimeout(300);

    // Should show origin feats tab content
    await expect(page.locator('#originFeatsTab')).toBeVisible();
  });

  test('should show General Feats tab', async ({ page }) => {
    await page.click('.feat-add-btn:has-text("Add Feat")');
    await page.click('.modal-tab-btn:has-text("General")');
    await page.waitForTimeout(300);

    // Should show general feats tab content
    await expect(page.locator('#generalFeatsTab')).toBeVisible();
  });

  test('should add feat to character', async ({ page }) => {
    await page.click('.feat-add-btn:has-text("Add Feat")');
    await page.click('.modal-tab-btn:has-text("Origin")');
    await page.click('.feat-card:has-text("Lucky")');
    await page.waitForTimeout(500);

    // Close modal
    await page.click('#featModal .modal-close');

    // Should appear in selected feats
    await expect(page.locator('.selected-feat:has-text("Lucky")')).toBeVisible();
  });

  test('should remove feat from character', async ({ page }) => {
    // Add feat first
    await page.click('.feat-add-btn:has-text("Add Feat")');
    await page.click('.feat-card:has-text("Alert")');
    await page.waitForTimeout(300);
    await page.click('#featModal .modal-close');

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

    // Login using smoke test pattern
    await page.click('#loginScreen .login-buttons .signup-btn');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal .modal-actions .confirm-btn');

    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('#loginScreen');
      return !loginScreen || loginScreen.style.display === 'none';
    });

    // Navigate to Player Tools tab
    await page.click('#mainApp .tabs .tab-button:has-text("Player Tools")');
    await expect(page.locator('#playertoolsTab')).toBeVisible();

    // Navigate to Counters section
    await page.click('.section-tab-button:has-text("Counters")');
    await page.waitForTimeout(500);
  });

  test('should create manual counter', async ({ page }) => {
    await page.click('.counter-add-btn:has-text("Add Counter")');

    await page.fill('#counterName', 'Test Resource');
    await page.fill('#counterMax', '5');
    await page.click('#addCounterModal .modal-actions .confirm-btn');
    await page.waitForTimeout(500);

    // Should appear in counters list
    await expect(page.locator('.counter-item:has-text("Test Resource")')).toBeVisible();
  });

  test('should increment and decrement counter', async ({ page }) => {
    // Add counter
    await page.click('.counter-add-btn:has-text("Add Counter")');
    await page.fill('#counterName', 'Test Counter');
    await page.fill('#counterMax', '5');
    await page.click('#addCounterModal .modal-actions .confirm-btn');
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
    await page.click('.section-tab-button:has-text("Character Sheet")');
    await page.selectOption('#charClass', 'Barbarian');
    await page.fill('#charLevel', '3');
    await page.waitForTimeout(500);

    // Click auto-populate counters
    await page.click('.section-tab-button:has-text("Counters")');
    await page.click('.counter-add-btn:has-text("Auto-populate Counters")');
    await page.waitForTimeout(1000);

    // Should have Rage counter
    await expect(page.locator('.counter-item:has-text("Rage")')).toBeVisible();
  });

  test('should auto-populate Ki Points for Monk', async ({ page }) => {
    await page.click('.section-tab-button:has-text("Character Sheet")');
    await page.selectOption('#charClass', 'Monk');
    await page.fill('#charLevel', '5');
    await page.waitForTimeout(500);

    await page.click('.section-tab-button:has-text("Counters")');
    await page.click('.counter-add-btn:has-text("Auto-populate Counters")');
    await page.waitForTimeout(1000);

    // Should have Ki Points = level
    const kiCounter = page.locator('.counter-item:has-text("Ki Points")');
    await expect(kiCounter).toBeVisible();

    const kiMax = await kiCounter.locator('.counter-max').textContent();
    expect(kiMax).toBe('5');
  });

  test('should reset all counters to max', async ({ page }) => {
    // Add counter
    await page.click('.counter-add-btn:has-text("Add Counter")');
    await page.fill('#counterName', 'Test');
    await page.fill('#counterMax', '5');
    await page.click('#addCounterModal .modal-actions .confirm-btn');
    await page.waitForTimeout(500);

    // Decrement it
    await page.click('.counter-decrement');
    await page.click('.counter-decrement');
    await page.waitForTimeout(300);

    // Reset all
    await page.click('.counter-reset-all-btn');
    await page.waitForTimeout(300);

    // Should be back at max
    const currentValue = await page.textContent('.counter-current');
    const maxValue = await page.textContent('.counter-max');
    expect(currentValue).toBe(maxValue);
  });

  test('should delete counter', async ({ page }) => {
    // Add counter
    await page.click('.counter-add-btn:has-text("Add Counter")');
    await page.fill('#counterName', 'To Delete');
    await page.fill('#counterMax', '3');
    await page.click('#addCounterModal .modal-actions .confirm-btn');
    await page.waitForTimeout(500);

    // Delete it
    await page.click('.counter-item:has-text("To Delete") .counter-delete-btn');
    await page.click('#deleteCounterModal .modal-actions .confirm-btn');
    await page.waitForTimeout(500);

    // Should be gone
    await expect(page.locator('.counter-item:has-text("To Delete")')).not.toBeVisible();
  });
});

test.describe('Equipment and Inventory', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const accountName = `EquipTest_${Date.now()}`;

    // Login using smoke test pattern
    await page.click('#loginScreen .login-buttons .signup-btn');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal .modal-actions .confirm-btn');

    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('#loginScreen');
      return !loginScreen || loginScreen.style.display === 'none';
    });

    // Navigate to Player Tools tab
    await page.click('#mainApp .tabs .tab-button:has-text("Player Tools")');
    await expect(page.locator('#playertoolsTab')).toBeVisible();

    // Navigate to Equipment section
    await page.click('.section-tab-button:has-text("Equipment")');
    await page.waitForTimeout(500);
  });

  test('should add armor', async ({ page }) => {
    await page.click('.spell-add-btn:has-text("Add Armor")');

    await page.fill('#armorName', 'Chain Mail');
    await page.fill('#armorAC', '16');
    await page.fill('#armorBonus', '');
    await page.fill('#armorNotes', 'Heavy armor');

    await page.click('#addArmorModal .modal-actions .confirm-btn');
    await page.waitForTimeout(500);

    await expect(page.locator('.armor-item:has-text("Chain Mail")')).toBeVisible();
  });

  test('should add weapon', async ({ page }) => {
    await page.click('.spell-add-btn:has-text("Add Weapon")');

    await page.fill('#weaponName', 'Longsword');
    await page.selectOption('#weaponDie', 'd8');
    await page.fill('#weaponBonus', '+1');
    await page.fill('#weaponNotes', 'Versatile (d10)');

    await page.click('#addWeaponModal .modal-actions .confirm-btn');
    await page.waitForTimeout(500);

    await expect(page.locator('.weapon-item:has-text("Longsword")')).toBeVisible();
  });

  test('should delete armor', async ({ page }) => {
    // Add armor first
    await page.click('.spell-add-btn:has-text("Add Armor")');
    await page.fill('#armorName', 'Test Armor');
    await page.fill('#armorAC', '14');
    await page.click('#addArmorModal .modal-actions .confirm-btn');
    await page.waitForTimeout(500);

    // Delete it
    await page.click('.armor-item:has-text("Test Armor") .delete-armor-btn');
    await page.waitForTimeout(300);

    await expect(page.locator('.armor-item:has-text("Test Armor")')).not.toBeVisible();
  });

  test('should track currency', async ({ page }) => {
    await page.click('.section-tab-button:has-text("Inventory")');
    await page.waitForTimeout(300);

    await page.fill('#currencyCP', '10');
    await page.fill('#currencySP', '5');
    await page.fill('#currencyGP', '100');
    await page.waitForTimeout(500);

    // Reload and check persistence
    await page.reload();
    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('#loginScreen');
      return !loginScreen || loginScreen.style.display === 'none';
    });
    await page.click('#mainApp .tabs .tab-button:has-text("Player Tools")');
    await page.click('.section-tab-button:has-text("Inventory")');
    await page.waitForTimeout(500);

    const gpValue = await page.inputValue('#currencyGP');
    expect(gpValue).toBe('100');
  });

  test('should add inventory item', async ({ page }) => {
    await page.click('.section-tab-button:has-text("Inventory")');
    await page.click('.spell-add-btn:has-text("Add Item")');

    await page.fill('#inventoryName', 'Healing Potion');
    await page.fill('#inventoryQuantity', '3');
    await page.fill('#inventoryValue', '50');
    await page.selectOption('#inventoryCurrency', 'gp');
    await page.fill('#inventoryNotes', 'Heals 2d4+2');

    await page.click('#addInventoryModal .modal-actions .confirm-btn');
    await page.waitForTimeout(500);

    await expect(page.locator('.inventory-item:has-text("Healing Potion")')).toBeVisible();
  });

  test('should adjust item quantity', async ({ page }) => {
    await page.click('.section-tab-button:has-text("Inventory")');
    await page.click('.spell-add-btn:has-text("Add Item")');
    await page.fill('#inventoryName', 'Arrow');
    await page.fill('#inventoryQuantity', '20');
    await page.click('#addInventoryModal .modal-actions .confirm-btn');
    await page.waitForTimeout(500);

    // Increment
    await page.click('.inventory-item:has-text("Arrow") .quantity-increment');
    await page.waitForTimeout(200);

    const quantity = await page.textContent('.inventory-item:has-text("Arrow") .item-quantity');
    expect(quantity).toBe('21');
  });

  test('should delete inventory item', async ({ page }) => {
    await page.click('.section-tab-button:has-text("Inventory")');
    await page.click('.spell-add-btn:has-text("Add Item")');
    await page.fill('#inventoryName', 'To Delete');
    await page.fill('#inventoryQuantity', '1');
    await page.click('#addInventoryModal .modal-actions .confirm-btn');
    await page.waitForTimeout(500);

    await page.click('.inventory-item:has-text("To Delete") .delete-item-btn');
    await page.waitForTimeout(300);

    await expect(page.locator('.inventory-item:has-text("To Delete")')).not.toBeVisible();
  });
});
