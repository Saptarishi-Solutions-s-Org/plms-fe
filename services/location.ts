import { api } from "@/lib/api";

export const getCountries = async () => {
  return api("/odata/v4/location/getCountries()");
};

export const getStatesByCountry = async (countryId: string) => {
  return api(`/odata/v4/location/getStatesByCountry(countryId='${countryId}')`);
};
