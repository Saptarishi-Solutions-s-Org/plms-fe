"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, RefreshCw, Users, LayoutDashboard, Shield } from "lucide-react";
import { toast } from "sonner";

import GlobalLoader from "@/components/commoncomponents/globalloader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUser, type AuthUser } from "@/lib/auth";
import { subscribeRealtime } from "@/lib/socket";
import { getSystemAdminDashboard } from "@/services/systemAdmin";
import { SYSTEM_ADMIN_DASHBOARD_CHANGED } from "@/types/realtime";
import type { SystemAdminDashboardData } from "@/types/system-admin";

const PERMISSIONS = ["create", "view", "update", "delete", "import", "export"];

export default function SystemAdminDashboard() {
  const [data, setData] = useState<SystemAdminDashboardData | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [user] = useState<AuthUser | null>(() => getUser());
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const applyDashboardData = useCallback(
    (nextData: SystemAdminDashboardData) => {
      setData(nextData);
      setSelectedRole((currentRole) => {
        const roleStillExists = nextData.roles?.some(
          (role) => role.orgRoleId === currentRole,
        );

        return roleStillExists
          ? currentRole
          : nextData.roles?.[0]?.orgRoleId || "";
      });
    },
    [],
  );

  const loadDashboard = useCallback(
    async (mode: "initial" | "realtime" = "initial") => {
      if (mode === "realtime") {
        setIsRefreshing(true);
      }

      try {
        const finalData = await getSystemAdminDashboard();
        applyDashboardData(finalData as SystemAdminDashboardData);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard");
      } finally {
        if (mode === "initial") {
          setIsInitialLoading(false);
        } else {
          setIsRefreshing(false);
        }
      }
    },
    [applyDashboardData],
  );

  useEffect(() => {
    loadDashboard("initial");
  }, [loadDashboard]);

  useEffect(() => {
    return subscribeRealtime(SYSTEM_ADMIN_DASHBOARD_CHANGED, () => {
      loadDashboard("realtime");
    });
  }, [loadDashboard]);

  if (isInitialLoading || !data || !user) return <GlobalLoader />;

  const currentRole = data.roleMatrix.find(
    (role) => role.orgRoleId === selectedRole,
  );
  const modules = Object.keys(currentRole?.modules || {});

  return (
    <div className="space-y-6 p-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">System Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {user.name} | Org Code: {user.orgCode} ({user.orgName})
            </p>
          </div>
        </div>

        {isRefreshing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Refreshing
          </div>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-md transition">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Organizations</p>
              <p className="text-2xl font-semibold">
                {data.totalOrganizations}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-3 rounded-xl bg-green-100 text-green-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Users</p>
              <p className="text-2xl font-semibold">{data.totalUsers}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users per Org list */}
      <Card className="hover:shadow-md transition">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
            <Building2 className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg">Users per Organization</CardTitle>
        </CardHeader>
        <CardContent>
          {data.usersPerOrg?.length ? (
            <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
              <Table>
                <TableHeader className="bg-[#7677F41A] border-b border-gray-200">
                  <TableRow>
                    <TableHead>Organization Name</TableHead>
                    <TableHead className="text-right w-36">User Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.usersPerOrg.map((org) => (
                    <TableRow key={org.orgId}>
                      <TableCell className="font-medium">{org.name}</TableCell>
                      <TableCell className="text-right font-semibold">{org.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-4">
              No organizations available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Matrix Card (Merged with dropdown) */}
      <Card className="hover:shadow-md transition">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <Shield className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">Permissions Matrix</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Select Active Role:</span>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-64 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {data.roles.map((role) => (
                  <SelectItem key={role.orgRoleId} value={role.orgRoleId}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#7677F41A] border-b border-gray-200">
                <TableRow>
                  <TableHead className="text-xs sm:text-sm whitespace-nowrap">
                    Feature
                  </TableHead>
                  {PERMISSIONS.map((permission) => (
                    <TableHead
                      key={permission}
                      className="text-xs sm:text-sm whitespace-nowrap text-center capitalize"
                    >
                      {permission}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {modules.length ? (
                  modules.map((module) => (
                    <TableRow key={module}>
                      <TableCell className="text-xs sm:text-sm whitespace-nowrap font-medium">
                        {module}
                      </TableCell>

                      {PERMISSIONS.map((permission) => (
                        <TableCell key={permission} className="text-center">
                          <Checkbox
                            checked={Boolean(
                              currentRole?.modules[module]?.[permission] ||
                              false
                            )}
                            className="pointer-events-none"
                            tabIndex={-1}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={PERMISSIONS.length + 1}
                      className="text-center py-6"
                    >
                      No permissions configured
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
