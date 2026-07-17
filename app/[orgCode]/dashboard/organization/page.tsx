"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, RefreshCw, Building2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

import GlobalLoader from "@/components/commoncomponents/globalloader";
import OrganizationCard from "@/components/commoncomponents/organization/OrganizationCard";
import CreateOrganizationModal from "@/components/commoncomponents/organization/CreateOrganizationModal";
import {
  getOrganizations,
  getOrganizationByCode,
} from "@/services/organization";
import { subscribeRealtime } from "@/lib/socket";
import { ORGANIZATION_LIST_CHANGED } from "@/types/realtime";
import type {
  Organization,
  OrganizationDetail,
} from "@/types/organization";

export default function OrganizationPage() {
  const [data, setData] = useState<Organization[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationDetail | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingOrg, setLoadingOrg] = useState(false);

  const fetchOrganizations = useCallback(
    async (mode: "initial" | "realtime" = "initial") => {
      if (mode === "realtime") {
        setIsRefreshing(true);
      }

      try {
        const res = await getOrganizations();
        setData(res);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load organizations");
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
    fetchOrganizations("initial");
  }, [fetchOrganizations]);

  useEffect(() => {
    return subscribeRealtime(ORGANIZATION_LIST_CHANGED, () => {
      fetchOrganizations("realtime");
    });
  }, [fetchOrganizations]);

  const handleEdit = async (org: Organization) => {
    setOpen(true);
    setSelectedOrg(org as any);
    setLoadingOrg(true);
    try {
      const res = await getOrganizationByCode(org.code);
      // Only apply state update if the modal is still open and we haven't switched targets
      setSelectedOrg(current => {
        if (current && current.id === org.id) {
          return res.organization;
        }
        return current;
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load organization");
      setOpen(false);
    } finally {
      setLoadingOrg(false);
    }
  };

  const totalOrgs = data.length;
  const activeOrgs = data.filter((org) => org.is_active).length;
  const inactiveOrgs = totalOrgs - activeOrgs;

  const filteredOrgs = data.filter(
    (org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isInitialLoading) return <GlobalLoader />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Organization Management
          </h1>
          <p className="text-sm text-gray-500">
            Create and manage organizations in your system
          </p>
        </div>

        <div className="flex items-center gap-4">
          {isRefreshing && (
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium animate-pulse">
              <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              Syncing
            </div>
          )}

          <Button
            size="lg"
            className="w-full sm:w-auto rounded-full px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100"
            onClick={() => {
              setSelectedOrg(null);
              setOpen(true);
            }}
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Organization
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition duration-200">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Organizations</p>
            <h3 className="text-xl font-bold text-gray-900">{totalOrgs}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition duration-200">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Active Organizations</p>
            <h3 className="text-xl font-bold text-gray-900">{activeOrgs}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition duration-200">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Inactive Organizations</p>
            <h3 className="text-xl font-bold text-gray-900">{inactiveOrgs}</h3>
          </div>
        </div>
      </div>

      {/* Search Bar section */}
      <div className="w-full sm:w-80">
        <Input
          search
          type="text"
          placeholder="Search organizations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-sm rounded-lg h-9 py-2 px-3 bg-white"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredOrgs.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 border border-dashed border-gray-200 rounded-2xl bg-white p-8">
            <Building2 className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-500">
              No organizations found
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Try adjusting your search criteria or add a new organization.
            </p>
          </div>
        ) : (
          filteredOrgs.map((org) => (
            <OrganizationCard key={org.id} org={org} onEdit={handleEdit} />
          ))
        )}
      </div>

      <CreateOrganizationModal
        open={open}
        setOpen={(val: boolean) => {
          setOpen(val);
          if (!val) setSelectedOrg(null);
        }}
        org={selectedOrg}
        loadingOrg={loadingOrg}
        isEdit={!!selectedOrg}
        onSuccess={() => {
          fetchOrganizations("realtime");
          toast.success(
            selectedOrg
              ? "Organization updated successfully"
              : "Organization created successfully",
          );
        }}
      />
    </div>
  );
}
