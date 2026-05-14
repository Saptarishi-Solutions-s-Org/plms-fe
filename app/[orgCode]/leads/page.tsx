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
import { getAssignedToId } from "@/types/leadtypes";
import { getUser } from "@/lib/auth";
import {
  createLead,
  getExecutiveUsers,
  updateLead,
} from "@/services/leads";
import type {
  ExecutiveOption,
  Lead,
  LeadFormData,
  LeadPayload,
  LeadUI,
} from "@/types/leadtypes";

const allFilters = {
  search: "",
  source: "All",
  status: "All",
  priority: "All",
  assignedTo: "All",
};


const toLeadPayload = (lead: LeadFormData): LeadPayload => {
  const { assignedToId, ...payload } = lead;

  return {
    ...payload,
    assignedTo: assignedToId,
  };
};

export default function LeadsPage() {
  const { leads, stats, isLoading, refetch } = useLeads();
  const currentUser = getUser();
  const isExecutive = currentUser?.role?.toUpperCase().trim() === "EXECUTIVE";

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<LeadUI | null>(null);
  const [pendingFilters, setPendingFilters] = useState(allFilters);
  const [filters, setFilters] = useState(allFilters);
  const [managerExecutives, setManagerExecutives] = useState<ExecutiveOption[]>(
    [],
  );

  const currentExecutive = useMemo<ExecutiveOption | null>(() => {
    return currentUser ? { id: currentUser.id, name: currentUser.name } : null;
  }, [currentUser]);

  const executives = isExecutive
    ? currentExecutive
      ? [currentExecutive]
      : []
    : managerExecutives;

  const visibleLeads = useMemo(() => {
    if (!isExecutive || !currentUser?.id) return leads;

    return leads.filter((lead) => getAssignedToId(lead) === currentUser.id);
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
      await updateLead({ id: editingLead.uuid, ...toLeadPayload(data) });
    } else {
      await createLead(toLeadPayload(data));
    }

    await refetch();
    closeForm();
  };

  const { handleExport } = useLeadExport();

  const mapLead = (lead: Lead): LeadUI => {
    const assignedToId = getAssignedToId(lead);
    const assignedTo =
      executives.find((executive) => executive.id === assignedToId) ?? {
        id: assignedToId,
        name: lead.assignedToName ?? "Unassigned",
      };

    return {
      ...lead,
      assignedTo,
    };
  };

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(mapLead(lead));
  };

  const isEmpty = !isLoading && visibleLeads.length === 0;

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
        pendingSearch={pendingFilters.search}
        pendingSource={pendingFilters.source}
        pendingStatus={pendingFilters.status}
        pendingPriority={pendingFilters.priority}
        pendingAssignedTo={pendingFilters.assignedTo}
        executives={executives}
        showAssignedToFilter={!isExecutive}
        onSearchChange={(search) =>
          setPendingFilters((current) => ({ ...current, search }))
        }
        onSourceChange={(source) =>
          setPendingFilters((current) => ({ ...current, source }))
        }
        onStatusChange={(status) =>
          setPendingFilters((current) => ({ ...current, status }))
        }
        onPriorityChange={(priority) =>
          setPendingFilters((current) => ({ ...current, priority }))
        }
        onAssignedToChange={(assignedTo) =>
          setPendingFilters((current) => ({ ...current, assignedTo }))
        }
        onClearAll={() => {
          setPendingFilters(allFilters);
          setFilters(allFilters);
        }}
        onApply={() => setFilters(pendingFilters)}
      />

      {isEmpty ? (
        <div className="text-center py-10 text-gray-500">No leads found</div>
      ) : (
        <LeadTable
          leads={visibleLeads}
          executives={executives}
          showAssignedTo={!isExecutive}
          search={filters.search}
          sourceFilter={filters.source}
          statusFilter={filters.status}
          priorityFilter={filters.priority}
          assignedToFilter={isExecutive ? "All" : filters.assignedTo}
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
    )}
  </>
);
}
