"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Ban, Shield, Save, Pencil } from "lucide-react";
import { toast } from "sonner";

import GlobalLoader from "@/components/commoncomponents/globalloader";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActionConfirmationDialog } from "@/components/commoncomponents/action-confirmation-dialog";

import { getOrganizationAdminPermissions, updateRolePermissions } from "@/services/organizationAdmin";
import { getUser } from "@/lib/auth";
import type {
  OrganizationAdminPermissionsResponse,
  OrganizationPermission,
  OrganizationRoleMatrix,
} from "@/types/organization";

const BLOCKED_PERMISSIONS: Record<string, Record<string, string[]>> = {
  Admin: {
    lead: ["import", "delete"],
    "lead activity": ["import", "export", "delete"],
    offers: ["import", "delete"],
    permission: ["create", "import", "export", "delete"],
    reports: ["create", "update", "import", "delete"],
    user: ["import", "delete"],
  },
  Manager: {
    lead: ["delete"],
    "lead activity": ["import", "export", "delete"],
    offers: ["import", "delete"],
    permission: ["create", "view", "update", "delete", "import", "export"],
    reports: ["create", "update", "import", "delete"],
    user: ["import", "delete", "update"],
  },
  Executive: {
    lead: ["delete"],
    "lead activity": ["import", "export", "delete"],
    offers: ["create", "update", "import", "delete"],
    permission: ["create", "view", "update", "delete", "import", "export"],
    reports: ["create", "update", "import", "delete"],
    user: ["create", "view", "update", "delete", "import", "export"],
  },
};

