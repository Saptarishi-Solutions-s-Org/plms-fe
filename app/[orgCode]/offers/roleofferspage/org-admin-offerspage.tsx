"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import GlobalLoader from "@/components/commoncomponents/globalloader";
import TablePaginationFooter from "@/components/commoncomponents/table-pagination-footer";
import { OfferCards } from "@/components/commoncomponents/offers/offercards";
import { OfferFilters } from "@/components/commoncomponents/offers/offerfilter";
import { OffersTable } from "@/components/commoncomponents/offers/offertable";
import { CreateOfferDialog } from "@/components/commoncomponents/offers/createoffer";
import { Button } from "@/components/ui/button";
import { useUrlPagination } from "@/hooks/use-url-pagination";
import { useUrlOfferFilters } from "@/hooks/useurloffer";
import { subscribeRealtime } from "@/lib/socket";
import {
  createOffer,
  getOfferSummary,
  getOffers,
  toggleOfferStatus,
  updateOffer,
} from "@/services/offers";
import { OFFER_LIST_CHANGED } from "@/types/realtime";

import type { OfferPayload } from "@/lib/validators/offervalidation";

import type {
  Offer,
  OfferFilters as OfferFiltersType,
  OfferStatus,
} from "@/types/Createoffer";
import { emptyPagination } from "@/types/pagination";
import type { PaginationMeta } from "@/types/pagination";

const DEFAULT_FILTERS: OfferFiltersType = {
  search: "",
  status: [],
  discountType: [],
};

