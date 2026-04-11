import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'html',
  use: {
    baseURL: 'http://localhost:5199',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'pnpm --filter @workspace/api-server run dev',
      port: 5198,
      reuseExistingServer: !process.env.CI,
      env: {
        PORT: '5198',
        NODE_ENV: 'test',
      },
      timeout: 30000,
    },
    {
      command: 'PORT=5199 BASE_PATH=/ pnpm --filter @workspace/scla run dev',
      url: 'http://localhost:5199',
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
  ],
});