export default function PermissionsPage() {
  const [data, setData] = useState<OrganizationAdminPermissionsResponse | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  const [isEditingPermissions, setIsEditingPermissions] = useState(false);
  const [permissionDraft, setPermissionDraft] = useState<Record<string, boolean>>({});
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);
  const [showPermissionConfirmation, setShowPermissionConfirmation] = useState(false);

  const currentUser = useMemo(() => getUser(), []);
  const isOrgAdmin = currentUser?.role?.toLowerCase().trim() === "admin";

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

  const permissions = useMemo(() => data?.permissions || [], [data?.permissions]);

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

  const permissionModulePermissions = useMemo(() => {
    return Object.entries(currentUser?.permissions || {})
      .filter(([module]) => ["permission", "permissions"].includes(module.toLowerCase().trim()))
      .flatMap(([, perms]) => perms ?? []);
  }, [currentUser?.permissions]);

  const canUpdatePermissions = useMemo(() => {
    return isOrgAdmin && permissionModulePermissions.some(
      (p) => ["update", "*", "edit", "use"].includes(p.toLowerCase().trim())
    );
  }, [isOrgAdmin, permissionModulePermissions]);

  const canEditSelectedRole = canUpdatePermissions && selectedRole !== "Admin";

  const openPermissionEditor = () => {
    const draft: Record<string, boolean> = {};
    permissions
      .filter((p) => p.role === selectedRole)
      .forEach((p) => {
        if (p.orgRoleModulePermissionId) {
          draft[p.orgRoleModulePermissionId] = p.access;
        }
      });
    setPermissionDraft(draft);
    setIsEditingPermissions(true);
  };

  const closePermissionEditor = () => {
    setIsEditingPermissions(false);
    setPermissionDraft({});
  };

  const handlePermissionChange = (permId: string, checked: boolean) => {
    setPermissionDraft((current) => ({
      ...current,
      [permId]: checked,
    }));
  };

  const handleSave = () => {
    const roleObj = data?.roles?.find((r) => r.name === selectedRole);
    if (!roleObj) {
      toast.error("Failed to identify role");
      return;
    }

    const payload = Object.entries(permissionDraft)
      .filter(([id, access]) => {
        const originalItem = permissions.find((p) => p.orgRoleModulePermissionId === id);
        return originalItem && originalItem.access !== access;
      })
      .map(([id, access]) => ({
        orgRoleModulePermissionId: id,
        access,
      }));

    if (payload.length === 0) {
      setIsEditingPermissions(false);
      return;
    }

    setShowPermissionConfirmation(true);
  };

  const confirmSavePermissions = async () => {
    const roleObj = data?.roles?.find((r) => r.name === selectedRole);
    if (!roleObj) {
      toast.error("Failed to identify role");
      return;
    }

    const payload = Object.entries(permissionDraft)
      .filter(([id, access]) => {
        const originalItem = permissions.find((p) => p.orgRoleModulePermissionId === id);
        return originalItem && originalItem.access !== access;
      })
      .map(([id, access]) => ({
        orgRoleModulePermissionId: id,
        access,
      }));

    setIsSavingPermissions(true);
    try {
      await updateRolePermissions({
        orgRoleId: roleObj.id,
        permissions: payload,
      });
      toast.success("Permissions updated successfully");
      setIsEditingPermissions(false);
      setShowPermissionConfirmation(false);
      setPermissionDraft({});
      await loadPermissions("realtime");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save permissions");
    } finally {
      setIsSavingPermissions(false);
    }
  };

  if (isInitialLoading) return <GlobalLoader />;
  if (!data) return <div className="p-6">No data</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Permissions</h1>
          <p className="text-sm text-muted-foreground">
            View and manage role-based access for each module
          </p>
        </div>

        <div className="flex items-center gap-4">
          {canEditSelectedRole && (
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
        </div>
      </div>

      {/* Role Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Select Role:</span>
        <Select
          value={selectedRole}
          onValueChange={(val) => {
            setSelectedRole(val);
          }}
        >
          <SelectTrigger className="w-64 bg-white">
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
      </div>

      {canEditSelectedRole && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <Ban className="h-4.5 w-4.5 text-amber-600 shrink-0" />
          <span>
            Note: Options marked with a 🚫 symbol are system-critical restrictions and cannot be modified.
          </span>
        </div>
      )}

      {/* Main Table: Out of card directly on the page */}
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
                  <TableCell className="capitalize font-medium text-sm">
                    {module}
                  </TableCell>

                  {permissionList.map((perm) => {
                    const permItem = permissions.find(
                      (p) =>
                        p.role === selectedRole &&
                        p.module === module &&
                        p.permission === perm,
                    );

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

                    if (!permItem) {
                      return (
                        <TableCell key={perm} className="text-center py-2.5 text-xs text-muted-foreground">
                          -
                        </TableCell>
                      );
                    }

                    return (
                      <TableCell key={perm} className="text-center">
                        <Checkbox
                          checked={permItem.access}
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

      {/* Edit Dialog Modal (Same design style as System Admin) */}
      <Dialog
        open={isEditingPermissions}
        onOpenChange={(open) => {
          if (!open) closePermissionEditor();
        }}
      >
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Update {selectedRole} Permissions</DialogTitle>
          </DialogHeader>

          {/* Warning Banner */}
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
                      <TableCell className="capitalize font-medium text-sm">
                        {module}
                      </TableCell>

                      {permissionList.map((perm) => {
                        const permItem = permissions.find(
                          (p) =>
                            p.role === selectedRole &&
                            p.module === module &&
                            p.permission === perm,
                        );

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

                        if (!permItem) {
                          return (
                            <TableCell key={perm} className="text-center py-2.5 text-xs text-muted-foreground">
                              -
                            </TableCell>
                          );
                        }

                        const permId = permItem.orgRoleModulePermissionId;
                        const checked = permId ? (permissionDraft[permId] ?? permItem.access) : false;

                        return (
                          <TableCell key={perm} className="text-center">
                            <Checkbox
                              checked={checked}
                              disabled={isSavingPermissions || !permId}
                              onCheckedChange={(nextChecked) => {
                                if (permId) {
                                  handlePermissionChange(permId, nextChecked === true);
                                }
                              }}
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

          <div className="flex justify-end pt-4">
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSavingPermissions || !moduleKeys.length}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition shadow"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSavingPermissions ? "Saving..." : "Save Changes"}
            </Button>
          </div>
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
    </div>
  );
}
