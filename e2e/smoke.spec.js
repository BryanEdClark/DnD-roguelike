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
    const loginScreen = page.locator('#loginScreen');
    await expect(loginScreen).toBeVisible();

    // Should have title
    await expect(loginScreen.locator('.logo-header h1')).toContainText('D&D Play Tools');

    // Should have logo
    await expect(loginScreen.locator('.trogdor-logo')).toBeVisible();

    // Should have login buttons
    await expect(loginScreen.locator('.login-buttons .login-btn:has-text("Login")')).toBeVisible();
    await expect(loginScreen.locator('.login-buttons .signup-btn:has-text("Sign Up")')).toBeVisible();
  });

  test('should open signup modal', async ({ page }) => {
    await page.goto('/');

    await page.click('#loginScreen .login-buttons .signup-btn');

    // Modal should be visible
    await expect(page.locator('#signupModal')).toBeVisible();
    await expect(page.locator('#signupModal .modal-header h2')).toContainText('Create Account');
  });

  test('should open login modal', async ({ page }) => {
    await page.goto('/');

    await page.click('#loginScreen .login-buttons .login-btn');

    // Modal should be visible
    await expect(page.locator('#loginModal')).toBeVisible();
    await expect(page.locator('#loginModal .modal-header h2')).toContainText('Login');
  });

  test('should create account and login', async ({ page }) => {
    await page.goto('/');

    const accountName = `TestUser_${Date.now()}`;

    // Open signup
    await page.click('#loginScreen .login-buttons .signup-btn');
    await expect(page.locator('#signupModal')).toBeVisible();

    // Fill form
    await page.fill('#signupAccountName', accountName);

    // Submit
    await page.click('#signupModal .modal-actions .confirm-btn');

    // Wait for main app to load
    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('#loginScreen');
      return !loginScreen || loginScreen.style.display === 'none';
    }, { timeout: 10000 });

    // Should show user info
    await expect(page.locator('#mainApp .current-user')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#mainApp .current-user')).toContainText(accountName);
  });

  test('should access DM Tools tab', async ({ page }) => {
    await page.goto('/');

    // Login first
    const accountName = `DMTest_${Date.now()}`;
    await page.click('#loginScreen .login-buttons .signup-btn');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal .modal-actions .confirm-btn');

    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('#loginScreen');
      return !loginScreen || loginScreen.style.display === 'none';
    });

    // Click DM Tools (should already be visible as it's the default tab)
    await page.click('#mainApp .tabs .tab-button:has-text("DM Tools")');

    // DM Tools section should be visible
    await expect(page.locator('#dmtoolsTab')).toBeVisible();
  });

  test('should access Player Tools tab', async ({ page }) => {
    await page.goto('/');

    // Login
    const accountName = `PlayerTest_${Date.now()}`;
    await page.click('#loginScreen .login-buttons .signup-btn');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal .modal-actions .confirm-btn');

    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('#loginScreen');
      return !loginScreen || loginScreen.style.display === 'none';
    });

    // Click Player Tools
    await page.click('#mainApp .tabs .tab-button:has-text("Player Tools")');

    // Player Tools section should be visible
    await expect(page.locator('#playertoolsTab')).toBeVisible();
  });

  test('should access Dice Roller tab', async ({ page }) => {
    await page.goto('/');

    // Login
    const accountName = `DiceTest_${Date.now()}`;
    await page.click('#loginScreen .login-buttons .signup-btn');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal .modal-actions .confirm-btn');

    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('#loginScreen');
      return !loginScreen || loginScreen.style.display === 'none';
    });

    // Click Dice Roller
    await page.click('#mainApp .tabs .tab-button:has-text("Dice Roller")');

    // Dice Roller section should be visible
    await expect(page.locator('#dicerollerTab')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await page.goto('/');

    // Login
    const accountName = `LogoutTest_${Date.now()}`;
    await page.click('#loginScreen .login-buttons .signup-btn');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal .modal-actions .confirm-btn');

    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('#loginScreen');
      return !loginScreen || loginScreen.style.display === 'none';
    });

    // Logout
    await page.click('#mainApp .logout-btn');

    // Should return to login screen
    await expect(page.locator('#loginScreen')).toBeVisible();
  });

  test('should validate Admin login', async ({ page }) => {
    await page.goto('/');

    // Login as Admin
    await page.click('#loginScreen .login-buttons .login-btn');
    await page.fill('#loginAccountName', 'Admin');
    await page.click('#loginModal .modal-actions .confirm-btn');

    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('#loginScreen');
      return !loginScreen || loginScreen.style.display === 'none';
    });

    // Should show admin panel
    await expect(page.locator('#adminPage')).toBeVisible();
    await expect(page.locator('#adminPage .header-content h1')).toContainText('Admin Panel');
  });
});
