"use client";

import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import {
  AuthUser,
  clearSession,
  getUser,
  logoutSession,
  setSession,
} from "@/lib/auth";
import { connectSocket } from "@/lib/socket";

type AuthContextValue = {
  user: AuthUser | null;
  login: (data: { accessToken: string; user: AuthUser }) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getUser());

  useEffect(() => {
    const syncUser = () => setUser(getUser());
    window.addEventListener("plms-auth-changed", syncUser);
    return () => window.removeEventListener("plms-auth-changed", syncUser);
  }, []);

  const login = (data: { accessToken: string; user: AuthUser }) => {
    setSession(data.accessToken, data.user);
    setUser(data.user);
    connectSocket(data.accessToken);
  };

  const logout = async () => {
    await logoutSession();
    clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
