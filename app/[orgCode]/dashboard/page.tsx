"use client"

import { useEffect, useState } from "react"
import type { ComponentType } from "react"
import { AuthUser, getUser, refreshSession } from "@/lib/auth"

import SystemAdminDashboard from "./roledashboards/system-admin-dashboard"
import OrganizationAdminDashboard from "./roledashboards/organization-admin-dashboard"
import ManagerDashboard from "./roledashboards/org-manager-dashboard"
import ExecutiveDashboard from "./roledashboards/org-executive-dashboard"

function DefaultDashboard() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div>Dashboard</div>
    </div>
  )
}

const ROLE_DASHBOARD_MAP: Record<string, ComponentType> = {
  "SYSTEM ADMIN": SystemAdminDashboard,
  "ADMIN" : OrganizationAdminDashboard,
  "MANAGER": ManagerDashboard,
  "EXECUTIVE": ExecutiveDashboard,
}

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(() => getUser())

  useEffect(() => {
    if (user) return

    refreshSession().then((session) => {
      if (session) setUser(session.user)
    })
  }, [user])

  if (!user) return null

  const role = user.role?.toUpperCase().trim()

  const DashboardComponent =
    ROLE_DASHBOARD_MAP[role] || DefaultDashboard

  return <DashboardComponent />
}
