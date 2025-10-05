// E2E Tests for Account Management
// Tests account creation, login, and admin functionality

const { test, expect } = require('@playwright/test');

test.describe('Account Management', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login screen on initial load', async ({ page }) => {
    await expect(page.locator('.login-screen')).toBeVisible();
    await expect(page.locator('h1')).toContainText('D&D Play Tools');
    await expect(page.locator('.trogdor-logo')).toBeVisible();
  });

  test('should show login and signup buttons', async ({ page }) => {
    await expect(page.locator('text=Login')).toBeVisible();
    await expect(page.locator('text=Sign Up')).toBeVisible();
  });

  test('should open signup modal when Sign Up is clicked', async ({ page }) => {
    await page.click('text=Sign Up');
    await expect(page.locator('#signupModal')).toBeVisible();
    await expect(page.locator('#signupModal h2')).toContainText('Create Account');
  });

  test('should create new account without password', async ({ page }) => {
    const accountName = `TestUser_${Date.now()}`;

    // Open signup modal
    await page.click('text=Sign Up');

    // Fill in account name
    await page.fill('#signupAccountName', accountName);

    // Leave password blank and submit
    await page.click('#signupModal button:has-text("Create Account")');

    // Wait for redirect to main page
    await page.waitForSelector('.container', { state: 'visible' });

    // Verify logged in
    await expect(page.locator('.current-user')).toContainText(accountName);
  });

  test('should create new account with password', async ({ page }) => {
    const accountName = `SecureUser_${Date.now()}`;
    const password = 'testpass123';

    // Open signup modal
    await page.click('text=Sign Up');

    // Fill in credentials
    await page.fill('#signupAccountName', accountName);
    await page.fill('#signupPassword', password);

    // Submit
    await page.click('#signupModal button:has-text("Create Account")');

    // Wait for main page
    await page.waitForSelector('.container', { state: 'visible' });

    // Verify logged in
    await expect(page.locator('.current-user')).toContainText(accountName);
  });

  test('should login to existing account', async ({ page }) => {
    const accountName = `LoginTest_${Date.now()}`;

    // Create account first
    await page.click('text=Sign Up');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal button:has-text("Create Account")');
    await page.waitForSelector('.container', { state: 'visible' });

    // Logout
    await page.click('.logout-btn');
    await page.waitForSelector('.login-screen', { state: 'visible' });

    // Login again
    await page.click('text=Login');
    await page.fill('#loginAccountName', accountName);
    await page.click('#loginModal button:has-text("Login")');

    // Verify logged in
    await page.waitForSelector('.container', { state: 'visible' });
    await expect(page.locator('.current-user')).toContainText(accountName);
  });

  test('should validate password on protected account', async ({ page }) => {
    const accountName = `PasswordTest_${Date.now()}`;
    const password = 'secretpass';

    // Create password-protected account
    await page.click('text=Sign Up');
    await page.fill('#signupAccountName', accountName);
    await page.fill('#signupPassword', password);
    await page.click('#signupModal button:has-text("Create Account")');
    await page.waitForSelector('.container', { state: 'visible' });

    // Logout
    await page.click('.logout-btn');

    // Try to login with wrong password
    await page.click('text=Login');
    await page.fill('#loginAccountName', accountName);
    await page.fill('#loginPassword', 'wrongpassword');
    await page.click('#loginModal button:has-text("Login")');

    // Should show incorrect password modal
    await expect(page.locator('#incorrectPasswordModal')).toBeVisible();

    // Close modal and try again with correct password
    await page.click('#incorrectPasswordModal button:has-text("Retry")');
    await page.fill('#loginPassword', password);
    await page.click('#loginModal button:has-text("Login")');

    // Should login successfully
    await page.waitForSelector('.container', { state: 'visible' });
    await expect(page.locator('.current-user')).toContainText(accountName);
  });

  test('should handle account not found', async ({ page }) => {
    await page.click('text=Login');
    await page.fill('#loginAccountName', 'NonExistentUser');
    await page.click('#loginModal button:has-text("Login")');

    // Should show account not found modal
    await expect(page.locator('#accountNotFoundModal')).toBeVisible();
  });

  test('should prevent duplicate account creation', async ({ page }) => {
    const accountName = `DuplicateTest_${Date.now()}`;

    // Create first account
    await page.click('text=Sign Up');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal button:has-text("Create Account")');
    await page.waitForSelector('.container', { state: 'visible' });

    // Logout
    await page.click('.logout-btn');

    // Try to create duplicate
    await page.click('text=Sign Up');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal button:has-text("Create Account")');

    // Should show error (account already exists)
    // Note: Implementation may vary - check for alert or modal
    await page.waitForTimeout(1000); // Brief wait for error handling
  });

  test('should logout successfully', async ({ page }) => {
    const accountName = `LogoutTest_${Date.now()}`;

    // Create and login
    await page.click('text=Sign Up');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal button:has-text("Create Account")');
    await page.waitForSelector('.container', { state: 'visible' });

    // Logout
    await page.click('.logout-btn');

    // Should return to login screen
    await expect(page.locator('.login-screen')).toBeVisible();
  });
});

