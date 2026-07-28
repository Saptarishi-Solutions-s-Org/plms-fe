"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  ClipboardList,
  Gift,
  Download,
  AlertCircle,
  Check,
  Plus
} from "lucide-react";

import { type AuthUser, getUser } from "@/lib/auth";
import { canAccess } from "@/lib/permissions";
import { getSegmentByCode, getSegmentAuditHistory, deleteSegment, assignOffersToSegment, exportSegment } from "@/services/segments";
import { getOffers } from "@/services/offers";
import { ActionConfirmationDialog } from "@/components/commoncomponents/action-confirmation-dialog";
import TablePaginationFooter from "@/components/commoncomponents/table-pagination-footer";
import GlobalLoader from "@/components/commoncomponents/globalloader";
import { subscribeRealtime } from "@/lib/socket";
import { SEGMENT_DETAIL_CHANGED } from "@/types/realtime";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

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

const isOfferExpired = (offer: any) => {
  if (!offer) return false;
  if (offer.status?.toLowerCase() === "expired") return true;

  const expiryDateStr = offer.validTo || offer.valid_to || offer.valid_To || offer.endDate || offer.end_date;
  if (expiryDateStr) {
    const expiryDate = new Date(expiryDateStr);
    if (!isNaN(expiryDate.getTime()) && expiryDate < new Date()) {
      return true;
    }
  }
  return false;
};

