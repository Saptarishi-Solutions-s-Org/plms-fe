"use client";

import { useEffect, useState } from "react";

import GlobalLoader from "@/components/commoncomponents/globalloader";
import AdminReportsPage from "@/components/commoncomponents/reports/admin-reports-page";
import ExecutiveReportsPage from "@/components/commoncomponents/reports/executive-reports-page";
import ManagerReportsPage from "@/components/commoncomponents/reports/manager-reports-page";
import { type AuthUser, getUser, refreshSession } from "@/lib/auth";

const normalizeRole = (role?: string) => role?.trim().toLowerCase() ?? "";

export default function OrgReports() {
  const [user, setUser] = useState<AuthUser | null>(() => getUser());

  useEffect(() => {
    if (user) return;

    refreshSession().then((session) => {
      if (session) setUser(session.user);
    });
  }, [user]);

  if (!user) return <GlobalLoader />;

  const role = normalizeRole(user.role);

  if (role === "admin" || role === "organization admin") {
    return <AdminReportsPage />;
  }

  if (role === "manager" || role === "organization manager") {
    return <ManagerReportsPage />;
  }

  if (role === "executive" || role === "organization executive") {
    return <ExecutiveReportsPage />;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-gray-900">Reports</h1>
      <p className="mt-1 text-sm text-gray-500">
        You do not have access to this page.
      </p>
    </div>
  );
}
