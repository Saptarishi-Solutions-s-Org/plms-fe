import { useState, useEffect, useCallback } from "react";
import { Lead } from "@/types/leadtypes";
import { getLeadsWithStats } from "@/services/leads";

export interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats>({
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getLeadsWithStats();
      setLeads(res.leads);
      setStats(res.stats);
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError("Failed to load leads. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return { leads, stats, isLoading, error, refetch: fetchLeads };
}