export default function SegmentDetailPage() {
  const router = useRouter();
  const params = useParams<{ orgCode: string; code: string }>();
  const orgCode = params.orgCode;
  const segmentCode = params.code;

  const parseUTCTimestamp = (tsString: string) => {
    if (!tsString) return new Date();
    const cleanStr = (tsString.endsWith("Z") || tsString.includes("+") || tsString.includes("-"))
      ? tsString
      : `${tsString}Z`;
    return new Date(cleanStr);
  };

  const [user, setUser] = useState<AuthUser | null>(() => getUser());

  useEffect(() => {
    const syncUser = () => setUser(getUser());
    window.addEventListener("LMA-auth-changed", syncUser);
    return () => window.removeEventListener("LMA-auth-changed", syncUser);
  }, []);

  const hasViewAccess = useMemo(() => canAccess(user, ["segmentation"], ["view"]), [user]);
  const canUpdate = useMemo(() => canAccess(user, ["segmentation"], ["update"]), [user]);
  const canDelete = useMemo(() => canAccess(user, ["segmentation"], ["delete"]), [user]);
  const canExport = useMemo(() => canAccess(user, ["segmentation"], ["export"]), [user]);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab");
  const activeTab = (tabParam === "offers" || tabParam === "audit") ? tabParam : "overview";

  const setActiveTab = (tab: "overview" | "offers" | "audit") => {
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set("tab", tab);
    router.replace(`${pathname}?${currentParams.toString()}`, { scroll: false });
  };

  // Segment State
  const [segment, setSegment] = useState<any>(null);
  const [matchingLeadsStats, setMatchingLeadsStats] = useState<any>({ total_count: 0, male_count: 0, female_count: 0, avg_age: 0.0, leads: [] });
  const [isLoadingSegment, setIsLoadingSegment] = useState(true);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditPagination, setAuditPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  // Offers Mapping Modal State
  const [offersModalOpen, setOffersModalOpen] = useState(false);
  const [allOffers, setAllOffers] = useState<any[]>([]);
  const [modalSelectedOfferIds, setModalSelectedOfferIds] = useState<string[]>([]);
  const [isLinkingOffers, setIsLinkingOffers] = useState(false);
  const [isOffersLoading, setIsOffersLoading] = useState(false);

  const filteredAvailableOffers = useMemo(() => {
    const assignedIds = segment?.assigned_offers?.map((o: any) => o.id) || [];
    return allOffers.filter((o) => !assignedIds.includes(o.id));
  }, [allOffers, segment?.assigned_offers]);

  // Deletion Modal State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Fetch Segment Details
  const fetchSegmentDetails = async (silent = false) => {
    if (!hasViewAccess) return;
    if (!silent) setIsLoadingSegment(true);
    try {
      const detail = await getSegmentByCode(segmentCode);
      setSegment(detail);

      // Trigger matching stats calculation using segment preview action (with exact current settings)
      const previewPayload = {
        segment_id: detail.id,
        type: detail.type,
        filters: detail.type === "Dynamic" ? detail.filters : [],
        static_lead_ids: detail.type === "Static" ? detail.static_lead_ids : []
      };
      
      // Let's call the preview segment service to fetch the dynamically resolved statistics
      const stats = await getOffersSegmentPreview(previewPayload);
      setMatchingLeadsStats(stats);
    } catch (err: any) {
      console.error(err);
      if (err.status === 403) {
        toast.error("Forbidden: You do not have permissions to view this segment.");
        router.push(`/${orgCode}/dashboard/segments`);
      } else {
        toast.error("Failed to load segment details.");
      }
    } finally {
      if (!silent) setIsLoadingSegment(false);
    }
  };

  // Helper helper to fetch match stats (same schema as previewSegment)
  const getOffersSegmentPreview = async (payload: any) => {
    const { previewSegment } = await import("@/services/segments");
    return await previewSegment(payload);
  };

  useEffect(() => {
    fetchSegmentDetails();
  }, [segmentCode, hasViewAccess]);

  // 2. Fetch Audit Logs
  const fetchAuditLogs = async () => {
    if (!segment || activeTab !== "audit") return;
    setIsLoadingAudit(true);
    try {
      const res = await getSegmentAuditHistory({
        segmentId: segment.id,
        page: auditPage,
        limit: 10
      });
      if (res && res.logs) {
        setAuditLogs(res.logs);
        setAuditPagination(res.pagination);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load audit history log.");
    } finally {
      setIsLoadingAudit(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [segment?.id, activeTab, auditPage]);

  useEffect(() => {
    if (!segment?.id) return;
    const unsubscribe = subscribeRealtime(SEGMENT_DETAIL_CHANGED, (event: any) => {
      const data = event?.data;
      if (data && data.segmentId === segment.id) {
        if (data.reason === "segment-deleted") {
          toast.warning("This segment has been deleted.");
          router.push(`/${orgCode}/dashboard/segments`);
        } else {
          fetchSegmentDetails(true);
          fetchAuditLogs();
        }
      }
    });
    return () => unsubscribe();
  }, [segment?.id]);

  // 3. Fetch Active Offers list for linking modal
  const fetchActiveOffers = async () => {
    setIsOffersLoading(true);
    try {
      const res = await getOffers({ page: 1, limit: 100 });
      if (res && res.offers) {
        // Only list active offers
        setAllOffers(res.offers.filter((o: any) => o.status === "Active"));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load available offer campaigns.");
    } finally {
      setIsOffersLoading(false);
    }
  };

  const handleOpenLinkOffers = () => {
    setModalSelectedOfferIds([]);
    fetchActiveOffers();
    setOffersModalOpen(true);
  };

  const handleLinkOffersConfirm = async () => {
    if (!segment) return;
    setIsLinkingOffers(true);
    try {
      const assignedIds = segment.assigned_offers?.map((o: any) => o.id) || [];
      const finalOfferIds = [...assignedIds, ...modalSelectedOfferIds];
      await assignOffersToSegment({
        segmentId: segment.id,
        offerIds: finalOfferIds
      });
      toast.success("Offers assigned to segment successfully!");
      setOffersModalOpen(false);
      fetchSegmentDetails(true); // Reload mappings
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign offers.");
    } finally {
      setIsLinkingOffers(false);
    }
  };

  // Toggle checklist inside Link offers popup
  const handleToggleOfferSelect = (offerId: string) => {
    setModalSelectedOfferIds(prev => 
      prev.includes(offerId) ? prev.filter(id => id !== offerId) : [...prev, offerId]
    );
  };

  // Unlink single offer states and handlers
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false);
  const [unlinkTargetOffer, setUnlinkTargetOffer] = useState<any>(null);

  const handleUnlinkOfferClick = (offer: any) => {
    setUnlinkTargetOffer(offer);
    setUnlinkDialogOpen(true);
  };

  const handleUnlinkOfferConfirm = async () => {
    if (!segment || !unlinkTargetOffer) return;
    setIsLinkingOffers(true);
    try {
      const assignedIds = segment.assigned_offers?.map((o: any) => o.id) || [];
      const remainingIds = assignedIds.filter((id: string) => id !== unlinkTargetOffer.id);
      await assignOffersToSegment({
        segmentId: segment.id,
        offerIds: remainingIds
      });
      toast.success(`Removed offer campaign "${unlinkTargetOffer.title}" from segment.`);
      setUnlinkDialogOpen(false);
      setSegment((prev: any) => ({
        ...prev,
        assigned_offers: prev.assigned_offers.filter((o: any) => o.id !== unlinkTargetOffer.id)
      }));
      fetchSegmentDetails(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove offer.");
    } finally {
      setIsLinkingOffers(false);
    }
  };

  // 4. Delete segment
  const handleDeleteSegment = async () => {
    if (!segment) return;
    setIsDeleting(true);
    try {
      await deleteSegment(segment.id);
      toast.success(`Segment "${segment.name}" deleted successfully.`);
      setDeleteDialogOpen(false);
      router.push(`/${orgCode}/dashboard/segments`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete segment.");
    } finally {
      setIsDeleting(false);
    }
  };

  // 5. CSV export
  const handleExportLeads = async () => {
    if (!segment || !canExport) {
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

  if (!user) return <GlobalLoader />;

  if (!hasViewAccess) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-6 bg-gray-50/50 rounded-3xl border border-gray-100">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4 animate-bounce" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-sm text-gray-500 text-center max-w-sm">
          You do not have permissions to view this page.
        </p>
      </div>
    );
  }

  if (isLoadingSegment || !segment) return <GlobalLoader />;

  return (
    <div className="w-full h-full p-4 sm:p-6 space-y-6 bg-gray-50/20">
      {/* Header back navigation & page actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/${orgCode}/dashboard/segments`)}
            className="p-2 text-gray-500 hover:text-purple-600 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-3">
            {/* Color block badge */}
            <div className="w-4 h-8 rounded-md shadow-sm" style={{ backgroundColor: segment.color || "#8b5cf6" }} />
            <div>
              <h1 className="text-xl font-bold text-gray-900">{segment.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <code className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded font-mono">
                  {segment.code}
                </code>
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                  segment.type === "Dynamic" ? "bg-indigo-50 text-indigo-700" : "bg-teal-50 text-teal-700"
                }`}>
                  {segment.type}
                </span>
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                  segment.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}>
                  {segment.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          {canUpdate && (
            <button
              onClick={() => router.push(`/${orgCode}/dashboard/segments/new?edit=${segment.code}`)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition duration-150 active:scale-95 shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Rules</span>
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => setDeleteDialogOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-100 transition duration-150 active:scale-95 shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete List</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs list switches */}
      <div className="flex items-center gap-2 border-b border-gray-150 pb-px">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeTab === "overview"
              ? "border-purple-600 text-purple-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Overview details</span>
          </span>
        </button>

        <button
          onClick={() => setActiveTab("offers")}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeTab === "offers"
              ? "border-purple-600 text-purple-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5" />
            <span>Target Campaigns</span>
          </span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeTab === "audit"
              ? "border-purple-600 text-purple-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Audit history trail</span>
          </span>
        </button>
      </div>

      {/* Dynamic Tab Body rendering */}
      <div className="w-full">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
            {/* Left Col: Segment settings & Rules display */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-50 pb-2">
                  Segment Settings Profile
                </h3>

                {/* Description */}
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Description</span>
                  <p className="text-xs text-gray-700 font-medium leading-relaxed mt-0.5">
                    {segment.description || "No description provided."}
                  </p>
                </div>

                {/* Notes */}
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Segment Notes</span>
                  <p className="text-xs text-gray-600 italic leading-relaxed mt-0.5">
                    {segment.notes || "No notes logged for this segment."}
                  </p>
                </div>

                {/* Rules Display (Dynamic) */}
                {segment.type === "Dynamic" ? (
                  <div className="space-y-2.5">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Filter Expressions</span>
                    <div className="space-y-1.5">
                      {segment.filters?.map((filter: any, idx: number) => (
                        <div key={filter.id} className="flex flex-col p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs">
                          {idx > 0 && (
                            <span className="text-[9px] font-extrabold text-purple-700 uppercase tracking-widest mb-1.5 block">
                              {filter.logical_op || "AND"}
                            </span>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-800">
                              {filter.filter_type_name
                                ? filter.filter_type_name.split("_").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
                                : "Filter"}
                            </span>
                            <span className="text-[10px] bg-white border border-gray-150 px-2 py-0.5 rounded text-gray-500 font-medium">
                              {filter.operator}
                            </span>
                          </div>
                          {!["Is Empty", "Is Not Empty"].includes(filter.operator) && (
                            <span className="mt-1 font-mono text-[10px] text-purple-600 font-semibold truncate bg-white/70 px-1.5 py-0.5 rounded">
                              Value: {filter.value}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Rules display (Static)
                  <div className="p-3 bg-teal-50/30 border border-teal-100 rounded-2xl flex items-start gap-2.5">
                    <Layers className="w-4 h-4 text-teal-600 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-teal-800 block">Static Target List</span>
                      <p className="text-[10px] text-teal-700 leading-relaxed mt-0.5">
                        This list evaluation is manually locked. Matched leads were picked individually.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Matches Stats & sample Leads list */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                    <span>Matching Leads statistics</span>
                  </h3>
                  {canExport && (
                    <button
                      onClick={handleExportLeads}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 rounded-xl transition duration-150"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Leads (CSV)</span>
                    </button>
                  )}
                </div>

                {/* Metric Summary Rows */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3.5 bg-purple-50/50 border border-purple-50 rounded-2xl text-center">
                    <span className="text-[10px] text-purple-600 font-bold block uppercase tracking-wider">Matched Leads</span>
                    <h2 className="text-xl font-black text-purple-700 mt-1">{matchingLeadsStats.total_count}</h2>
                  </div>
                  <div className="p-3.5 bg-blue-50/50 border border-blue-50 rounded-2xl text-center">
                    <span className="text-[10px] text-blue-600 font-bold block uppercase tracking-wider">Male matches</span>
                    <h2 className="text-xl font-black text-blue-700 mt-1">{matchingLeadsStats.male_count}</h2>
                  </div>
                  <div className="p-3.5 bg-pink-50/50 border border-pink-50 rounded-2xl text-center">
                    <span className="text-[10px] text-pink-600 font-bold block uppercase tracking-wider">Female matches</span>
                    <h2 className="text-xl font-black text-pink-700 mt-1">{matchingLeadsStats.female_count}</h2>
                  </div>
                  <div className="p-3.5 bg-indigo-50/50 border border-indigo-50 rounded-2xl text-center">
                    <span className="text-[10px] text-indigo-600 font-bold block uppercase tracking-wider">Avg Age</span>
                    <h2 className="text-xl font-black text-indigo-700 mt-1">{matchingLeadsStats.avg_age}</h2>
                  </div>
                </div>

                {/* Match sample table */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-gray-700">Matched Sample Leads (First 20 records)</h4>
                  {matchingLeadsStats.leads.length === 0 ? (
                    <div className="p-10 text-center text-xs text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-150">
                      No leads matching segment rules are visible under your role scope.
                    </div>
                  ) : (
                    <div className="border border-gray-150 rounded-2xl overflow-hidden shadow-sm bg-white">
                      <Table>
                        <TableHeader className="bg-[#7677F41A] border-b border-gray-200">
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="text-xs font-bold text-gray-700 uppercase tracking-wider">Name</TableHead>
                            <TableHead className="text-xs font-bold text-gray-700 uppercase tracking-wider">Gender</TableHead>
                            <TableHead className="text-xs font-bold text-gray-700 uppercase tracking-wider">Location</TableHead>
                            <TableHead className="text-xs font-bold text-gray-700 uppercase tracking-wider">Status</TableHead>
                            <TableHead className="text-xs font-bold text-gray-700 uppercase tracking-wider">Assigned Executive</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {matchingLeadsStats.leads.map((lead: any) => (
                            <TableRow key={lead.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition">
                              <TableCell className="font-semibold text-gray-900 py-3.5">{lead.name}</TableCell>
                              <TableCell className="text-gray-500 py-3.5">{lead.gender}</TableCell>
                              <TableCell className="text-gray-500 py-3.5">{lead.city || "N/A"}</TableCell>
                              <TableCell className="py-3.5">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                  lead.status === "New" ? "bg-blue-50 text-blue-700" :
                                  lead.status === "Contacted" ? "bg-orange-50 text-orange-700" :
                                  lead.status === "Qualified" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-700"
                                }`}>
                                  {lead.status}
                                </span>
                              </TableCell>
                              <TableCell className="text-gray-600 font-medium py-3.5">{lead.assignedToName}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Target offer campaigns linking */}
        {activeTab === "offers" && (
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-purple-600" />
                <span>Linked Promotion Campaigns</span>
              </h3>
              {canUpdate && (
                <button
                  onClick={handleOpenLinkOffers}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition shadow-md hover:shadow active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Link Offer Campaigns</span>
                </button>
              )}
            </div>

            {segment.assigned_offers?.length === 0 ? (
              <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center">
                <AlertCircle className="w-8 h-8 text-gray-300 mb-2" />
                <h4 className="font-semibold text-gray-700">No active offers linked</h4>
                <p className="text-[10px] text-gray-400 max-w-xs mt-0.5">
                  Promotional campaigns associated with this segment will target matched lead categories automatically.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {segment.assigned_offers?.map((offer: any) => {
                  const expired = isOfferExpired(offer);
                  return (
                    <div
                      key={offer.id}
                      className={`p-4 flex items-start justify-between rounded-2xl border transition group relative ${
                        expired
                          ? "bg-red-50/10 border-red-200 hover:border-red-300 shadow-sm shadow-red-50"
                          : "bg-gray-50 border-gray-100 hover:border-purple-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl ${expired ? "bg-red-100 text-red-600" : "bg-purple-100 text-purple-600"}`}>
                          <Gift className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-gray-900 text-xs truncate max-w-[120px]" title={offer.title}>
                              {offer.title}
                            </h4>
                            {expired && (
                              <span className="shrink-0 px-1.5 py-0.5 rounded text-[8px] font-bold bg-red-100 text-red-800 uppercase tracking-wide">
                                Expired
                              </span>
                            )}
                          </div>
                          <code className="text-[10px] text-gray-400 font-mono block mt-0.5">{offer.code}</code>
                        </div>
                      </div>
                      {canUpdate && (
                        <button
                          onClick={() => handleUnlinkOfferClick(offer)}
                          className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-xl transition"
                          title="Remove Offer Campaign"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Paginated audit history log list */}
        {activeTab === "audit" && (
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4 animate-fade-in">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-50 pb-2">
              Auditable Log Trail
            </h3>

            {isLoadingAudit ? (
              <div className="py-10 text-center text-xs text-gray-400">Loading audit history...</div>
            ) : auditLogs.length === 0 ? (
              <div className="py-10 text-center text-xs text-gray-400 italic">No audit records logged.</div>
            ) : (
              <div className="space-y-4">
                <div className="border border-gray-150 rounded-2xl overflow-hidden shadow-sm bg-white">
                  <Table>
                    <TableHeader className="bg-[#7677F41A] border-b border-gray-200">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-32 text-xs font-bold text-gray-700 uppercase tracking-wider">Action Type</TableHead>
                        <TableHead className="w-40 text-xs font-bold text-gray-700 uppercase tracking-wider">User</TableHead>
                        <TableHead className="w-48 text-xs font-bold text-gray-700 uppercase tracking-wider">Timestamp</TableHead>
                        <TableHead className="text-xs font-bold text-gray-700 uppercase tracking-wider">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log: any, idx: number) => (
                        <TableRow key={idx} className="border-b border-gray-50 hover:bg-gray-50/30 transition">
                          <TableCell className="font-bold py-3.5">
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${
                              log.action_type === "Create" ? "bg-green-50 text-green-700 border border-green-100" :
                              log.action_type === "Activate" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                              log.action_type === "Deactivate" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                              log.action_type.includes("Override") ? "bg-orange-50 text-orange-700 border border-orange-100 font-black animate-pulse" :
                              log.action_type === "Delete" ? "bg-red-50 text-red-700 border border-red-100" : "bg-purple-50 text-purple-700 border border-purple-100"
                            }`}>
                              {log.action_type}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-700 font-semibold py-3.5">{log.username}</TableCell>
                          <TableCell className="text-gray-500 font-mono text-[10px] py-3.5">
                            {parseUTCTimestamp(log.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
                          </TableCell>
                          <TableCell className="text-gray-600 font-medium leading-normal py-3.5">{log.details}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Audit Pagination */}
                <TablePaginationFooter
                  pagination={auditPagination}
                  onPageChange={setAuditPage}
                  onLimitChange={() => {}}
                  totalLabel="records"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Deletion Dialog */}
      <ActionConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteSegment}
        title="Delete Segment"
        description="Are you sure you want to delete this segment? This action is permanent and cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
      />

      <ActionConfirmationDialog
        open={unlinkDialogOpen}
        onOpenChange={setUnlinkDialogOpen}
        onConfirm={handleUnlinkOfferConfirm}
        title="Unlink Offer Campaign"
        description={`Are you sure you want to remove offer campaign "${unlinkTargetOffer?.title}" from this segment? This action can be undone by linking it again.`}
        confirmText="Remove"
        cancelText="Cancel"
        isLoading={isLinkingOffers}
      />

      {/* Offer Linking Modal popup */}
      <Dialog open={offersModalOpen} onOpenChange={setOffersModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-5 border border-gray-100 shadow-2xl gap-4">
          <DialogHeader className="border-b border-gray-50 pb-2">
            <DialogTitle className="text-sm font-extrabold text-gray-900 uppercase tracking-wide text-left">
              Link Offer Campaigns
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 py-1">
            {isOffersLoading ? (
              <div className="py-10 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></span>
                <span>Loading campaigns...</span>
              </div>
            ) : filteredAvailableOffers.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400">No active offers available to assign.</div>
            ) : (
              filteredAvailableOffers.map((offer) => {
                const isSelected = modalSelectedOfferIds.includes(offer.id);
                return (
                  <div
                    key={offer.id}
                    onClick={() => handleToggleOfferSelect(offer.id)}
                    className={`flex items-center justify-between p-2.5 border rounded-xl cursor-pointer hover:bg-purple-50/10 transition ${
                      isSelected ? "border-purple-400 bg-purple-50/10" : "border-gray-100"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`p-1 rounded ${isSelected ? "text-purple-600" : "text-gray-300"}`}>
                        <Check className={`w-4 h-4 border rounded ${isSelected ? "bg-purple-600 text-white" : "border-gray-300"}`} />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-gray-900 truncate max-w-[200px]">{offer.title}</h5>
                        <span className="text-[10px] text-gray-400 font-mono block mt-0.5">{offer.code}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <DialogFooter className="flex items-center gap-3 pt-2 sm:justify-between flex-row">
            <DialogClose asChild>
              <button
                type="button"
                className="flex-1 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
              >
                Cancel
              </button>
            </DialogClose>
            <button
              onClick={handleLinkOffersConfirm}
              disabled={isLinkingOffers}
              className="flex-1 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition shadow disabled:opacity-50"
            >
              {isLinkingOffers ? "Linking..." : "Save Assignments"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
