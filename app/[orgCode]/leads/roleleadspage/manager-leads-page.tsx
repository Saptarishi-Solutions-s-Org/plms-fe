"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import GlobalLoader from "@/components/commoncomponents/globalloader";
import { BulkLeadActionsDrawer } from "@/components/commoncomponents/lead-bulk-actions/BulkLeadActionsDrawer";
import LeadSummaryCards from "@/components/commoncomponents/leads/lead-cards";
import LeadDialogs from "@/components/commoncomponents/leads/lead-dialogs";
import LeadActions from "@/components/commoncomponents/leads/leadactions";
import LeadHeader from "@/components/commoncomponents/leads/leadheader";
import LeadTableFilters from "@/components/commoncomponents/leads/leadtable-filters";
import LeadTable from "@/components/commoncomponents/leads/leadtable";
import TablePaginationFooter from "@/components/commoncomponents/table-pagination-footer";
import { useLeadExport } from "@/hooks/export";
import { useLeads } from "@/hooks/use-leads";
import { useUrlLeadFilters } from "@/hooks/useurllead-filters";
import { useUrlPagination } from "@/hooks/use-url-pagination";
import {
  bulkAssignLeads as bulkAssignLeadsRequest,
  createLead,
  getExecutiveUsers,
  getLeadsWithStats,
  updateLead,
} from "@/services/leads";
import type {
  ExecutiveOption,
  Lead,
  LeadFormData,
  LeadPayload,
} from "@/types/leadtypes";

import { type AuthUser, getUser } from "@/lib/auth";
import { canAccess } from "@/lib/permissions";

const BULK_ASSIGN_PAGE_LIMIT = 100;

function joinFilterValues(values?: string[]) {
  const filteredValues = values?.filter(Boolean) ?? [];

  return filteredValues.length ? filteredValues.join(",") : undefined;
}

function toLeadPayload(lead: Lead, assignedTo: string): LeadPayload {
  return {
    name: lead.name,
    gender: lead.gender,
    email: lead.email,
    phone: lead.phone,
    city: lead.city,
    state: lead.state,
    country: lead.country,
    postalCode: lead.postalCode,
    leadSource: lead.leadSource,
    status: lead.status,
    assignedTo,
    priority: lead.priority,
    notes: lead.notes,
  };
}

