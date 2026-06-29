import { useState, useEffect, useCallback } from "react";
import type { Lead, LeadStats } from "@/types/leadtypes";
import { getLeadsWithStats } from "@/services/leads";
import { LEAD_LIST_CHANGED, LeadListChangedPayload } from "@/types/realtime";
import { subscribeRealtime } from "@/lib/socket";
import {
  DEFAULT_PAGE_LIMIT,
  emptyPagination,
  normalizePagination,
  type PaginationMeta,
} from "@/types/pagination";
import {UseLeadsOptions} from "@/types/pagination";
export function useLeads(options: UseLeadsOptions = {}) {
  const page = options.page;
  const limit = options.limit ?? DEFAULT_PAGE_LIMIT;
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats>({
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
  });
  const [pagination, setPagination] = useState<PaginationMeta>(
    emptyPagination(limit),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getLeadsWithStats(
        page ? { page, limit } : undefined,
      );
      const nextLeads = res.leads ?? [];
      setLeads(nextLeads);
      setStats(res.stats);
      setPagination(
        normalizePagination(res.pagination, nextLeads.length, limit),
      );
    } catch {
      setError("Failed to load leads. Please try again.");
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, [limit, page]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    return subscribeRealtime<LeadListChangedPayload>(LEAD_LIST_CHANGED, () => {
      fetchLeads();
    });
  },[fetchLeads]);

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
