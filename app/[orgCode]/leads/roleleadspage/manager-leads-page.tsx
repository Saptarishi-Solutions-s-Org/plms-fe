"use client";

import { useEffect, useMemo, useState } from "react";

import GlobalLoader from "@/components/commoncomponents/globalloader";
import { BulkLeadActionsDrawer } from "@/components/commoncomponents/lead-bulk-actions/BulkLeadActionsDrawer";
import LeadSummaryCards from "@/components/commoncomponents/leads/lead-cards";
import LeadDialogs from "@/components/commoncomponents/leads/lead-dialogs";
import LeadActions from "@/components/commoncomponents/leads/leadactions";
import LeadHeader from "@/components/commoncomponents/leads/leadheader";
import LeadPagination from "@/components/commoncomponents/leads/lead-pagination";
import LeadTableFilters from "@/components/commoncomponents/leads/leadtable-filters";
import LeadTable from "@/components/commoncomponents/leads/leadtable";
import { useLeadExport } from "@/hooks/export";
import { useLeads } from "@/hooks/use-leads";
import { useUrlLeadFilters } from "@/hooks/use-url-lead-filters";
import { useUrlPagination } from "@/hooks/use-url-pagination";
import { createLead, getExecutiveUsers, updateLead } from "@/services/leads";
import type {
  ExecutiveOption,
  Lead,
  LeadFormData,
  LeadPayload,
} from "@/types/leadtypes";

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
  const { page, limit, setPage, setLimit } = useUrlPagination();
  const { filters, setFilters } = useUrlLeadFilters();
  const { handleExport } = useLeadExport();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [executives, setExecutives] = useState<ExecutiveOption[]>([]);
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);

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
  });

  const leadsById = useMemo(
    () => new Map(leads.map((lead) => [lead.uuid, lead])),
    [leads],
  );

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
      const lead = leadsById.get(leadId)!;
      if (lead.assignedTo) {
        failures.push({
          leadId,
          message: `${lead.name} is already assigned and cannot be reassigned.`,
        });
        continue;
      }

      assignableLeads.push(lead);
    }

    const results = await Promise.allSettled(
      assignableLeads.map((lead) =>
        updateLead({ id: lead.uuid, ...toLeadPayload(lead, assignedTo) }),
      ),
    );

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        successCount += 1;
        return;
      }

      failures.push({
        leadId: assignableLeads[index].uuid,
        message:
          result.reason instanceof Error
            ? result.reason.message
            : "Failed to assign lead.",
      });
    });

    if (successCount > 0) {
      await refetch();
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
              onBulkAssign={() => setIsBulkAssignOpen(true)}
            />
          </div>

          <LeadSummaryCards stats={stats} />

          <LeadTableFilters
            key={JSON.stringify(filters)}
            executives={executives}
            filters={filters}
            onApply={setFilters}
          />

          <LeadTable
            leads={leads}
            executives={executives}
            emptyMessage="No leads found"
            renderActions={(lead) => (
              <LeadActions
                lead={lead}
                onEdit={openEditForm}
                onViewDetails={handleViewDetails}
                executives={executives}
                onAssign={handleAssignLead}
              />
            )}
          />

          <LeadPagination
            pagination={pagination}
            onPageChange={setPage}
            onLimitChange={setLimit}
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
            leads={leads}
            onClose={() => setIsBulkAssignOpen(false)}
            onAssign={handleBulkAssignLeads}
          />
        </div>
      )}
    </>
  );
}
