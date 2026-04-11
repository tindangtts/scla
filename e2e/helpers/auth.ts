import { Page, expect } from '@playwright/test';

// Demo account credentials (from seed data)
export const RESIDENT_EMAIL = 'resident@starcity.com';
export const RESIDENT_PASSWORD = 'password123';
export const ADMIN_EMAIL = 'admin@starcity.com';
export const ADMIN_PASSWORD = 'admin123';

/**
 * Log in via the Next.js login page.
 * Fills the email/password form and waits for navigation away from /login.
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  // Wait for navigation away from /login (successful auth redirects to /)
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
    timeout: 15000,
  });
}

/**
 * Convenience: log in as the seeded resident user.
 */
export async function loginAsResident(page: Page) {
  await login(page, RESIDENT_EMAIL, RESIDENT_PASSWORD);
}

/**
 * Convenience: log in as the seeded admin user.
 */
export async function loginAsAdmin(page: Page) {
  await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
}
