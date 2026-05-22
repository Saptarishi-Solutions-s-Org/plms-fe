import { api } from "@/lib/api";

export const getCountries = async () =>
  api("/odata/v4/location/getCountries()");

export const getStatesByCountry = async (countryId: string) =>
  api(`/odata/v4/location/getStatesByCountry(countryId='${countryId}')`);
