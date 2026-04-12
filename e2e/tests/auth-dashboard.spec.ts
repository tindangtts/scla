import { test, expect } from '@playwright/test';
import { loginAsResident, RESIDENT_EMAIL } from '../helpers/auth';

test.describe('Authentication and Dashboard', () => {
  test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/');
    // Middleware redirects unauthenticated users to /login
    await expect(page).toHaveURL(/\/login/);
  });

  test('resident can log in and see dashboard', async ({ page }) => {
    await loginAsResident(page);

    // After login, resident lands on home dashboard at /
    await expect(page).toHaveURL('/');

    // Dashboard shows "Welcome, <first name>" heading
    await expect(
      page.getByRole('heading', { name: /welcome/i })
    ).toBeVisible({ timeout: 10000 });

    // Dashboard shows wallet balance card
    await expect(page.getByText('Wallet Balance').first()).toBeVisible();

    // Dashboard shows unpaid bills card (appears in card title and CTA button, so use first)
    await expect(page.getByText('Unpaid Bills').first()).toBeVisible();
  });

  test('invalid credentials show error message', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[name="email"]').fill('wrong@email.com');
    await page.locator('input[name="password"]').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();

    // The login page displays an error message (state.error rendered as red text)
    await expect(
      page.locator('.text-red-600')
    ).toBeVisible({ timeout: 10000 });

    // Should remain on login page
    await expect(page).toHaveURL(/\/login/);
  });
});
