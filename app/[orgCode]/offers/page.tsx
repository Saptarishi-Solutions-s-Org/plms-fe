"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";

import {
  AuthUser,
  getUser,
  refreshSession,
} from "@/lib/auth";

import OrgAdminOffersPage from "./roleofferspage/org-admin-offerspage";
import OrgManagerOffersPage from "./roleofferspage/org-manager-offerspage";
import OrgExecutiveOffersPage from "./roleofferspage/org-executive-offerpage"
function DefaultOffersPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">
        Offers
      </h1>

      <p className="text-gray-500">
        You do not have access to this page.
      </p>
    </div>
  );
}

const ROLE_OFFERS_MAP: Record<
  string,
  ComponentType
> = {
  ADMIN: OrgAdminOffersPage,
  MANAGER: OrgManagerOffersPage,
  EXECUTIVE: OrgExecutiveOffersPage,
};

export default function OffersPage() {
  const [user, setUser] =
    useState<AuthUser | null>(() =>
      getUser()
    );

  useEffect(() => {
    if (user) return;

    refreshSession().then(
      (session) => {
        if (session) {
          setUser(session.user);
        }
      }
    );
  }, [user]);

  if (!user) return null;

  const role =
    user.role?.toUpperCase().trim();

  const OffersComponent =
    ROLE_OFFERS_MAP[role] ||
    DefaultOffersPage;

  return <OffersComponent />;
}