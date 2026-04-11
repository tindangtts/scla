import { test, expect } from '@playwright/test';
import { loginAsResident } from '../helpers/auth';

test.describe('Ticket Creation and Chat', () => {

  test('creates a new ticket, opens detail, sends a chat message', async ({ page }) => {
    await loginAsResident(page);

    // Navigate to Star Assist
    await page.goto('/star-assist');
    await expect(page.getByTestId('button-new-ticket')).toBeVisible();

    // Click new ticket
    await page.getByTestId('button-new-ticket').click();
    await expect(page.getByTestId('input-title')).toBeVisible();

    // Fill in ticket form with a unique title to avoid collision with seeded data
    const ticketTitle = `E2E Test Ticket ${Date.now()}`;
    await page.getByTestId('input-title').fill(ticketTitle);

    // Select category — "general_enquiry" renders service types unconditionally visible
    await page.getByTestId('category-general_enquiry').click();

    // Select service type — "General query" renders as data-testid="service-type-general-query"
    // Service types for general_enquiry: ["Billing enquiry", "Facility enquiry", "General query", "Other"]
    // data-testid uses st.toLowerCase().replace(/\s+/g, "-")
    await page.getByTestId('service-type-general-query').click();

    // Fill unit number — may be pre-filled for resident (readOnly when unitNumber is set)
    const unitInput = page.getByTestId('input-unit');
    const unitValue = await unitInput.inputValue();
    if (!unitValue) {
      await unitInput.fill('A-12-03');
    }

    // Fill description (required)
    await page.getByTestId('input-description').fill(
      'This is an automated E2E test ticket for testing the full ticket creation and chat flow.'
    );

    // Submit the form
    await page.getByTestId('button-submit-ticket').click();

    // After successful submission, app redirects to /star-assist/{ticket.id}
    // (from new-ticket.tsx: setLocation(`/star-assist/${ticket.id}`))
    await page.waitForURL(/\/star-assist\/[^/]+$/, { timeout: 10000 });

    // Verify we are on the ticket detail page — status badge must be visible
    await expect(page.getByTestId('text-ticket-status')).toBeVisible({ timeout: 10000 });

    // Send a chat message via the "Chat with Support" section
    const chatMessage = `E2E chat message ${Date.now()}`;
    await page.getByTestId('input-chat-message').fill(chatMessage);
    await page.getByTestId('button-send-chat').click();

    // Assert the message text appears in the chat thread
    await expect(page.getByText(chatMessage)).toBeVisible({ timeout: 10000 });
  });

});
