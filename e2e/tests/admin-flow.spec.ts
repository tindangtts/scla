import { test, expect } from "@playwright/test";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "../helpers/auth";

test.describe("Admin Portal", () => {
  test("admin can log in and see dashboard", async ({ page }) => {
    // Admin has a separate login page
    await page.goto("/admin/login");
    await page.locator('input[name="email"]').fill(ADMIN_EMAIL);
    await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);
    await page.locator('button[type="submit"]').click();

    // Successful admin login lands on /admin/dashboard
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 15000 });

    // Dashboard shows KPI cards
    await expect(page.getByText(/residents/i).first()).toBeVisible();
  });

  test("admin sidebar links all resolve (no 404)", async ({ page }) => {
    // Sign in first via resident helper (we reuse the flow) — then go admin
    await page.goto("/admin/login");
    await page.locator('input[name="email"]').fill(ADMIN_EMAIL);
    await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 15000 });

    const adminRoutes = [
      "/admin/dashboard",
      "/admin/users",
      "/admin/upgrade-requests",
      "/admin/tickets",
      "/admin/facilities",
      "/admin/content",
      "/admin/staff",
      "/admin/audit-logs",
      "/admin/wallets",
    ];

    for (const route of adminRoutes) {
      const res = await page.request.get(route);
      expect(res.status(), `${route} should not 404`).toBeLessThan(400);
    }
  });

  test("/admin/login renders without redirect loop", async ({ page }) => {
    // This was broken before Phase 32 route group fix — admin layout
    // ran requireAdmin() and redirected unauthenticated users back to
    // /admin/login, causing an infinite redirect loop.
    const res = await page.goto("/admin/login");
    expect(res?.status()).toBe(200);
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

});
