"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import GlobalLoader from "@/components/commoncomponents/globalloader";
import { BulkActionsDrawer } from "@/components/commoncomponents/bulk-actions/BulkActionsDrawer";
import { CreateOfferDialog } from "@/components/commoncomponents/offers/createoffer";
import { OfferCards } from "@/components/commoncomponents/offers/offercards";
import { OfferFilters } from "@/components/commoncomponents/offers/offerfilter";
import TablePaginationFooter from "@/components/commoncomponents/table-pagination-footer";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useManagerOfferExport } from "@/hooks/export";
import { useUrlPagination } from "@/hooks/use-url-pagination";
import { useUrlOfferFilters } from "@/hooks/useurloffer";
import { type AuthUser, getUser } from "@/lib/auth";
import { canAccess } from "@/lib/permissions";
import { subscribeRealtime } from "@/lib/socket";
import { MoreHorizontal, ListChecks, Download, Plus, Loader2 } from "lucide-react";
import Image from "next/image";

import {
  assignOfferToExecutive,
  bulkAssignOffersToExecutives,
  getAvailableExecutivesForOffer,
  getExecutiveOverview,
  getManagerOfferOverview,
} from "@/services/managerdashboard";
import {
  createManagerOffer,
  getExecutivesByOffer,
  updateManagerOffer,
} from "@/services/offers";

import type { OfferPayload } from "@/lib/validators/offervalidation";

import type {
  Offer,
  OfferFilters as OfferFiltersType,
} from "@/types/Createoffer";
import type { Offer as BulkOffer } from "@/types/offerbulk";
import { emptyPagination } from "@/types/pagination";
import type { PaginationMeta } from "@/types/pagination";
import { OFFER_LIST_CHANGED } from "@/types/realtime";

import {
  formatDate,
  formatStatusLabel,
  AssignedExecutive,
  ExecutiveRow,
  ExecutiveUser,
  ManagerOffer,
  ManagerOfferOverviewItem,
} from "@/types/org-manager";

const DEFAULT_FILTERS: OfferFiltersType = {
  search: "",
  status: [],
  discountType: [],
};

const DISCOUNT_TYPE_LABELS: Record<string, string> = {
  Fixed_Amount: "Fixed Amount",
  Percentage: "Percentage",
  Combo_Offer: "Combo Offer",
  Buy_One_Get_One_Free: "Buy One Get One",
  Conditional_Discount: "Conditional",
  Flag_Discount: "Flag Discount",
};

const formatManagerOffers = (
  items: ManagerOfferOverviewItem[] = [],
): ManagerOffer[] =>
  items.map((item) => ({
    id: item.id,

    title: item.title || "",

    code: item.code || "",

    description: item.description || "",

    assignedUsers: "",

    assignedExecutives: item.assigned_executives ?? [],

    isGlobal: item.is_global ?? false,

    status: (item.status?.toLowerCase() || "inactive") as Offer["status"],

    discountType: item.discount_type || "Fixed_Amount",

    discountAmount: item.discount_amount,

    discountPercentage: item.discount_percentage,

    maxDiscountAmount: item.max_discount_amount,

    comboDescription: item.combo_description,

    buyQuantity: item.buy_quantity,

    getQuantity: item.get_quantity,

    minPurchaseAmount: item.min_purchase_amount,

    conditionalDiscountValue: item.discount_value,

    flagDiscountAmount: item.flag_discount_amount,

    assignStatus: item.assignStatus,

    validFrom: item.valid_from || "",

    validTo: item.valid_to || "",

    createdAt: item.createdat,

    createdBy: "",

    organization: null,

    managers: [],
  }));

