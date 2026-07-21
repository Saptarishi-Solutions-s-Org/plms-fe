"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Ban, Shield, Save, Pencil, Award } from "lucide-react";
import { toast } from "sonner";

import GlobalLoader from "@/components/commoncomponents/globalloader";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toggleSegmentFilter } from "@/services/segments";
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
    segmentation: ["create", "update", "delete", "import", "export"],
  },
  Manager: {
    lead: ["delete"],
    "lead activity": ["import", "export", "delete"],
    offers: ["import", "delete"],
    permission: ["create", "view", "update", "delete", "import", "export"],
    reports: ["create", "update", "import", "delete"],
    user: ["import", "delete", "update"],
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

  const handleToggleSegmentFilter = async (filterId: string, currentStatus: boolean) => {
    try {
      toast.loading("Updating filter status...");
      await toggleSegmentFilter(filterId, !currentStatus);
      toast.dismiss();
      toast.success("Segmentation filter updated successfully!");
      loadPermissions("realtime");
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to update segmentation filter status.");
    }
  };

  if (isInitialLoading) return <GlobalLoader />;
  if (!data) return <div className="p-6">No data</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Title Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold">Permissions</h1>
          <p className="text-sm text-muted-foreground">
            View and manage role-based access for each module
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-4">
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

      {/* Segmentation Filters Configuration */}
      {isOrgAdmin && (
        <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition mt-6">
          <CardHeader className="flex flex-row items-center gap-3 border-b border-gray-50 pb-3">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Segmentation Filters Configuration</CardTitle>
              <p className="text-xs text-muted-foreground">Enable or disable specific search filters for your organizations segments builder.</p>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
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
                  {data.segmentFilters?.length ? (
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
                        No segmentation filters configured
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
