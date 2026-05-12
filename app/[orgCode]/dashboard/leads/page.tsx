"use client";

import { useEffect, useMemo, useState } from "react";

import GlobalLoader from "@/components/commoncomponents/globalloader";
import LeadSummaryCards from "@/components/commoncomponents/leads/lead-cards";
import LeadDialogs from "@/components/commoncomponents/leads/lead-dialogs";
import LeadActions from "@/components/commoncomponents/leads/leadactions";
import LeadHeader from "@/components/commoncomponents/leads/leadheader";
import LeadTableFilters from "@/components/commoncomponents/leads/leadtable-filters";
import LeadTable from "@/components/commoncomponents/leads/leadtable";
import { useLeadActions } from "@/hooks/use-lead-actions";
import { useLeadExport } from "@/hooks/export";
import { useLeadFilters } from "@/hooks/use-lead-filters";
import { useLeads } from "@/hooks/use-leads";
import { getUser } from "@/lib/auth";
import { getExecutiveUsers } from "@/services/leads";
import { ExecutiveOption, Lead, LeadUI } from "@/types/leadtypes";

export default function LeadsPage() {
  const { leads, stats, isLoading, refetch } = useLeads();
  const filters = useLeadFilters();

  const {
    isFormOpen,
    editingLead,
    selectedLead,
    openAddForm,
    openEditForm,
    closeForm,
    setSelectedLead,
    handleFormSubmit,
  } = useLeadActions({ onSuccess: refetch });

  const { handleExport } = useLeadExport();
  const currentUser = getUser();
  const isExecutive = currentUser?.role?.toUpperCase().trim() === "EXECUTIVE";
  const currentExecutive = useMemo<ExecutiveOption | null>(() => {
    return currentUser ? { id: currentUser.id, name: currentUser.name } : null;
  }, [currentUser]);
  const [managerExecutives, setManagerExecutives] = useState<ExecutiveOption[]>(
    [],
  );
  const executives = isExecutive
    ? currentExecutive
      ? [currentExecutive]
      : []
    : managerExecutives;
  const visibleLeads = useMemo(() => {
    if (!isExecutive || !currentUser?.id) return leads;

    return leads.filter((lead) => lead.assignedToId === currentUser.id);
  }, [currentUser?.id, isExecutive, leads]);
  const visibleStats = useMemo(() => {
    if (!isExecutive) return stats;

    return visibleLeads.reduce(
      (nextStats, lead) => {
        nextStats.total += 1;

        if (lead.status === "New") nextStats.new += 1;
        if (lead.status === "Contacted") nextStats.contacted += 1;
        if (lead.status === "Qualified") nextStats.qualified += 1;

        return nextStats;
      },
      { total: 0, new: 0, contacted: 0, qualified: 0 },
    );
  }, [isExecutive, stats, visibleLeads]);

  useEffect(() => {
    if (isExecutive) return;

    getExecutiveUsers().then(setManagerExecutives).catch(console.error);
  }, [isExecutive]);

  const mapLead = (lead: Lead): LeadUI => {
    const assignedTo = executives.find(
      (executive) => executive.id === lead.assignedToId,
    );

    if (!assignedTo) {
      throw new Error(`Executive not found for lead ${lead.uuid}`);
    }

    return {
      ...lead,
      assignedTo,
    };
  };

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(mapLead(lead));
  };

  const isEmpty = !isLoading && visibleLeads.length === 0;

  if (isLoading) return <GlobalLoader />;

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

        <LeadHeader onExport={handleExport} onAddLead={openAddForm} />
      </div>

      <LeadSummaryCards stats={visibleStats} />

      <LeadTableFilters
        pendingSearch={filters.pendingSearch}
        pendingSource={filters.pendingSource}
        pendingStatus={filters.pendingStatus}
        pendingPriority={filters.pendingPriority}
        pendingAssignedTo={filters.pendingAssignedTo}
        executives={executives}
        showAssignedToFilter={!isExecutive}
        onSearchChange={filters.setPendingSearch}
        onSourceChange={filters.setPendingSource}
        onStatusChange={filters.setPendingStatus}
        onPriorityChange={filters.setPendingPriority}
        onAssignedToChange={filters.setPendingAssignedTo}
        onClearAll={filters.handleClearAll}
        onApply={filters.handleApply}
      />

      {isEmpty ? (
        <div className="text-center py-10 text-gray-500">No leads found</div>
      ) : (
        <LeadTable
          leads={visibleLeads}
          executives={executives}
          showAssignedTo={!isExecutive}
          search={filters.search}
          sourceFilter={filters.sourceFilter}
          statusFilter={filters.statusFilter}
          priorityFilter={filters.priorityFilter}
          assignedToFilter={isExecutive ? "All" : filters.assignedToFilter}
          renderActions={(lead) => (
            <LeadActions
              lead={lead}
              onEdit={openEditForm}
              onViewDetails={handleViewDetails}
            />
          )}
        />
      )}

      <LeadDialogs
        isFormOpen={isFormOpen}
        editingLead={editingLead}
        onFormSubmit={handleFormSubmit}
        onFormClose={closeForm}
        selectedLead={selectedLead}
        onDetailsClose={() => setSelectedLead(null)}
        fixedAssignedToId={isExecutive ? currentUser?.id : undefined}
        hideAssignedTo={isExecutive}
      />
    </div>
  );
}
