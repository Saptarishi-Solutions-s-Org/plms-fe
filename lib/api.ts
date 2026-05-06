let isRefreshing = false;

export async function api(path: string, options: RequestInit = {}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,

    credentials: "include",

    headers: {
      "Content-Type": "application/json",

      ...(options.headers || {}),
    },
  });

  let data: any = null;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (res.status === 401) {
    const isAuthPage = window.location.pathname === "/";

    const isRefreshCall = path.includes("/auth/refresh");

    if (!isRefreshing && !isAuthPage && !isRefreshCall) {
      isRefreshing = true;

      try {
        const refreshRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/odata/v4/auth/refresh`,
          {
            method: "POST",

            credentials: "include",
          },
        );

        if (refreshRes.ok) {
          isRefreshing = false;

          return api(path, options);
        }
      } catch {}

      isRefreshing = false;
    }

    return {
      unauthorized: true,
    };
  }

  if (!res.ok) {
    throw new Error(
      data?.error?.message || data?.message || "Something went wrong",
    );
  }

  return data?.value ?? data;
}
