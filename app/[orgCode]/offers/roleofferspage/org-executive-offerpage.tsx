"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import GlobalLoader from "@/components/commoncomponents/globalloader";
import { OfferCards } from "@/components/commoncomponents/offers/offercards";
import TablePaginationFooter from "@/components/commoncomponents/table-pagination-footer";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { useExecutiveOfferExport } from "@/hooks/export";
import { useUrlPagination } from "@/hooks/use-url-pagination";
import { useUrlOfferFilters } from "@/hooks/useurloffer";
import { type AuthUser, getUser } from "@/lib/auth";
import { canAccess } from "@/lib/permissions";
import { subscribeRealtime } from "@/lib/socket";
import { Download } from "lucide-react";

import { getExecutiveOffers } from "@/services/executivestats";

import { OFFER_STATUS_OPTIONS, type Offer, type OfferFilters } from "@/types/Createoffer";
import { DISCOUNT_OPTIONS } from "@/lib/validators/offervalidation";
import { emptyPagination } from "@/types/pagination";
import type { PaginationMeta } from "@/types/pagination";
import { OFFER_LIST_CHANGED } from "@/types/realtime";

import {
  ExecutiveOfferItem,
  ExecutiveOfferRow,
  formatDate,
  formatStatusLabel,
  ExecutiveOffersEnvelope
} from "@/types/org-manager";



const DEFAULT_FILTERS: OfferFilters = {
  search: "",
  discountType: [],
  status: [],
};

const DISCOUNT_TYPE_LABELS: Record<string, string> = {
  Fixed_Amount: "Fixed Amount",
  Percentage: "Percentage",
  Combo_Offer: "Combo Offer",
  Buy_One_Get_One_Free: "Buy One Get One",
  Conditional_Discount: "Conditional",
  Flag_Discount: "Flag Discount",
};

const DISCOUNT_LABEL_TO_VALUE = new Map<string, string>(
  DISCOUNT_OPTIONS.map((option) => [option.label, option.value]),
);

const STATUS_LABEL_TO_VALUE = new Map<string, string>(
  OFFER_STATUS_OPTIONS.map((option) => [option.label, option.value]),
);



