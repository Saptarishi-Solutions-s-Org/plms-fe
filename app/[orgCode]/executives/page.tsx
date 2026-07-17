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
import { useUrlFilters, type FilterConfig } from "@/hooks/useurlfilters";
import { createPaginationMeta, type PaginationMeta } from "@/types/pagination";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AddLeadForm from "@/components/orgadmindashboard/userform";
import { canAccess } from "@/lib/permissions";
import { useCurrentUser } from "@/hooks/use-current-user";

const executiveFilterConfig: FilterConfig<ExecutiveFilters> = {
  search: { type: "string", urlKey: "search" },
  status: { type: "list", urlKey: "status" },
};

const formatCount = (value: number) => value.toLocaleString("en-IN");

export default function ExecutivesPage() {
  const { page, limit, setPage, setLimit } = useUrlPagination();
  const { filters, setFilters } = useUrlFilters<ExecutiveFilters>(executiveFilterConfig);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [executives, setExecutives] = useState<ExecutiveRow[]>([]);

  const [totalCount, setTotalCount] = useState(0);

  const [activeCount, setActiveCount] = useState(0);

  const [inactiveCount, setInactiveCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [draftFilters, setDraftFilters] = useState<ExecutiveFilters>(filters);

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  const [pagination, setPagination] = useState<PaginationMeta>(
    createPaginationMeta({ page, limit, total: 0 }),
  );

  const currentUser = useCurrentUser();
  const canCreateExecutives = canAccess(currentUser, ["user"], ["create"]);
  const canExportExecutives = canAccess(currentUser, ["user"], ["export"]);

  const fetchExecutives = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setIsLoading(true);

      setError(null);

      const response = await getExecutiveOverview({
        page,
        limit,
        search: filters.search,
        status: filters.status.join(","),
      });

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
      setPagination(
        data?.pagination ??
          createPaginationMeta({ page, limit, total: formattedExecutives.length }),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load executives",
      );
      setExecutives([]);
      setPagination(createPaginationMeta({ page, limit, total: 0 }));
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, [page, limit, filters]);

  useEffect(() => {
    fetchExecutives(!hasLoaded);
  }, [fetchExecutives, hasLoaded]);

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
  }, [draftFilters, setFilters]);

  const handleClearFilters = useCallback(() => {
    setFilters({ search: "", status: [] });
  }, [setFilters]);

  const paginatedExecutives = executives;

  const handleExport = useCallback(() => {
    if (!executives.length) return;

    const headers = ["S.No", "Executive Name", "Email", "Phone", "Status", "Leads", "Assigned Offers"];

    const rows = executives.map((executive, index) => [
      (pagination.page - 1) * pagination.limit + index + 1,
      executive.name,
      executive.email,
      executive.phone,
      executive.status,
      executive.leadCount,
      executive.offerCount,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((value) => {
            const stringValue = String(value ?? "");
            return /[",\n]/.test(stringValue)
              ? `"${stringValue.replace(/"/g, '""')}"`
              : stringValue;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `executives-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [executives, pagination.page, pagination.limit]);

  useEffect(() => {
    if (pagination.totalPages > 0 && page > pagination.totalPages) {
      setPage(pagination.totalPages);
    }
  }, [page, pagination.totalPages, setPage]);

  if (isLoading && !hasLoaded) {
    return <GlobalLoader />;
  }

  return (
    <div className="w-full h-full p-4 sm:p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-gray-900 sm:text-2xl">
            Executives
          </h1>
          <p className="text-xs text-gray-500 sm:text-sm">
            Track and manage your executives.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          {canCreateExecutives ? (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="h-9 w-full rounded-full bg-blue-500 px-4 font-medium text-white hover:bg-blue-600 sm:w-auto">
                  <Plus className="size-4" />
                  Add Executive
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Executive</DialogTitle>
                  <DialogDescription>
                    Create an executive for your team.
                  </DialogDescription>
                </DialogHeader>
                <AddLeadForm mode="manager" onClose={() => setIsCreateOpen(false)} />
              </DialogContent>
            </Dialog>
          ) : null}

          {canExportExecutives ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleExport}
              disabled={!executives.length}
              className="flex h-9 w-full items-center justify-center gap-1.5 rounded-full px-4 sm:w-auto"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          ) : null}
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