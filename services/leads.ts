import { api } from "@/lib/api";
import { LeadFormData } from "@/types/leadtypes";

export const getLeadsWithStats = async () => {
  return await api("/odata/v4/lead/getLeadsWithStats()");
};

export const getExecutiveUsers = async (): Promise<{ id: string; name: string }[]> => {
  return await api("/odata/v4/lead/getExecutiveUsers()");
};

export const createLead = async (formData: LeadFormData) => {
  return await api("/odata/v4/lead/createLead", {
    method: "POST",
    body: JSON.stringify(formData),
  });
};

export const updateLead = async (leadId: string, formData: LeadFormData) => {
  return await api("/odata/v4/lead/updateLead", {
    method: "POST",
    body: JSON.stringify({ id: leadId, ...formData }),
  });
};

export const importLeads = async (data: any) => {
  return await api("/odata/v4/lead/importLeads", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// ✅ EXPORT LEADS (usually returns file/blob)
export const exportLeads = async () => {
  return await api("/odata/v4/lead/exportLeads", {
    method: "POST", 
  });
};

export const getCountries = async (): Promise<{ id: string; name: string }[]> => {
  return await api("/odata/v4/location/getCountries()");
};

export const getStatesByCountry = async (countryId: string): Promise<{ id: string; name: string }[]> => {
  return await api(`/odata/v4/location/getStatesByCountry(countryId='${countryId}')`);
};