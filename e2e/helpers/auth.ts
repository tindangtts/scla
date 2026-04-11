import { Page, expect } from '@playwright/test';

export async function loginAsResident(page: Page) {
  await page.goto('/login');
  await page.getByTestId('input-email').fill('resident@starcity.com');
  await page.getByTestId('input-password').fill('password123');
  await page.getByTestId('button-login').click();
  // Wait for redirect to home and username to appear
  await expect(page.getByTestId('text-username')).toBeVisible({ timeout: 10000 });
}

export async function loginAsGuest(page: Page) {
  await page.goto('/login');
  await page.getByTestId('input-email').fill('demo@starcity.com');
  await page.getByTestId('input-password').fill('password123');
  await page.getByTestId('button-login').click();
  await expect(page.getByTestId('text-username')).toBeVisible({ timeout: 10000 });
}
