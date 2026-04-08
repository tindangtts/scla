import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, UserUserType, setAuthTokenGetter } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isResident: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const storedToken = localStorage.getItem("scla_token");
    const storedUser = localStorage.getItem("scla_user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setAuthTokenGetter(() => storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("scla_token", newToken);
    localStorage.setItem("scla_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setAuthTokenGetter(() => newToken);
  };

  const logout = () => {
    localStorage.removeItem("scla_token");
    localStorage.removeItem("scla_user");
    setToken(null);
    setUser(null);
    setAuthTokenGetter(null);
    queryClient.clear();
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isResident: user?.userType === UserUserType.resident,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
