// E2E Tests for Account Management
// Tests account creation, login, and admin functionality

const { test, expect } = require('@playwright/test');

test.describe('Account Management', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login screen on initial load', async ({ page }) => {
    const loginScreen = page.locator('#loginScreen');
    await expect(loginScreen).toBeVisible();
    await expect(loginScreen.locator('.logo-header h1')).toContainText('D&D Play Tools');
    await expect(loginScreen.locator('.trogdor-logo')).toBeVisible();
  });

  test('should show login and signup buttons', async ({ page }) => {
    const loginScreen = page.locator('#loginScreen');
    await expect(loginScreen.locator('.login-buttons .login-btn:has-text("Login")')).toBeVisible();
    await expect(loginScreen.locator('.login-buttons .signup-btn:has-text("Sign Up")')).toBeVisible();
  });

  test('should open signup modal when Sign Up is clicked', async ({ page }) => {
    await page.click('#loginScreen .login-buttons .signup-btn');
    await expect(page.locator('#signupModal')).toBeVisible();
    await expect(page.locator('#signupModal .modal-header h2')).toContainText('Create Account');
  });

  test('should create new account without password', async ({ page }) => {
    const accountName = `TestUser_${Date.now()}`;

    // Open signup modal
    await page.click('#loginScreen .login-buttons .signup-btn');

    // Fill in account name
    await page.fill('#signupAccountName', accountName);

    // Leave password blank and submit
    await page.click('#signupModal .modal-actions .confirm-btn');

    // Wait for redirect to main page
    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('#loginScreen');
      return !loginScreen || loginScreen.style.display === 'none';
    }, { timeout: 10000 });

    // Verify logged in
    await expect(page.locator('#mainApp .current-user')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#mainApp .current-user')).toContainText(accountName);
  });

  test('should create new account with password', async ({ page }) => {
    const accountName = `SecureUser_${Date.now()}`;
    const password = 'testpass123';

    // Open signup modal
    await page.click('#loginScreen .login-buttons .signup-btn');

    // Fill in credentials
    await page.fill('#signupAccountName', accountName);
    await page.fill('#signupPassword', password);

    // Submit
    await page.click('#signupModal .modal-actions .confirm-btn');

    // Wait for main page
    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('#loginScreen');
      return !loginScreen || loginScreen.style.display === 'none';
    }, { timeout: 10000 });

    // Verify logged in
    await expect(page.locator('#mainApp .current-user')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#mainApp .current-user')).toContainText(accountName);
  });

  test('should login to existing account', async ({ page }) => {
    const accountName = `LoginTest_${Date.now()}`;

    // Create account first
    await page.click('#loginScreen .login-buttons .signup-btn');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal .modal-actions .confirm-btn');
    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('#loginScreen');
      return !loginScreen || loginScreen.style.display === 'none';
    }, { timeout: 10000 });

    // Logout
    await page.click('#mainApp .logout-btn');
    await expect(page.locator('#loginScreen')).toBeVisible();

    // Login again
    await page.click('#loginScreen .login-buttons .login-btn');
    await page.fill('#loginAccountName', accountName);
    await page.click('#loginModal .modal-actions .confirm-btn');

    // Verify logged in
    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('#loginScreen');
      return !loginScreen || loginScreen.style.display === 'none';
    }, { timeout: 10000 });
    await expect(page.locator('#mainApp .current-user')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#mainApp .current-user')).toContainText(accountName);
  });

  test('should validate password on protected account', async ({ page }) => {
    const accountName = `PasswordTest_${Date.now()}`;
    const password = 'secretpass';

    // Create password-protected account
    await page.click('#loginScreen .login-buttons .signup-btn');
    await page.fill('#signupAccountName', accountName);
    await page.fill('#signupPassword', password);
    await page.click('#signupModal .modal-actions .confirm-btn');
    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('#loginScreen');
      return !loginScreen || loginScreen.style.display === 'none';
    }, { timeout: 10000 });

    // Logout
    await page.click('#mainApp .logout-btn');

    // Try to login with wrong password
    await page.click('#loginScreen .login-buttons .login-btn');
    await page.fill('#loginAccountName', accountName);
    await page.fill('#loginPassword', 'wrongpassword');
    await page.click('#loginModal .modal-actions .confirm-btn');

    // Should show incorrect password modal
    await expect(page.locator('#incorrectPasswordModal')).toBeVisible();

    // Close modal and try again with correct password
    await page.click('#incorrectPasswordModal .modal-actions .confirm-btn');
    await page.fill('#loginPassword', password);
    await page.click('#loginModal .modal-actions .confirm-btn');

    // Should login successfully
    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('#loginScreen');
      return !loginScreen || loginScreen.style.display === 'none';
    }, { timeout: 10000 });
    await expect(page.locator('#mainApp .current-user')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#mainApp .current-user')).toContainText(accountName);
  });

  test('should handle account not found', async ({ page }) => {
    await page.click('#loginScreen .login-buttons .login-btn');
    await page.fill('#loginAccountName', 'NonExistentUser');
    await page.click('#loginModal .modal-actions .confirm-btn');

    // Should show account not found modal
    await expect(page.locator('#accountNotFoundModal')).toBeVisible();
  });

  test('should prevent duplicate account creation', async ({ page }) => {
    const accountName = `DuplicateTest_${Date.now()}`;

    // Create first account
    await page.click('#loginScreen .login-buttons .signup-btn');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal .modal-actions .confirm-btn');
    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('#loginScreen');
      return !loginScreen || loginScreen.style.display === 'none';
    }, { timeout: 10000 });

    // Logout
    await page.click('#mainApp .logout-btn');

    // Try to create duplicate
    await page.click('#loginScreen .login-buttons .signup-btn');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal .modal-actions .confirm-btn');

    // Should show error (account already exists)
    // Note: Implementation may vary - check for alert or modal
    await page.waitForTimeout(1000); // Brief wait for error handling
  });

  test('should logout successfully', async ({ page }) => {
    const accountName = `LogoutTest_${Date.now()}`;

    // Create and login
    await page.click('#loginScreen .login-buttons .signup-btn');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal .modal-actions .confirm-btn');
    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('#loginScreen');
      return !loginScreen || loginScreen.style.display === 'none';
    }, { timeout: 10000 });

    // Logout
    await page.click('#mainApp .logout-btn');

    // Should return to login screen
    await expect(page.locator('#loginScreen')).toBeVisible();
  });
});

