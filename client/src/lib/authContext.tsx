import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { apiClient } from "./apiClient";

export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  is_admin: boolean;
  status: string;
  effective_time: string;
  expired_time: string;
  must_change_password?: boolean;
}

interface AuthContextType {
  user: User | null;
  daysUntilExpiry: number | null;
  loading: boolean;
  login: (user: User, daysUntilExpiry: number) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [daysUntilExpiry, setDaysUntilExpiry] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const data = await apiClient("/auth/me");
      setUser(data.user);
      setDaysUntilExpiry(data.days_until_expiry);
    } catch (error) {
      setUser(null);
      setDaysUntilExpiry(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (userData: User, expiryDays: number) => {
    setUser(userData);
    setDaysUntilExpiry(expiryDays);
  };

  const logout = async () => {
    try {
      await apiClient("/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      setDaysUntilExpiry(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, daysUntilExpiry, loading, login, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
