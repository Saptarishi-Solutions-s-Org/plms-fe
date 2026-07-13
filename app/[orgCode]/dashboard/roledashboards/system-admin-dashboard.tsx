"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, RefreshCw, Users } from "lucide-react";
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
      <section className="w-full rounded-xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 px-4 sm:px-6 py-6 sm:py-8 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-wide">
              Welcome back, {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 tracking-wide">
              Here&apos;s what&apos;s happening in your Application today
            </p>
          </div>

          {isRefreshing && (
            <div className="flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Refreshing
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3 text-xs sm:text-sm font-medium text-white">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-green-400" />
            </span>
            <span>Org Code : {user.orgCode}</span>
          </div>
          <span className="hidden sm:block opacity-70">/</span>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-blue-400" />
            </span>
            <span className="capitalize">Org Name : {user.orgName}</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-lg transition">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-3 rounded-xl bg-blue-100">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Organizations</p>
              <p className="text-2xl font-semibold">
                {data.totalOrganizations}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-3 rounded-xl bg-green-100">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Users</p>
              <p className="text-2xl font-semibold">{data.totalUsers}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users per Organization</CardTitle>
        </CardHeader>
        <CardContent>
          {data.usersPerOrg?.length ? (
            <div className="space-y-3">
              {data.usersPerOrg.map((org) => (
                <div
                  key={org.orgId}
                  className="flex justify-between border-b pb-2 text-sm"
                >
                  <span>{org.name}</span>
                  <span className="font-medium">{org.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-4">
              No organizations available
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Select Active Role</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-64">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permissions Matrix</CardTitle>
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
                            checked={
                              currentRole?.modules[module]?.[permission] ||
                              false
                            }
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
