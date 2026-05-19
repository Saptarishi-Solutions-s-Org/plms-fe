import { api } from "@/lib/api";
export const getOffers = () =>
  api(`/odata/v4/offer/getOffers()`);
export const getOfferSummary = () =>
  api(`/odata/v4/offer/getOfferSummary()`); 

export const createOffer = (data: Record<string, unknown>) =>
  api(`/odata/v4/offer/createOffer`, {
    method: "POST",
    body: JSON.stringify(data),
  });


export const toggleOfferStatus = (id: string) =>
  api(`/odata/v4/offer/toggleOfferStatus`, {
    method: "POST",
    body: JSON.stringify({ id }),
  });
export const getManagers = () =>
  api(`/odata/v4/offer/getManagers()`);