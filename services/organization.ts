const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/odata/v4/organization`;

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const createOrganization = async (payload: any) => {
  const res = await fetch(`${BASE_URL}/createOrganization`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.error?.message || "Create failed");
  }

  return json.value || json;
};

export const getOrganizations = async () => {
  const res = await fetch(`${BASE_URL}/getOrganizations()`, {
    method: "GET",
    headers: getHeaders(),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.error?.message || "Fetch failed");
  }

  return json.value || json;
};

export const getOrganizationByCode = async (code: string) => {
  const res = await fetch(`${BASE_URL}/getOrganizationByCode(code='${code}')`, {
    method: "GET",
    headers: getHeaders(),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.error?.message || "Fetch failed");
  }

  return json.value || json;
};

export const updateOrganization = async (payload: any) => {
  const res = await fetch(`${BASE_URL}/updateOrganization`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.error?.message || "Update failed");
  }

  return json.value || json;
};
