"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import GlobalLoader from "@/components/commoncomponents/globalloader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { ActionConfirmationDialog } from "@/components/commoncomponents/action-confirmation-dialog";

import {
  Building2,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  X,
  Award,
  LayoutGrid,
  Ban,
} from "lucide-react";
import { toast } from "sonner";

import { getOrganizationByCode } from "@/services/organization";

const BLOCKED_PERMISSIONS: Record<string, Record<string, string[]>> = {
  Admin: {
    lead: ["import", "delete"],
    "lead activity": ["import", "export", "delete"],
    offers: ["import", "delete"],
    permission: ["create", "import", "export", "delete"],
    reports: ["create", "update", "import", "delete"],
    user: ["import", "delete"],
    segmentation: ["create", "update", "delete", "import", "export"],
  },
  Manager: {
    lead: ["delete"],
    "lead activity": ["import", "export", "delete"],
    offers: ["import", "delete"],
    permission: ["create", "view", "update", "delete", "import", "export"],
    reports: ["create", "update", "import", "delete"],
    user: ["import", "delete"],
    segmentation: ["import"],
  },
  Executive: {
    lead: ["delete"],
    "lead activity": ["import", "export", "delete"],
    offers: ["create", "update", "import", "delete"],
    permission: ["create", "view", "update", "delete", "import", "export"],
    reports: ["create", "update", "import", "delete"],
    user: ["create", "view", "update", "delete", "import", "export"],
    segmentation: ["import"],
  },
};
import { updateOrganizationAdminPermissions } from "@/services/systemAdmin";
import { getAdminUsers } from "@/services/user";
import UserModal from "@/components/commoncomponents/user/userModal";
import { toggleSegmentFilter } from "@/services/segments";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { subscribeRealtime } from "@/lib/socket";
import {
  ORGANIZATION_DETAIL_CHANGED,
  SYSTEM_ADMIN_DASHBOARD_CHANGED,
  type OrganizationDetailChangedPayload,
} from "@/types/realtime";
import type {
  OrganizationAdminUser,
  OrganizationDetailResponse,
  OrganizationPermission,
  OrganizationPermissionMatrix,
  OrganizationRoleMatrix,
} from "@/types/organization";
import type { UpdateAdminPermission } from "@/types/system-admin";
import { toISTDate } from "@/lib/time";
import { getUser, type AuthUser } from "@/lib/auth";

const normalize = (value?: string | null) => value?.toLowerCase().trim() || "";

