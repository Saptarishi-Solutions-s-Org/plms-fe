"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { api } from "@/lib/api";

import { connectSocket, disconnectSocket } from "@/lib/socket";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const [loggingOut, setLoggingOut] = useState(false);

  const fetchMe = async () => {
    if (loggingOut) {
      setLoading(false);

      return;
    }

    try {
      const response = await api("/odata/v4/auth/me", {
        method: "POST",
      });

      if (!response || response.unauthorized) {
        setUser(null);

        setLoading(false);

        return;
      }

      const userData = response?.user || response?.value?.user;

      if (!userData) {
        setUser(null);

        return;
      }

      setUser({
        ...userData,

        permissions:
          typeof userData.permissions === "string"
            ? JSON.parse(userData.permissions)
            : userData.permissions,
      });

      connectSocket();
    } catch (err) {
      setUser(null);

      if (window.location.pathname.includes("/dashboard")) {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const pathname = window.location.pathname;

    const isDashboardRoute = pathname.includes("/dashboard");

    if (!isDashboardRoute) {
      setLoading(false);

      return;
    }

    const timer = setTimeout(() => {
      fetchMe();
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api("/odata/v4/auth/login", {
      method: "POST",

      body: JSON.stringify({
        email,
        password,
      }),
    });

    const userData = response?.user || response?.value?.user;

    setUser({
      ...userData,

      permissions:
        typeof userData.permissions === "string"
          ? JSON.parse(userData.permissions)
          : userData.permissions,
    });

    connectSocket();

    return response;
  };

  const logout = async () => {
    setLoggingOut(true);

    try {
      await api("/odata/v4/auth/logout", {
        method: "POST",
      });
    } catch {}

    disconnectSocket();

    setUser(null);

    window.location.replace("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser: fetchMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
