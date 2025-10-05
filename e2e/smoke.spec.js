// Smoke Tests - Basic E2E validation
// Simple tests that verify core application functionality

const { test, expect } = require('@playwright/test');

test.describe('Smoke Tests', () => {

  test('should load the application', async ({ page }) => {
    await page.goto('/');

    // Should show login screen
    await expect(page.locator('.login-screen')).toBeVisible();
  });

  test('should show login elements', async ({ page }) => {
    await page.goto('/');

    // Login screen should be visible
    const loginScreen = page.locator('.login-screen');
    await expect(loginScreen).toBeVisible();

    // Should have title
    await expect(loginScreen.locator('h1')).toContainText('D&D Play Tools');

    // Should have logo
    await expect(page.locator('.trogdor-logo')).toBeVisible();

    // Should have login buttons
    await expect(page.locator('.login-buttons button:has-text("Login")')).toBeVisible();
    await expect(page.locator('.login-buttons button:has-text("Sign Up")')).toBeVisible();
  });

  test('should open signup modal', async ({ page }) => {
    await page.goto('/');

    await page.click('.login-buttons button:has-text("Sign Up")');

    // Modal should be visible
    await expect(page.locator('#signupModal')).toBeVisible();
    await expect(page.locator('#signupModal h2')).toContainText('Create Account');
  });

  test('should open login modal', async ({ page }) => {
    await page.goto('/');

    await page.click('.login-buttons button:has-text("Login")');

    // Modal should be visible
    await expect(page.locator('#loginModal')).toBeVisible();
    await expect(page.locator('#loginModal h2')).toContainText('Login');
  });

  test('should create account and login', async ({ page }) => {
    await page.goto('/');

    const accountName = `TestUser_${Date.now()}`;

    // Open signup
    await page.click('.login-buttons button:has-text("Sign Up")');
    await expect(page.locator('#signupModal')).toBeVisible();

    // Fill form
    await page.fill('#signupAccountName', accountName);

    // Submit
    await page.click('#signupModal button:has-text("Create Account")');

    // Wait for main app to load
    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('.login-screen');
      return !loginScreen || loginScreen.style.display === 'none';
    }, { timeout: 10000 });

    // Should show user info
    await expect(page.locator('.current-user')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.current-user')).toContainText(accountName);
  });

  test('should access DM Tools tab', async ({ page }) => {
    await page.goto('/');

    // Login first
    const accountName = `DMTest_${Date.now()}`;
    await page.click('.login-buttons button:has-text("Sign Up")');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal button:has-text("Create Account")');

    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('.login-screen');
      return !loginScreen || loginScreen.style.display === 'none';
    });

    // Click DM Tools
    await page.click('.tab-btn:has-text("DM Tools")');

    // DM Tools section should be visible
    await expect(page.locator('#dmTools')).toBeVisible();
  });

  test('should access Player Tools tab', async ({ page }) => {
    await page.goto('/');

    // Login
    const accountName = `PlayerTest_${Date.now()}`;
    await page.click('.login-buttons button:has-text("Sign Up")');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal button:has-text("Create Account")');

    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('.login-screen');
      return !loginScreen || loginScreen.style.display === 'none';
    });

    // Click Player Tools
    await page.click('.tab-btn:has-text("Player Tools")');

    // Player Tools section should be visible
    await expect(page.locator('#playerTools')).toBeVisible();
  });

  test('should access Dice Roller tab', async ({ page }) => {
    await page.goto('/');

    // Login
    const accountName = `DiceTest_${Date.now()}`;
    await page.click('.login-buttons button:has-text("Sign Up")');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal button:has-text("Create Account")');

    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('.login-screen');
      return !loginScreen || loginScreen.style.display === 'none';
    });

    // Click Dice Roller
    await page.click('.tab-btn:has-text("Dice Roller")');

    // Dice Roller section should be visible
    await expect(page.locator('#diceRoller')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await page.goto('/');

    // Login
    const accountName = `LogoutTest_${Date.now()}`;
    await page.click('.login-buttons button:has-text("Sign Up")');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal button:has-text("Create Account")');

    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('.login-screen');
      return !loginScreen || loginScreen.style.display === 'none';
    });

    // Logout
    await page.click('.logout-btn');

    // Should return to login screen
    await expect(page.locator('.login-screen')).toBeVisible();
  });

  test('should validate Admin login', async ({ page }) => {
    await page.goto('/');

    // Login as Admin
    await page.click('.login-buttons button:has-text("Login")');
    await page.fill('#loginAccountName', 'Admin');
    await page.click('#loginModal button:has-text("Login")');

    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('.login-screen');
      return !loginScreen || loginScreen.style.display === 'none';
    });

    // Should show admin panel
    await expect(page.locator('#adminPage')).toBeVisible();
    await expect(page.locator('#adminPage h1')).toContainText('Admin Panel');
  });
});
