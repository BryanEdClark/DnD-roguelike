// E2E Tests for Character Management
// Tests character creation, stats, and auto-population features

const { test, expect } = require('@playwright/test');

test.describe('Character Creation and Management', () => {

  test.beforeEach(async ({ page }) => {
    // Create account and login
    await page.goto('/');
    const accountName = `CharTest_${Date.now()}`;
    await page.click('#loginScreen .login-buttons .signup-btn');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal .modal-actions .confirm-btn');

    // Wait for login screen to disappear
    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('#loginScreen');
      return !loginScreen || loginScreen.style.display === 'none';
    });

    // Wait for main app to be visible
    await expect(page.locator('#mainApp .current-user')).toBeVisible({ timeout: 10000 });

    // Navigate to Player Tools
    await page.click('#mainApp .tabs .tab-button:has-text("Player Tools")');
    await page.waitForSelector('#playertoolsTab', { state: 'visible' });
  });

  test('should create a new character', async ({ page }) => {
    // Fill basic character info
    await page.fill('#charName', 'Aragorn');
    await page.selectOption('#charClass', 'Ranger');
    await page.fill('#charLevel', '5');
    await page.fill('#charBackground', 'Soldier');
    await page.selectOption('#charSpecies', 'Human');

    // Verify character name is saved
    await page.waitForTimeout(1000); // Wait for auto-save
    const nameValue = await page.inputValue('#charName');
    expect(nameValue).toBe('Aragorn');
  });

  test('should select class and populate subclass options', async ({ page }) => {
    await page.selectOption('#charClass', 'Fighter');

    // Subclass dropdown should populate
    await page.waitForTimeout(500);
    const subclassOptions = await page.$$eval('#charSubclass option', options =>
      options.map(opt => opt.textContent)
    );

    expect(subclassOptions.length).toBeGreaterThan(1);
    expect(subclassOptions).toContain('Champion');
  });

  test('should select species and populate subspecies options', async ({ page }) => {
    await page.selectOption('#charSpecies', 'Elf');

    // Subspecies dropdown should enable and populate
    await page.waitForTimeout(500);
    const subspeciesSelect = page.locator('#charSubspecies');
    await expect(subspeciesSelect).toBeEnabled();

    const subspeciesOptions = await page.$$eval('#charSubspecies option', options =>
      options.map(opt => opt.textContent).filter(t => t !== '')
    );

    expect(subspeciesOptions.length).toBeGreaterThan(0);
    expect(subspeciesOptions).toContain('High Elf');
  });

  test('should calculate ability modifiers correctly', async ({ page }) => {
    // Set STR to 16
    await page.fill('#str', '16');
    await page.waitForTimeout(300);

    // Modifier should be +3
    const strMod = await page.textContent('#strMod');
    expect(strMod).toBe('+3');

    // Set DEX to 8
    await page.fill('#dex', '8');
    await page.waitForTimeout(300);

    // Modifier should be -1
    const dexMod = await page.textContent('#dexMod');
    expect(dexMod).toBe('-1');
  });

  test('should calculate proficiency bonus based on level', async ({ page }) => {
    // Level 1-4: +2
    await page.fill('#charLevel', '4');
    await page.locator('#charLevel').blur();
    await page.waitForTimeout(500);
    let profBonus = await page.inputValue('#profBonus');
    expect(profBonus).toBe('2');

    // Level 5-8: +3
    await page.fill('#charLevel', '7');
    await page.locator('#charLevel').blur();
    await page.waitForTimeout(500);
    profBonus = await page.inputValue('#profBonus');
    expect(profBonus).toBe('3');

    // Level 17-20: +6
    await page.fill('#charLevel', '20');
    await page.locator('#charLevel').blur();
    await page.waitForTimeout(500);
    profBonus = await page.inputValue('#profBonus');
    expect(profBonus).toBe('6');
  });

  test('should auto-calculate HP from class and level', async ({ page }) => {
    await page.selectOption('#charClass', 'Fighter');
    await page.fill('#charLevel', '5');
    await page.fill('#con', '14'); // +2 modifier
    await page.waitForTimeout(300);

    // Click Set HP button
    await page.click('#playertoolsTab .set-hp-btn');

    // Fighter: d10 hit die
    // Level 1: 10 + 2 = 12
    // Levels 2-5: 4 × (6 + 2) = 32
    // Total: 44
    const hpMax = await page.inputValue('#hpMax');
    expect(hpMax).toBe('44');
  });

  test('should calculate initiative from DEX modifier', async ({ page }) => {
    await page.fill('#dex', '16'); // +3 modifier
    await page.waitForTimeout(300);

    const initiative = await page.inputValue('#initiative');
    expect(initiative).toBe('+3');
  });

  test('should auto-populate class traits', async ({ page }) => {
    await page.selectOption('#charClass', 'Barbarian');
    await page.fill('#charLevel', '3');
    await page.waitForTimeout(300);

    // Click auto-populate button
    await page.click('#playertoolsTab .auto-populate-btn.class-populate');
    await page.waitForTimeout(1000);

    // Should have Rage trait
    await expect(page.locator('#playertoolsTab .trait-name:has-text("Rage")')).toBeVisible();

    // Should have Unarmored Defense
    await expect(page.locator('#playertoolsTab .trait-name:has-text("Unarmored Defense")')).toBeVisible();
  });

  test('should auto-populate species traits', async ({ page }) => {
    await page.selectOption('#charSpecies', 'Dragonborn');
    await page.waitForTimeout(300);
    await page.selectOption('#charSubspecies', 'Red Dragon');
    await page.waitForTimeout(300);

    // Click auto-populate button
    await page.click('#playertoolsTab .auto-populate-btn.species-populate');
    await page.waitForTimeout(1000);

    // Should have Breath Weapon
    await expect(page.locator('#playertoolsTab .trait-name:has-text("Breath Weapon")')).toBeVisible();

    // Should have Damage Resistance
    await expect(page.locator('#playertoolsTab .trait-name:has-text("Damage Resistance")')).toBeVisible();
  });

  test('should apply Unarmored Defense to AC', async ({ page }) => {
    await page.selectOption('#charClass', 'Barbarian');
    await page.fill('#charLevel', '1');
    await page.fill('#dex', '14'); // +2
    await page.fill('#con', '16'); // +3
    await page.waitForTimeout(300);

    // Auto-populate to get Unarmored Defense
    await page.click('#playertoolsTab .auto-populate-btn.class-populate');
    await page.waitForTimeout(1000);

    // AC should be 10 + 2 (DEX) + 3 (CON) = 15
    const ac = await page.inputValue('#ac');
    expect(ac).toBe('15');
  });

  test('should calculate attack bonuses correctly', async ({ page }) => {
    await page.selectOption('#charClass', 'Fighter');
    await page.fill('#charLevel', '5'); // +3 proficiency
    await page.locator('#charLevel').blur();
    await page.waitForTimeout(300);
    await page.fill('#str', '18'); // +4 modifier
    await page.locator('#str').blur();
    await page.waitForTimeout(300);
    await page.fill('#dex', '14'); // +2 modifier
    await page.locator('#dex').blur();
    await page.waitForTimeout(500);

    // Navigate to Equipment section to see attack bonuses
    await page.click('#playertoolsTab .section-tab-button:has-text("Equipment")');
    await page.waitForSelector('#equipmentSection', { state: 'visible' });

    // Navigate back to Character Sheet to trigger recalculation
    await page.click('#playertoolsTab .section-tab-button:has-text("Character Sheet")');
    await page.waitForSelector('#characterSection', { state: 'visible' });
    await page.waitForTimeout(300);

    // Navigate back to Equipment to see updated bonuses
    await page.click('#playertoolsTab .section-tab-button:has-text("Equipment")');
    await page.waitForSelector('#equipmentSection', { state: 'visible' });
    await page.waitForTimeout(500);

    // Melee: +3 (prof) + 4 (STR) = +7
    const meleeBonus = await page.textContent('#equipmentSection #meleeAttackBonus');
    expect(meleeBonus).toBe('+7');

    // Ranged: +3 (prof) + 2 (DEX) = +5
    const rangedBonus = await page.textContent('#equipmentSection #rangedAttackBonus');
    expect(rangedBonus).toBe('+5');

    // Finesse: +3 (prof) + 4 (higher of STR/DEX) = +7
    const finesseBonus = await page.textContent('#equipmentSection #finesseAttackBonus');
    expect(finesseBonus).toBe('+7');
  });

  test('should save character data persistently', async ({ page }) => {
    // Fill character data
    await page.fill('#charName', 'Test Character');
    await page.selectOption('#charClass', 'Wizard');
    await page.fill('#charLevel', '10');
    await page.fill('#str', '10');
    await page.fill('#dex', '14');
    await page.waitForTimeout(1000); // Auto-save

    // Reload page
    await page.reload();

    // Wait for login to restore
    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('#loginScreen');
      return !loginScreen || loginScreen.style.display === 'none';
    });

    await expect(page.locator('#mainApp')).toBeVisible({ timeout: 10000 });

    // Navigate back to Player Tools
    await page.click('#mainApp .tabs .tab-button:has-text("Player Tools")');
    await page.waitForSelector('#playertoolsTab', { state: 'visible' });

    // Data should persist
    const charName = await page.inputValue('#charName');
    expect(charName).toBe('Test Character');

    const charClass = await page.inputValue('#charClass');
    expect(charClass).toBe('Wizard');

    const str = await page.inputValue('#str');
    expect(str).toBe('10');
  });

  test('should create and switch between multiple characters', async ({ page }) => {
    // Create first character
    await page.fill('#charName', 'Character 1');
    await page.selectOption('#charClass', 'Fighter');
    await page.waitForTimeout(500);

    // Add new character
    await page.click('#playertoolsTab .char-add-btn');
    await page.waitForTimeout(500);

    // Fill second character
    await page.fill('#charName', 'Character 2');
    await page.selectOption('#charClass', 'Wizard');
    await page.waitForTimeout(500);

    // Switch back to first character
    await page.selectOption('#characterSelect', { index: 0 });
    await page.waitForTimeout(500);

    // Should show first character data
    const charName = await page.inputValue('#charName');
    expect(charName).toBe('Character 1');

    const charClass = await page.inputValue('#charClass');
    expect(charClass).toBe('Fighter');
  });

  test('should delete character with confirmation', async ({ page }) => {
    // Add a second character first (can't delete if only one character)
    await page.fill('#charName', 'Character 1');
    await page.waitForTimeout(300);
    await page.click('#playertoolsTab .char-add-btn');
    await page.waitForTimeout(500);

    // Fill second character
    await page.fill('#charName', 'To Delete');
    await page.waitForTimeout(500);

    // Click delete button
    await page.click('#playertoolsTab .char-delete-btn');

    // Wait for modal to appear
    await expect(page.locator('#deleteCharacterModal')).toBeVisible();
    await page.waitForTimeout(300);

    // Confirm deletion
    await page.click('#deleteCharacterModal .modal-actions .delete-confirm-btn');
    await page.waitForTimeout(500);

    // Should now show Character 1
    const charName = await page.inputValue('#charName');
    expect(charName).toBe('Character 1');
  });
});

