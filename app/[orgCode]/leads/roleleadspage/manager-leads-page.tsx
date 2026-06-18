"use client";

import { useEffect, useMemo, useState } from "react";

import GlobalLoader from "@/components/commoncomponents/globalloader";
import LeadSummaryCards from "@/components/commoncomponents/leads/lead-cards";
import LeadDialogs from "@/components/commoncomponents/leads/lead-dialogs";
import LeadActions from "@/components/commoncomponents/leads/leadactions";
import LeadHeader from "@/components/commoncomponents/leads/leadheader";
import LeadTableFilters from "@/components/commoncomponents/leads/leadtable-filters";
import LeadTable from "@/components/commoncomponents/leads/leadtable";
import { useLeadExport } from "@/hooks/export";
import { useLeads } from "@/hooks/use-leads";
import { createLead, getExecutiveUsers, updateLead } from "@/services/leads";
import type {
  ExecutiveOption,
  Lead,
  LeadFilters,
  LeadFormData,
} from "@/types/leadtypes";
import { allFilters } from "@/types/leadtypes";

function normalizeFilterValue(value: string) {
  return value.trim().toLowerCase().replace(/[\s_]+/g, "");
}

export default function ManagerLeadsPage() {
  const { leads, stats, isInitialLoading, refetch } = useLeads();
  const { handleExport } = useLeadExport();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filters, setFilters] = useState<LeadFilters>(allFilters);
  const [executives, setExecutives] = useState<ExecutiveOption[]>([]);

  useEffect(() => {
    getExecutiveUsers().then(setExecutives).catch(console.error);
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const search = filters.search.trim().toLowerCase();
      const assignedExecutive = executives.find(
        (executive) => executive.id === lead.assignedTo,
      );

      const searchMatch =
        !search ||
        lead.name.toLowerCase().includes(search) ||
        lead.email.toLowerCase().includes(search);

      const statusMatch =
        filters.statuses.length === 0 || filters.statuses.includes(lead.status);

      const priorityMatch =
        filters.priorities.length === 0 ||
        filters.priorities.includes(lead.priority);

      const assignedToMatch =
        filters.assignedTo.length === 0 ||
        filters.assignedTo.includes(
          assignedExecutive?.name ?? lead.assignedToName ?? "",
        );

      return (
        searchMatch &&
        statusMatch &&
        priorityMatch &&
        assignedToMatch
      );
    });
  }, [executives, filters, leads]);

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
            />
          </div>

          <LeadSummaryCards stats={stats} />

          <LeadTableFilters executives={executives} onApply={setFilters} />

          <LeadTable
            leads={filteredLeads}
            executives={executives}
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
          />
        </div>
      )}
    </>
  );
}
 