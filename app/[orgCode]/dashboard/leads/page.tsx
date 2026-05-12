"use client";

import { useEffect, useState } from "react";

import LeadHeader       from "@/components/commoncomponents/leads/leadheader";
import LeadTableFilters from "@/components/commoncomponents/leads/leadtable-filters";
import LeadTable        from "@/components/commoncomponents/leads/leadtable";
import LeadActions      from "@/components/commoncomponents/leads/leadactions";
import LeadDialogs      from "@/components/commoncomponents/leads/lead-dialogs";
import LeadSummaryCards from "@/components/commoncomponents/leads/lead-cards";

import { useLeads }       from "@/hooks/use-leads";
import { useLeadActions } from "@/hooks/use-lead-actions";
import { useLeadFilters } from "@/hooks/use-lead-filters";
import { useLeadExport }  from "@/hooks/export";
import { ExecutiveOption } from "@/types/leadtypes";

import { getExecutiveUsers } from "@/services/leads";

export default function LeadsPage() {
  const { leads, stats, refetch } = useLeads();
  const filters = useLeadFilters();
  const {
    isFormOpen, editingLead, selectedLead,
    openAddForm, openEditForm, closeForm,
    setSelectedLead, handleFormSubmit,
  } = useLeadActions({ onSuccess: refetch });

  const { handleExport } = useLeadExport();

  const [executives, setExecutives] = useState<ExecutiveOption[]>([]);

  useEffect(() => {
    getExecutiveUsers()
      .then(setExecutives)
      .catch(console.error);
  }, []);

  return (
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
          onAddLead={openAddForm}
        />
      </div>

      {/* ── Stats cards ───────────────────────────────────────────────── */}
      <LeadSummaryCards stats={stats} />

      {/* ── Filters ───────────────────────────────────────────────────── */}
      <LeadTableFilters
        pendingSearch={filters.pendingSearch}
        pendingSource={filters.pendingSource}
        pendingStatus={filters.pendingStatus}
        pendingPriority={filters.pendingPriority}
        pendingAssignedTo={filters.pendingAssignedTo}
        executives={executives}
        onSearchChange={filters.setPendingSearch}
        onSourceChange={filters.setPendingSource}
        onStatusChange={filters.setPendingStatus}
        onPriorityChange={filters.setPendingPriority}
        onAssignedToChange={filters.setPendingAssignedTo}
        onClearAll={filters.handleClearAll}
        onApply={filters.handleApply}
      />

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <LeadTable
        leads={leads}
        search={filters.search}
        sourceFilter={filters.sourceFilter}
        statusFilter={filters.statusFilter}
        priorityFilter={filters.priorityFilter}
        assignedToFilter={filters.assignedToFilter}
        renderActions={(lead) => (
          <LeadActions
            lead={lead}
            onEdit={openEditForm}
            onViewDetails={setSelectedLead}
          />
        )}
      />

      {/* ── Dialogs ───────────────────────────────────────────────────── */}
      <LeadDialogs
        isFormOpen={isFormOpen}
        editingLead={editingLead}
        onFormSubmit={handleFormSubmit}
        onFormClose={closeForm}
        selectedLead={selectedLead}
        onDetailsClose={() => setSelectedLead(null)}
      />
    </div>
  );
}