"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getExecutiveOverview } from "@/services/managerdashboard";
import type { ExecutiveFilters, ExecutiveRow } from "@/types/org-manager";
import { subscribeRealtime } from "@/lib/socket";
import {
  LEAD_LIST_CHANGED,
  OFFER_LIST_CHANGED,
  USER_LIST_CHANGED,
} from "@/types/realtime";
import GlobalLoader from "@/components/commoncomponents/globalloader";

import ExecutiveStatCards from "@/components/commoncomponents/managerdashboard/executive-stat-card";
import ExecutiveTableFilters from "@/components/commoncomponents/managerdashboard/executive-table-filter";
import TablePaginationFooter from "@/components/commoncomponents/table-pagination-footer";
import { useUrlPagination } from "@/hooks/use-url-pagination";
import { createPaginationMeta } from "@/types/pagination";

const DEFAULT_FILTERS: ExecutiveFilters = {
  search: "",
  status: [],
};

const formatCount = (value: number) => value.toLocaleString("en-IN");

export default function ExecutivesPage() {
  const { page, limit, setPage, setLimit } = useUrlPagination();
  const [executives, setExecutives] = useState<ExecutiveRow[]>([]);

  const [totalCount, setTotalCount] = useState(0);

  const [activeCount, setActiveCount] = useState(0);

  const [inactiveCount, setInactiveCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<ExecutiveFilters>(DEFAULT_FILTERS);

  const [draftFilters, setDraftFilters] =
    useState<ExecutiveFilters>(DEFAULT_FILTERS);

  const fetchExecutives = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setIsLoading(true);

      setError(null);

      const response = await getExecutiveOverview();

      const data = response?.value || response;

      const stats = data?.stats || {};

      setTotalCount(stats.totalExecutives || 0);

      setActiveCount(stats.activeExecutives || 0);

      setInactiveCount(stats.inactiveExecutives || 0);

      const formattedExecutives: ExecutiveRow[] = (data?.executives || []).map(
        (item: ExecutiveRow) => ({
          id: item.id,

          name: item.name,

          email: item.email,

          phone: item.phone,

          status: item.status,

          leadCount: item.leadCount,

          offerCount: item.offerCount,
        }),
      );

      setExecutives(formattedExecutives);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load executives",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExecutives(true);
  }, [fetchExecutives]);

  useEffect(() => {
    const refreshExecutives = () => {
      fetchExecutives();
    };

    const unsubscribeUserChanges = subscribeRealtime(
      USER_LIST_CHANGED,
      refreshExecutives,
    );
    const unsubscribeLeadChanges = subscribeRealtime(
      LEAD_LIST_CHANGED,
      refreshExecutives,
    );
    const unsubscribeOfferChanges = subscribeRealtime(
      OFFER_LIST_CHANGED,
      refreshExecutives,
    );

    return () => {
      unsubscribeUserChanges();
      unsubscribeLeadChanges();
      unsubscribeOfferChanges();
    };
  }, [fetchExecutives]);

  const handleFilterChange = useCallback(
    <K extends keyof ExecutiveFilters>(key: K, value: ExecutiveFilters[K]) => {
      setDraftFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [],
  );

  const handleApplyFilters = useCallback(() => {
    setFilters(draftFilters);
    setPage(1);
  }, [draftFilters, setPage]);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);

    setDraftFilters(DEFAULT_FILTERS);
    setPage(1);
  }, [setPage]);

  const filteredExecutives = useMemo(
    () =>
      executives.filter((executive) => {
        const query = filters.search.toLowerCase();

        const matchesSearch =
          !query ||
          executive.name.toLowerCase().includes(query) ||
          executive.email.toLowerCase().includes(query) ||
          executive.phone.toLowerCase().includes(query);

        const matchesStatus =
          filters.status.length === 0 ||
          filters.status.some((s) => s.toLowerCase() === executive.status.toLowerCase());

        return matchesSearch && matchesStatus;
      }),
    [executives, filters],
  );

  const pagination = useMemo(
    () =>
      createPaginationMeta({
        page,
        limit,
        total: filteredExecutives.length,
      }),
    [filteredExecutives.length, limit, page],
  );

  const paginatedExecutives = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;

    return filteredExecutives.slice(startIndex, startIndex + pagination.limit);
  }, [filteredExecutives, pagination.limit, pagination.page]);

  useEffect(() => {
    if (page > pagination.totalPages) {
      setPage(pagination.totalPages);
    }
  }, [page, pagination.totalPages, setPage]);

  if (isLoading) {
    return <GlobalLoader />;
  }

  return (
    <div className="w-full h-full p-4 sm:p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 sm:text-2xl">
            Executives
          </h1>

          <p className="text-xs text-gray-500 sm:text-sm">
            Track and manage your executives.
          </p>
        </div>
      </div>

      {/* Cards */}
      <ExecutiveStatCards
        stats={{
          totalExecutives: totalCount,
          activeExecutives: activeCount,
          inactiveExecutives: inactiveCount,
        }}
      />

      {/* Filters */}
      <ExecutiveTableFilters
        search={draftFilters.search}
        status={draftFilters.status}
        onSearchChange={(value) => handleFilterChange("search", value)}
        onStatusChange={(value) => handleFilterChange("status", value)}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

      {/* Table */}
      <div>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <Table>
          <TableHeader className="bg-[#7677F41A]">
            <TableRow>
              <TableHead className="w-16 whitespace-nowrap text-xs sm:text-sm">S.No</TableHead>

              <TableHead className="min-w-[160px] whitespace-nowrap text-xs sm:text-sm">Executive Name</TableHead>

              <TableHead className="min-w-[220px] whitespace-nowrap text-xs sm:text-sm">Email</TableHead>

              <TableHead className="min-w-[160px] whitespace-nowrap text-xs sm:text-sm">Phone</TableHead>

              <TableHead className="min-w-[120px] whitespace-nowrap text-xs sm:text-sm">Status</TableHead>

              <TableHead className="min-w-[100px] whitespace-nowrap text-xs sm:text-sm">Leads</TableHead>

              <TableHead className="min-w-[140px] whitespace-nowrap text-xs sm:text-sm">Assigned Offers</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {error ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-red-500">
                  {error}
                </TableCell>
              </TableRow>
            ) : executives.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-gray-500"
                >
                  No Executives Available
                </TableCell>
              </TableRow>
            ) : filteredExecutives.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-gray-500"
                >
                  No Executives Match the Applied Filters
                </TableCell>
              </TableRow>
            ) : (
              paginatedExecutives.map((executive, index) => (
                <TableRow key={executive.id}>
                  <TableCell>
                    {(pagination.page - 1) * pagination.limit + index + 1}
                  </TableCell>

                  <TableCell 
                    title={executive.name}
                    className="font-medium"
                  >
                    {executive.name}
                  </TableCell>

                  <TableCell
                    title={executive.email}
                    className="max-w-[220px] truncate"
                  >
                    {executive.email}
                  </TableCell>

                  <TableCell>
                    {executive.phone}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        executive.status.toLowerCase() === "active"
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-gray-200 bg-gray-50 text-gray-600"
                      }
                    >
                      {executive.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="font-semibold">
                    {formatCount(executive.leadCount)}
                  </TableCell>

                  <TableCell className="font-semibold">
                    {formatCount(executive.offerCount)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          </Table>
        </div>

        <TablePaginationFooter
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={setLimit}
          totalLabel="executives"
        />
      </div>
    </div>
  );
}