export default function OrgAdminOffersPage() {
  const { page, limit, setPage, setLimit } = useUrlPagination();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [globalCount, setGlobalCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationMeta>(
    emptyPagination(limit),
  );

  const [isLoading, setIsLoading] =
    useState(true);
  const [hasLoaded, setHasLoaded] =
    useState(false);

  const [createOpen, setCreateOpen] =
    useState(false);

  const [editingOffer, setEditingOffer] =
    useState<Offer | null>(null);

  const { filters, setFilters } = useUrlOfferFilters();

  const [draftFilters, setDraftFilters] = useState(filters);
  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);
  const activeCount = useMemo(
    () =>
      offers.filter(
        (offer) => offer.status === "active"
      ).length,
    [offers]
  );

  const inactiveCount = useMemo(
    () =>
      offers.filter(
        (offer) => offer.status === "inactive"
      ).length,
    [offers]
  );

  const fetchOffers = useCallback(
    async () => {
      try {
        setIsLoading(true);

        const [offersResponse, summary] =
          await Promise.all([
            getOffers({
              page,
              limit,
              search: filters.search,
              status: filters.status.join(","),
              discountType: filters.discountType.join(","),
            }),
            getOfferSummary(),
          ]);

        const formattedOffers: Offer[] = (
          offersResponse?.offers ||
          []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ).map((item: any) => ({
          id: item.id,

          title: item.title,

          code: item.code,

          description: item.description,

          assignedUsers:
            item.managers
              ?.map(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (manager: any) => manager.name
              )
              .join(", ") || "",

          isGlobal: item.is_global,

          status:
            item.status?.toLowerCase() ||
            "inactive",

          discountType:
            item.discount_type,

          discountAmount:
            item.discount_amount,

          discountPercentage:
            item.discount_percentage,

          maxDiscountAmount:
            item.max_discount_amount,

          comboDescription:
            item.combo_description,

          buyQuantity:
            item.buy_quantity,

          getQuantity:
            item.get_quantity,

          minPurchaseAmount:
            item.min_purchase_amount,

          conditionalDiscountValue:
            item.discount_value,

          flagDiscountAmount:
            item.flag_discount_amount,

          validFrom:
            item.valid_from,

          validTo:
            item.valid_to,

          createdAt:
            item.created_at,

          createdBy: "",

          organization:
            item.organization_id
              ? {
                id: item.organization_id,
                name: "",
              }
              : null,

          managers:
            item.managers || [],
        }));

        setOffers(formattedOffers);

        setPagination(offersResponse?.pagination ?? emptyPagination(limit));

        setTotalCount(summary.totalCount);

        setGlobalCount(summary.globalCount);

      } catch (err) {
        console.error("Failed to load offers", err);
        setOffers([]);
        setTotalCount(0);
        setGlobalCount(0);
        setPagination(emptyPagination(limit));
      } finally {
        setIsLoading(false);
        setHasLoaded(true);
      }
    },
    [filters, limit, page]
  );
  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  useEffect(() => {
    return subscribeRealtime(OFFER_LIST_CHANGED, () => {
      fetchOffers();
    });
  }, [fetchOffers]);

  const buildOfferApiPayload = useCallback(
    (data: OfferPayload) => ({
      ...(data.id && { id: data.id }),

      title: data.title,

      description:
        data.description,

      discount_type:
        data.discount_type,

      valid_from:
        data.valid_from,

      valid_to:
        data.valid_to,

      is_global:
        data.is_global,

      ...(!data.is_global && {
        manager_ids:
          data.manager_ids,
      }),

      ...(data.discount_amount !==
        undefined && {
        discount_amount:
          data.discount_amount,
      }),

      ...(data.discount_percentage !==
        undefined && {
        discount_percentage:
          data.discount_percentage,
      }),

      ...(data.max_discount_amount !==
        undefined && {
        max_discount_amount:
          data.max_discount_amount,
      }),

      ...(data.combo_description !==
        undefined && {
        combo_description:
          data.combo_description,
      }),

      ...(data.buy_quantity !==
        undefined && {
        buy_quantity:
          data.buy_quantity,
      }),

      ...(data.get_quantity !==
        undefined && {
        get_quantity:
          data.get_quantity,
      }),

      ...(data.min_purchase_amount !==
        undefined && {
        min_purchase_amount:
          data.min_purchase_amount,
      }),

      ...(data.discount_value !==
        undefined && {
        discount_value:
          data.discount_value,
      }),

      ...(data.flag_discount_amount !==
        undefined && {
        flag_discount_amount:
          data.flag_discount_amount,
      }),
    }),
    []
  );

  const handleCreateOffer = useCallback(
    async (data: OfferPayload) => {
      try {
        await createOffer(
          buildOfferApiPayload(data)
        );

        await fetchOffers();

        return {
          success: true as const,
        };

      } catch {
        return {
          success: false as const,
          error:
            "Failed to create offer",
        };
      }
    },
    [buildOfferApiPayload, fetchOffers]
  );

  const handleUpdateOffer = useCallback(
    async (data: OfferPayload) => {
      try {
        await updateOffer(
          buildOfferApiPayload(data)
        );

        await fetchOffers();

        return {
          success: true as const,
        };

      } catch {
        return {
          success: false as const,
          error:
            "Failed to update offer",
        };
      }
    },
    [buildOfferApiPayload, fetchOffers]
  );

  const handleSubmitOffer = useCallback(
    (data: OfferPayload) =>
      editingOffer
        ? handleUpdateOffer(data)
        : handleCreateOffer(data),
    [editingOffer, handleUpdateOffer, handleCreateOffer]
  );

  const handleEditOffer = useCallback(
    (offer: Offer) => {
      setEditingOffer(offer);
      setCreateOpen(true);
    },
    []
  );

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      setCreateOpen(open);
      if (!open) setEditingOffer(null);
    },
    []
  );
  const handleToggleStatus = useCallback(
    async (id: string) => {
      const offer = offers.find(
        (offer) => offer.id === id
      );

      if (!offer) return;

      const previousStatus =
        offer.status;

      const newStatus: OfferStatus =
        previousStatus === "active"
          ? "inactive"
          : "active";

      setOffers((prev) =>
        prev.map((offer) =>
          offer.id === id
            ? {
              ...offer,
              status: newStatus,
            }
            : offer
        )
      );

      try {
        await toggleOfferStatus(id);
      } catch {
        setOffers((prev) =>
          prev.map((offer) =>
            offer.id === id
              ? {
                ...offer,
                status: previousStatus,
              }
              : offer
          )
        );
      }
    },
    [offers]
  );
  const handleFilterChange = useCallback(
    <K extends keyof OfferFiltersType>(key: K, value: OfferFiltersType[K]) => {
      setDraftFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const handleApplyFilters =
    useCallback(() => {
      setFilters(draftFilters);
    }, [draftFilters, setFilters]);

  const handleClearFilters =
    useCallback(() => {
      setFilters(DEFAULT_FILTERS);
      setDraftFilters(DEFAULT_FILTERS);
    }, [setFilters]);

  const rowOffset = (pagination.page - 1) * pagination.limit;
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
            Manage promotional offers
          </p>
        </div>

        <Button
          onClick={() =>
            setCreateOpen(true)
          }
          className="w-full rounded-full bg-blue-600 px-6 text-white hover:bg-blue-700 sm:w-auto"
        >
          + Create Offer
        </Button>
      </div>

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
        onFilterChange={
          handleFilterChange
        }
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

      <OffersTable
        offers={offers}
        onToggleStatus={
          handleToggleStatus
        }
        onEdit={handleEditOffer}
        rowOffset={rowOffset}
      />

      <TablePaginationFooter
        pagination={pagination}
        onPageChange={setPage}
        onLimitChange={setLimit}
        totalLabel="offers"
      />

      {/* Dialog */}

      <CreateOfferDialog
        open={createOpen}
        onOpenChange={handleDialogOpenChange}
        onSubmit={handleSubmitOffer}
        offer={editingOffer}
      />
    </div>
  );
}
