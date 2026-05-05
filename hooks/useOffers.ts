"use client";

import { useCallback, useMemo, useState } from "react";

import type { Offer, OfferFormData } from "@/lib/offer-utils";
import { OFFER_FORM_DEFAULTS } from "@/lib/offer-utils";

export type OfferFilters = {
  search: string;
  status: "all" | "active" | "inactive" | "expired";
};

function generateOfferId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `offer_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function useOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filters, setFilters] = useState<OfferFilters>({ search: "", status: "all" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filteredOffers = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return offers.filter((offer) => {
      const matchSearch =
        !search ||
        offer.title.toLowerCase().includes(search);

      const matchStatus = filters.status === "all" || offer.status === filters.status;
      return matchSearch && matchStatus;
    });
  }, [filters.search, filters.status, offers]);

  const updateFilter = useCallback(
    <K extends keyof OfferFilters>(key: K, value: OfferFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const toggleOfferStatus = useCallback((id: string) => {
    setOffers((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: o.status === "active" ? "inactive" : "active" } : o,
      ),
    );
  }, []);

  const createOffer = useCallback(async (formData: OfferFormData) => {
    setIsSubmitting(true);
    try {
      const newOffer: Offer = {
        id:           generateOfferId(),
        title:        formData.offerName.trim(),
        description:  formData.description.trim(),
        isGlobal:     true,
        status:       "active",
        discountType: formData.discountType as Offer["discountType"],
        validFrom:    formData.validFrom,
        validTo:      formData.validTo,
        ...(formData.discountAmount           && { discountAmount:           Number(formData.discountAmount) }),
        ...(formData.discountPercentage       && { discountPercentage:       Number(formData.discountPercentage) }),
        ...(formData.maxDiscountAmount        && { maxDiscountAmount:        Number(formData.maxDiscountAmount) }),
        ...(formData.comboDescription         && { comboDescription:         formData.comboDescription }),
        ...(formData.buyQuantity              && { buyQuantity:              Number(formData.buyQuantity) }),
        ...(formData.getQuantity              && { getQuantity:              Number(formData.getQuantity) }),
        ...(formData.minPurchaseAmount        && { minPurchaseAmount:        Number(formData.minPurchaseAmount) }),
        ...(formData.conditionalDiscountValue && { conditionalDiscountValue: Number(formData.conditionalDiscountValue) }),
        ...(formData.flagDiscountAmount       && { flagDiscountAmount:       Number(formData.flagDiscountAmount) }),
      };

      setOffers((prev) => [newOffer, ...prev]);
      return { success: true } as const;
    } catch {
      return { success: false, error: "Something went wrong. Please try again." } as const;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    offers,
    filteredOffers,
    filters,
    updateFilter,
    toggleOfferStatus,
    createOffer,
    isSubmitting,
    isLoading,
    totalCount:    offers.length,
    activeCount:   offers.filter((o) => o.status === "active").length,
    inactiveCount: offers.filter((o) => o.status === "inactive").length,
    expiredCount:  offers.filter((o) => o.status === "expired").length,
  };
}

export function useOfferForm() {
  const [formData, setFormData] = useState<OfferFormData>(OFFER_FORM_DEFAULTS);

  const updateField = useCallback(
    <K extends keyof OfferFormData>(field: K, value: OfferFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const resetForm = useCallback(() => {
    setFormData(OFFER_FORM_DEFAULTS);
  }, []);

  return { formData, updateField, resetForm };
}