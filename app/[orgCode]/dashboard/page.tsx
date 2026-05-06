"use client";

import { useAuth } from "@/context/AuthContext";

import SystemAdminDashboard from "./roledashboards/system-admin-dashboard";

function DefaultDashboard() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div>Dashboard</div>
    </div>
  );
}

const ROLE_DASHBOARD_MAP: Record<string, any> = {
  "SYSTEM ADMIN": SystemAdminDashboard,
};

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return null;

  const role = user.role?.toUpperCase().trim();

  const DashboardComponent = ROLE_DASHBOARD_MAP[role] || DefaultDashboard;

  return <DashboardComponent />;
}
