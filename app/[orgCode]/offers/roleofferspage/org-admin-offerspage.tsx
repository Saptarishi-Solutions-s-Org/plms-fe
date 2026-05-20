"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import GlobalLoader from "@/components/commoncomponents/globalloader";
import { OfferCards } from "@/components/commoncomponents/offers/offercards";
import { OfferFilters } from "@/components/commoncomponents/offers/offerfilter";
import { OffersTable } from "@/components/commoncomponents/offers/offertable";
import { CreateOfferDialog } from "@/components/commoncomponents/offers/createoffer";
import { Button } from "@/components/ui/button";
import {
  createOffer,
  getOfferSummary,
  getOffers,
  toggleOfferStatus,
} from "@/services/offers";

import type { OfferPayload } from "@/lib/validators/offervalidation";

import type {
  Offer,
  OfferFilters as OfferFiltersType,
  OfferStatus,
} from "@/types/Createoffer";

const DEFAULT_FILTERS: OfferFiltersType = {
  search: "",
  status: "all",
  discountType: "all",
};

export default function OrgAdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [globalCount, setGlobalCount] = useState(0);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] = useState<
    string | null
  >(null);

  const [createOpen, setCreateOpen] =
    useState(false);

  const [filters, setFilters] =
    useState(DEFAULT_FILTERS);

  const [draftFilters, setDraftFilters] =
    useState(DEFAULT_FILTERS);
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
    async (showLoader = false) => {
      try {
        setError(null);

        if (showLoader) {
          setIsLoading(true);
        }

        const [offersResponse, summary] =
          await Promise.all([
            getOffers(),
            getOfferSummary(),
          ]);

        const formattedOffers: Offer[] = (
          offersResponse?.value ||
          offersResponse ||
          []
        ).map((item: any) => ({
          id: item.id,

          title: item.title,

          code: item.code,

          description: item.description,

          assignedUsers:
            item.managers
              ?.map(
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

        setTotalCount(summary.totalCount);

        setGlobalCount(summary.globalCount);

      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load offers"
        );
      } finally {
        if (showLoader) {
          setIsLoading(false);
        }
      }
    },
    []
  );
  useEffect(() => {
    fetchOffers(true);
  }, [fetchOffers]);
  const handleCreateOffer = useCallback(
    async (data: OfferPayload) => {
      try {
        await createOffer({
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
        });

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
    [fetchOffers]
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
    (
      key: keyof OfferFiltersType,
      value: string
    ) => {
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
    }, [draftFilters]);

  const handleClearFilters =
    useCallback(() => {
      setFilters(DEFAULT_FILTERS);
      setDraftFilters(DEFAULT_FILTERS);
    }, []);

 const filteredOffers = useMemo(
    () =>
      offers.filter((offer) => {
        const query =
          filters.search.toLowerCase();

        const matchSearch =
          !query ||
          offer.title
            .toLowerCase()
            .includes(query) ||
          offer.code
            .toLowerCase()
            .includes(query);

        const matchStatus =
          filters.status === "all" ||
          offer.status === filters.status;

        const matchDiscount =
          filters.discountType ===
            "all" ||
          offer.discountType ===
            filters.discountType;

        return (
          matchSearch &&
          matchStatus &&
          matchDiscount
        );
      }),
    [offers, filters]
  );
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

      {error ? (
        <div className="flex items-center justify-center py-20 text-red-500">
          {error}
        </div>
      ) : (
        <OffersTable
          offers={filteredOffers}
          onToggleStatus={
            handleToggleStatus
          }
        />
      )}

      {/* Dialog */}

      <CreateOfferDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateOffer}
      />
    </div>
  );
}