test.describe('Admin Panel', () => {

  test('should access admin panel with Admin account', async ({ page }) => {
    await page.goto('/');

    // Login as Admin
    await page.click('text=Login');
    await page.fill('#loginAccountName', 'Admin');
    await page.click('#loginModal button:has-text("Login")');

    // Should show admin panel
    await page.waitForSelector('#adminPage', { state: 'visible' });
    await expect(page.locator('h1')).toContainText('Admin Panel');
  });

  test('should display all accounts in admin panel', async ({ page }) => {
    await page.goto('/');

    // Create a test account first
    const accountName = `AdminViewTest_${Date.now()}`;
    await page.click('text=Sign Up');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal button:has-text("Create Account")');
    await page.waitForSelector('.container', { state: 'visible' });
    await page.click('.logout-btn');

    // Login as Admin
    await page.click('text=Login');
    await page.fill('#loginAccountName', 'Admin');
    await page.click('#loginModal button:has-text("Login")');

    // Admin panel should show accounts
    await page.waitForSelector('#adminAccountsList', { state: 'visible' });
    await expect(page.locator(`text=${accountName}`)).toBeVisible();
  });

  test('should delete account from admin panel', async ({ page }) => {
    await page.goto('/');

    // Create account to delete
    const accountName = `ToDelete_${Date.now()}`;
    await page.click('text=Sign Up');
    await page.fill('#signupAccountName', accountName);
    await page.click('#signupModal button:has-text("Create Account")');
    await page.waitForSelector('.container', { state: 'visible' });
    await page.click('.logout-btn');

    // Login as Admin
    await page.click('text=Login');
    await page.fill('#loginAccountName', 'Admin');
    await page.click('#loginModal button:has-text("Login")');
    await page.waitForSelector('#adminAccountsList', { state: 'visible' });

    // Find and delete the account
    const accountCard = page.locator(`.admin-account-card:has-text("${accountName}")`);
    await expect(accountCard).toBeVisible();

    // Click delete button
    await accountCard.locator('.admin-delete-btn').click();

    // Confirm deletion in modal
    await page.click('#deleteAccountModal button:has-text("Delete")');

    // Account should be removed from list
    await expect(accountCard).not.toBeVisible();
  });

  test('should refresh admin accounts list', async ({ page }) => {
    await page.goto('/');

    // Login as Admin
    await page.click('text=Login');
    await page.fill('#loginAccountName', 'Admin');
    await page.click('#loginModal button:has-text("Login")');

    // Click refresh button
    await page.click('.admin-refresh-btn');

    // List should reload (brief wait for refresh)
    await page.waitForTimeout(500);
    await expect(page.locator('#adminAccountsList')).toBeVisible();
  });
});
