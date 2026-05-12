"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import GlobalLoader from "@/components/commoncomponents/globalloader";
import { Button } from "@/components/ui/button";
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

import { Building2, Plus, MoreHorizontal, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { getOrganizationByCode } from "@/services/organization";
import { getAdminUsers } from "@/services/user";
import UserModal from "@/components/commoncomponents/user/userModal";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { subscribeRealtime } from "@/lib/socket";
import {
  ORGANIZATION_DETAIL_CHANGED,
  type OrganizationDetailChangedPayload,
} from "@/types/realtime";
import type {
  OrganizationAdminUser,
  OrganizationDetailResponse,
  OrganizationPermission,
  OrganizationRoleMatrix,
} from "@/types/organization";
import { toISTDate } from "@/lib/time";

export default function OrganizationDetailsPage() {
  const { code } = useParams();
  const orgCode = Array.isArray(code) ? code[0] : code;

  const [data, setData] = useState<OrganizationDetailResponse | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  const [users, setUsers] = useState<OrganizationAdminUser[]>([]);
  const [openUser, setOpenUser] = useState(false);
  const [selectedUser, setSelectedUser] =
    useState<OrganizationAdminUser | null>(null);

  const fetchUsers = useCallback(async (orgId: string) => {
    try {
      const res = await getAdminUsers(orgId);
      setUsers(res);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadOrganization = useCallback(
    async (mode: "initial" | "realtime" = "initial") => {
      if (!orgCode) return;
      if (mode === "realtime") {
        setIsRefreshing(true);
      }

      try {
        const res = await getOrganizationByCode(orgCode);
        setData(res);
        if (res.organization?.id) {
          await fetchUsers(res.organization.id);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load organization");
      } finally {
        if (mode === "initial") {
          setIsInitialLoading(false);
        } else {
          setIsRefreshing(false);
        }
      }
    },
    [fetchUsers, orgCode],
  );

  useEffect(() => {
    loadOrganization("initial");
  }, [loadOrganization]);

  useEffect(() => {
    return subscribeRealtime<OrganizationDetailChangedPayload>(
      ORGANIZATION_DETAIL_CHANGED,
      (event) => {
        const payload = event.data;
        const matchesOrgId =
          payload?.orgId && payload.orgId === data?.organization?.id;
        const matchesOrgCode = payload?.orgCode && payload.orgCode === orgCode;

        if (matchesOrgId || matchesOrgCode) {
          loadOrganization("realtime");
        }
      },
    );
  }, [data?.organization?.id, loadOrganization, orgCode]);

  const organization = data?.organization;
  const roles = data?.roles || [];
  const modules = data?.modules || [];
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

  const display = (value: unknown) => {
    return value ? String(value) : "No Data";
  };

  if (isInitialLoading) return <GlobalLoader />;
  if (!data || !organization) return <div className="p-6">No data</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-100">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold">{organization.name}</h1>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                {display(organization.code)}
              </p>

              <span
                className={`h-2.5 w-2.5 rounded-full animate-pulse ${
                  organization.is_active ? "bg-green-500" : "bg-red-500"
                }`}
              />
            </div>
          </div>
        </div>

        {isRefreshing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Refreshing
          </div>
        )}

        <Button
          size="lg"
          className="w-full sm:w-auto rounded-full px-6 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => {
            setSelectedUser(null);
            setOpenUser(true);
          }}
        >
          <Plus className="h-5 w-5 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <p>
            <b>Email :</b> {display(organization.email)}
          </p>
          <p>
            <b>Phone :</b> {display(organization.phone)}
          </p>
          <p>
            <b>Address :</b> {display(organization.address)}
          </p>
          <p>
            <b>Trial :</b> {display(organization.trial)}
          </p>
          <p>
            <b>Start Date :</b> {display(organization.start_date)}
          </p>
          <p>
            <b>End Date :</b> {display(organization.end_date)}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle>Organization Roles</CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            {roles.map((r) => (
              <div
                key={r.id}
                className="px-3 py-2 rounded-md bg-gray-50 text-sm font-medium"
              >
                {format(r.name)}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle>Organization Modules</CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            {modules.map((m) => (
              <div
                key={m.name}
                className="px-3 py-2 rounded-md bg-gray-50 text-sm font-medium"
              >
                {format(m.name)}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Permissions</CardTitle>
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

      <Card>
        <CardHeader>
          <CardTitle>Admin Users</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#7677F41A] border-b border-gray-200">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>DOB</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {users.length ? (
                  users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>

                      <TableCell>{u.email}</TableCell>

                      <TableCell>{u.phone || "-"}</TableCell>

                      <TableCell>{u.gender || "-"}</TableCell>

                      <TableCell>{toISTDate(u.dob) || "-"}</TableCell>

                      <TableCell>
                        {u.state || "-"}, {u.country || "-"}
                      </TableCell>

                      <TableCell>
                        {u.is_active ? "Active" : "Inactive"}
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(u);
                                setOpenUser(true);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <UserModal
        open={openUser}
        setOpen={setOpenUser}
        user={selectedUser}
        onSuccess={() => loadOrganization("realtime")}
        organizationId={organization.id || ""}
      />
    </div>
  );
}
