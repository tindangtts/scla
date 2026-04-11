import { test, expect } from '@playwright/test';
import { loginAsResident } from '../helpers/auth';

test.describe('Resident Login and Dashboard', () => {
  test('redirects unauthenticated user to login', async ({ page }) => {
    await page.goto('/');
    // Unauthenticated users see login prompt on home
    await expect(page.getByTestId('button-login-prompt')).toBeVisible();
  });

  test('logs in as resident and sees dashboard content', async ({ page }) => {
    await loginAsResident(page);

    // TEST-08: Assert key dashboard content is visible
    // 1. Username is displayed
    await expect(page.getByTestId('text-username')).toContainText('Ma Aye Aye');

    // 2. Outstanding balance is visible (seeded resident has 2 unpaid invoices)
    await expect(page.getByTestId('text-outstanding-balance')).toBeVisible();

    // 3. Star Assist card is visible (resident has 2 open/in-progress tickets)
    await expect(page.getByTestId('card-star-assist')).toBeVisible();

    // 4. Bill payment card is visible
    await expect(page.getByTestId('card-bill-payment')).toBeVisible();
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('input-email').fill('wrong@email.com');
    await page.getByTestId('input-password').fill('wrongpassword');
    await page.getByTestId('button-login').click();

    // Should show a toast error, not redirect
    // The toast uses sonner/radix — look for the destructive toast text
    await expect(page.getByText('Login failed')).toBeVisible({ timeout: 5000 });
  });
});
