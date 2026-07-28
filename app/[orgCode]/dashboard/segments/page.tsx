"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { 
  Users, 
  Plus, 
  Search, 
  Trash2, 
  Download, 
  Edit3, 
  Eye, 
  Settings, 
  AlertCircle,
  FileSpreadsheet,
  ToggleLeft,
  ToggleRight
} from "lucide-react";

import { type AuthUser, getUser } from "@/lib/auth";
import { canAccess } from "@/lib/permissions";
import { getSegments, deleteSegment, exportSegment, saveSegment } from "@/services/segments";
import { ActionConfirmationDialog } from "@/components/commoncomponents/action-confirmation-dialog";
import TablePaginationFooter from "@/components/commoncomponents/table-pagination-footer";
import GlobalLoader from "@/components/commoncomponents/globalloader";
import { useUrlPagination } from "@/hooks/use-url-pagination";
import { subscribeRealtime } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { SEGMENT_LIST_CHANGED } from "@/types/realtime";

const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((cells) => cells.some((cell) => cell !== ""));
};

const escapeCsvValue = (value: unknown) => {
  const text = String(value ?? "").replace(/"/g, '""');
  return /[",\n]/.test(text) ? `"${text}"` : text;
};

const cleanSegmentExportCsv = (csvContent: string): string => {
  const rows = parseCsv(csvContent);

  if (!rows.length) return csvContent;

  const [headerRow, ...dataRows] = rows;
  const leadCodeIndex = headerRow.findIndex((header) =>
    /^leadcode$/i.test(header.replace(/[_\s]/g, "")),
  );

  const stripLeadCode = (row: string[]) =>
    leadCodeIndex === -1
      ? row
      : row.filter((_, index) => index !== leadCodeIndex);

  const newHeader = [
    "S.No",
    ...stripLeadCode(headerRow).map((header) => header.replace(/_/g, " ")),
  ];

  const newRows = dataRows.map((row, index) => [
    String(index + 1),
    ...stripLeadCode(row).map((cell) => cell.replace(/_/g, " ")),
  ]);

  return [newHeader, ...newRows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");
};

export default function SegmentsPage() {
  const router = useRouter();
  const params = useParams<{ orgCode: string }>();
  const orgCode = params.orgCode;
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<AuthUser | null>(() => getUser());

  useEffect(() => {
    const syncUser = () => setUser(getUser());
    window.addEventListener("LMA-auth-changed", syncUser);
    return () => window.removeEventListener("LMA-auth-changed", syncUser);
  }, []);

  // 1. Permissions Check
  const hasViewAccess = useMemo(() => canAccess(user, ["segmentation"], ["view"]), [user]);
  const canCreate = useMemo(() => canAccess(user, ["segmentation"], ["create"]), [user]);
  const canUpdate = useMemo(() => canAccess(user, ["segmentation"], ["update"]), [user]);
  const canDelete = useMemo(() => canAccess(user, ["segmentation"], ["delete"]), [user]);
  const canExport = useMemo(() => canAccess(user, ["segmentation"], ["export"]), [user]);

  // 2. Pagination & Filters State
  const { page, limit, setPage, setLimit } = useUrlPagination();
  const searchVal = searchParams.get("search") || "";
  const typeVal = searchParams.get("type") || "";
  const statusVal = searchParams.get("is_active") || "";

  const [searchTerm, setSearchTerm] = useState(searchVal);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(() =>
    typeVal ? typeVal.split(",") : []
  );
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(() => {
    if (!statusVal) return [];
    return statusVal.split(",").map((v) => (v === "true" ? "Active" : "Inactive"));
  });

  const [segmentsList, setSegmentsList] = useState<any[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<any>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Stats calculation
  const [summaryStats, setSummaryStats] = useState({
    totalSegments: 0,
    activeSegments: 0,
    totalMatchingLeads: 0,
    offersLinked: 0
  });

  // Action states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [targetSegment, setTargetSegment] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Sync input value with URL search changes
  useEffect(() => {
    setSearchTerm(searchVal);
    setSelectedTypes(typeVal ? typeVal.split(",") : []);
    setSelectedStatuses(
      statusVal ? statusVal.split(",").map((v) => (v === "true" ? "Active" : "Inactive")) : []
    );
  }, [searchVal, typeVal, statusVal]);

  // 3. Data Fetcher
  const fetchSegmentsData = async () => {
    if (!hasViewAccess) return;
    setIsLoading(true);
    try {
      const res = await getSegments({
        page,
        limit,
        search: searchVal || undefined,
        type: typeVal || undefined,
        is_active: statusVal || undefined
      });

      if (res && res.segments) {
        setSegmentsList(res.segments);
        setPaginationMeta(res.pagination);
        
        // Calculate dynamic summary stats based on current list and configuration
        const activeCount = res.segments.filter((s: any) => s.is_active).length;
        const leadsSum = res.segments.reduce((acc: number, cur: any) => acc + (cur.lead_count || 0), 0);
        const offersCount = res.segments.reduce((acc: number, cur: any) => acc + (cur.offer_titles && cur.offer_titles !== "None" ? 1 : 0), 0);

        setSummaryStats({
          totalSegments: res.pagination.total || 0,
          activeSegments: activeCount,
          totalMatchingLeads: leadsSum,
          offersLinked: offersCount
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load segments list.");
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  };

  useEffect(() => {
    fetchSegmentsData();
  }, [page, limit, searchParams, hasViewAccess]);

  useEffect(() => {
    if (!hasViewAccess) return;
    const unsubscribe = subscribeRealtime(SEGMENT_LIST_CHANGED, () => {
      fetchSegmentsData();
    });
    return () => unsubscribe();
  }, [hasViewAccess, page, limit, searchParams]);

  useEffect(() => {
    if (user && !hasViewAccess) {
      router.replace("/not-authorized");
    }
  }, [user, hasViewAccess, router]);

  // 4. URL State Update Handlers
  const handleApplyFilters = () => {
    const current = new URLSearchParams(searchParams.toString());

    if (searchTerm) {
      current.set("search", searchTerm);
    } else {
      current.delete("search");
    }

    if (selectedTypes.length > 0) {
      current.set("type", selectedTypes.join(","));
    } else {
      current.delete("type");
    }

    if (selectedStatuses.length > 0) {
      const activeParams = selectedStatuses.map((s) => (s === "Active" ? "true" : "false"));
      current.set("is_active", activeParams.join(","));
    } else {
      current.delete("is_active");
    }

    current.set("page", "1"); // Always reset page index to 1 on filters mutation
    router.replace(`${pathname}?${current.toString()}`, { scroll: false });
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedTypes([]);
    setSelectedStatuses([]);

    const current = new URLSearchParams(searchParams.toString());
    current.delete("search");
    current.delete("type");
    current.delete("is_active");
    current.set("page", "1");
    router.replace(`${pathname}?${current.toString()}`, { scroll: false });
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleApplyFilters();
    }
  };

  // 5. Actions Handlers
  const handleDeleteConfirm = async () => {
    if (!targetSegment) return;
    setActionLoading(true);
    try {
      await deleteSegment(targetSegment.id);
      toast.success(`Segment "${targetSegment.name}" deleted successfully.`);
      setDeleteDialogOpen(false);
      setTargetSegment(null);
      fetchSegmentsData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete segment.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusToggle = (segment: any) => {
    if (!canUpdate) {
      toast.error("Forbidden: You do not have permissions to modify segments.");
      return;
    }
    setTargetSegment(segment);
    setStatusDialogOpen(true);
  };

  const handleStatusConfirm = async () => {
    if (!targetSegment) return;

    setActionLoading(true);
    try {
      await saveSegment({
        id: targetSegment.id,
        name: targetSegment.name,
        description: targetSegment.description,
        type: targetSegment.type,
        color: targetSegment.color,
        notes: targetSegment.notes,
        is_active: !targetSegment.is_active,
        filters: undefined as any,
        static_lead_ids: undefined as any
      });

      toast.success(`Segment status updated successfully.`);
      setStatusDialogOpen(false);
      fetchSegmentsData();
    } catch (err) {
      toast.error("Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportSegment = async (segment: any) => {
    if (!canExport) {
      toast.error("Forbidden: You do not have permissions to export.");
      return;
    }

    try {
      const loadId = toast.loading(`Exporting leads for Segment "${segment.name}"...`);
      const res = await exportSegment(segment.code);

      const blob = new Blob([cleanSegmentExportCsv(res.csvContent)], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${segment.name.toLowerCase().replace(/\s+/g, "_")}_leads.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.dismiss(loadId);
      toast.success("Leads list exported successfully!");
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to export segment leads.");
    }
  };

  // 6. Security restriction templates
  if (!user) return <GlobalLoader />;

  if (!hasViewAccess) {
    return null;
  }

  const isInitialLoading = isLoading && !hasLoaded;
  if (isInitialLoading) return <GlobalLoader />;

  return (
    <div className="w-full h-full p-4 sm:p-6 space-y-6 bg-gray-50/20">
      {/* Upper Title Block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads Segmentation</h1>
          <p className="text-sm text-gray-500">
            Create custom static lists or filter-based dynamic categories to manage targeted offers.
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={() => router.push(`/${orgCode}/dashboard/segments/new`)}
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Create Segment
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition duration-200">
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Segments</p>
            <h3 className="text-xl font-bold text-gray-900">{summaryStats.totalSegments}</h3>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition duration-200">
          <div className="p-3 bg-green-50 rounded-xl text-green-600">
            <ToggleRight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Active Lists</p>
            <h3 className="text-xl font-bold text-gray-900">{summaryStats.activeSegments}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition duration-200">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider font-semibold">Leads Matching</p>
            <h3 className="text-xl font-bold text-gray-900">{summaryStats.totalMatchingLeads}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition duration-200">
          <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider font-semibold">Offer Campaigns</p>
            <h3 className="text-xl font-bold text-gray-900">{summaryStats.offersLinked}</h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar Section */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:flex-1 sm:flex-wrap sm:items-center sm:justify-end gap-4">
          <div className="w-full sm:w-80">
            <Input
              search
              type="text"
              placeholder="Search segments name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              className="text-sm rounded-lg h-9 py-2 px-3 bg-white"
            />
          </div>

          <MultiSelectCombobox
            options={["Dynamic", "Static"]}
            selectedValues={selectedTypes}
            onSelectionChange={setSelectedTypes}
            placeholder="Filter by type"
            width="w-full sm:w-50"
          />

          <MultiSelectCombobox
            options={["Active", "Inactive"]}
            selectedValues={selectedStatuses}
            onSelectionChange={setSelectedStatuses}
            placeholder="Filter by status"
            width="w-full sm:w-50"
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="h-9 rounded-lg"
            >
              Clear
            </Button>

            <Button
              onClick={handleApplyFilters}
              className="bg-blue-600 text-white hover:bg-blue-700 h-9 rounded-lg"
            >
              Apply
            </Button>
          </div>
        </div>
      </div>

      {/* Segments Cards Grid */}
      {segmentsList.length === 0 ? (
        <div className="w-full text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <AlertCircle className="w-8 h-8 text-gray-300 mb-2" />
          <h3 className="text-gray-900 font-semibold mb-1 text-sm">No segments found</h3>
          <p className="text-xs text-gray-400 max-w-xs">
            Try adjusting your search query, state filters, or create a new segment configuration.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {segmentsList.map((segment) => (
            <div
              key={segment.id}
              onClick={() => router.push(`/${orgCode}/dashboard/segments/${segment.code}`)}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
              style={{ borderLeft: `5px solid ${segment.color || "#8b5cf6"}` }}
            >
              <div className="p-5 space-y-4">
                {/* Heading & Badges */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      segment.type === "Dynamic" 
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-100" 
                        : "bg-teal-50 text-teal-700 border border-teal-100"
                    }`}>
                      {segment.type}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      segment.is_active
                        ? "bg-green-50 text-green-700 border border-green-100"
                        : "bg-red-50 text-red-700 border border-red-100"
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${segment.is_active ? "bg-green-500" : "bg-red-500"}`}></span>
                      {segment.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Top-right Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={(e) => e.stopPropagation()}>
                    {canUpdate && (
                      <button
                        onClick={() => handleStatusToggle(segment)}
                        title={segment.is_active ? "Deactivate list" : "Activate list"}
                        className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full transition"
                      >
                        {segment.is_active ? <ToggleRight className="w-4 h-4 text-purple-600" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                      </button>
                    )}

                    {canExport && (
                      <button
                        onClick={() => handleExportSegment(segment)}
                        title="Export leads CSV"
                        className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => {
                          setTargetSegment(segment);
                          setDeleteDialogOpen(true);
                        }}
                        title="Delete segment"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Brand / Logo container */}
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-2xl text-white shadow-sm shadow-purple-100 group-hover:scale-105 transition-transform duration-300">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-200 line-clamp-1">
                      {segment.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono">
                      Code: {segment.code}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-500 line-clamp-2 min-h-[2rem]">
                  {segment.description || "No description provided."}
                </p>

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-500 block">Matched Leads</span>
                    <span className="text-sm font-bold text-purple-600">{segment.lead_count}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Owner</span>
                    <span className="truncate block font-semibold text-gray-800">{segment.createdByName}</span>
                  </div>
                </div>

                {/* Linked Campaign */}
                {segment.offer_titles && segment.offer_titles !== "None" && (() => {
                  const offers = segment.offer_titles.split(",").map((o: any) => o.trim()).filter(Boolean);
                  if (offers.length === 0) return null;
                  return (
                    <div className="text-[10px] bg-purple-50/50 p-2.5 rounded-xl border border-purple-100/50 text-purple-900 font-medium mt-2 flex items-center gap-1.5">
                      <span className="font-bold text-purple-700">Offers:</span>
                      {offers.length <= 2 ? (
                        <span className="truncate flex-1">{offers.join(", ")}</span>
                      ) : (
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <span className="truncate flex-1">{offers[0]}</span>
                          <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full font-bold text-[9px] shrink-0">
                            +{offers.length - 1}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Action Buttons Footer */}
              <div className="px-5 py-3 bg-gray-50/40 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400 font-medium">
                <span>Updated: {new Date(segment.modifiedAt).toLocaleDateString()}</span>
                <span className="flex items-center gap-1 text-purple-600 font-bold group-hover:translate-x-1 transition-transform duration-200">
                  View Details →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {segmentsList.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <TablePaginationFooter
            pagination={paginationMeta}
            onPageChange={setPage}
            onLimitChange={setLimit}
            totalLabel="segments"
          />
        </div>
      )}

      {/* Delete Confirmation Alert Dialog */}
      <ActionConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Segment"
        description={`Are you sure you want to delete segment "${targetSegment?.name}"? All rules and mappings will be permanently removed. This action is irreversible.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={actionLoading}
      />

      {/* Status Confirmation Alert Dialog */}
      <ActionConfirmationDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        onConfirm={handleStatusConfirm}
        title={targetSegment?.is_active ? "Deactivate Segment" : "Activate Segment"}
        description={`Are you sure you want to ${targetSegment?.is_active ? "deactivate" : "activate"} segment "${targetSegment?.name}"?`}
        confirmText={targetSegment?.is_active ? "Deactivate" : "Activate"}
        cancelText="Cancel"
        isLoading={actionLoading}
      />
    </div>
  );
}
