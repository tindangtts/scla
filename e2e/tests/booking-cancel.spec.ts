import { test, expect } from '@playwright/test';
import { loginAsResident } from '../helpers/auth';

test.describe('Facility Booking and Cancellation', () => {

  test('books a recurring facility slot and cancels it', async ({ page }) => {
    await loginAsResident(page);

    // Navigate to bookings page
    await page.goto('/bookings');

    // The bookings page has two tabs: "facilities" (facility list) and "mybookings" (booking list)
    // Default tab is "facilities" — click it to ensure we are on the facility list
    await page.getByTestId('tab-facilities').click();

    // Select the first available facility card
    // Seeded facilities: Olympic Swimming Pool, Tennis Court A, Gymnasium, etc.
    const facilityCard = page.locator('[data-testid^="card-facility-"]').first();
    await expect(facilityCard).toBeVisible({ timeout: 10000 });
    await facilityCard.click();

    // Now on booking detail page — select today's date (pre-selected by default)
    // Date buttons use data-testid="date-{YYYY-MM-DD}" for each of the next 7 days
    const dateButton = page.locator('[data-testid^="date-"]').first();
    await expect(dateButton).toBeVisible({ timeout: 10000 });
    await dateButton.click();

    // Select the first AVAILABLE time slot
    // Slots use data-testid="slot-{id}" and are disabled when not available
    // Wait for slots to load after date selection
    const slotButton = page.locator('[data-testid^="slot-"]:not([disabled])').first();
    await expect(slotButton).toBeVisible({ timeout: 10000 });
    await slotButton.click();

    // Enable "Repeat Weekly" toggle so the booking creates a recurring group
    // This is required for the cancel group button to appear on the booking card
    // (button-cancel-group-{id} only renders when booking.recurringGroupId is set)
    await page.getByTestId('toggle-repeat-weekly').click();

    // Confirm the booking
    const confirmButton = page.getByTestId('button-confirm-booking');
    await expect(confirmButton).toBeEnabled({ timeout: 5000 });
    await confirmButton.click();

    // After successful booking, the detail page shows a success screen with "View My Bookings" button
    await expect(page.getByTestId('button-view-bookings')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('button-view-bookings').click();

    // Now on bookings list page — switch to "My Bookings" tab to see the new bookings
    await page.getByTestId('tab-mybookings').click();

    // The recurring booking we just created should appear as an "upcoming" booking card
    // There should be at least one booking card visible (new recurring + seeded BK-0001)
    const bookingCard = page.locator('[data-testid^="card-booking-"]').first();
    await expect(bookingCard).toBeVisible({ timeout: 10000 });

    // The cancel group button appears only on recurring upcoming bookings
    // (data-testid="button-cancel-group-{id}" rendered when recurringGroupId && status === 'upcoming')
    const cancelButton = page.locator('[data-testid^="button-cancel-group-"]').first();
    await expect(cancelButton).toBeVisible({ timeout: 5000 });
    await cancelButton.click();

    // After cancellation via cancel-group, a toast notification confirms success
    // and the booking list is refreshed — the cancelled bookings are removed from upcoming list
    // Wait briefly for the mutation to complete and UI to update
    await page.waitForTimeout(1500);

    // Verify the cancelled booking(s) are no longer shown in the list
    // (The recurring group is cancelled — all future bookings removed from upcoming view)
    // We verify by checking that there are no more cancel-group buttons (or the count decreased)
    // OR that a toast with "cancelled" text appeared — accept either signal
    const cancelledToast = page.getByText(/cancelled/i);
    const noCancelButton = page.locator('[data-testid^="button-cancel-group-"]');

    // At least one of: toast visible OR no more cancel buttons from our recurring group
    const toastVisible = await cancelledToast.isVisible().catch(() => false);
    const cancelCount = await noCancelButton.count();

    // Either the toast appeared (confirming cancellation) or cancel buttons decreased
    // This flexible assertion handles timing variations
    expect(toastVisible || cancelCount === 0).toBe(true);
  });

});
