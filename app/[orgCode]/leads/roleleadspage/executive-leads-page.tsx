"use client";

import { useState } from "react";

import GlobalLoader from "@/components/commoncomponents/globalloader";
import { BulkOfferAssignDrawer } from "@/components/commoncomponents/executive-bulk-actions/BulkOfferAssignDrawer";
import LeadSummaryCards from "@/components/commoncomponents/leads/lead-cards";
import LeadDialogs from "@/components/commoncomponents/leads/lead-dialogs";
import LeadActions from "@/components/commoncomponents/leads/leadactions";
import LeadHeader from "@/components/commoncomponents/leads/leadheader";
import LeadTableFilters from "@/components/commoncomponents/leads/leadtable-filters";
import LeadTable from "@/components/commoncomponents/leads/leadtable";
import TablePaginationFooter from "@/components/commoncomponents/table-pagination-footer";
import { useLeads } from "@/hooks/use-leads";
import { useUrlLeadFilters } from "@/hooks/use-url-lead-filters";
import { useUrlPagination } from "@/hooks/use-url-pagination";
import { getUser } from "@/lib/auth";
import { assignOfferToLead } from "@/services/executivestats";
import { createLead, updateLead } from "@/services/leads";
import type { Lead, LeadFormData } from "@/types/leadtypes";

export default function ExecutiveLeadsPage() {
  const { page, limit, setPage, setLimit } = useUrlPagination();
  const { filters, setFilters } = useUrlLeadFilters();
  const { leads, stats, pagination, isInitialLoading, refetch } = useLeads({
    page,
    limit,
    search: filters.search,
    statuses: filters.statuses,
    priorities: filters.priorities,
    sources: filters.sources,
    statsScope: "all",
  });
  const currentUser = getUser();
  const currentUserId = currentUser?.id;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filters, setFilters] = useState<LeadFilters>(allFilters);
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const search = filters.search.trim().toLowerCase();

      const searchMatch =
        !search ||
        lead.name.toLowerCase().includes(search) ||
        lead.email.toLowerCase().includes(search);

      const sourceMatch =
        (filters.sources?.length ?? 0) === 0 ||
        filters.sources?.some(
          (source) =>
            normalizeFilterValue(source) ===
            normalizeFilterValue(lead.leadSource),
        );

      const statusMatch =
        filters.statuses.length === 0 || filters.statuses.includes(lead.status);

      const priorityMatch =
        filters.priorities.length === 0 ||
        filters.priorities.includes(lead.priority);

      return searchMatch && sourceMatch && statusMatch && priorityMatch;
    });
  }, [filters, leads]);

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
    const payload = {
      ...data,
      assignedTo: currentUserId ?? editingLead?.assignedTo ?? "",
    };

    if (editingLead) {
      await updateLead({ id: editingLead.uuid, ...payload });
    } else {
      await createLead(payload);
    }

    await refetch();
    closeForm();
  };

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead({
      ...lead,
      assignedToName: lead.assignedToName ?? currentUser?.name ?? "Unassigned",
    });
  };

  const handleBulkAssign = async (offerIds: string[], leadIds: string[]) => {
    const pairs = offerIds.flatMap((offerId) =>
      leadIds.map((leadId) => ({ offerId, leadId })),
    );

    const results = await Promise.allSettled(
      pairs.map((pair) => assignOfferToLead(pair)),
    );

    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const failureCount = results.filter((r) => r.status === "rejected").length;

    return { successCount, failureCount };
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
                My Leads
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Manage and track your assigned lead pipeline
              </p>
            </div>

            <LeadHeader
              onExport={() => undefined}
              onAddLead={openAddForm}
              showImportExport={false}
              onBulkAssign={() => setIsBulkAssignOpen(true)}
            />
          </div>

          <LeadSummaryCards stats={stats} />

          <LeadTableFilters
            key={JSON.stringify(filters)}
            executives={[]}
            filters={filters}
            showAssignedToFilter={false}
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
            showAssignedTo={false}
            rowOffset={(pagination.page - 1) * pagination.limit}
            emptyMessage="No leads found"
            renderActions={(lead) => (
              <LeadActions
                lead={lead}
                onEdit={openEditForm}
                onViewDetails={handleViewDetails}
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

          <BulkOfferAssignDrawer
            open={isBulkAssignOpen}
            leads={leads}
            onClose={() => setIsBulkAssignOpen(false)}
            onAssign={handleBulkAssign}
          />
        </div>
      )}
    </>
  );
}
