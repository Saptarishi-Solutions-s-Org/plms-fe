import { getAccessToken, redirectToLogin, refreshSession } from "@/lib/auth";

async function parseResponse(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function request(path: string, options: RequestInit = {}) {
  const token = getAccessToken();

  return fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
}

export async function api(path: string, options: RequestInit = {}) {
  let res = await request(path, options);

  if (res.status === 401) {
    const refreshed = await refreshSession(true);

    if (refreshed) {
      res = await request(path, options);
    } else {
      redirectToLogin();
    }
  }

  const data = await parseResponse(res);

  if (!res.ok) {
    throw new Error(
      data?.error?.message || data?.message || "Something went wrong",
    );
  }

  return data?.value ?? data;
}
