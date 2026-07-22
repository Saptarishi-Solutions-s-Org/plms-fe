import { useState, useEffect, useCallback } from "react";
import type { Lead, LeadStats } from "@/types/leadtypes";
import { getLeadsWithStats, getAllOrganizationLeads } from "@/services/leads";
import {
  LEAD_LIST_CHANGED,
  LeadListChangedPayload,
} from "@/types/realtime";
import { subscribeRealtime } from "@/lib/socket";
import {
  DEFAULT_PAGE_LIMIT,
  emptyPagination,
  normalizePagination,
  type PaginationMeta,
} from "@/types/pagination";

type UseLeadsOptions = {
  page?: number;
  limit?: number;
  search?: string;
  statuses?: string[];
  priorities?: string[];
  sources?: string[];
  assignedTo?: string[];
  statsScope?: "filtered" | "all";
  fetchAllAsAdmin?: boolean;
};

const EMPTY_STATS: LeadStats = {
  total: 0,
  new: 0,
  contacted: 0,
  qualified: 0,
};

function joinFilterValues(values?: string[]) {
  const filteredValues = values?.filter(Boolean) ?? [];

  return filteredValues.length
    ? filteredValues.join(",")
    : undefined;
}

export function useLeads(options: UseLeadsOptions = {}) {
  const page = options.page ?? 1;
  const limit = options.limit ?? DEFAULT_PAGE_LIMIT;
  const search = options.search;

  // Convert arrays into stable primitive strings
  const status = joinFilterValues(options.statuses);
  const priority = joinFilterValues(options.priorities);
  const leadSource = joinFilterValues(options.sources);
  const assignedTo = options.assignedTo?.[0];

  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats>(EMPTY_STATS);

  const [pagination, setPagination] =
    useState<PaginationMeta>(
      emptyPagination(limit)
    );

  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit,
        search,
        status,
        priority,
        leadSource,
        assignedTo,
      };

      const fetchFn = options.fetchAllAsAdmin ? getAllOrganizationLeads : getLeadsWithStats;
      const res = await fetchFn(params);

      const nextLeads = res.leads ?? [];

      setLeads(nextLeads);
      setStats(res.stats ?? EMPTY_STATS);

      setPagination(
        normalizePagination(
          res.pagination,
          nextLeads.length,
          limit
        )
      );
    } catch {
      setError("Failed to load leads. Please try again.");
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, [
    page,
    limit,
    search,
    status,
    priority,
    leadSource,
    assignedTo,
    options.fetchAllAsAdmin,
  ]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    const unsubscribe =
      subscribeRealtime<LeadListChangedPayload>(
        LEAD_LIST_CHANGED,
        fetchLeads
      );

    return unsubscribe;
  }, [fetchLeads]);

  return {
    leads,
    stats,
    pagination,
    isLoading,
    isInitialLoading: isLoading && !hasLoaded,
    error,
    refetch: fetchLeads,
  };
}
