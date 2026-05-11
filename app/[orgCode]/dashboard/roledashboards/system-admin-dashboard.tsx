"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "sonner";

import { Building2, Users } from "lucide-react";

import { getSystemAdminDashboard } from "@/services/systemAdmin";
import { getUser, refreshSession } from "@/lib/auth";

export default function SystemAdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [user, setUser] = useState<any>(null);

  async function fetchDashboard() {
    try {
      const finalData = await getSystemAdminDashboard();
      setData(finalData);
      setSelectedRole(finalData.roles?.[0]?.orgRoleId);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard");
    }
  }

  useEffect(() => {
    const currentUser = getUser();
    if (currentUser) {
      setUser(currentUser);
    } else {
      refreshSession().then((session) => {
        if (session) setUser(session.user);
      });
    }
    fetchDashboard();
  }, []);

  if (!data || !user) return <div className="p-6">Loading...</div>;

  const currentRole = data.roleMatrix.find(
    (r: any) => r.orgRoleId === selectedRole,
  );

  const modules = Object.keys(currentRole?.modules || {});
  const permissions = [
    "create",
    "view",
    "update",
    "delete",
    "import",
    "export",
  ];

  return (
    <div className="space-y-6 p-6">
      <section className="w-full rounded-xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 px-4 sm:px-6 py-6 sm:py-8 shadow-lg">
        <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-wide">
          Welcome back, {user.name}
        </h1>
        <p className="text-xs sm:text-sm text-blue-100 mt-1 tracking-wide">
          Here's what's happening in your Application today
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3 text-xs sm:text-sm font-medium text-white">
          {/* Org Code */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-green-400"></span>
            </span>
            <span>Org Code : {user.orgCode}</span>
          </div>
          <span className="hidden sm:block opacity-70">•</span>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-blue-400"></span>
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

      {/* USERS PER ORG */}
      <Card>
        <CardHeader>
          <CardTitle>Users per Organization</CardTitle>
        </CardHeader>
        <CardContent>
          {data.usersPerOrg?.length ? (
            <div className="space-y-3">
              {data.usersPerOrg.map((org: any) => (
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
              {data.roles.map((r: any) => (
                <SelectItem key={r.orgRoleId} value={r.orgRoleId}>
                  {r.name}
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
                  {permissions.map((p) => (
                    <TableHead
                      key={p}
                      className="text-xs sm:text-sm whitespace-nowrap text-center capitalize"
                    >
                      {p}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {modules.length ? (
                  modules.map((module: string) => (
                    <TableRow key={module}>
                      <TableCell className="text-xs sm:text-sm whitespace-nowrap capitalize font-medium">
                        {module}
                      </TableCell>

                      {permissions.map((perm) => (
                        <TableCell key={perm} className="text-center">
                          <Checkbox
                            checked={
                              currentRole?.modules[module]?.[perm] || false
                            }
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={permissions.length + 1}
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
