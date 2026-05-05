"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getOffers,
  getOfferSummary,
  createOffer,
  toggleOfferStatus,
} from "@/services/offers";

import { OffersTable } from "@/components/offers/OffersTable";
import { OfferFilters } from "@/components/offers/OfferFilters";
import { OfferCards } from "@/components/offers/offercards";
import { CreateOfferDialog } from "@/components/offers/CreateOfferDialog";
import { Button } from "@/components/ui/button";

import type { OfferPayload } from "@/components/offers/CreateOfferDialog";
import type {
  Offer,
  OfferFilters as OfferFiltersType,
  DiscountType,
  OfferStatus,
} from "@/types/offer";

// ───────── Helpers ─────────

const str = (v: unknown): string => (typeof v === "string" ? v : "");

const bool = (v: unknown): boolean => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") return v === "true" || v === "1";
  return false;
};

const num = (v: unknown): number | undefined => {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : undefined;
};

const toStatus = (v: unknown): OfferStatus => {
  const s = str(v).toLowerCase();
  return s === "active" || s === "inactive" || s === "expired" ? s : "active";
};

// ✅ FIXED: values match CDS DiscountType enum exactly
const toDiscountType = (v: unknown): DiscountType | "" => {
  const VALID = [
    "Fixed_Amount",
    "Percentage",
    "Combo_Offer",
    "Buy_One_Get_One_Free",
    "Conditional_Discount",
    "Flag_Discount",
  ];
  return typeof v === "string" && VALID.includes(v) ? (v as DiscountType) : "";
};

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

const toArray = (res: unknown): Record<string, unknown>[] => {
  if (Array.isArray(res)) return res;
  if (isObj(res) && Array.isArray(res.value)) return res.value;
  return [];
};

const mapOffer = (o: Record<string, unknown>): Offer => ({
  id: str(o.id),
  title: str(o.title),
  code: str(o.code),
  description: str(o.description),
  validFrom: str(o.valid_from),
  validTo: str(o.valid_to),
  isGlobal: bool(o.is_global),
  status: toStatus(o.status),
  discountType: toDiscountType(o.discount_type),
  discountAmount: num(o.discount_amount),
  discountPercentage: num(o.discount_percentage),
  maxDiscountAmount: num(o.max_discount_amount),
  comboDescription: str(o.combo_description),
  buyQuantity: num(o.buy_quantity),
  getQuantity: num(o.get_quantity),
  minPurchaseAmount: num(o.min_purchase_amount),
  conditionalDiscountValue: num(o.discount_value), // ✅ mapped from discount_value
  flagDiscountAmount: num(o.flag_discount_amount),
  createdAt: "",
  createdBy: "",
  organization: null,
});

const generateCode = (name: string) =>
  name.toUpperCase().replace(/\s+/g, "_").slice(0, 20) || `OFFER_${Date.now()}`;

const DEFAULT_FILTERS: OfferFiltersType = { search: "", status: "all" };

type Summary = {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  globalCount: number;
};

// ───────── Page ─────────

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalCount: 0,
    activeCount: 0,
    inactiveCount: 0,
    globalCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);

  // ── Fetch offers + summary ──────────────────────────────────────────────
  const fetchOffers = useCallback(async () => {
    setError(null);
    try {
      const [res, summaryRes] = await Promise.all([
        getOffers(),
        getOfferSummary(),
      ]);
      setOffers(toArray(res).map(mapOffer));
      setSummary({
        totalCount: summaryRes?.totalCount ?? 0,
        activeCount: summaryRes?.activeCount ?? 0,
        inactiveCount: summaryRes?.inactiveCount ?? 0,
        globalCount: summaryRes?.globalCount ?? 0,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load offers";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Load on mount ───────────────────────────────────────────────────────
  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  // ── Create offer ────────────────────────────────────────────────────────
  const handleCreateOffer = useCallback(
    async (data: OfferPayload) => {
      try {
        const payload: Record<string, unknown> = {
          title: data.title,
          code: generateCode(data.title),
          description: data.description,
          discount_type: data.discount_type,
          valid_from: data.valid_from,
          valid_to: data.valid_to,
          is_global: data.is_global, // ✅ FIXED: from form, not hardcoded
          manager_ids: data.manager_ids, // ✅ FIXED: plural array, not manager_id: null
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
          }), // ✅ FIXED: was conditional_discount_value
          ...(data.flag_discount_amount !== undefined && {
            flag_discount_amount: data.flag_discount_amount,
          }),
        };

        await createOffer(payload);
        await fetchOffers();
        return { success: true };
      } catch {
        return { success: false, error: "Failed to create offer" };
      }
    },
    [fetchOffers],
  );

  // ── Toggle status ───────────────────────────────────────────────────────
  const handleToggleStatus = useCallback(
    async (id: string) => {
      await toggleOfferStatus(id);
      await fetchOffers();
    },
    [fetchOffers],
  );

  // ── Filter offers ───────────────────────────────────────────────────────
  const filteredOffers = useMemo(() => {
    return offers.filter((o) => {
      const matchSearch =
        !filters.search ||
        o.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        o.code.toLowerCase().includes(filters.search.toLowerCase());
      const matchStatus =
        filters.status === "all" || o.status === filters.status;
      return matchSearch && matchStatus;
    });
  }, [offers, filters]);

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-semibold">Offers</h1>
          <p className="text-sm text-muted-foreground">
            Manage promotional offers
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          + Create Offer
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 mt-4">
        <OfferCards
          totalCount={summary.totalCount}
          activeCount={summary.activeCount}
          inactiveCount={summary.inactiveCount}
          globalCount={summary.globalCount}
        />
      </div>

      {/* Filters */}
      <div className="mb-4">
        <OfferFilters
          filters={draftFilters}
          onFilterChange={(k, v) => setDraftFilters((p) => ({ ...p, [k]: v }))}
          onApply={() => setFilters(draftFilters)}
          onClear={() => {
            setFilters(DEFAULT_FILTERS);
            setDraftFilters(DEFAULT_FILTERS);
          }}
        />
      </div>

      {/* Table / States */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Loading...
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-20 text-red-500">
          {error}
        </div>
      ) : (
        <OffersTable
          offers={filteredOffers}
          onToggleStatus={handleToggleStatus}
        />
      )}

      <CreateOfferDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateOffer}
      />
    </div>
  );
}
