import { test, expect } from '@playwright/test';
import { loginAsResident } from '../helpers/auth';

test.describe('Facility Booking', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsResident(page);
  });

  test('resident can browse facilities', async ({ page }) => {
    await page.goto('/bookings/facilities');

    // Facilities page heading
    await expect(
      page.getByRole('heading', { name: /SCSC Facilities/i })
    ).toBeVisible({ timeout: 10000 });

    // At least one facility card should be visible (seeded data)
    // Facility cards contain rate text like "MMK"
    await expect(
      page.getByText('MMK').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('resident can book a facility slot', async ({ page }) => {
    // Navigate to facilities list
    await page.goto('/bookings/facilities');

    // Click on the first facility link
    const firstFacility = page.locator('a[href^="/bookings/facilities/"]').first();
    await expect(firstFacility).toBeVisible({ timeout: 10000 });
    await firstFacility.click();

    // Should be on a facility detail page
    await expect(page).toHaveURL(/\/bookings\/facilities\/.+/);

    // Jump to a random future date (30-180 days out) to avoid conflicts across test runs.
    // Shared DB state between runs means booking the same slot twice would fail.
    const daysOut = 30 + Math.floor(Math.random() * 150);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysOut);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    const currentUrl = new URL(page.url());
    currentUrl.searchParams.set('date', futureDateStr);
    await page.goto(currentUrl.toString());

    // Wait for "Available Slots" heading to appear
    await expect(
      page.getByText('Available Slots')
    ).toBeVisible({ timeout: 10000 });

    // Click the first non-booked (non-disabled) slot button
    // Slot buttons are in a grid, each showing a time range like "06:00 - 07:00"
    const availableSlot = page.locator(
      'button:not([disabled]):has-text(":")'
    ).first();
    await expect(availableSlot).toBeVisible({ timeout: 10000 });
    await availableSlot.click();

    // After selecting a slot, the booking form appears with a submit button
    const bookButton = page.locator('button[type="submit"]', {
      hasText: /book/i,
    });
    await expect(bookButton).toBeVisible({ timeout: 5000 });
    await bookButton.click();

    // After successful booking, a success message appears
    await expect(
      page.getByText('Booking confirmed!')
    ).toBeVisible({ timeout: 15000 });

    // Follow "View your bookings" link
    await page.getByText('View your bookings').click();

    // Should be on /bookings page
    await expect(page).toHaveURL(/\/bookings/);
  });

  test('my bookings page shows bookings', async ({ page }) => {
    await page.goto('/bookings');

    // Bookings page heading
    await expect(
      page.getByRole('heading', { name: /My Bookings/i })
    ).toBeVisible({ timeout: 10000 });

    // At least one booking should be visible (seeded data includes BK-0001)
    await expect(
      page.locator('text=/BK-\\d+/').first()
    ).toBeVisible({ timeout: 10000 });
  });
});
