import { api } from "@/lib/api";

// 🔹 Get offers
export const getOffers = () =>
  api(`/odata/v4/offer/getOffers()`);

// 🔹 Get offer summary (cards)
// api/offers.ts
export const getOfferSummary = () =>
  api(`/odata/v4/offer/getOfferSummary()`); // was getsummarycards()

// 🔹 Create offer
export const createOffer = (data: Record<string, unknown>) =>
  api(`/odata/v4/offer/createOffer`, {
    method: "POST",
    body: JSON.stringify(data),
  });

// 🔹 Toggle status
export const toggleOfferStatus = (id: string) =>
  api(`/odata/v4/offer/toggleOfferStatus`, {
    method: "POST",
    body: JSON.stringify({ id }),
  });
  // 🔹 Get managers
export const getManagers = () =>
  api(`/odata/v4/offer/getManagers()`);