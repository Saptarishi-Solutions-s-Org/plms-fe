export async function api(path: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const method = (options.method || "GET").toUpperCase();

  const controller = options.signal ? null : new AbortController();
  const timeoutMs = 15000;
  const timeoutId =
    controller && typeof window !== "undefined"
      ? window.setTimeout(() => controller.abort(), timeoutMs)
      : null;

  const configuredBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

  // ✅ always use full URL — never proxy through Next.js
  const url = `${configuredBaseUrl}${path}`;

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller?.signal ?? options.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any = null;

    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      const message =
        data?.error?.message || data?.message || res.statusText || "Something went wrong";
      throw new Error(`[${res.status}] ${message}`);
    }
    return data?.value ?? data;
  } catch (error) {
    if (
      typeof DOMException !== "undefined" &&
      error instanceof DOMException &&
      error.name === "AbortError" &&
      controller
    ) {
      throw new Error(`Request timed out (${method} ${path})`);
    }
    throw error;
  } finally {
    if (timeoutId !== null) window.clearTimeout(timeoutId);
  }
}