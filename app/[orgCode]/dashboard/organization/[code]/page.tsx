"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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

import { Building2, Plus, MoreHorizontal } from "lucide-react";
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

export default function OrganizationDetailsPage() {
  const { code } = useParams();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState("");

  const [users, setUsers] = useState<any[]>([]);
  const [openUser, setOpenUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const fetchUsers = async (orgId: string) => {
    try {
      const res = await getAdminUsers(orgId);
      setUsers(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getOrganizationByCode(code as string);
        setData(res);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load organization");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [code]);

  useEffect(() => {
    if (data?.organization?.id) {
      fetchUsers(data.organization.id);
    }
  }, [data]);

  const organization = data?.organization || {};
  const roles = data?.roles || [];
  const modules = data?.modules || [];
  const permissions = data?.permissions || [];

  const roleMatrix: any = {};

  permissions.forEach((p: any) => {
    if (!roleMatrix[p.role]) roleMatrix[p.role] = {};
    if (!roleMatrix[p.role][p.module]) roleMatrix[p.role][p.module] = {};
    roleMatrix[p.role][p.module][p.permission] = p.access;
  });

  const rolesList = Object.keys(roleMatrix);

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

  const display = (value: any) => {
    return value ? value : "No Data";
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">No data</div>;

  return (
    <div className="p-6 space-y-6">
      {/* 🔥 YOUR UI FULLY UNTOUCHED */}

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
            {roles.map((r: any) => (
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
            {modules.map((m: any) => (
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

                      <TableCell>
                        {u.dob ? new Date(u.dob).toLocaleDateString() : "-"}
                      </TableCell>

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
        onSuccess={() => fetchUsers(organization.id)}
        organizationId={organization.id}
      />
    </div>
  );
}
