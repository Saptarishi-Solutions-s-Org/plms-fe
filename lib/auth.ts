"use client";

import { connectSocket, disconnectSocket } from "@/lib/socket";

export type AuthUser = {
  id: string;
  name: string;
  orgId: string;
  orgCode: string;
  orgName: string;
  roleId: string;
  role: string;
  permissions?: Record<string, string[]>;
  mustChangePassword?: boolean;
};

type AuthSession = {
  accessToken: string;
  user: AuthUser;
};

type AuthResponse = {
  accessToken?: string;
  user?: AuthUser;
  value?: {
    accessToken?: string;
    user?: AuthUser;
  };
};

let session: AuthSession | null = null;
let refreshPromise: Promise<AuthSession | null> | null = null;

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function normalizeAuthResponse(data: AuthResponse): AuthSession | null {
  const payload = data?.value || data;

  if (!payload?.accessToken || !payload?.user) {
    return null;
  }

  return {
    accessToken: payload.accessToken,
    user: payload.user,
  };
}

function applySession(nextSession: AuthSession) {
  session = nextSession;
  connectSocket(nextSession.accessToken);
  notifyAuthChanged();
  return nextSession;
}

export function getAccessToken() {
  return session?.accessToken || null;
}

export function getUser() {
  return session?.user || null;
}

export function getDashboardPath(user = session?.user) {
  return user?.orgCode ? `/${user.orgCode}/dashboard` : "/";
}

export function setSession(accessToken: string, user: AuthUser) {
  return applySession({ accessToken, user });
}

export function updateSessionUser(updates: Partial<AuthUser>) {
  if (!session) return null;

  session = {
    ...session,
    user: {
      ...session.user,
      ...updates,
    },
  };
  notifyAuthChanged();
  return session;
}

export async function validateCurrentAccessSession() {
  const token = getAccessToken();
  if (!token || !API_URL) return false;

  try {
    const res = await fetch(`${API_URL}/odata/v4/profile/getProfile()`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (res.status === 401) return false;
    return true;
  } catch {
    return true;
  }
}

export function clearSession() {
  session = null;
  disconnectSocket();
  notifyAuthChanged();
}

export async function refreshSession(force = false) {
  if (session && !force) return session;
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch(`${API_URL}/odata/v4/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })
    .then(async (res) => {
      if (!res.ok) return null;

      const data = normalizeAuthResponse(await res.json());
      if (!data) return null;

      return applySession(data);
    })
    .catch(() => null)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export async function logoutSession() {
  try {
    await fetch(`${API_URL}/odata/v4/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
  } finally {
    clearSession();
  }
}

export function redirectToLogin() {
  clearSession();

  if (typeof window !== "undefined" && window.location.pathname !== "/") {
    window.location.replace("/");
  }
}

function notifyAuthChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("LMA-auth-changed"));
}
