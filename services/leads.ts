import { api } from "@/lib/api";
import { Lead, LeadFormData } from "@/types/leadtypes";

type LeadApiRow = Omit<Lead, "assignedToId"> & {
  assignedToId?: string;
  assignedTo?: string;
};

type LeadActionPayload = Omit<LeadFormData, "assignedToId"> & {
  assignedTo: string;
};

function toLeadActionPayload(formData: LeadFormData): LeadActionPayload {
  const { assignedToId, ...rest } = formData;

  return {
    ...rest,
    assignedTo: assignedToId,
  };
}

export const getLeadsWithStats = async () => {
  const res = await api("/odata/v4/lead/getLeadsWithStats()");

  return {
    ...res,
    leads: (res.leads ?? []).map((lead: LeadApiRow): Lead => {
      const { assignedTo, ...rest } = lead;

      return {
        ...rest,
        assignedToId: lead.assignedToId ?? assignedTo ?? "",
      };
    }),
  };
};

export const getExecutiveUsers = async (): Promise<{ id: string; name: string }[]> => {
  return await api("/odata/v4/lead/getExecutiveUsers()");
};

export const createLead = async (formData: LeadFormData) => {
  return await api("/odata/v4/lead/createLead", {
    method: "POST",
    body: JSON.stringify(toLeadActionPayload(formData)),
  });
};

export const updateLead = async (leadId: string, formData: LeadFormData) => {
  return await api("/odata/v4/lead/updateLead", {
    method: "POST",
    body: JSON.stringify({ id: leadId, ...toLeadActionPayload(formData) }),
  });
};

export const importLeads = async (data: unknown) => {
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
