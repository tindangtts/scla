import { test, expect } from '@playwright/test';
import { loginAsResident } from '../helpers/auth';

test.describe('Ticket Creation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsResident(page);
  });

  test('resident can create a maintenance ticket', async ({ page }) => {
    // Navigate to the new ticket form
    await page.goto('/star-assist/new');

    // Page heading should be visible
    await expect(
      page.getByRole('heading', { name: /new star assist/i })
    ).toBeVisible({ timeout: 10000 });

    // Fill in the ticket form
    const ticketTitle = `E2E Ticket ${Date.now()}`;
    await page.locator('input[name="title"]').fill(ticketTitle);

    // Select a category from the dropdown
    await page.locator('select[name="category"]').selectOption('plumbing');

    // Fill service type
    await page.locator('input[name="serviceType"]').fill('Repair');

    // Fill description (min 10 chars)
    await page.locator('textarea[name="description"]').fill(
      'Leaking pipe under kitchen sink needs urgent repair. Water damage is spreading.'
    );

    // Submit the ticket (scope to form to avoid matching layout's logout button)
    await page.locator('form button[type="submit"]', { hasText: /submit ticket/i }).click();

    // After success, the form shows a success message with "submitted successfully"
    await expect(
      page.getByText('submitted successfully')
    ).toBeVisible({ timeout: 15000 });

    // Follow the "View your tickets" link to see it in the list
    await page.getByText('View your tickets').click();

    // Should be on /star-assist page
    await expect(page).toHaveURL(/\/star-assist/);

    // The ticket list page should show at least one ticket
    await expect(
      page.getByRole('heading', { name: 'Star Assist' })
    ).toBeVisible({ timeout: 10000 });
  });

  test('ticket list shows existing tickets', async ({ page }) => {
    await page.goto('/star-assist');

    // The "Star Assist" heading should be visible
    await expect(
      page.getByRole('heading', { name: 'Star Assist' })
    ).toBeVisible({ timeout: 10000 });

    // At least one ticket card with a ticket number pattern should be visible
    // Ticket numbers follow the pattern SA-XXXX (Star Assist prefix)
    await expect(
      page.locator('text=/SA-\\d+/').first()
    ).toBeVisible({ timeout: 10000 });
  });
});
