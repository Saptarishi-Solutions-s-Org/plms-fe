"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DEFAULT_PAGE } from "@/types/pagination";

export type FilterType = "string" | "list";

export type FilterConfig<T> = {
  [K in keyof T]-?: {
    type: FilterType;
    urlKey: string;
  };
};

function parseList(value: string | null) {
  return value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function setListParam(
  params: URLSearchParams,
  key: string,
  values?: string[],
) {
  if (values && values.length) {
    params.set(key, values.join(","));
    return;
  }
  params.delete(key);
}

export function useUrlFilters<T extends Record<string, any>>(config: FilterConfig<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo<T>(() => {
    const result: Partial<T> = {};
    for (const key in config) {
      const { type, urlKey } = config[key];
      const val = searchParams.get(urlKey);
      if (type === "list") {
        result[key] = parseList(val) as any;
      } else {
        result[key] = (val ?? "") as any;
      }
    }
    return result as T;
  }, [searchParams, config]);

  const setFilters = useCallback(
    (nextFilters: T) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const key in config) {
        const { type, urlKey } = config[key];
        const val = nextFilters[key];

        if (type === "list") {
          setListParam(params, urlKey, val as unknown as string[]);
        } else {
          const search = val ? (val as unknown as string).trim() : "";
          if (search) {
            params.set(urlKey, search);
          } else {
            params.delete(urlKey);
          }
        }
      }

      params.set("page", String(DEFAULT_PAGE));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams, config],
  );

  return { filters, setFilters };
}