export default function ManagerLeadsPage() {
  const [user, setUser] = useState<AuthUser | null>(() => getUser());

  useEffect(() => {
    const syncUser = () => setUser(getUser());
    window.addEventListener("LMA-auth-changed", syncUser);
    return () => window.removeEventListener("LMA-auth-changed", syncUser);
  }, []);
  const canCreateLead = useMemo(() => canAccess(user, ["lead"], ["create"]), [user]);
  const canExportLead = useMemo(() => canAccess(user, ["lead"], ["export"]), [user]);
  const canImportLead = useMemo(() => canAccess(user, ["lead"], ["import"]), [user]);
  const canUpdateLead = useMemo(() => canAccess(user, ["lead"], ["update"]), [user]);

  console.log(canCreateLead,"hello")
  const { page, limit, setPage, setLimit } = useUrlPagination();
  const { filters, setFilters } = useUrlLeadFilters();
  const { handleExport } = useLeadExport();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [executives, setExecutives] = useState<ExecutiveOption[]>([]);
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);
  const [bulkAssignLeads, setBulkAssignLeads] = useState<Lead[]>([]);
  const [isBulkAssignLeadsLoading, setIsBulkAssignLeadsLoading] =
    useState(false);

  useEffect(() => {
    getExecutiveUsers().then(setExecutives).catch(console.error);
  }, []);

  const executiveNamesById = useMemo(
    () => new Map(executives.map((executive) => [executive.id, executive.name])),
    [executives],
  );
  const assignedToIds = useMemo(
    () =>
      filters.assignedTo
        .map(
          (name) =>
            executives.find((executive) => executive.name === name)?.id ?? name,
        )
        .filter(Boolean),
    [executives, filters.assignedTo],
  );
  const { leads, stats, pagination, isInitialLoading, refetch } = useLeads({
    page,
    limit,
    search: filters.search,
    statuses: filters.statuses,
    priorities: filters.priorities,
    sources: filters.sources,
    assignedTo: assignedToIds,
    statsScope: "all",
  });

  const leadsById = useMemo(
    () =>
      new Map(
        [...leads, ...bulkAssignLeads].map((lead) => [lead.uuid, lead]),
      ),
    [bulkAssignLeads, leads],
  );

  const fetchBulkAssignLeads = useCallback(async () => {
    setIsBulkAssignLeadsLoading(true);

    try {
      const bulkLimit = Math.max(
        BULK_ASSIGN_PAGE_LIMIT,
        pagination.total,
        stats.total,
        leads.length,
        limit,
      );
      const params = {
        limit: bulkLimit,
        search: filters.search,
        status: joinFilterValues(filters.statuses),
        priority: joinFilterValues(filters.priorities),
        leadSource: joinFilterValues(filters.sources),
        assignedTo: assignedToIds[0],
      };
      const firstPage = await getLeadsWithStats({
        ...params,
        page: 1,
      });
      const firstPageLeads = firstPage.leads ?? [];
      const totalPages = firstPage.pagination?.totalPages ?? 1;

      if (totalPages <= 1) {
        setBulkAssignLeads(firstPageLeads);
        return;
      }

      const remainingPages = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, index) =>
          getLeadsWithStats({
            ...params,
            page: index + 2,
          }),
        ),
      );

      setBulkAssignLeads([
        ...firstPageLeads,
        ...remainingPages.flatMap((pageData) => pageData.leads ?? []),
      ]);
    } catch (error) {
      console.error(error);
      setBulkAssignLeads([]);
      toast.error("Failed to load leads for bulk assignment.");
    } finally {
      setIsBulkAssignLeadsLoading(false);
    }
  }, [
    assignedToIds,
    filters.priorities,
    filters.search,
    filters.sources,
    filters.statuses,
    leads.length,
    limit,
    pagination.total,
    stats.total,
  ]);

  const openAddForm = () => {
    setEditingLead(null);
    setIsFormOpen(true);
  };

  const openEditForm = (lead: Lead) => {
    setEditingLead(lead);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingLead(null);
  };

  const handleFormSubmit = async (data: LeadFormData) => {
    if (editingLead) {
      await updateLead({ id: editingLead.uuid, ...data, assignedTo: editingLead.assignedTo });
    } else {
      await createLead({ ...data, assignedTo: "" });
    }

    await refetch();
    closeForm();
  };

  const handleAssignLead = async (lead: Lead, assignedTo: string) => {
    if (lead.assignedTo) return;

    await updateLead({ id: lead.uuid, ...toLeadPayload(lead, assignedTo) });

    await refetch();
  };

  const handleBulkAssignLeads = async (
    leadIds: string[],
    assignedTo: string,
  ) => {
    const failures: Array<{ leadId: string; message: string }> = [];
    let successCount = 0;
    const assignableLeads: Lead[] = [];

    for (const leadId of leadIds) {
      const lead = leadsById.get(leadId);

      if (!lead) {
        failures.push({
          leadId,
          message: "Lead was not found and could not be assigned.",
        });
        continue;
      }

      if (lead.assignedTo) {
        failures.push({
          leadId,
          message: `${lead.name} is already assigned and cannot be reassigned.`,
        });
        continue;
      }

      assignableLeads.push(lead);
    }

    if (assignableLeads.length > 0) {
      const result = await bulkAssignLeadsRequest({
        leadIds: assignableLeads.map((lead) => lead.uuid),
        assignedTo,
      });

      successCount = result.assignedCount ?? assignableLeads.length;
    }

    if (successCount > 0) {
      await refetch();
      await fetchBulkAssignLeads();
    }

    return {
      successCount,
      failureCount: failures.length,
      failures,
    };
  };

  const mapLead = (lead: Lead): Lead => {
    return {
      ...lead,
      assignedToName:
        executiveNamesById.get(lead.assignedTo) ??
        lead.assignedToName ??
        "Unassigned",
    };
  };

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(mapLead(lead));
  };

  return (
    <>
      {isInitialLoading ? (
        <GlobalLoader />
      ) : (
        <div className="w-full h-full p-4 sm:p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-lg sm:text-2xl font-semibold text-gray-900">
                Leads
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Manage and track your lead pipeline
              </p>
            </div>

            <LeadHeader
              onExport={handleExport}
              onImportComplete={refetch}
              onAddLead={openAddForm}
              onBulkAssign={() => {
                setIsBulkAssignOpen(true);
                void fetchBulkAssignLeads();
              }}
              showCreate={canCreateLead}
              showExport={canExportLead}
              showImport={canImportLead}
              showBulkAssign={canUpdateLead}
            />
          </div>

          <LeadSummaryCards stats={stats} />

          <LeadTableFilters
            key={JSON.stringify(filters)}
            executives={executives}
            filters={filters}
            onApply={setFilters}
          />

          <TablePaginationFooter
            pagination={pagination}
            onPageChange={setPage}
            onLimitChange={setLimit}
            totalLabel="leads"
            placement="top"
          />

          <LeadTable
            leads={leads}
            executives={executives}
            rowOffset={(pagination.page - 1) * pagination.limit}
            emptyMessage="No leads found"
            renderActions={(lead) => (
              <LeadActions
                lead={lead}
                onEdit={canUpdateLead ? openEditForm : undefined}
                onViewDetails={handleViewDetails}
                executives={executives}
                onAssign={canUpdateLead ? handleAssignLead : undefined}
              />
            )}
          />

          <TablePaginationFooter
            pagination={pagination}
            onPageChange={setPage}
            onLimitChange={setLimit}
            totalLabel="leads"
          />

          <LeadDialogs
            isFormOpen={isFormOpen}
            editingLead={editingLead}
            onFormSubmit={handleFormSubmit}
            onFormClose={closeForm}
            selectedLead={selectedLead}
            onDetailsClose={() => setSelectedLead(null)}
          />

          <BulkLeadActionsDrawer
            open={isBulkAssignOpen}
            executives={executives}
            leads={bulkAssignLeads}
            isLoadingLeads={isBulkAssignLeadsLoading}
            onClose={() => setIsBulkAssignOpen(false)}
            onAssign={handleBulkAssignLeads}
          />
        </div>
      )}
    </>
  );
}
