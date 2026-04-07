"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import OrganizationCard from "@/components/commoncomponents/organization/OrganizationCard";
import CreateOrganizationModal from "@/components/commoncomponents/organization/CreateOrganizationModal";
import {
  getOrganizations,
  getOrganizationByCode,
} from "@/services/organization";
import { Organization } from "@/types/organization";

export default function OrganizationPage() {
  const [data, setData] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const res = await getOrganizations();
      setData(res);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load organizations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleEdit = async (org: Organization) => {
    try {
      const res = await getOrganizationByCode(org.code);
      setSelectedOrg(res.organization);
      setOpen(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load organization");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Organization Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Create and manage organizations in your system
          </p>
        </div>

        <Button
          size="lg"
          className="w-full sm:w-auto rounded-full px-6 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => {
            setSelectedOrg(null);
            setOpen(true);
          }}
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Organization
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          <div className="col-span-full flex justify-center py-10">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="col-span-full flex justify-center py-10">
            <p className="text-sm text-muted-foreground">
              No organizations found
            </p>
          </div>
        ) : (
          data.map((org) => (
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
        isEdit={!!selectedOrg}
        onSuccess={() => {
          fetchOrganizations();
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
