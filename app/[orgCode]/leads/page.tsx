"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";

import { AuthUser, getUser, refreshSession } from "@/lib/auth";

import OrgAdminManagerLeadsPage from "./roleleadspage/manager-leads-page";
import OrgExecutiveLeadsPage from "./roleleadspage/executive-leads-page";

function DefaultLeadsPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Leads</h1>
      <p className="text-gray-500">You do not have access to this page.</p>
    </div>
  );
}

const ROLE_LEADS_MAP: Record<string, ComponentType> = {
  ADMIN: OrgAdminManagerLeadsPage,
  MANAGER: OrgAdminManagerLeadsPage,
  EXECUTIVE: OrgExecutiveLeadsPage,
};

export default function LeadsPage() {
  const [user, setUser] = useState<AuthUser | null>(() => getUser());

  useEffect(() => {
    if (user) return;

    refreshSession().then((session) => {
      if (session) setUser(session.user);
    });
  }, [user]);

  if (!user) return null;

  const role = user.role?.toUpperCase().trim();
  const LeadsComponent = ROLE_LEADS_MAP[role] || DefaultLeadsPage;

  return <LeadsComponent />;
}
 