export default function OrganizationDetailsPage() {
  const { code } = useParams();
  const orgCode = Array.isArray(code) ? code[0] : code;

  const [data, setData] = useState<OrganizationDetailResponse | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);
  const [showPermissionConfirmation, setShowPermissionConfirmation] =
    useState(false);
  const [pendingAdminPermissionChanges, setPendingAdminPermissionChanges] =
    useState<UpdateAdminPermission[]>([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [permissionDraft, setPermissionDraft] = useState<
    Record<string, boolean>
  >({});
  const [user, setUser] = useState<AuthUser | null>(() => getUser());

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

  const handleToggleSegmentFilter = async (filterId: string, currentStatus: boolean) => {
    try {
      toast.loading("Updating filter status...");
      await toggleSegmentFilter(filterId, !currentStatus);
      toast.dismiss();
      toast.success("Segmentation filter updated successfully!");
      loadOrganization("realtime");
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to update segmentation filter status.");
    }
  };

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
    const handleAuthChanged = () => {
      setUser(getUser());
    };

    window.addEventListener("LMA-auth-changed", handleAuthChanged);
    return () =>
      window.removeEventListener("LMA-auth-changed", handleAuthChanged);
  }, []);

  useEffect(() => {
    const unsub1 = subscribeRealtime<OrganizationDetailChangedPayload>(
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
    
    const unsub2 = subscribeRealtime(
      SYSTEM_ADMIN_DASHBOARD_CHANGED,
      (event) => {
        const payload = event.data as any;
        const matchesOrgId = payload?.orgId && payload.orgId === data?.organization?.id;
        if (matchesOrgId || !payload?.orgId) {
          loadOrganization("realtime");
        }
      }
    );

    return () => {
      unsub1();
      unsub2();
    };
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

  const permissionMatrix = useMemo<OrganizationPermissionMatrix>(() => {
    return permissions.reduce<OrganizationPermissionMatrix>(
      (matrix, permission: OrganizationPermission) => {
        if (!matrix[permission.role]) matrix[permission.role] = {};
        if (!matrix[permission.role][permission.module]) {
          matrix[permission.role][permission.module] = {};
        }
        matrix[permission.role][permission.module][permission.permission] =
          permission;
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
  const currentRolePermissions = permissionMatrix[selectedRole] || {};
  const activeModuleNames = useMemo(
    () => new Set(modules.map((m) => m.name.toLowerCase().trim())),
    [modules],
  );
  const moduleKeys = useMemo(() => {
    return Object.keys(currentRole).filter((m) =>
      activeModuleNames.has(m.toLowerCase().trim()),
    );
  }, [currentRole, activeModuleNames]);
  const selectedOrganizationRole = roles.find(
    (role) => normalize(role.name) === normalize(selectedRole),
  );
  const selectedOrganizationRoleId =
    selectedOrganizationRole?.id ||
    permissions.find((permission) => normalize(permission.role) === "admin")
      ?.orgRoleId;
  const ROLE_UPDATE_PERMISSIONS = ["*", "update", "edit", "updation"];
  const permissionModulePermissions = Object.entries(user?.permissions || {})
    .filter(([module]) => ["permission", "permissions"].includes(normalize(module)))
    .flatMap(([, perms]) => perms ?? []);
  const canUpdateRoles =
    normalize(user?.role) === "system admin" &&
    permissionModulePermissions.some((permission) =>
      ROLE_UPDATE_PERMISSIONS.includes(normalize(permission)),
    );
  const selectedRoleIsAdmin = normalize(selectedRole) === "admin";
  const canEditAdminPermissions = canUpdateRoles && selectedRoleIsAdmin;

  const permissionList = [
    "create",
    "view",
    "update",
    "delete",
    "import",
    "export",
  ];

  const display = (value: unknown) => {
    return value ? String(value) : "No Data";
  };

  const getPermissionId = useCallback((permission?: OrganizationPermission) => {
    const rawId = permission?.orgRoleModulePermissionId;
    if (rawId === null || rawId === undefined) return undefined;
    const idStr = String(rawId).trim();
    return idStr ? idStr : undefined;
  }, []);

  const resetPermissionDraft = useCallback(() => {
    const draft = permissions.reduce<Record<string, boolean>>(
      (nextDraft, permission) => {
        const permissionId = getPermissionId(permission);

        if (normalize(permission.role) === "admin" && permissionId) {
          nextDraft[permissionId] = permission.access;
        }

        return nextDraft;
      },
      {},
    );

    setPermissionDraft(draft);
  }, [getPermissionId, permissions]);

  useEffect(() => {
    resetPermissionDraft();
  }, [resetPermissionDraft]);

  useEffect(() => {
    setIsEditingPermissions(false);
    setShowPermissionConfirmation(false);
    setPendingAdminPermissionChanges([]);
    resetPermissionDraft();
  }, [resetPermissionDraft, selectedRole]);

  const openPermissionEditor = () => {
    setPendingAdminPermissionChanges([]);
    setShowPermissionConfirmation(false);
    setIsEditingPermissions(true);
    resetPermissionDraft();
  };

  const closePermissionEditor = () => {
    if (isSavingPermissions) return;
    setIsEditingPermissions(false);
    setShowPermissionConfirmation(false);
    setPendingAdminPermissionChanges([]);
    resetPermissionDraft();
  };

  const handlePermissionChange = (
    permission: OrganizationPermission,
    checked: boolean,
  ) => {
    const permissionId = getPermissionId(permission);
    if (!permissionId) return;

    setPermissionDraft((current) => ({
      ...current,
      [permissionId]: checked,
    }));
  };

  const handleSavePermissions = () => {
    if (!organization?.id || !selectedOrganizationRoleId) {
      toast.error("Admin organization role id is missing");
      return;
    }

    const changedPermissions = permissions
      .filter((permission) => {
        const permissionId = getPermissionId(permission);
        return (
          normalize(permission.role) === "admin" &&
          permissionId &&
          permissionDraft[permissionId] !== permission.access
        );
      })
      .map((permission) => {
        const permissionId = getPermissionId(permission);
        return {
          orgRoleModulePermissionId: permissionId as string,
          access: permissionDraft[permissionId as string],
        };
      });

    if (!changedPermissions.length) {
      closePermissionEditor();
      return;
    }

    setPendingAdminPermissionChanges(changedPermissions);
    setShowPermissionConfirmation(true);
  };

  const confirmSavePermissions = async () => {
    if (!organization?.id || !selectedOrganizationRoleId) {
      toast.error("Admin organization role id is missing");
      return;
    }

    setIsSavingPermissions(true);

    try {
      const result = await updateOrganizationAdminPermissions({
        organizationId: organization.id,
        orgRoleId: selectedOrganizationRoleId,
        permissions: pendingAdminPermissionChanges,
      });

      toast.success(
        result.updatedCount > 0
          ? "Admin permissions updated"
          : "No permissions changed",
      );
      setShowPermissionConfirmation(false);
      setPendingAdminPermissionChanges([]);
      setIsEditingPermissions(false);
      await loadOrganization("realtime");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update admin permissions");
    } finally {
      setIsSavingPermissions(false);
    }
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organization Roles */}
        <Card className="hover:shadow-md transition">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <Award className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">Organization Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-[#7677F41A] border-b border-gray-200">
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead className="text-center w-24">Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    const rolesToRender = data?.allRoles?.length ? data.allRoles : roles;
                    return rolesToRender.length ? (
                      rolesToRender.map((r) => {
                        const isActive = data?.allRoles?.length
                          ? roles.some((activeRole) => activeRole.name === r.name)
                          : true;
                        return (
                          <TableRow key={r.id}>
                            <TableCell className="font-medium capitalize">{r.name}</TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={isActive}
                                className="pointer-events-none"
                                tabIndex={-1}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-4">
                          No roles configured
                        </TableCell>
                      </TableRow>
                    );
                  })()}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Organization Modules */}
        <Card className="hover:shadow-md transition">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">Organization Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-[#7677F41A] border-b border-gray-200">
                  <TableRow>
                    <TableHead>Module Name</TableHead>
                    <TableHead className="text-center w-24">Enabled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    const modulesToRender = data?.allModules?.length ? data.allModules : modules;
                    return modulesToRender.length ? (
                      modulesToRender.map((m) => {
                        const isEnabled = data?.allModules?.length
                          ? modules.some((activeModule) => activeModule.name === m.name)
                          : true;
                        const key = m.name;
                        return (
                          <TableRow key={key}>
                            <TableCell className="font-medium capitalize">{m.name}</TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={isEnabled}
                                className="pointer-events-none"
                                tabIndex={-1}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-4">
                          No modules enabled
                        </TableCell>
                      </TableRow>
                    );
                  })()}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Organization Permissions</CardTitle>

          {canEditAdminPermissions && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openPermissionEditor}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              {rolesList.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {canEditAdminPermissions && (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <Ban className="h-4.5 w-4.5 text-amber-600 shrink-0" />
              <span>
                Note: Options marked with a 🚫 symbol are system-critical restrictions and cannot be modified.
              </span>
            </div>
          )}

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
                        {module}
                      </TableCell>

                      {permissionList.map((perm) => {
                        const permission =
                          currentRolePermissions[module]?.[perm];
                        const permissionId = getPermissionId(permission);
                        const checked = permissionId
                          ? (permission?.access ?? false)
                          : currentRole?.[module]?.[perm] || false;

                        const isBlocked =
                          BLOCKED_PERMISSIONS[selectedRole]?.[
                            module.toLowerCase()
                          ]?.includes(perm);

                        if (isBlocked) {
                          return (
                            <TableCell key={perm} className="text-center py-2.5">
                              <Ban className="h-4 w-4 text-red-400 mx-auto" />
                            </TableCell>
                          );
                        }

                        return (
                          <TableCell key={perm} className="text-center">
                            <Checkbox
                              checked={checked}
                              className="pointer-events-none"
                              tabIndex={-1}
                            />
                          </TableCell>
                        );
                      })}
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

      <Dialog
        open={isEditingPermissions}
        onOpenChange={(open) => {
          if (!open) closePermissionEditor();
        }}
      >
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Update Admin Permissions</DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <Ban className="h-4.5 w-4.5 text-amber-600 shrink-0" />
            <span>
              Note: Options marked with a 🚫 symbol are system-critical restrictions and cannot be modified.
            </span>
          </div>

          <div className="max-h-[65vh] overflow-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <Table>
              <TableHeader className="bg-[#7677F41A] border-b border-gray-200">
                <TableRow>
                  <TableHead className="text-xs sm:text-sm whitespace-nowrap">
                    Feature
                  </TableHead>
                  {permissionList.map((permission) => (
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
                {moduleKeys.length ? (
                  moduleKeys.map((module) => (
                    <TableRow key={module}>
                      <TableCell className="capitalize font-medium">
                        {module}
                      </TableCell>

                      {permissionList.map((perm) => {
                        const permission =
                          currentRolePermissions[module]?.[perm];
                        const permissionId = permission
                          ? getPermissionId(permission)
                          : undefined;
                        const checked = permissionId
                          ? (permissionDraft[permissionId] ??
                            permission?.access ??
                            false)
                          : currentRole?.[module]?.[perm] || false;

                        const isBlocked =
                          BLOCKED_PERMISSIONS[selectedRole]?.[
                            module.toLowerCase()
                          ]?.includes(perm);

                        if (isBlocked) {
                          return (
                            <TableCell key={perm} className="text-center py-2.5">
                              <Ban className="h-4 w-4 text-red-400 mx-auto" />
                            </TableCell>
                          );
                        }

                        return (
                          <TableCell key={perm} className="text-center">
                            {permission ? (
                              <Checkbox
                                checked={checked}
                                disabled={isSavingPermissions || !permissionId}
                                onCheckedChange={(nextChecked) => {
                                  if (!permission) return;
                                  handlePermissionChange(
                                    permission,
                                    nextChecked === true,
                                  );
                                }}
                              />
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        );
                      })}
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

          <DialogFooter>
            <Button
              type="button"
              onClick={handleSavePermissions}
              disabled={isSavingPermissions || !moduleKeys.length}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSavingPermissions ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ActionConfirmationDialog
        open={showPermissionConfirmation}
        onOpenChange={(open) => {
          if (!open) setShowPermissionConfirmation(false);
        }}
        onConfirm={confirmSavePermissions}
        title="Change permissions?"
        description="Are you sure you want to change these permissions?"
        confirmText="Yes, change"
        cancelText="No"
        isLoading={isSavingPermissions}
      />

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

      <Card className="hover:shadow-md transition">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
            <Award className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg">Segmentation Filters Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-[#7677F41A] border-b border-gray-200">
                <TableRow>
                  <TableHead>Filter Label</TableHead>
                  <TableHead>Database Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Operator Type</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.segmentFilters?.length ? (
                  data.segmentFilters.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-semibold text-gray-900">{f.label}</TableCell>
                      <TableCell className="font-mono text-xs text-gray-500">{f.name}</TableCell>
                      <TableCell className="text-gray-700">{f.category}</TableCell>
                      <TableCell>
                        <span className="text-purple-600 font-medium text-[10px] bg-purple-50 px-2 py-0.5 rounded border border-purple-100 uppercase tracking-wide">
                          {f.operator_type}
                        </span>
                      </TableCell>
                      <TableCell className="flex items-center justify-center">
                        <Checkbox 
                          checked={f.is_enabled} 
                          onCheckedChange={() => handleToggleSegmentFilter(f.id, f.is_enabled)} 
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-gray-400">
                      No segmentation filters configured for this organization
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
