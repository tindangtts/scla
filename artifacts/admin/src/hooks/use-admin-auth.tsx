import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiRequest, getToken, setToken, clearToken } from "@/lib/api";

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminAuthContextType {
  staff: StaffUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [staff, setStaff] = useState<StaffUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { setIsLoading(false); return; }
    apiRequest<StaffUser>("GET", "/admin/auth/me")
      .then(setStaff)
      .catch(() => clearToken())
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiRequest<{ token: string; staff: StaffUser }>(
      "POST", "/admin/auth/login", { email, password }
    );
    setToken(res.token);
    setStaff(res.staff);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setStaff(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ staff, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be inside AdminAuthProvider");
  return ctx;
}
