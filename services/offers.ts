import { api } from "@/lib/api";
import { buildApiFunctionUrl } from "@/lib/api-function-url";
import type { GetOffersParams } from "@/types/Createoffer";

export const getOffers = (params?: GetOffersParams) =>
  api(buildApiFunctionUrl("/odata/v4/offer/getOffers", params));
export const getOfferSummary = () =>
  api(`/odata/v4/offer/getOfferSummary()`); 

export const createOffer = (data: Record<string, unknown>) =>
  api(`/odata/v4/offer/createOffer`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateOffer = (data: Record<string, unknown>) =>
  api(`/odata/v4/offer/updateOffer`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const createManagerOffer = (data: Record<string, unknown>) =>
  api(`/odata/v4/offer/createManagerOffer`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateManagerOffer = (data: Record<string, unknown>) =>
  api(`/odata/v4/offer/updateManagerOffer`, {
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

export const getExecutivesByOffer = (offerId: string) =>
  api(`/odata/v4/offer/getExecutivesByOffer(offerId='${offerId}')`);