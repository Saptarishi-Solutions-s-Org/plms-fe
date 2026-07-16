"use client";

import { useEffect, useState } from "react";

import { type AuthUser, getUser } from "@/lib/auth";

export function useCurrentUser() {
  const [user, setUser] = useState<AuthUser | null>(() => getUser());

  useEffect(() => {
    const syncUser = () => setUser(getUser());

    window.addEventListener("LMA-auth-changed", syncUser);
    return () => window.removeEventListener("LMA-auth-changed", syncUser);
  }, []);

  return user;
}
