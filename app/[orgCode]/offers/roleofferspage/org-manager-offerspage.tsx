"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import GlobalLoader from "@/components/commoncomponents/globalloader";
import { BulkActionsDrawer } from "@/components/commoncomponents/bulk-actions/BulkActionsDrawer";
import { OfferCards } from "@/components/commoncomponents/offers/offercards";
import { OfferFilters } from "@/components/commoncomponents/offers/offerfilter";

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

import {
  assignOfferToExecutive,
  getExecutiveOverview,
  getManagerOfferOverview,
} from "@/services/managerdashboard";

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
  ExecutiveRow,
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

  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);

  const [totalCount, setTotalCount] = useState(0);

  const [activeCount, setActiveCount] = useState(0);

  const [inactiveCount, setInactiveCount] = useState(0);

  const [globalCount, setGlobalCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

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
    [executives]
  );

  const bulkActionOffers = useMemo(
    (): BulkOffer[] =>
      offers.map((offer) => ({
        id: offer.id,
        title: offer.title,
        description: offer.description,
        validTo: offer.validTo,
        status: (offer.status === "active" ? "ACTIVE" : "INACTIVE") as BulkOffer["status"],
      })),
    [offers]
  );

  const fetchOffers = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setIsLoading(true);
      }
      setError(null);

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
          []
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
      setError(err instanceof Error ? err.message : "Failed to load offers");
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchOffers(true);
  }, [fetchOffers]);

  useEffect(() => {
    return subscribeRealtime(OFFER_LIST_CHANGED, () => {
      fetchOffers(false);
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
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to assign offer to executive",
      );
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

  if (isLoading) {
    return <GlobalLoader />;
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
      {error ? (
        <div className="flex items-center justify-center py-20 text-red-500">
          {error}
        </div>
      ) : (
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

                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {offers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="py-10 text-center text-gray-500"
                  >
                    No Offers Available
                  </TableCell>
                </TableRow>
              ) : filteredOffers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
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
                            : "border-gray-200 bg-gray-50 text-gray-600"
                        }
                      >
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

                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
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

                          {executives.length === 0 ? (
                            <DropdownMenuItem disabled>
                              No Executives
                            </DropdownMenuItem>
                          ) : (
                            executives.map(
                              (
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                executive: any,
                              ) => (
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
      )}
    </div>
  );
}
