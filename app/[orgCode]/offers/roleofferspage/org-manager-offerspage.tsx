"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import GlobalLoader from "@/components/commoncomponents/globalloader";
import { BulkActionsDrawer } from "@/components/commoncomponents/bulk-actions/BulkActionsDrawer";
import { OfferCards } from "@/components/commoncomponents/offers/offercards";
import { OfferFilters } from "@/components/commoncomponents/offers/offerfilter";

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
import { subscribeRealtime } from "@/lib/socket";
import { Plus, MoreHorizontal } from "lucide-react";
import Image from "next/image";

import {
  assignOfferToExecutive,
  getAvailableExecutivesForOffer,
  getExecutiveOverview,
  getManagerOfferOverview,
} from "@/services/managerdashboard";
import { getExecutivesByOffer } from "@/services/offers";

import type {
  Offer,
  OfferFilters as OfferFiltersType,
} from "@/types/Createoffer";
import type { Offer as BulkOffer } from "@/types/offerbulk";
import type { BulkAssignResult } from "@/types/offerbulk";
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
export default function OrgManagerOffersPage() {
  const [offers, setOffers] = useState<ManagerOffer[]>([]);

  const [executives, setExecutives] = useState<ExecutiveRow[]>([]);

  const [availableExecutivesByOffer, setAvailableExecutivesByOffer] = useState<
    Record<string, ExecutiveUser[]>
  >({});

  const [
    availableExecutivesLoadingOfferId,
    setAvailableExecutivesLoadingOfferId,
  ] = useState<string | null>(null);

  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);

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

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);

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
      offers.map((offer) => ({
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
    [offers],
  );

  const fetchOffers = useCallback(async () => {
    try {
      setIsLoading(true);

      const [response, executivesResponse] = await Promise.all([
        getManagerOfferOverview(),
        getExecutiveOverview(),
      ]);

      const data = response?.value || response;

      const stats = data?.stats || {};

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

      const formattedOffers: ManagerOffer[] = (data?.offers || []).map(
        (item: ManagerOfferOverviewItem) => ({
          id: item.id,

          title: item.title,

          code: item.code,

          description: item.description,

          assignedUsers: "",

          assignedExecutives: item.assigned_executives ?? [],

          isGlobal: item.is_global,

          status: item.status?.toLowerCase() || "inactive",

          discountType: item.discount_type,

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

          validFrom: item.valid_from,

          validTo: item.valid_to,

          createdAt: item.createdat,

          createdBy: "",

          organization: null,

          managers: [],
        }),
      );
      setOffers(formattedOffers);
    } catch (err) {
      console.error("Failed to load offers", err);
      setOffers([]);
      setExecutives([]);
      setTotalCount(0);
      setActiveCount(0);
      setInactiveCount(0);
      setGlobalCount(0);
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  useEffect(() => {
    return subscribeRealtime(OFFER_LIST_CHANGED, () => {
      fetchOffers();
    });
  }, [fetchOffers]);

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
  }, [draftFilters]);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);

    setDraftFilters(DEFAULT_FILTERS);
  }, []);

  const filteredOffers = useMemo(
    () =>
      offers.filter((offer) => {
        const query = filters.search.toLowerCase();

        const matchSearch =
          !query ||
          offer.title.toLowerCase().includes(query) ||
          offer.code.toLowerCase().includes(query);

        const matchStatus =
          filters.status.length === 0 || filters.status.includes(offer.status);

        const matchDiscount =
          filters.discountType.length === 0 ||
          filters.discountType.includes(offer.discountType);

        return matchSearch && matchStatus && matchDiscount;
      }),
    [offers, filters],
  );

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

  const handleActionsMenuOpenChange = async (
    offerId: string,
    open: boolean,
  ) => {
    if (!open) return;

    setAvailableExecutivesLoadingOfferId(offerId);

    try {
      const response = await getAvailableExecutivesForOffer(offerId);
      setAvailableExecutivesByOffer((current) => ({
        ...current,
        [offerId]: response ?? [],
      }));
    } catch (error) {
      setAvailableExecutivesByOffer((current) => ({
        ...current,
        [offerId]: [],
      }));

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load available executives",
      );
      
    } finally {
      setAvailableExecutivesLoadingOfferId((currentOfferId) =>
        currentOfferId === offerId ? null : currentOfferId,
      );
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

  const handleBulkAssignOffer = async ({
    offerId,
    executiveIds,
  }: {
    offerId: string;
    executiveIds: string[];
  }): Promise<BulkAssignResult> => {
    const failures: BulkAssignResult["failures"] = [];
    let successCount = 0;

    for (const executiveId of executiveIds) {
      try {
        await assignOfferToExecutive({ offerId, executiveId });
        successCount += 1;
      } catch (error) {
        failures.push({
          executiveId,
          message:
            error instanceof Error
              ? error.message
              : "Failed to assign offer to executive",
        });
      }
    }

    return {
      offerId,
      successCount,
      failureCount: failures.length,
      failures,
    };
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

        <Button
          variant="outline"
          size="lg"
          className="w-full sm:w-auto rounded-full bg-blue-600 text-white hover:bg-blue-600 hover:text-white font-medium"
          onClick={() => setIsBulkActionsOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Bulk Action
        </Button>
      </div>

      <BulkActionsDrawer
        open={isBulkActionsOpen}
        executives={bulkActionExecutives}
        offers={bulkActionOffers}
        onClose={() => setIsBulkActionsOpen(false)}
        onAssignOffer={handleBulkAssignOffer}
      />

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

                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {offers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="py-10 text-center text-gray-500"
                  >
                    No Offers Available
                  </TableCell>
                </TableRow>
              ) : filteredOffers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="py-10 text-center text-gray-500"
                  >
                    No Offers Match the Applied Filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredOffers.map((offer, index) => (
                  <TableRow key={offer.id}>
                    <TableCell>{index + 1}</TableCell>

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
                          className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                            offer.status === "active"
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

                    <TableCell className="text-center">
                      <DropdownMenu
                        onOpenChange={(open) =>
                          handleActionsMenuOpenChange(offer.id, open)
                        }
                      >
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={offer.status !== "active"}
                            className={
                              offer.status !== "active"
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
                          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                            Assign To
                          </div>

                          {availableExecutivesLoadingOfferId === offer.id ? (
                            <DropdownMenuItem disabled>
                              Loading executives...
                            </DropdownMenuItem>
                          ) : (availableExecutivesByOffer[offer.id] ?? [])
                              .length === 0 ? (
                            <DropdownMenuItem disabled>
                              No Eligible Executives
                            </DropdownMenuItem>
                          ) : (
                            availableExecutivesByOffer[offer.id].map(
                              (executive) => (
                                <DropdownMenuItem
                                  key={executive.id}
                                  onClick={() =>
                                    handleAssignOffer(offer.id, executive.id)
                                  }
                                >
                                  {executive.name}
                                </DropdownMenuItem>
                              ),
                            )
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
      </div>

      <AlertDialog
        open={isViewAllErrorOpen}
        onOpenChange={(open) => {
          setIsViewAllErrorOpen(open);
          if (!open) {
            setSelectedOffer(null);
          }
        }}
      >
        <AlertDialogContent className="w-[540px] max-w-[calc(100vw-2rem)] rounded-[2rem] border-0 bg-white px-5 py-6 shadow-2xl sm:px-6">
          <AlertDialogHeader className="items-center gap-2 text-center">
            <Image
              src="/saptarishi.png"
              alt="SAPtarishi"
              width={150}
              height={54}
              priority
              className="h-auto w-[150px] object-contain"
            />

            <AlertDialogTitle className="text-center text-xl font-bold text-gray-950">
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
            <AlertDialogAction className="h-12 w-full rounded-lg bg-indigo-700 text-sm font-bold text-white hover:bg-indigo-800">
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