test.describe('Saving Throws and Skills', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const accountName = `SkillTest_${Date.now()}`;
    await page.click('#loginScreen .login-buttons .signup-btn');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal .modal-actions .confirm-btn');

    // Wait for login screen to disappear
    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('#loginScreen');
      return !loginScreen || loginScreen.style.display === 'none';
    });

    await expect(page.locator('#mainApp .current-user')).toBeVisible({ timeout: 10000 });

    // Navigate to Player Tools
    await page.click('#mainApp .tabs .tab-button:has-text("Player Tools")');
    await page.waitForSelector('#playertoolsTab', { state: 'visible' });
  });

  test('should calculate saving throw bonuses', async ({ page }) => {
    await page.fill('#str', '16'); // +3 modifier
    await page.fill('#charLevel', '5'); // +3 proficiency
    await page.waitForTimeout(300);

    // Check STR save proficiency
    await page.check('#saveStr');
    await page.waitForTimeout(300);

    // Bonus should be +6 (3 mod + 3 prof)
    const strSaveBonus = await page.textContent('#bonusSaveStr');
    expect(strSaveBonus).toBe('+6');
  });

  test('should mark class proficient saves automatically', async ({ page }) => {
    await page.selectOption('#charClass', 'Fighter');
    await page.waitForTimeout(500);

    // Fighter has STR and CON saves
    const strSaveProfChecked = await page.isChecked('#saveStr');
    const conSaveProfChecked = await page.isChecked('#saveCon');

    expect(strSaveProfChecked).toBe(true);
    expect(conSaveProfChecked).toBe(true);
  });

  test('should calculate skill bonuses with proficiency', async ({ page }) => {
    await page.fill('#dex', '16'); // +3 modifier
    await page.fill('#charLevel', '5'); // +3 proficiency
    await page.waitForTimeout(300);

    // Check Stealth proficiency (DEX based)
    await page.check('#skillStealth');
    await page.waitForTimeout(300);

    // Bonus should be +6 (3 mod + 3 prof)
    const stealthBonus = await page.textContent('#bonusStealth');
    expect(stealthBonus).toBe('+6');
  });
});
