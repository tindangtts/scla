import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/navigation
const mockRedirect = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`);
});
vi.mock("next/navigation", () => ({
  redirect: (url: string) => mockRedirect(url),
}));

// Mock Supabase client
const mockGetUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
  })),
}));

// Mock DB
const mockDbFrom = vi.fn();
const mockDbWhere = vi.fn();
const mockDbSelect = vi.fn(() => ({ from: mockDbFrom }));
mockDbFrom.mockReturnValue({ where: mockDbWhere });

vi.mock("@/lib/db", () => ({
  db: {
    select: () => mockDbSelect(),
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a: unknown, b: unknown) => ({ field: a, value: b })),
}));

vi.mock("@workspace/db/schema", () => ({
  staffUsersTable: { email: "staff_email" },
}));

import { getCurrentUser, requireAuth, requireAdmin } from "../auth";

describe("auth helpers", () => {
  const mockUser = {
    id: "supabase-uid-1",
    email: "resident@test.com",
    aud: "authenticated",
  };

  const mockStaffUser = {
    id: "staff-1",
    email: "admin@test.com",
    name: "Admin User",
    role: "admin",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCurrentUser", () => {
    it("returns user when authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser } });

      const result = await getCurrentUser();
      expect(result).toEqual({ user: mockUser });
    });

    it("returns null user when not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      const result = await getCurrentUser();
      expect(result).toEqual({ user: null });
    });
  });

  describe("requireAuth", () => {
    it("returns user when authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser } });

      const user = await requireAuth();
      expect(user).toEqual(mockUser);
    });

    it("redirects to /login when not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      await expect(requireAuth()).rejects.toThrow("NEXT_REDIRECT:/login");
      expect(mockRedirect).toHaveBeenCalledWith("/login");
    });
  });

  describe("requireAdmin", () => {
    it("returns user and staff when user is staff", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { ...mockUser, email: "admin@test.com" } } });
      mockDbWhere.mockResolvedValue([mockStaffUser]);

      const result = await requireAdmin();
      expect(result).toEqual({
        user: { ...mockUser, email: "admin@test.com" },
        staff: mockStaffUser,
      });
    });

    it("redirects to /admin/login when no user", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT:/admin/login");
      expect(mockRedirect).toHaveBeenCalledWith("/admin/login");
    });

    it("redirects to /admin/login when user is not staff", async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser } });
      mockDbWhere.mockResolvedValue([]);

      await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT:/admin/login");
      expect(mockRedirect).toHaveBeenCalledWith("/admin/login");
    });
  });
});
