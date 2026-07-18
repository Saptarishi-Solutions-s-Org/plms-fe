"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

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
import { useUrlLeadFilters } from "@/hooks/useurllead-filters";
import { useUrlPagination } from "@/hooks/use-url-pagination";
import { type AuthUser, getUser } from "@/lib/auth";
import { canAccess } from "@/lib/permissions";
import {
  assignOfferToLead,
  assignOffersToLeads,
  getExecutiveOffers,
} from "@/services/executivestats";
import { createLead, updateLead, getLeadsWithStats } from "@/services/leads";
import {
  type Lead,
  type LeadFormData,
  type LeadOfferOption,
} from "@/types/leadtypes";
import {
  type ExecutiveOffersResponse,
  getOfferItems,
  getOfferPagination,
} from "@/types/leadoffer";
import { DEFAULT_PAGE_LIMIT } from "@/types/pagination";

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
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() =>
    getUser(),
  );

  useEffect(() => {
    const syncUser = () => setCurrentUser(getUser());
    window.addEventListener("LMA-auth-changed", syncUser);
    return () => window.removeEventListener("LMA-auth-changed", syncUser);
  }, []);
  const currentUserId = currentUser?.id;

  const canCreateLead = useMemo(
    () => canAccess(currentUser, ["lead"], ["create"]),
    [currentUser],
  );
  const canExportLead = useMemo(
    () => canAccess(currentUser, ["lead"], ["export"]),
    [currentUser],
  );
  const canImportLead = useMemo(
    () => canAccess(currentUser, ["lead"], ["import"]),
    [currentUser],
  );
  const canUpdateLead = useMemo(
    () => canAccess(currentUser, ["lead"], ["update"]),
    [currentUser],
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);
  const [bulkAssignLeads, setBulkAssignLeads] = useState<Lead[]>([]);
  const [isBulkAssignLeadsLoading, setIsBulkAssignLeadsLoading] =
    useState(false);

  const fetchBulkAssignLeads = useCallback(async () => {
    setIsBulkAssignLeadsLoading(true);

    try {
      const BULK_ASSIGN_PAGE_LIMIT = 100;
      const bulkLimit = Math.max(
        BULK_ASSIGN_PAGE_LIMIT,
        pagination.total,
        stats.total,
        leads.length,
        limit,
      );
      const joinFilterValues = (values?: string[]) => {
        const filteredValues = values?.filter(Boolean) ?? [];
        return filteredValues.length ? filteredValues.join(",") : undefined;
      };
      const params = {
        limit: bulkLimit,
        search: filters.search,
        status: joinFilterValues(filters.statuses),
        priority: joinFilterValues(filters.priorities),
        leadSource: joinFilterValues(filters.sources),
        assignedTo: currentUserId,
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
    currentUserId,
    filters.priorities,
    filters.search,
    filters.sources,
    filters.statuses,
    leads.length,
    limit,
    pagination.total,
    stats.total,
  ]);

  const [offerOptions, setOfferOptions] = useState<LeadOfferOption[]>([]);
  const [isOfferOptionsLoading, setIsOfferOptionsLoading] = useState(false);

  const fetchOfferOptions = useCallback(async () => {
    setIsOfferOptionsLoading(true);

    try {
      const fetchOfferPage = (nextPage: number) =>
        getExecutiveOffers({
          page: nextPage,
          limit: DEFAULT_PAGE_LIMIT,
        }) as Promise<ExecutiveOffersResponse>;

      const firstResponse = await fetchOfferPage(1);
      const firstItems = getOfferItems(firstResponse);
      const firstPagination = getOfferPagination(firstResponse);
      let items = firstItems;

      if (firstPagination?.totalPages && firstPagination.totalPages > 1) {
        const remainingResponses = await Promise.all(
          Array.from({ length: firstPagination.totalPages - 1 }, (_, index) =>
            fetchOfferPage(index + 2),
          ),
        );

        items = [firstItems, ...remainingResponses.map(getOfferItems)].flat();
      }

      setOfferOptions(
        items.map((offer) => ({
          id: offer.id ?? "",
          title: offer.title ?? "",
          status: offer.status ?? "inactive",
        })),
      );
    } catch {
      setOfferOptions([]);
    } finally {
      setIsOfferOptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOfferOptions();
  }, [fetchOfferOptions]);

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
    const results = await Promise.allSettled(
      offerIds.map((offerId) => assignOffersToLeads({ offerId, leadIds })),
    );

    const successCount = results.reduce(
      (count, result) =>
        result.status === "fulfilled"
          ? count + result.value.assignedCount
          : count,
      0,
    );
    const skippedCount = results.reduce(
      (count, result) =>
        result.status === "fulfilled"
          ? count + result.value.skippedCount
          : count,
      0,
    );
    const rejectedCount = results.filter(
      (result) => result.status === "rejected",
    ).length;
    const failureCount = skippedCount + rejectedCount * leadIds.length;

    return { successCount, failureCount };
  };

  const handleAssignOffer = async (lead: Lead, offerId: string) => {
    try {
      await assignOfferToLead({
        offerId,
        leadId: lead.uuid,
      });

      toast.success("Offer assigned to lead successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to assign offer.",
      );
    }
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
              showImport={canImportLead}
              showExport={canExportLead}
              showCreate={canCreateLead}
              showBulkAssign={canUpdateLead}
              onImportComplete={refetch}
              onBulkAssign={() => {
                setIsBulkAssignOpen(true);
                void fetchBulkAssignLeads();
              }}
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
                onEdit={canUpdateLead ? openEditForm : undefined}
                onViewDetails={handleViewDetails}
                offerOptions={offerOptions}
                isOfferOptionsLoading={isOfferOptionsLoading}
                onAssignOffer={canUpdateLead ? handleAssignOffer : undefined}
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
            leads={bulkAssignLeads}
            isLoadingLeads={isBulkAssignLeadsLoading}
            onClose={() => setIsBulkAssignOpen(false)}
            onAssign={handleBulkAssign}
          />
        </div>
      )}
    </>
  );
}
