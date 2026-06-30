"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import GlobalLoader from "@/components/commoncomponents/globalloader";
import { OfferCards } from "@/components/commoncomponents/offers/offercards";

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
import { subscribeRealtime } from "@/lib/socket";

import { getExecutiveOffers } from "@/services/executivestats";

import { OFFER_STATUS_OPTIONS, type Offer } from "@/types/Createoffer";
import { DISCOUNT_OPTIONS } from "@/lib/validators/offervalidation";
import { OFFER_LIST_CHANGED } from "@/types/realtime";

import {
  ExecutiveOfferItem,
  ExecutiveOfferRow,
  formatDate,
  formatStatusLabel,
} from "@/types/org-manager";

type ExecutiveOfferFilters = {
  search: string;
  discountTypes: string[];
  statuses: string[];
};

const DEFAULT_FILTERS: ExecutiveOfferFilters = {
  search: "",
  discountTypes: [],
  statuses: [],
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

type ExecutiveOffersEnvelope = {
  value?: ExecutiveOfferItem[] | { value?: ExecutiveOfferItem[] };
  offers?: ExecutiveOfferItem[];
};

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
  const [offers, setOffers] = useState<ExecutiveOfferRow[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);

  const fetchOffers = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await getExecutiveOffers();

      const data = getExecutiveOfferRows(response);

      setOffers(data.map(mapExecutiveOffer));
    } catch (err) {
      console.error("Failed to load executive offers", err);
      setOffers([]);
    } finally {
      setIsLoading(false);
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
    <K extends keyof ExecutiveOfferFilters>(
      key: K,
      value: ExecutiveOfferFilters[K],
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
  }, [draftFilters]);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);

    setDraftFilters(DEFAULT_FILTERS);
  }, []);

  const filteredOffers = useMemo(
    () =>
      offers.filter((offer) => {
        const query = filters.search.trim().toLowerCase();

        const matchSearch = !query || offer.title.toLowerCase().includes(query);

        const selectedStatuses = filters.statuses.map(
          (status) => STATUS_LABEL_TO_VALUE.get(status) ?? status,
        );

        const selectedDiscountTypes = filters.discountTypes.map(
          (type) => DISCOUNT_LABEL_TO_VALUE.get(type) ?? type,
        );

        const matchStatus =
          selectedStatuses.length === 0 ||
          selectedStatuses.includes(offer.status);

        const matchDiscount =
          selectedDiscountTypes.length === 0 ||
          selectedDiscountTypes.includes(offer.discountType);

        return matchSearch && matchStatus && matchDiscount;
      }),
    [offers, filters],
  );

  const offerStats = useMemo(
    () => ({
      total: offers.length,
      active: offers.filter((offer) => offer.status === "active").length,
      inactive: offers.filter((offer) => offer.status !== "active").length,
    }),
    [offers],
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
            My Offers
          </h1>
          <p className="text-xs text-gray-500 sm:text-sm">
            Manage offers and assign them to leads easily.
          </p>
        </div>
      </div>

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
          selectedValues={draftFilters.discountTypes}
          onSelectionChange={(values) =>
            handleFilterChange("discountTypes", values)
          }
          placeholder="All Offer Types"
          width="w-full sm:w-56"
        />

        <MultiSelectCombobox
          options={OFFER_STATUS_OPTIONS.map((option) => option.label)}
          selectedValues={draftFilters.statuses}
          onSelectionChange={(values) => handleFilterChange("statuses", values)}
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
                  No Offers Available
                </TableCell>
              </TableRow>
            ) : filteredOffers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-10 text-center text-gray-500"
                >
                  No Offers Match the Applied Filters
                </TableCell>
              </TableRow>
            ) : (
              filteredOffers.map((offer, index) => (
                <TableRow key={offer.id || index}>
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
    </div>
  );
}
