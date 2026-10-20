import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface AdminUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
  status: string;
}

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AdminUser>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => { throw new Error("AuthProvider not mounted"); },
  signOut: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('iswcdn_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get<{ user: AdminUser }>('/auth/me');
      if (res && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
        localStorage.removeItem('iswcdn_token');
      }
    } catch {
      setUser(null);
      localStorage.removeItem('iswcdn_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string): Promise<AdminUser> => {
    const res = await api.post<{ token: string; user: AdminUser }>('/auth/login', {
      email,
      password,
    });

    if (res.token) {
      localStorage.setItem('iswcdn_token', res.token);
    }
    setUser(res.user);
    return res.user;
  };

  const signOut = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors and clean up local state
    } finally {
      localStorage.removeItem('iswcdn_token');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
