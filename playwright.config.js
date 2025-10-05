// Playwright Configuration for D&D 2024 Play Tools E2E Tests
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',

  // Maximum time one test can run for
  timeout: 60 * 1000,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }]
  ],

  use: {
    // Base URL for tests
    baseURL: 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment to test on other browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'node server.js',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
