"use client";

import { useEffect, useMemo, useState } from "react";

import GlobalLoader from "@/components/commoncomponents/globalloader";
import LeadSummaryCards from "@/components/commoncomponents/leads/lead-cards";
import LeadDialogs from "@/components/commoncomponents/leads/lead-dialogs";
import LeadActions from "@/components/commoncomponents/leads/leadactions";
import LeadHeader from "@/components/commoncomponents/leads/leadheader";
import LeadTableFilters from "@/components/commoncomponents/leads/leadtable-filters";
import LeadTable from "@/components/commoncomponents/leads/leadtable";
import { useLeads } from "@/hooks/use-leads";
import { useLeadExport } from "@/hooks/export";
import { getUser } from "@/lib/auth";
import { createLead, getExecutiveUsers, updateLead } from "@/services/leads";
import type {
  ExecutiveOption,
  Lead,
  LeadFilters,
  LeadFormData,
} from "@/types/leadtypes";

const allFilters = {
  search: "",
  sources: [],
  statuses: [],
  priorities: [],
  assignedTo: [],
};

export default function LeadsPage() {
  const { leads, stats, isLoading, refetch } = useLeads();
  const currentUser = getUser();
  const isExecutive = currentUser?.role?.toUpperCase().trim() === "EXECUTIVE";

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filters, setFilters] = useState<LeadFilters>(allFilters);
  const [managerExecutives, setManagerExecutives] = useState<ExecutiveOption[]>(
    [],
  );

  const currentExecutive = useMemo<ExecutiveOption | null>(() => {
    return currentUser ? { id: currentUser.id, name: currentUser.name } : null;
  }, [currentUser]);

  const executives = useMemo(() => {
    if (!isExecutive) return managerExecutives;

    return currentExecutive ? [currentExecutive] : [];
  }, [currentExecutive, isExecutive, managerExecutives]);

  const visibleLeads = useMemo(() => {
    if (!isExecutive || !currentUser?.id) return leads;

    return leads.filter((lead) => lead.assignedTo === currentUser.id);
  }, [currentUser?.id, isExecutive, leads]);

  const filteredLeads = useMemo(() => {
    return visibleLeads.filter((lead) => {
      const search = filters.search.trim().toLowerCase();
      const assignedExecutive = executives.find(
        (executive) => executive.id === lead.assignedTo,
      );

      const searchMatch =
        !search ||
        lead.name.toLowerCase().includes(search) ||
        lead.email.toLowerCase().includes(search);

      const sourceMatch =
        filters.sources.length === 0 ||
        filters.sources.includes(lead.leadSource);

      const statusMatch =
        filters.statuses.length === 0 || filters.statuses.includes(lead.status);

      const priorityMatch =
        filters.priorities.length === 0 ||
        filters.priorities.includes(lead.priority);

      const assignedToMatch =
        isExecutive ||
        filters.assignedTo.length === 0 ||
        filters.assignedTo.includes(
          assignedExecutive?.name ?? lead.assignedToName ?? "",
        );

      return (
        searchMatch &&
        sourceMatch &&
        statusMatch &&
        priorityMatch &&
        assignedToMatch
      );
    });
  }, [executives, filters, isExecutive, visibleLeads]);

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
      await updateLead({ id: editingLead.uuid, ...data });
    } else {
      await createLead(data);
    }

    await refetch();
    closeForm();
  };

  const { handleExport } = useLeadExport();

  const mapLead = (lead: Lead): Lead => {
    const assignedExecutive = executives.find(
      (executive) => executive.id === lead.assignedTo,
    );

    return {
      ...lead,
      assignedToName:
        assignedExecutive?.name ?? lead.assignedToName ?? "Unassigned",
    };
  };

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(mapLead(lead));
  };

  return (
    <>
      {isLoading ? (
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

            <LeadHeader onExport={handleExport} onAddLead={openAddForm} />
          </div>

          <LeadSummaryCards stats={visibleStats} />

          <LeadTableFilters
            executives={executives}
            showAssignedToFilter={!isExecutive}
            onApply={setFilters}
          />

          <LeadTable
            leads={filteredLeads}
            executives={executives}
            showAssignedTo={!isExecutive}
            emptyMessage="No leads found"
            renderActions={(lead) => (
              <LeadActions
                lead={lead}
                onEdit={openEditForm}
                onViewDetails={handleViewDetails}
              />
            )}
          />

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
      )}
    </>
  );
}
