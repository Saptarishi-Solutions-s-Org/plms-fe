"use client"

import { useEffect, useState } from "react"

import SystemAdminDashboard from "./roledashboards/system-admin-dashboard"
import OrganizationAdminDashboard from "./roledashboards/organization-admin-dashboard"

function DefaultDashboard() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div>Dashboard</div>
    </div>
  )
}

const ROLE_DASHBOARD_MAP: Record<string, any> = {
  "SYSTEM ADMIN": SystemAdminDashboard,
  "ADMIN" : OrganizationAdminDashboard
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) setUser(JSON.parse(stored))
  }, [])

  if (!user) return null

  const role = user.role?.toUpperCase().trim()

  const DashboardComponent =
    ROLE_DASHBOARD_MAP[role] || DefaultDashboard

  return <DashboardComponent />
}