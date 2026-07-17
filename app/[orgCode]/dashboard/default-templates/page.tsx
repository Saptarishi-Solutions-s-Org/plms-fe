"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Shield, LayoutGrid, Award, Ban } from "lucide-react";
import { toast } from "sonner";

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
import { getDefaultTemplates } from "@/services/systemAdmin";

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

const getBlockedList = (roleName: string) => {
  const norm = roleName.toLowerCase().trim();
  if (norm === "admin") return BLOCKED_PERMISSIONS.Admin;
  if (norm === "manager") return BLOCKED_PERMISSIONS.Manager;
  if (norm === "executive") return BLOCKED_PERMISSIONS.Executive;
  return undefined;
};

type ModuleTemplate = {
  id: string;
  name: string;
  default: boolean;
};

type RoleTemplate = {
  id: string;
  name: string;
  default: boolean;
};

type RmpTemplateItem = {
  role: string;
  module: string;
  permission: string;
  access: boolean;
};

type SegmentFilterTemplate = {
  id: string;
  name: string;
  label: string;
  category: string;
  operator_type: string;
  default: boolean;
};

type DefaultTemplatesResponse = {
  modules: ModuleTemplate[];
  roles: RoleTemplate[];
  rmp: RmpTemplateItem[];
  segmentFilters: SegmentFilterTemplate[];
};

export default function DefaultTemplatesPage() {
  const [data, setData] = useState<DefaultTemplatesResponse | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  const loadTemplates = useCallback(
    async (mode: "initial" | "realtime" = "initial") => {
      if (mode === "realtime") {
        setIsRefreshing(true);
      }

      try {
        const res = await getDefaultTemplates();
        setData(res);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load default templates");
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
    loadTemplates("initial");
  }, [loadTemplates]);

  const roles = useMemo(() => data?.roles || [], [data?.roles]);
  const modulesList = useMemo(() => data?.modules || [], [data?.modules]);
  const rmpList = useMemo(() => data?.rmp || [], [data?.rmp]);

  const uniqueRoles = useMemo(() => {
    const rolesSet = new Set<string>();
    rmpList.forEach((item) => rolesSet.add(item.role));
    return Array.from(rolesSet).sort();
  }, [rmpList]);

  useEffect(() => {
    if (uniqueRoles.length && !selectedRole) {
      setSelectedRole(uniqueRoles[0]);
    }
  }, [uniqueRoles, selectedRole]);

  // Construct matrix for the selected role
  const roleMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, boolean>> = {};
    rmpList
      .filter((item) => item.role === selectedRole)
      .forEach((item) => {
        if (!matrix[item.module]) {
          matrix[item.module] = {};
        }
        matrix[item.module][item.permission] = item.access;
      });
    return matrix;
  }, [rmpList, selectedRole]);

  const matrixModules = useMemo(() => Object.keys(roleMatrix).sort(), [roleMatrix]);

  const permissionList = [
    "create",
    "view",
    "update",
    "delete",
    "import",
    "export",
  ];

  if (isInitialLoading) return <GlobalLoader />;
  if (!data) return <div className="p-6">No template data loaded</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Default Templates</h1>
          <p className="text-sm text-muted-foreground">
            View default configurations used for seeding newly created organizations
          </p>
        </div>

        {isRefreshing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Refreshing
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Default Modules */}
        <Card className="hover:shadow-md transition">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">Default Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-[#7677F41A] border-b border-gray-200">
                  <TableRow>
                    <TableHead>Module Name</TableHead>
                    <TableHead className="text-center w-24">Default</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modulesList.length ? (
                    modulesList.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium capitalize">{m.name}</TableCell>
                        <TableCell className="text-center">
                          <Checkbox checked={m.default} className="pointer-events-none" tabIndex={-1} />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-4">
                        No default modules configured
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Default Roles */}
        <Card className="hover:shadow-md transition">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <Award className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">Default Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-[#7677F41A] border-b border-gray-200">
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead className="text-center w-24">Default</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.length ? (
                    roles.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium capitalize">{r.name}</TableCell>
                        <TableCell className="text-center">
                          <Checkbox checked={r.default} className="pointer-events-none" tabIndex={-1} />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-4">
                        No default roles configured
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RMP Matrix Template */}
      <Card className="hover:shadow-md transition">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
            <Shield className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg">Template Role-Module-Permissions (RMP) Matrix</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Select Template Role:</span>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                {uniqueRoles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {getBlockedList(selectedRole) && (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <Ban className="h-4.5 w-4.5 text-amber-600 shrink-0" />
              <span>
                Note: Options marked with a 🚫 symbol are system-critical restrictions.
              </span>
            </div>
          )}

          <div className="rounded-lg border border-gray-200 overflow-hidden">
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
                {matrixModules.length ? (
                  matrixModules.map((module) => (
                    <TableRow key={module}>
                      <TableCell className="capitalize font-medium">{module}</TableCell>
                      {permissionList.map((perm) => {
                        const blockedRules = getBlockedList(selectedRole);
                        const isBlocked = blockedRules?.[module.toLowerCase()]?.includes(perm);

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
                              checked={roleMatrix[module]?.[perm] || false}
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
                      No template permissions found for this role
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Default Segmentation Filters */}
      <Card className="hover:shadow-md transition">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
            <Award className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg">Default Segmentation Filters</CardTitle>
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
                  <TableHead className="text-center">Default Enabled</TableHead>
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
                      <TableCell className="text-center">
                        <Checkbox checked={f.default} className="pointer-events-none" tabIndex={-1} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-gray-400">
                      No default segmentation filters configured
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
