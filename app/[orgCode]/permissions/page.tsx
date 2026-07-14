"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import GlobalLoader from "@/components/commoncomponents/globalloader";
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
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {  RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { getOrganizationAdminPermissions } from "@/services/organizationAdmin";
import type {
  OrganizationAdminPermissionsResponse,
  OrganizationPermission,
  OrganizationRoleMatrix,
} from "@/types/organization";

export default function PermissionsPage() {
  const [data, setData] = useState<OrganizationAdminPermissionsResponse | null>(
    null,
  );
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  const loadPermissions = useCallback(
    async (mode: "initial" | "realtime" = "initial") => {
      if (mode === "realtime") {
        setIsRefreshing(true);
      }

      try {
        const res = await getOrganizationAdminPermissions();
        setData(res);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load permissions");
      } finally {
        if (mode === "initial") {
          setIsInitialLoading(false);
        } else {
          setIsRefreshing(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    loadPermissions("initial");
  }, [loadPermissions]);

  const permissions = useMemo(
    () => data?.permissions || [],
    [data?.permissions],
  );

  const roleMatrix = useMemo<OrganizationRoleMatrix>(() => {
    return permissions.reduce<OrganizationRoleMatrix>(
      (matrix, permission: OrganizationPermission) => {
        if (!matrix[permission.role]) matrix[permission.role] = {};
        if (!matrix[permission.role][permission.module]) {
          matrix[permission.role][permission.module] = {};
        }
        matrix[permission.role][permission.module][permission.permission] =
          permission.access;
        return matrix;
      },
      {},
    );
  }, [permissions]);

  const rolesList = useMemo(() => Object.keys(roleMatrix), [roleMatrix]);

  useEffect(() => {
    if (rolesList.length && !selectedRole) {
      setSelectedRole(rolesList[0]);
    }
  }, [rolesList, selectedRole]);

  const currentRole = roleMatrix[selectedRole] || {};
  const moduleKeys = Object.keys(currentRole);

  const permissionList = [
    "create",
    "view",
    "update",
    "delete",
    "import",
    "export",
  ];

  const format = (text: string) =>
    text ? text.charAt(0).toUpperCase() + text.slice(1) : "";

  if (isInitialLoading) return <GlobalLoader />;
  if (!data) return <div className="p-6">No data</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Permissions</h1>
            <p className="text-sm text-muted-foreground">
              View role based access for each module
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

      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              {rolesList.map((r) => (
                <SelectItem key={r} value={r}>
                  {format(r)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#7677F41A] border-b border-gray-200">
                <TableRow>
                  <TableHead>Feature</TableHead>

                  {permissionList.map((p) => (
                    <TableHead key={p} className="text-center capitalize">
                      {p}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {moduleKeys.length ? (
                  moduleKeys.map((module) => (
                    <TableRow key={module}>
                      <TableCell className="capitalize font-medium">
                        {format(module)}
                      </TableCell>

                      {permissionList.map((perm) => (
                        <TableCell key={perm} className="text-center">
                          <Checkbox
                            checked={currentRole?.[module]?.[perm] || false}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={permissionList.length + 1}
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