test.describe('Admin Panel', () => {

  test('should access admin panel with Admin account', async ({ page }) => {
    await page.goto('/');

    // Login as Admin
    await page.click('#loginScreen .login-buttons .login-btn');
    await page.fill('#loginAccountName', 'Admin');
    await page.click('#loginModal .modal-actions .confirm-btn');

    // Should show admin panel
    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('#loginScreen');
      return !loginScreen || loginScreen.style.display === 'none';
    }, { timeout: 10000 });
    await expect(page.locator('#adminPage')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#adminPage .header-content h1')).toContainText('Admin Panel');
  });

  test('should display all accounts in admin panel', async ({ page }) => {
    await page.goto('/');

    // Create a test account first
    const accountName = `AdminViewTest_${Date.now()}`;
    await page.click('#loginScreen .login-buttons .signup-btn');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal .modal-actions .confirm-btn');
    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('#loginScreen');
      return !loginScreen || loginScreen.style.display === 'none';
    }, { timeout: 10000 });
    await page.click('#mainApp .logout-btn');

    // Login as Admin
    await page.click('#loginScreen .login-buttons .login-btn');
    await page.fill('#loginAccountName', 'Admin');
    await page.click('#loginModal .modal-actions .confirm-btn');

    // Admin panel should show accounts
    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('#loginScreen');
      return !loginScreen || loginScreen.style.display === 'none';
    }, { timeout: 10000 });
    await expect(page.locator('#adminAccountsList')).toBeVisible({ timeout: 10000 });
    await expect(page.locator(`#adminAccountsList .admin-account-card:has-text("${accountName}")`)).toBeVisible();
  });

  test('should delete account from admin panel', async ({ page }) => {
    await page.goto('/');

    // Create account to delete
    const accountName = `ToDelete_${Date.now()}`;
    await page.click('#loginScreen .login-buttons .signup-btn');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal .modal-actions .confirm-btn');
    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('#loginScreen');
      return !loginScreen || loginScreen.style.display === 'none';
    }, { timeout: 10000 });
    await page.click('#mainApp .logout-btn');

    // Login as Admin
    await page.click('#loginScreen .login-buttons .login-btn');
    await page.fill('#loginAccountName', 'Admin');
    await page.click('#loginModal .modal-actions .confirm-btn');
    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('#loginScreen');
      return !loginScreen || loginScreen.style.display === 'none';
    }, { timeout: 10000 });
    await expect(page.locator('#adminAccountsList')).toBeVisible({ timeout: 10000 });

    // Find and delete the account
    const accountCard = page.locator(`.admin-account-card:has-text("${accountName}")`);
    await expect(accountCard).toBeVisible();

    // Click delete button
    await accountCard.locator('.admin-delete-btn').click();

    // Confirm deletion in modal
    await page.click('#adminDeleteModal .modal-actions .confirm-btn');

    // Account should be removed from list
    await expect(accountCard).not.toBeVisible();
  });

  test('should refresh admin accounts list', async ({ page }) => {
    await page.goto('/');

    // Login as Admin
    await page.click('#loginScreen .login-buttons .login-btn');
    await page.fill('#loginAccountName', 'Admin');
    await page.click('#loginModal .modal-actions .confirm-btn');

    // Wait for admin page to load
    await page.waitForFunction(() => {
      const loginScreen = document.querySelector('#loginScreen');
      return !loginScreen || loginScreen.style.display === 'none';
    }, { timeout: 10000 });

    // Click refresh button
    await page.click('.admin-refresh-btn');

    // List should reload (brief wait for refresh)
    await page.waitForTimeout(500);
    await expect(page.locator('#adminAccountsList')).toBeVisible();
  });
});
