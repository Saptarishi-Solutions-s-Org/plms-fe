"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import GlobalLoader from "@/components/commoncomponents/globalloader";
import LeadActions from "@/components/commoncomponents/leads/leadactions";
import LeadDialogs from "@/components/commoncomponents/leads/lead-dialogs";
import LeadHeader from "@/components/commoncomponents/leads/leadheader";
import LeadSummaryCards from "@/components/commoncomponents/leads/lead-cards";
import LeadTable from "@/components/commoncomponents/leads/leadtable";
import LeadTableFilters from "@/components/commoncomponents/leads/leadtable-filters";
import TablePaginationFooter from "@/components/commoncomponents/table-pagination-footer";
import { useLeadExport } from "@/hooks/export";
import { useLeads } from "@/hooks/use-leads";
import { useUrlLeadFilters } from "@/hooks/useurllead-filters";
import { useUrlPagination } from "@/hooks/use-url-pagination";
import { createLead, updateLead } from "@/services/leads";
import { getOrganizationAdminDashboard } from "@/services/organizationAdmin";
import type {
  ExecutiveOption,
  Lead,
  LeadFormData,
  LeadPayload,
} from "@/types/leadtypes";
import type { UserDetails } from "@/types/organizationadmindashboard/dashboardtypes";

import { type AuthUser, getUser } from "@/lib/auth";
import { canAccess } from "@/lib/permissions";

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

export default function AdminLeadsPage() {
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

  const { page, limit, setPage, setLimit } = useUrlPagination();
  const { filters, setFilters } = useUrlLeadFilters();
  const { handleExport } = useLeadExport();

  const [assignees, setAssignees] = useState<ExecutiveOption[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    getOrganizationAdminDashboard()
      .then((data) => {
        const activeAssignees = data.users
          .filter(
            (user: UserDetails) =>
              user.is_active &&
              ["manager", "executive"].includes(
                user.role_name.toLowerCase(),
              ),
          )
          .map((user: UserDetails) => ({
            id: user.id,
            name: user.name,
            role: user.role_name,
            reportingManagerId: user.reporting_manager_id,
          }));

        setAssignees(activeAssignees);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to load lead assignees.");
      });
  }, []);

  const assigneeIds = useMemo(
    () =>
      filters.assignedTo
        .map(
          (name) =>
            assignees.find((assignee) => assignee.name === name)?.id ?? name,
        )
        .filter(Boolean),
    [assignees, filters.assignedTo],
  );

  const { leads, stats, pagination, isInitialLoading, refetch } = useLeads({
    page,
    limit,
    search: filters.search,
    statuses: filters.statuses,
    priorities: filters.priorities,
    sources: filters.sources,
    assignedTo: assigneeIds,
    statsScope: "all",
    fetchAllAsAdmin: true,
  });

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
      await updateLead({
        id: editingLead.uuid,
        ...data,
        assignedTo: editingLead.assignedTo,
      });
    } else {
      await createLead({ ...data, assignedTo: data.assignedTo ?? "" });
    }

    await refetch();
    closeForm();
  };

  const handleAssignLead = async (lead: Lead, assignedTo: string) => {
    if (lead.assignedTo) return;

    await updateLead({
      id: lead.uuid,
      ...toLeadPayload(lead, assignedTo),
    });
    await refetch();
  };

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead({
      ...lead,
      assignedToName:
        assignees.find((assignee) => assignee.id === lead.assignedTo)?.name ??
        lead.assignedToName ??
        "Unassigned",
    });
  };

  if (isInitialLoading) return <GlobalLoader />;

  return (
    <div className="w-full h-full p-4 sm:p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-semibold text-gray-900">
            All Leads
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            View organization leads and assign them to managers or executives
          </p>
        </div>

        <LeadHeader
          onExport={handleExport}
          onAddLead={openAddForm}
          showImport={false}
          showExport={canExportLead}
          showCreate={canCreateLead}
          showBulkAssign={canUpdateLead}
        />
      </div>

      <LeadSummaryCards stats={stats} />

      <LeadTableFilters
        key={JSON.stringify(filters)}
        executives={assignees}
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
        executives={assignees}
        rowOffset={(pagination.page - 1) * pagination.limit}
        emptyMessage="No leads found"
        renderActions={(lead) => (
          <LeadActions
            lead={lead}
            onEdit={canUpdateLead ? openEditForm : undefined}
            onViewDetails={handleViewDetails}
            executives={assignees}
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
        assignees={assignees}
      />
    </div>
  );
}