export default function OrgManagerOffersPage() {
  const [user, setUser] = useState<AuthUser | null>(() => getUser());

  useEffect(() => {
    const syncUser = () => setUser(getUser());
    window.addEventListener("LMA-auth-changed", syncUser);
    return () => window.removeEventListener("LMA-auth-changed", syncUser);
  }, []);

  const canView = useMemo(
    () => canAccess(user, ["offers"], ["view"]),
    [user],
  );
  const canCreate = useMemo(
    () => canAccess(user, ["offers"], ["create"]),
    [user],
  );
  const canExport = useMemo(
    () => canAccess(user, ["offers"], ["export"]),
    [user],
  );
  const canUpdate = useMemo(
    () => canAccess(user, ["offers"], ["update"]),
    [user],
  );

  const { handleExport } = useManagerOfferExport();
  const { page, limit, setPage, setLimit } = useUrlPagination();
  const [offers, setOffers] = useState<ManagerOffer[]>([]);
  const [bulkOffers, setBulkOffers] = useState<ManagerOffer[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(
    emptyPagination(limit),
  );

  const [executives, setExecutives] = useState<ExecutiveRow[]>([]);

  const [availableExecutivesByOffer, setAvailableExecutivesByOffer] = useState<
    Record<string, ExecutiveUser[]>
  >({});

  const [
    availableExecutivesLoadingOfferId,
    setAvailableExecutivesLoadingOfferId,
  ] = useState<string | null>(null);

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [offerToAssign, setOfferToAssign] = useState<ManagerOffer | null>(null);

  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<ManagerOffer | null>(null);

  const [isViewAllErrorOpen, setIsViewAllErrorOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<ManagerOffer | null>(null);
  const [assignedExecutives, setAssignedExecutives] = useState<
    AssignedExecutive[]
  >([]);
  const [isAssignedExecutivesLoading, setIsAssignedExecutivesLoading] =
    useState(false);
  const [assignedExecutivesError, setAssignedExecutivesError] = useState("");

  const [totalCount, setTotalCount] = useState(0);

  const [activeCount, setActiveCount] = useState(0);

  const [inactiveCount, setInactiveCount] = useState(0);

  const [globalCount, setGlobalCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isBulkOffersLoading, setIsBulkOffersLoading] = useState(false);
  const [bulkOffersError, setBulkOffersError] = useState<string | null>(null);

  const { filters, setFilters } = useUrlOfferFilters();

  const [draftFilters, setDraftFilters] = useState(filters);
  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  const bulkActionExecutives = useMemo(
    () =>
      executives.map((executive) => ({
        id: executive.id,
        name: executive.name,
        leadCount: executive.leadCount,
        activeOfferCount: executive.offerCount,
      })),
    [executives],
  );

  const bulkActionOffers = useMemo(
    (): BulkOffer[] =>
      bulkOffers
        .filter((offer) => offer.status !== "expired")
        .map((offer) => ({
        id: offer.id,
        title: offer.title,
        description: offer.description,
        validTo: offer.validTo,
        status: (offer.status === "active"
          ? "ACTIVE"
          : offer.status === "inactive"
            ? "INACTIVE"
            : "EXPIRED") as BulkOffer["status"],
        })),
    [bulkOffers],
  );

  const fetchOffers = useCallback(async () => {
    if (!canView) {
      setOffers([]);
      setPagination(emptyPagination(limit));
      setExecutives([]);
      setTotalCount(0);
      setActiveCount(0);
      setInactiveCount(0);
      setGlobalCount(0);
      setIsLoading(false);
      setHasLoaded(true);
      return;
    }

    try {
      setIsLoading(true);

      const [response, executivesResponse] = await Promise.all([
        getManagerOfferOverview({
          page,
          limit,
          search: filters.search,
          status: filters.status.join(","),
          discountType: filters.discountType.join(","),
        }),
        getExecutiveOverview(),
      ]);

      const data = response?.value || response;

      const stats = data?.stats || {};
      setPagination(data?.pagination ?? emptyPagination(limit));

      setExecutives(
        executivesResponse?.value?.executives ||
        executivesResponse?.executives ||
        executivesResponse?.value ||
        executivesResponse ||
        [],
      );

      setTotalCount(stats.totalOffers || 0);

      setActiveCount(stats.activeOffers || 0);

      setInactiveCount(stats.inactiveOffers || 0);

      setGlobalCount(stats.globalOffers || 0);

      setOffers(formatManagerOffers(data?.offers));
    } catch (err) {
      console.error("Failed to load offers", err);
      setOffers([]);
      setPagination(emptyPagination(limit));
      setExecutives([]);
      setTotalCount(0);
      setActiveCount(0);
      setInactiveCount(0);
      setGlobalCount(0);
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, [canView, filters, limit, page]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  useEffect(() => {
    if (!canView) return;
    return subscribeRealtime(OFFER_LIST_CHANGED, () => {
      fetchOffers();
    });
  }, [canView, fetchOffers]);

  const fetchBulkOffers = useCallback(async () => {
    try {
      setIsBulkOffersLoading(true);
      setBulkOffersError(null);

      const bulkLimit = Math.max(
        pagination.total,
        totalCount,
        offers.length,
        limit,
      );
      const params = {
        limit: bulkLimit,
        search: filters.search,
        status: filters.status.join(","),
        discountType: filters.discountType.join(","),
      };
      const firstResponse = await getManagerOfferOverview({
        ...params,
        page: 1,
      });
      const firstPage = firstResponse?.value || firstResponse;
      const firstPageOffers = firstPage?.offers ?? [];
      const totalPages = firstPage?.pagination?.totalPages ?? 1;

      if (totalPages <= 1) {
        setBulkOffers(formatManagerOffers(firstPageOffers));
        return;
      }

      const remainingPages = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, index) =>
          getManagerOfferOverview({ ...params, page: index + 2 }),
        ),
      );

      setBulkOffers(
        formatManagerOffers([
          ...firstPageOffers,
          ...remainingPages.flatMap((response) => {
            const pageData = response?.value || response;
            return pageData?.offers ?? [];
          }),
        ]),
      );
    } catch (error) {
      console.error("Failed to load offers for bulk assignment", error);
      setBulkOffers([]);
      setBulkOffersError("Failed to load offers for bulk assignment.");
    } finally {
      setIsBulkOffersLoading(false);
    }
  }, [filters, limit, offers.length, pagination.total, totalCount]);

  useEffect(() => {
    if (isBulkActionsOpen && canUpdate) {
      fetchBulkOffers();
    }
  }, [canUpdate, fetchBulkOffers, isBulkActionsOpen]);

  const handleFilterChange = useCallback(
    <K extends keyof OfferFiltersType>(key: K, value: OfferFiltersType[K]) => {
      setDraftFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [],
  );

  const handleApplyFilters = useCallback(() => {
    setFilters(draftFilters);
  }, [draftFilters, setFilters]);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setDraftFilters(DEFAULT_FILTERS);
  }, [setFilters]);

  const rowOffset = (pagination.page - 1) * pagination.limit;

  const getDiscountValue = (offer: Offer) => {
    switch (offer.discountType) {
      case "Fixed_Amount":
        return `₹${offer.discountAmount}`;

      case "Percentage":
        return `${offer.discountPercentage}%`;

      case "Combo_Offer":
        return offer.comboDescription || "—";

      case "Buy_One_Get_One_Free":
        return `Buy ${offer.buyQuantity} Get ${offer.getQuantity}`;

      case "Conditional_Discount":
        return `₹${offer.conditionalDiscountValue}`;

      case "Flag_Discount":
        return `₹${offer.flagDiscountAmount}`;

      default:
        return "—";
    }
  };

  const handleAssignOffer = async (offerId: string, executiveId: string) => {
    try {
      const response = await assignOfferToExecutive({
        offerId,
        executiveId,
      });

      toast.success(
        response?.message || "Offer assigned to executive successfully",
      );
      setAvailableExecutivesByOffer((current) => ({
        ...current,
        [offerId]: (current[offerId] ?? []).filter(
          (executive) => executive.id !== executiveId,
        ),
      }));
      fetchOffers();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to assign offer to executive",
      );
    }
  };

  const handleOpenAssignDialog = async (offer: ManagerOffer) => {
    if (offer.status !== "active") return;

    setOfferToAssign(offer);
    setAssignDialogOpen(true);
    setAvailableExecutivesLoadingOfferId(offer.id);

    try {
      const response = await getAvailableExecutivesForOffer(offer.id);
      setAvailableExecutivesByOffer((current) => ({
        ...current,
        [offer.id]: response ?? [],
      }));
    } catch (error) {
      setAvailableExecutivesByOffer((current) => ({
        ...current,
        [offer.id]: [],
      }));

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load available executives",
      );

    } finally {
      setAvailableExecutivesLoadingOfferId(null);
    }
  };

  const handleViewAssignedExecutives = async (offer: ManagerOffer) => {
    setSelectedOffer(offer);
    setAssignedExecutives([]);
    setAssignedExecutivesError("");
    setIsAssignedExecutivesLoading(true);
    setIsViewAllErrorOpen(true);

    try {
      const response = await getExecutivesByOffer(offer.id);
      setAssignedExecutives(response ?? []);
    } catch (error) {
      setAssignedExecutivesError(
        error instanceof Error
          ? error.message
          : "Failed to load assigned executives",
      );
    } finally {
      setIsAssignedExecutivesLoading(false);
    }
  };

  const buildManagerOfferApiPayload = (data: OfferPayload) => ({
    ...(data.id && { id: data.id }),

    title: data.title,
    description: data.description,
    discount_type: data.discount_type,
    valid_from: data.valid_from,
    valid_to: data.valid_to,

    ...(data.discount_amount !== undefined && {
      discount_amount: data.discount_amount,
    }),

    ...(data.discount_percentage !== undefined && {
      discount_percentage: data.discount_percentage,
    }),

    ...(data.max_discount_amount !== undefined && {
      max_discount_amount: data.max_discount_amount,
    }),

    ...(data.combo_description !== undefined && {
      combo_description: data.combo_description,
    }),

    ...(data.buy_quantity !== undefined && {
      buy_quantity: data.buy_quantity,
    }),

    ...(data.get_quantity !== undefined && {
      get_quantity: data.get_quantity,
    }),

    ...(data.min_purchase_amount !== undefined && {
      min_purchase_amount: data.min_purchase_amount,
    }),

    ...(data.discount_value !== undefined && {
      discount_value: data.discount_value,
    }),

    ...(data.flag_discount_amount !== undefined && {
      flag_discount_amount: data.flag_discount_amount,
    }),
  });

  const handleCreateOffer = async (data: OfferPayload) => {
    try {
      await createManagerOffer(buildManagerOfferApiPayload(data));

      await fetchOffers();

      return { success: true as const };
    } catch {
      return {
        success: false as const,
        error: "Failed to create offer",
      };
    }
  };

  const handleUpdateOffer = async (data: OfferPayload) => {
    try {
      await updateManagerOffer(buildManagerOfferApiPayload(data));

      await fetchOffers();

      return { success: true as const };
    } catch {
      return {
        success: false as const,
        error: "Failed to update offer",
      };
    }
  };

  const handleSubmitOffer = (data: OfferPayload) =>
    data.id ? handleUpdateOffer(data) : handleCreateOffer(data);

  const handleEditOffer = (offer: ManagerOffer) => {
    setEditingOffer(offer);
    setCreateOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setCreateOpen(open);
    if (!open) setEditingOffer(null);
  };

  const handleBulkAssignOffer = async ({
    offerIds,
    executiveIds,
  }: {
    offerIds: string[];
    executiveIds: string[];
  }) => {
    const response = await bulkAssignOffersToExecutives({
      offerIds,
      executiveIds,
    });

    await fetchOffers();

    return response;
  };

  const isInitialLoading = isLoading && !hasLoaded;

  if (isInitialLoading) {
    return (
      <>
        <GlobalLoader />
      </>
    );
  }

  return (
    <div className="w-full h-full p-4 sm:p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 sm:text-2xl">
            Offers
          </h1>
          <p className="text-xs text-gray-500 sm:text-sm">
            Manage offers and assign them to leads easily.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {canExport && (
            <Button
              type="button"
              variant="outline"
              onClick={handleExport}
              className="flex h-9 w-full items-center justify-center gap-1.5 rounded-full border-blue-600 px-4 text-blue-600 hover:bg-blue-50 hover:text-blue-700 sm:w-auto"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}

          {canUpdate && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBulkActionsOpen(true)}
              className="flex h-9 w-full items-center justify-center gap-1.5 rounded-full border-blue-600 px-4 text-blue-600 hover:bg-blue-50 hover:text-blue-700 sm:w-auto"
            >
              <ListChecks className="h-4 w-4" />
              Bulk Action
            </Button>
          )}

          {canCreate && (
            <Button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Create Offer
            </Button>
          )}
        </div>
      </div>

      <CreateOfferDialog
        open={createOpen}
        onOpenChange={handleDialogOpenChange}
        onSubmit={handleSubmitOffer}
        offer={editingOffer}
        scope="manager"
      />

      <BulkActionsDrawer
        open={isBulkActionsOpen}
        executives={bulkActionExecutives}
        offers={bulkActionOffers}
        offersLoading={isBulkOffersLoading}
        offersError={bulkOffersError}
        onClose={() => setIsBulkActionsOpen(false)}
        onAssignOffer={handleBulkAssignOffer}
      />

      {canView ? (
        <>
          {/* Cards */}
          <OfferCards
            totalCount={totalCount}
            activeCount={activeCount}
            inactiveCount={inactiveCount}
            globalCount={globalCount}
          />

          {/* Filters */}
          <OfferFilters
            filters={draftFilters}
            onFilterChange={handleFilterChange}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />

          {/* Table */}
          <TablePaginationFooter
            pagination={pagination}
            onPageChange={setPage}
            onLimitChange={setLimit}
            placement="top"
            totalLabel="offers"
          />

          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <Table>
              <TableHeader className="bg-[#7677F41A]">
                <TableRow>
                  <TableHead>S.No</TableHead>

                  <TableHead>Offer Name</TableHead>

                  <TableHead>Description</TableHead>

                  <TableHead>Discount Type</TableHead>

                  <TableHead>Discount Value</TableHead>

                  <TableHead>Valid From</TableHead>

                  <TableHead>Valid To</TableHead>

                  <TableHead>Status</TableHead>

                  <TableHead>Assign Status</TableHead>

                  <TableHead>Assigned To</TableHead>

                  {canUpdate && (
                    <TableHead className="text-center">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={canUpdate ? 11 : 10} className="py-10 text-center text-gray-500">
                      Loading offers...
                    </TableCell>
                  </TableRow>
                ) : offers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={canUpdate ? 11 : 10}
                      className="py-10 text-center text-gray-500"
                    >
                      No Offers Available
                    </TableCell>
                  </TableRow>
                ) : (
                  offers.map((offer, index) => (
                    <TableRow key={offer.id}>
                      <TableCell>{rowOffset + index + 1}</TableCell>

                      <TableCell className="font-medium">{offer.title}</TableCell>

                      <TableCell className="max-w-[250px] truncate">
                        {offer.description || "—"}
                      </TableCell>

                      <TableCell>
                        {DISCOUNT_TYPE_LABELS[offer.discountType] ??
                          offer.discountType}
                      </TableCell>

                      <TableCell>{getDiscountValue(offer)}</TableCell>

                      <TableCell>{formatDate(offer.validFrom)}</TableCell>

                      <TableCell>{formatDate(offer.validTo)}</TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            offer.status === "active"
                              ? "border-green-200 bg-green-50 text-green-700"
                              : offer.status === "expired"
                                ? "border-red-200 bg-red-50 text-red-700"
                                : "border-gray-200 bg-gray-50 text-gray-600"
                          }
                        >
                          <span
                            className={`mr-1.5 h-1.5 w-1.5 rounded-full ${offer.status === "active"
                              ? "bg-green-500"
                              : offer.status === "expired"
                                ? "bg-red-400"
                                : "bg-gray-400"
                              }`}
                          />
                          {formatStatusLabel(offer.status)}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {offer.assignStatus ? (
                          <Badge
                            className={
                              offer.assignStatus.toLowerCase() === "assigned"
                                ? "border-purple-200 bg-purple-100 text-purple-700"
                                : "border-slate-200 bg-slate-100 text-slate-700"
                            }
                          >
                            {offer.assignStatus}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>

                      <TableCell>
                        <Button
                          variant="link"
                          className="h-auto p-0 text-blue-600 hover:text-blue-700"
                          onClick={() => handleViewAssignedExecutives(offer)}
                        >
                          View All
                        </Button>
                      </TableCell>

                      {canUpdate && (
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={offer.status === "expired"}
                                className={
                                  offer.status === "expired"
                                    ? "cursor-not-allowed opacity-100"
                                    : ""
                                }
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>

                      <DropdownMenuContent
                        align="end"
                        className="max-h-60 overflow-y-auto"
                      >
                        <DropdownMenuItem
                          onClick={() => handleEditOffer(offer)}
                        >
                          Edit
                        </DropdownMenuItem>

                              {offer.status === "active" && (
                                <DropdownMenuItem
                                  onClick={() => handleOpenAssignDialog(offer)}
                                >
                                  Assign To
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <TablePaginationFooter
            pagination={pagination}
            onPageChange={setPage}
            onLimitChange={setLimit}
            totalLabel="offers"
          />
        </>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-sm text-gray-500 shadow-sm">
          You do not have permission to view offers.
        </div>
      )}

      <AlertDialog
        open={isViewAllErrorOpen}
        onOpenChange={(open) => {
          setIsViewAllErrorOpen(open);
          if (!open) {
            setSelectedOffer(null);
          }
        }}
      >
        <AlertDialogContent className="w-[420px] max-w-[calc(100vw-2rem)] rounded-[2rem] border-0 bg-white px-5 py-6 shadow-2xl sm:px-6">
          <AlertDialogHeader className="items-center gap-2 text-center">
            <Image
              src="/saptarishi.png"
              alt="SAPtarishi"
              width={150}
              height={54}
              priority
              className="h-auto w-[150px] object-contain"
            />

            <AlertDialogTitle className="text-center text-xl font-poppins text-gray-950">
              Assigned Executives
            </AlertDialogTitle>

            <AlertDialogDescription className="max-w-[420px] text-center text-sm leading-5 text-slate-600">
              {selectedOffer?.title
                ? `${selectedOffer.title} is assigned to the executives below.`
                : "Assigned executives for this offer are shown below."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="rounded-xl border border-red-100 bg-red-50/70 p-3">
            <div className="max-h-36 space-y-2 overflow-y-scroll rounded-lg bg-white p-3 shadow-sm custom-scrollbar">
              {isAssignedExecutivesLoading && (
                <p className="text-center text-sm font-medium text-slate-500">
                  Loading assigned executives...
                </p>
              )}

              {!isAssignedExecutivesLoading && assignedExecutivesError && (
                <p className="text-center text-sm font-medium text-red-600">
                  {assignedExecutivesError}
                </p>
              )}

              {!isAssignedExecutivesLoading &&
                !assignedExecutivesError &&
                assignedExecutives.length === 0 && (
                  <p className="text-center text-sm font-medium text-slate-500">
                    No executives assigned yet.
                  </p>
                )}

              {!isAssignedExecutivesLoading &&
                !assignedExecutivesError &&
                assignedExecutives.map((executive, index) => (
                  <div key={executive.id ?? `${executive.name}-${index}`}>
                    <p className="text-sm font-bold text-gray-950">
                      {executive.name}
                    </p>
                    {executive.email && (
                      <p className="text-sm text-slate-600">
                        {executive.email}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>

          <AlertDialogFooter className="justify-center sm:justify-center">
            <AlertDialogAction className="h-12 w-full rounded-lg bg-blue-500 text-sm font-bold text-white hover:bg-blue-600">
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <AlertDialogContent className="w-[420px] max-w-[calc(100vw-2rem)] rounded-3xl border-0 bg-white p-4 shadow-2xl">
          <AlertDialogHeader className="flex flex-col items-center space-y-1 text-center">
            <Image
              src="/saptarishi.png"
              alt="SAPtarishi"
              width={90}
              height={32}
              priority
              className="h-auto w-[90px] object-contain mb-0.5"
            />

            <AlertDialogTitle className="text-base font-semibold text-slate-900">
              Assign Offer
            </AlertDialogTitle>

            <AlertDialogDescription className="max-w-xs text-[11px] text-slate-500">
              Select an executive to assign this offer.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="rounded-xl border border-red-100 bg-red-50/70 p-1.5 mt-2">
            <div className="max-h-[120px] space-y-1.5 overflow-y-auto rounded-lg bg-white p-1.5 shadow-sm custom-scrollbar">
              {availableExecutivesLoadingOfferId === offerToAssign?.id ? (
                <div className="flex items-center justify-center py-3 text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <p className="text-center text-xs font-medium">Loading executives...</p>
                </div>
              ) : (availableExecutivesByOffer[offerToAssign?.id ?? ""] ?? []).length === 0 ? (
                <p className="text-center text-xs font-medium text-slate-500 py-3">
                  No eligible executives found.
                </p>
              ) : (
                availableExecutivesByOffer[offerToAssign?.id ?? ""].map((executive) => (
                  <div key={executive.id} className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg border border-slate-100">
                    <span className="font-poppins text-xs font-medium text-gray-950 px-1">{executive.name}</span>
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-blue-500 hover:bg-blue-600 text-white font-poppins h-6 px-3 text-[11px]"
                      onClick={() => {
                        if (offerToAssign) {
                          handleAssignOffer(offerToAssign.id, executive.id);
                          setAssignDialogOpen(false);
                        }
                      }}
                    >
                      Assign
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <AlertDialogFooter className="justify-center sm:justify-center mt-3">
            <AlertDialogAction className="h-9 w-full rounded-lg bg-blue-500 text-xs font-poppins text-white hover:bg-blue-600">
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