const getExecutiveOfferRows = (response: unknown): ExecutiveOfferItem[] => {
  if (Array.isArray(response)) {
    return response as ExecutiveOfferItem[];
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const envelope = response as ExecutiveOffersEnvelope;

  if (Array.isArray(envelope.offers)) {
    return envelope.offers;
  }

  if (Array.isArray(envelope.value)) {
    return envelope.value;
  }

  if (
    envelope.value &&
    typeof envelope.value === "object" &&
    "value" in envelope.value &&
    Array.isArray(envelope.value.value)
  ) {
    return envelope.value.value;
  }

  return [];
};

const getExecutiveOfferPagination = (
  response: unknown,
): PaginationMeta | undefined => {
  if (!response || typeof response !== "object") {
    return undefined;
  }

  return (response as ExecutiveOffersEnvelope).pagination;
};

const normalizeStatus = (status?: string): Offer["status"] =>
  (status?.toLowerCase() || "inactive") as Offer["status"];

const mapExecutiveOffer = (
  item: ExecutiveOfferItem,
  index: number,
): ExecutiveOfferRow => ({
  id: item.id ?? `${item.title || "offer"}-${index}`,
  title: item.title || "",
  description: item.description || "",
  status: normalizeStatus(item.status),
  discountType: item.discountType || "Fixed_Amount",
  discountValue: item.discountValue,
  validFrom: item.validFrom || "",
  validTo: item.validTo || "",
});

const getDiscountValue = (offer: ExecutiveOfferRow) => {
  if (offer.discountValue == null) {
    return "—";
  }

  return offer.discountType === "Percentage"
    ? `${offer.discountValue}%`
    : `₹${offer.discountValue}`;
};

export default function OrgExecutiveOffersPage() {
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
  const canExport = useMemo(
    () => canAccess(user, ["offers"], ["export"]),
    [user],
  );

  const { handleExport } = useExecutiveOfferExport();
  const { page, limit, setPage, setLimit } = useUrlPagination();
  const [offers, setOffers] = useState<ExecutiveOfferRow[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(
    emptyPagination(limit),
  );

  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  const { filters, setFilters } = useUrlOfferFilters();

  const [draftFilters, setDraftFilters] = useState(filters);
  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  const selectedStatuses = useMemo(
    () =>
      filters.status.map(
        (s) => STATUS_LABEL_TO_VALUE.get(s) ?? s,
      ),
    [filters.status],
  );

  const selectedDiscountTypes = useMemo(
    () =>
      filters.discountType.map(
        (type) => DISCOUNT_LABEL_TO_VALUE.get(type) ?? type,
      ),
    [filters.discountType],
  );

  const fetchOffers = useCallback(async () => {
    if (!canView) {
      setOffers([]);
      setPagination(emptyPagination(limit));
      setIsLoading(false);
      setHasLoaded(true);
      return;
    }

    try {
      setIsLoading(true);

      const response = await getExecutiveOffers({
        page,
        limit,
        search: filters.search,
        status: selectedStatuses.join(","),
        discountType: selectedDiscountTypes.join(","),
      });

      const data = getExecutiveOfferRows(response);

      setOffers(data.map(mapExecutiveOffer));
      setPagination(getExecutiveOfferPagination(response) ?? emptyPagination(limit));
    } catch (err) {
      console.error("Failed to load executive offers", err);
      setOffers([]);
      setPagination(emptyPagination(limit));
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, [canView, filters.search, limit, page, selectedDiscountTypes, selectedStatuses]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  useEffect(() => {
    if (!canView) return;
    return subscribeRealtime(OFFER_LIST_CHANGED, () => {
      fetchOffers();
    });
  }, [canView, fetchOffers]);

  const handleFilterChange = useCallback(
    <K extends keyof OfferFilters>(
      key: K,
      value: OfferFilters[K],
    ) => {
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

  const hasAppliedFilters =
    filters.search.trim() ||
    selectedStatuses.length > 0 ||
    selectedDiscountTypes.length > 0;

  const offerStats = useMemo(
    () => ({
      total: pagination.total,
      active: offers.filter((offer) => offer.status === "active").length,
      inactive: offers.filter((offer) => offer.status !== "active").length,
    }),
    [offers, pagination.total],
  );

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
            My Offers
          </h1>
          <p className="text-xs text-gray-500 sm:text-sm">
            Manage offers and assign them to leads easily.
          </p>
        </div>

        {canExport && (
          <Button
            type="button"
            variant="outline"
            onClick={handleExport}
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-full px-4 sm:w-auto"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        )}
      </div>

      {canView ? (
        <>
      {/* Cards */}
      <OfferCards
        totalCount={offerStats.total}
        activeCount={offerStats.active}
        inactiveCount={offerStats.inactive}
        globalCount={0}
        showGlobal={false}
      />

      {/* Filters */}
      <div className="w-full flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
        <div className="w-full sm:w-64">
          <Input
            search
            type="text"
            placeholder="Search by Offer Name..."
            value={draftFilters.search}
            onChange={(event) =>
              handleFilterChange("search", event.target.value)
            }
            className="min-h-10 text-sm"
          />
        </div>

        <MultiSelectCombobox
          options={DISCOUNT_OPTIONS.map((option) => option.label)}
          selectedValues={draftFilters.discountType}
          onSelectionChange={(values) =>
            handleFilterChange("discountType", values as OfferFilters["discountType"])
          }
          placeholder="All Offer Types"
          width="w-full sm:w-56"
        />

        <MultiSelectCombobox
          options={OFFER_STATUS_OPTIONS.map((option) => option.label)}
          selectedValues={draftFilters.status}
          onSelectionChange={(values) => handleFilterChange("status", values as OfferFilters["status"])}
          placeholder="All Status"
          width="w-full sm:w-44"
        />

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClearFilters}>
            Clear All
          </Button>

          <Button
            onClick={handleApplyFilters}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Apply
          </Button>
        </div>
      </div>

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
            </TableRow>
          </TableHeader>

          <TableBody>
            {offers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-10 text-center text-gray-500"
                >
                  {hasAppliedFilters
                    ? "No Offers Match the Applied Filters"
                    : "No Offers Available"}
                </TableCell>
              </TableRow>
            ) : (
              offers.map((offer, index) => (
                <TableRow key={offer.id || index}>
                  <TableCell>{rowOffset + index + 1}</TableCell>

                  <TableCell
                    className="max-w-50 truncate font-medium"
                    title={offer.title}
                  >
                    {offer.title}
                  </TableCell>

                  <TableCell className="max-w-[250px] truncate" title={offer.description}>
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
                            ? "bg-red-500"
                            : "bg-gray-500"
                          }`}
                      />
                      {formatStatusLabel(offer.status)}
                    </Badge>
                  </TableCell>
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
    </div>
  );
}
