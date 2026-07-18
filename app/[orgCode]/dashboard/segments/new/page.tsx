"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { 
  ArrowLeft,
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  Users,
  Settings, 
  AlertCircle,
  Play,
  CheckSquare,
  Square,
  Search,
  CalendarIcon
} from "lucide-react";

import { type AuthUser, getUser } from "@/lib/auth";
import { canAccess } from "@/lib/permissions";
import { getActiveFilterTypes, previewSegment, saveSegment, getSegmentByCode } from "@/services/segments";
import { getLeadsWithStats } from "@/services/leads";
import { ActionConfirmationDialog } from "@/components/commoncomponents/action-confirmation-dialog";
import TablePaginationFooter from "@/components/commoncomponents/table-pagination-footer";
import GlobalLoader from "@/components/commoncomponents/globalloader";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const COLOR_PRESETS = [
  "#8b5cf6", // Purple
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Orange
  "#ef4444", // Red
  "#ec4899", // Pink
  "#6366f1", // Indigo
  "#14b8a6", // Teal
  "#f43f5e"  // Rose
];

export default function NewSegmentPage() {
  const router = useRouter();
  const params = useParams<{ orgCode: string }>();
  const orgCode = params.orgCode;

  const [user, setUser] = useState<AuthUser | null>(() => getUser());

  useEffect(() => {
    const syncUser = () => setUser(getUser());
    window.addEventListener("LMA-auth-changed", syncUser);
    return () => window.removeEventListener("LMA-auth-changed", syncUser);
  }, []);

  const canCreate = useMemo(() => canAccess(user, ["segmentation"], ["create"]), [user]);
  const canUpdate = useMemo(() => canAccess(user, ["segmentation"], ["update"]), [user]);
  const searchParams = useSearchParams();
  const editCode = searchParams.get("edit");
  const hasAccess = editCode ? canUpdate : canCreate;

  // 1. Core Segment Fields
  const [segmentId, setSegmentId] = useState<string | undefined>(undefined);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [segmentType, setSegmentType] = useState<"Dynamic" | "Static">("Dynamic");
  const [color, setColor] = useState("#8b5cf6");
  const [notes, setNotes] = useState("");
  const [isActive, setIsActive] = useState(true);

  // 2. Filter Types Metadata Lookup
  const [filterTypes, setFilterTypes] = useState<any[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);

  // 3. Dynamic Segment Rules State
  const [conditionRows, setConditionRows] = useState<any[]>([
    { filter_type_id: "", operator: "Equals", value: "", group_id: "", logical_op: "AND" }
  ]);

  // 4. Static Segment Leads Selection State
  const [leadsList, setLeadsList] = useState<any[]>([]);
  const [leadsSearch, setLeadsSearch] = useState("");
  const [leadsPage, setLeadsPage] = useState(1);
  const [leadsLimit, setLeadsLimit] = useState(10);
  const [leadsPagination, setLeadsPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);

  const handlePageChange = (newPage: number) => {
    setLeadsPage(newPage);
    setLeadsPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleLimitChange = (newLimit: number) => {
    setLeadsLimit(newLimit);
    setLeadsPage(1);
    setLeadsPagination((prev) => ({
      ...prev,
      limit: newLimit,
      page: 1,
    }));
  };

  // 5. Live Preview Sidebar State
  const [previewStats, setPreviewStats] = useState({
    total_count: 0,
    male_count: 0,
    female_count: 0,
    avg_age: 0.0,
    leads: [] as any[]
  });
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Save confirmation dialog states
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 6. Fetch Metadata
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const ftRes = await getActiveFilterTypes();
        setFilterTypes(ftRes);
        // Pre-select first filter type for the initial row if available
        if (ftRes && ftRes.length > 0) {
          setConditionRows([{
            filter_type_id: ftRes[0].id,
            operator: "Equals",
            value: "",
            group_id: "",
            logical_op: "AND"
          }]);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load filter configuration metadata.");
      } finally {
        setIsLoadingMetadata(false);
      }
    };

    if (hasAccess) {
      loadMetadata();
    }
  }, [hasAccess]);

  // Load existing segment details if in edit mode
  useEffect(() => {
    if (!editCode) return;

    const loadDetails = async () => {
      try {
        setIsLoadingMetadata(true);
        const detail = await getSegmentByCode(editCode);
        setSegmentId(detail.id);
        setName(detail.name);
        setDescription(detail.description);
        setSegmentType(detail.type as "Dynamic" | "Static");
        setColor(detail.color || "#8b5cf6");
        setNotes(detail.notes || "");
        setIsActive(detail.is_active);

        if (detail.type === "Dynamic") {
          setConditionRows(detail.filters.map((f: any) => ({
            filter_type_id: f.filter_type_id,
            operator: f.operator,
            value: f.value,
            group_id: f.group_id || "",
            logical_op: f.logical_op || "AND"
          })));
        } else {
          setSelectedLeadIds(detail.static_lead_ids || []);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load segment details for editing.");
      } finally {
        setIsLoadingMetadata(false);
      }
    };

    loadDetails();
  }, [editCode]);

  // 7. Fetch Static Leads
  const fetchLeadsForStatic = async () => {
    if (segmentType !== "Static") return;
    setIsLoadingLeads(true);
    console.log("[Static Leads Query] fetching page:", leadsPage, "limit:", leadsLimit, "with search:", leadsSearch);
    try {
      const res = await getLeadsWithStats({
        page: leadsPage,
        limit: leadsLimit,
        search: leadsSearch
      });
      console.log("[Static Leads Query] response:", res);
      if (res && res.leads) {
        setLeadsList(res.leads);
        setLeadsPagination(res.pagination);
      }
    } catch (err) {
      console.error("[Static Leads Query] Error:", err);
      toast.error("Failed to load leads list.");
    } finally {
      setIsLoadingLeads(false);
    }
  };

  useEffect(() => {
    fetchLeadsForStatic();
  }, [segmentType, leadsPage, leadsLimit, leadsSearch]);

  const handleLeadsSearchChange = (val: string) => {
    setLeadsSearch(val);
    setLeadsPage(1); // Reset page to 1 on keyword search
  };

  // 8. Dynamic Condition Rows Modification Handlers
  const handleAddConditionRow = () => {
    const defaultTypeId = filterTypes[0]?.id || "";
    setConditionRows([
      ...conditionRows,
      { filter_type_id: defaultTypeId, operator: "Equals", value: "", group_id: "", logical_op: "AND" }
    ]);
  };

  const handleRemoveConditionRow = (index: number) => {
    if (conditionRows.length <= 1) return; // Keep at least 1 rule
    const rows = [...conditionRows];
    rows.splice(index, 1);
    setConditionRows(rows);
  };

  const handleConditionRowChange = (index: number, field: string, value: any) => {
    const rows = [...conditionRows];
    rows[index][field] = value;

    // Reset default operators and values when filter type changes
    if (field === "filter_type_id") {
      const selectedType = filterTypes.find(ft => ft.id === value);
      const optType = selectedType?.operator_type || "Text";
      
      if (optType === "Boolean") {
        rows[index].operator = "Equals";
        rows[index].value = "True";
      } else if (optType === "Date") {
        rows[index].operator = "Equals";
        rows[index].value = "";
      } else {
        rows[index].operator = "Equals";
        rows[index].value = "";
      }
    }
    setConditionRows(rows);
  };

  // Resolve operators list based on filter operator_type
  const getOperatorsForType = (filterTypeId: string) => {
    const selectedType = filterTypes.find(ft => ft.id === filterTypeId);
    const optType = selectedType?.operator_type || "Text";

    switch (optType) {
      case "Select":
        return ["Equals", "Not Equals", "Is Empty", "Is Not Empty"];
      case "Number":
        return ["Equals", "Not Equals", "GreaterThan", "LessThan", "GreaterThanOrEqual", "LessThanOrEqual", "Between", "Is Empty", "Is Not Empty"];
      case "Date":
        return ["Equals", "Not Equals", "Before", "After", "Between", "Today", "Yesterday", "This Week", "This Month", "Last Month", "Is Empty", "Is Not Empty"];
      case "Boolean":
        return ["Equals"];
      case "Text":
      default:
        return ["Equals", "Not Equals", "Contains", "Starts With", "Ends With", "Is Empty", "Is Not Empty"];
    }
  };

  // Helper values select list for status, priority, sources, gender, executives
  const getValueOptionsForFilter = (filterName: string) => {
    switch (filterName) {
      case "gender":
        return ["Male", "Female", "Other"];
      case "status":
        return ["New", "Contacted", "Qualified", "Lost"];
      case "priority":
        return ["High", "Medium", "Low"];
      case "source":
        return ["Website", "Referral", "Cold Call", "Ad Campaign", "Imported"];
      case "birthday_month":
        return [
          { label: "January", value: "1" },
          { label: "February", value: "2" },
          { label: "March", value: "3" },
          { label: "April", value: "4" },
          { label: "May", value: "5" },
          { label: "June", value: "6" },
          { label: "July", value: "7" },
          { label: "August", value: "8" },
          { label: "September", value: "9" },
          { label: "October", value: "10" },
          { label: "November", value: "11" },
          { label: "December", value: "12" }
        ];
      default:
        return null;
    }
  };

  // Form and preview validation helper states
  const isPreviewValid = useMemo(() => {
    if (segmentType === "Static") {
      return selectedLeadIds.length > 0;
    } else {
      if (conditionRows.length === 0) return false;
      return conditionRows.every((row) => {
        if (!row.filter_type_id) return false;
        
        // Operators that don't need a value
        const noValueNeeded = ["Is Empty", "Is Not Empty", "Today", "Yesterday", "This Week", "This Month", "Last Month"].includes(row.operator);
        if (noValueNeeded) return true;
        
        if (row.operator === "Between") {
          const parts = String(row.value).split(",");
          return parts.length === 2 && parts[0].trim() !== "" && parts[1].trim() !== "";
        }
        
        return row.value !== undefined && row.value !== null && String(row.value).trim() !== "";
      });
    }
  }, [segmentType, selectedLeadIds, conditionRows]);

  const isFormValid = useMemo(() => {
    if (!name || name.trim() === "") return false;
    return isPreviewValid;
  }, [name, isPreviewValid]);

  // 9. Execute Live Preview
  const handleApplyPreview = async () => {
    setIsPreviewLoading(true);
    try {
      const payload = {
        segment_id: segmentId || undefined,
        type: segmentType,
        filters: segmentType === "Dynamic"
          ? conditionRows
              .filter((r) => r.filter_type_id)
              .map((r) => ({
                id: r.id || undefined,
                filter_type_id: r.filter_type_id,
                operator: r.operator,
                value: r.value,
                group_id: r.group_id || "",
                logical_op: r.logical_op || "AND",
              }))
          : [],
        static_lead_ids: segmentType === "Static" ? selectedLeadIds : []
      };

      const res = await previewSegment(payload);
      setPreviewStats(res);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load segment preview stats.");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // 10. Perform Save
  const handleSaveSegment = async () => {
    if (!name || name.trim() === "") {
      toast.error("Please enter a segment name.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await saveSegment({
        id: segmentId,
        name,
        description,
        type: segmentType,
        color,
        notes,
        is_active: isActive,
        filters: segmentType === "Dynamic" ? conditionRows.filter(r => r.filter_type_id) : [],
        static_lead_ids: segmentType === "Static" ? selectedLeadIds : []
      });

      toast.success(segmentId ? "Segment updated successfully!" : "Segment created successfully!");
      setSaveDialogOpen(false);
      
      const targetCode = res?.code || editCode;
      if (targetCode) {
        router.push(`/${orgCode}/dashboard/segments/${targetCode}`);
      } else {
        router.push(`/${orgCode}/dashboard/segments`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save segment.");
    } finally {
      setIsSaving(false);
    }
  };

  // Lead selection checkboxes toggler for Static Builder
  const handleToggleLeadSelection = (leadId: string) => {
    setSelectedLeadIds(prev => 
      prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]
    );
  };

  const handleSelectAllLeadsOnPage = () => {
    const pageIds = leadsList.map(l => l.uuid);
    const allSelected = pageIds.every(id => selectedLeadIds.includes(id));

    if (allSelected) {
      setSelectedLeadIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedLeadIds(prev => {
        const toAdd = pageIds.filter(id => !prev.includes(id));
        return [...prev, ...toAdd];
      });
    }
  };

  if (!user || isLoadingMetadata) return <GlobalLoader />;

  if (!hasAccess) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-6 bg-gray-50/50 rounded-3xl border border-gray-100">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4 animate-bounce" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Unauthorized Action</h1>
        <p className="text-sm text-gray-500 text-center max-w-sm">
          You do not have permissions to {editCode ? "edit" : "create"} segments.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-purple-600 rounded-xl"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 sm:p-6 bg-gray-50/20">
      {/* Header back navigation */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-500 hover:text-purple-600 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{editCode ? "Edit Segment Settings" : "Create New Segment"}</h1>
          <p className="text-xs text-gray-500">{editCode ? "Modify segment rules and configuration metadata" : "Configure search parameters or pick lead list targets."}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Section: Segment Configuration & Rules Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata Section */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-50 pb-2">
              Segment Profile Details
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Segment Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Young Male Customers"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-purple-500 transition"
                />
              </div>

              {/* Segment Type Selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Segmentation Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setSegmentType("Dynamic");
                      setPreviewStats({ total_count: 0, male_count: 0, female_count: 0, avg_age: 0, leads: [] });
                    }}
                    className={`py-2 text-xs font-semibold rounded-xl border transition ${
                      segmentType === "Dynamic"
                        ? "bg-purple-50 border-purple-300 text-purple-700"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Dynamic (Filters)
                  </button>
                  <button
                    onClick={() => {
                      setSegmentType("Static");
                      setPreviewStats({ total_count: 0, male_count: 0, female_count: 0, avg_age: 0, leads: [] });
                    }}
                    className={`py-2 text-xs font-semibold rounded-xl border transition ${
                      segmentType === "Static"
                        ? "bg-purple-50 border-purple-300 text-purple-700"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Static (Manual Pick)
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Description</label>
              <textarea
                rows={2}
                placeholder="Describe the segment criteria or purpose..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-purple-500 transition resize-none"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Notes / Guidelines</label>
              <textarea
                rows={2}
                placeholder="Add operational notes or guidelines for using this segment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-purple-500 transition resize-none"
              />
            </div>

            {/* Notes & Color Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Color Presets */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Theme Color</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {COLOR_PRESETS.map((pColor) => (
                    <button
                      key={pColor}
                      onClick={() => setColor(pColor)}
                      className={`w-6 h-6 rounded-full border transition hover:scale-110 active:scale-95 ${
                        color === pColor ? "border-gray-900 ring-2 ring-gray-200" : "border-transparent"
                      }`}
                      style={{ backgroundColor: pColor }}
                    />
                  ))}
                </div>
              </div>

              {/* Status toggler */}
              <div className="space-y-1 flex flex-col justify-end">
                <div className="flex items-center gap-2 pt-2">
                  <Checkbox
                    id="isActiveCheck"
                    checked={isActive}
                    onCheckedChange={(checked) => setIsActive(checked === true)}
                  />
                  <label htmlFor="isActiveCheck" className="text-xs font-bold text-gray-700 cursor-pointer">
                    Active & Enable segment mapping
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Builder Section */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-50 pb-2">
              {segmentType === "Dynamic" ? "Filter Condition Rules" : "Associate Matching Leads"}
            </h2>

            {segmentType === "Dynamic" ? (
              // Dynamic Condition Rows Builder
              <div className="space-y-3">
                {conditionRows.map((row, index) => {
                  const selectedType = filterTypes.find(ft => ft.id === row.filter_type_id);
                  const selectedTypeName = selectedType?.name;
                  const operators = getOperatorsForType(row.filter_type_id);
                  const valueOptions = selectedTypeName ? getValueOptionsForFilter(selectedTypeName) : null;
                  const isBoolean = selectedType?.operator_type === "Boolean";
                  const isIsEmptyOperator = ["Is Empty", "Is Not Empty", "Today", "Yesterday", "This Week", "This Month", "Last Month"].includes(row.operator);

                  return (
                    <div key={index} className="flex flex-col sm:flex-row items-center gap-2 p-3 bg-gray-50/50 border border-gray-100 rounded-2xl relative">
                      
                      {/* Logical Operator (AND/OR selector for rows index > 0) */}
                      {index > 0 && (
                        <div className="w-full sm:w-24 mb-2 sm:mb-0">
                          <Select
                            value={row.logical_op}
                            onValueChange={(val) => handleConditionRowChange(index, "logical_op", val)}
                          >
                            <SelectTrigger className="w-full h-8 text-xs bg-white rounded-lg border-gray-200 font-semibold text-purple-700">
                              <SelectValue placeholder="Op" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AND" className="text-xs font-bold text-purple-700">AND</SelectItem>
                              <SelectItem value="OR" className="text-xs font-bold text-purple-700">OR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Filter Name Selector */}
                      <div className="flex-1 w-full">
                        <Select
                          value={row.filter_type_id}
                          onValueChange={(val) => handleConditionRowChange(index, "filter_type_id", val)}
                        >
                          <SelectTrigger className="w-full h-8 text-xs bg-white rounded-lg border-gray-200 font-medium">
                            <SelectValue placeholder="Select Filter" />
                          </SelectTrigger>
                          <SelectContent>
                            {filterTypes.map((ft) => (
                              <SelectItem key={ft.id} value={ft.id} className="text-xs">
                                {ft.label} ({ft.category})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Operator Selector */}
                      <div className="w-full sm:w-36">
                        <Select
                          value={row.operator}
                          onValueChange={(val) => handleConditionRowChange(index, "operator", val)}
                        >
                          <SelectTrigger className="w-full h-8 text-xs bg-white rounded-lg border-gray-200 font-medium">
                            <SelectValue placeholder="Select Operator" />
                          </SelectTrigger>
                          <SelectContent>
                            {operators.map((op) => (
                              <SelectItem key={op} value={op} className="text-xs">
                                {op}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Value Input */}
                      <div className="flex-1 w-full">
                        {isIsEmptyOperator ? (
                          // Render disabled text for parameterless operators
                          <span className="text-[10px] text-gray-400 italic block py-1 bg-gray-100 text-center rounded-lg">
                            No parameter needed
                          </span>
                        ) : isBoolean ? (
                          // Boolean dropdown
                          <Select
                            value={row.value}
                            onValueChange={(val) => handleConditionRowChange(index, "value", val)}
                          >
                            <SelectTrigger className="w-full h-8 text-xs bg-white rounded-lg border-gray-200">
                              <SelectValue placeholder="Select Option" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="True" className="text-xs">True</SelectItem>
                              <SelectItem value="False" className="text-xs">False</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : valueOptions ? (
                          // Lookup values select dropdown
                          <Select
                            value={row.value}
                            onValueChange={(val) => handleConditionRowChange(index, "value", val)}
                          >
                            <SelectTrigger className="w-full h-8 text-xs bg-white rounded-lg border-gray-200">
                              <SelectValue placeholder="Select Value" />
                            </SelectTrigger>
                            <SelectContent>
                              {valueOptions.map((opt: any) => {
                                const label = typeof opt === "object" ? opt.label : opt;
                                const val = typeof opt === "object" ? opt.value : opt;
                                return (
                                  <SelectItem key={val} value={val} className="text-xs">
                                    {label}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        ) : row.operator === "Between" ? (
                          // Double range input
                          <div className="flex items-center gap-1.5">
                            <Input
                              type="text"
                              placeholder="Min"
                              value={row.value.split(",")[0] || ""}
                              onChange={(e) => {
                                const second = row.value.split(",")[1] || "";
                                handleConditionRowChange(index, "value", `${e.target.value},${second}`);
                              }}
                              className="h-8 text-xs rounded-lg border-gray-200 bg-white"
                            />
                            <span className="text-gray-400 font-medium">-</span>
                            <Input
                              type="text"
                              placeholder="Max"
                              value={row.value.split(",")[1] || ""}
                              onChange={(e) => {
                                const first = row.value.split(",")[0] || "";
                                handleConditionRowChange(index, "value", `${first},${e.target.value}`);
                              }}
                              className="h-8 text-xs rounded-lg border-gray-200 bg-white"
                            />
                          </div>
                        ) : selectedType?.operator_type === "Date" ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full h-8 px-3 text-left font-normal text-xs justify-start border-gray-200 bg-white rounded-lg text-gray-700"
                              >
                                <CalendarIcon className="mr-2 h-3.5 w-3.5 text-gray-400" />
                                {row.value ? format(new Date(row.value), "PPP") : "Select Date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={row.value ? new Date(row.value) : undefined}
                                onSelect={(d) => {
                                  if (d) {
                                    const formatted = d.toLocaleDateString("en-CA");
                                    handleConditionRowChange(index, "value", formatted);
                                  } else {
                                    handleConditionRowChange(index, "value", "");
                                  }
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        ) : (
                          // Standard Text Input
                          <Input
                            type={selectedType?.operator_type === "Number" ? "number" : "text"}
                            placeholder={selectedType?.operator_type === "Number" ? "e.g. 25" : "e.g. London"}
                            value={row.value}
                            onChange={(e) => handleConditionRowChange(index, "value", e.target.value)}
                            className="h-8 text-xs rounded-lg border-gray-200 bg-white"
                          />
                        )}
                      </div>

                      {/* Row Actions */}
                      <div className="flex items-center gap-1.5 justify-end">
                        <button
                          onClick={handleAddConditionRow}
                          className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Add condition row"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveConditionRow(index)}
                          disabled={conditionRows.length <= 1}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Remove condition row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Static Selector Table View
              <div className="space-y-4">
                {/* Local search leads */}
                <div className="w-full sm:w-72">
                  <Input
                    search
                    type="text"
                    placeholder="Search lead by name..."
                    value={leadsSearch}
                    onChange={(e) => handleLeadsSearchChange(e.target.value)}
                    className="text-xs rounded-lg"
                  />
                </div>

                {isLoadingLeads ? (
                  <div className="py-10 text-center text-xs text-gray-500">Loading leads list...</div>
                ) : leadsList.length === 0 ? (
                  <div className="py-10 text-center text-xs text-gray-400">No leads match search.</div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                    <Table>
                      <TableHeader className="border-b border-gray-200 bg-[#7677F41A]">
                        <TableRow>
                          <TableHead className="w-12 text-center whitespace-nowrap text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <Checkbox
                              checked={leadsList.length > 0 && leadsList.map(l => l.uuid).every(id => selectedLeadIds.includes(id))}
                              onCheckedChange={handleSelectAllLeadsOnPage}
                            />
                          </TableHead>
                          <TableHead className="whitespace-nowrap text-xs font-bold text-gray-700 uppercase tracking-wider">Name</TableHead>
                          <TableHead className="whitespace-nowrap text-xs font-bold text-gray-700 uppercase tracking-wider">Gender</TableHead>
                          <TableHead className="whitespace-nowrap text-xs font-bold text-gray-700 uppercase tracking-wider">Location</TableHead>
                          <TableHead className="whitespace-nowrap text-xs font-bold text-gray-700 uppercase tracking-wider">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leadsList.map((lead) => {
                          const isSelected = selectedLeadIds.includes(lead.uuid);
                          return (
                            <TableRow
                              key={lead.uuid}
                              onClick={() => handleToggleLeadSelection(lead.uuid)}
                              className={`border-b border-gray-50 text-xs hover:bg-gray-50/50 cursor-pointer transition ${
                                isSelected ? "bg-purple-50/20" : ""
                              }`}
                            >
                              <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => handleToggleLeadSelection(lead.uuid)}
                                />
                              </TableCell>
                              <TableCell className="font-semibold text-gray-900">{lead.name}</TableCell>
                              <TableCell className="text-gray-500">{lead.gender}</TableCell>
                              <TableCell className="text-gray-500">{lead.city || "N/A"}</TableCell>
                              <TableCell>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                  lead.status === "New" ? "bg-blue-50 text-blue-700" :
                                  lead.status === "Contacted" ? "bg-orange-50 text-orange-700" :
                                  lead.status === "Qualified" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-700"
                                }`}>
                                  {lead.status}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>

                    {/* Leads Pagination */}
                    <div className="bg-white border-t border-gray-200">
                      <TablePaginationFooter
                        pagination={leadsPagination}
                        onPageChange={handlePageChange}
                        onLimitChange={handleLimitChange}
                        totalLabel="leads"
                      />
                    </div>
                  </div>
                )}
                
                {/* Selected lead tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  <span className="text-xs font-bold text-gray-700">Selected ({selectedLeadIds.length}):</span>
                  {selectedLeadIds.length === 0 ? (
                    <span className="text-[10px] text-gray-400 italic">None selected.</span>
                  ) : (
                    <span className="text-[10px] bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded-lg border border-purple-100">
                      Check preview on the right to see list
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Run Preview CTA Action */}
            <div className="pt-2 flex items-center justify-between border-t border-gray-50">
              <span className="text-[10px] text-gray-400 font-semibold italic">
                {segmentType === "Dynamic" 
                  ? "* Enforces minimum 1 condition row constraint" 
                  : `* Checked: ${selectedLeadIds.length} lead(s) manual allocation`}
              </span>
              <button
                onClick={handleApplyPreview}
                disabled={isPreviewLoading || !isPreviewValid}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 rounded-xl transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isPreviewLoading ? "Calculating..." : "Apply Filters & Preview"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Section: Sticky Live Preview Sidebar */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-purple-600" />
                <span>Live Matches Preview</span>
              </h2>
              {isPreviewLoading && <div className="w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />}
            </div>

            {/* Big Match Stats */}
            <div className="bg-purple-50/30 p-5 rounded-2xl border border-purple-50 text-center space-y-1">
              <h3 className="text-xs text-purple-600 font-bold uppercase tracking-wider">Matched Leads</h3>
              <h1 className="text-4xl font-extrabold text-purple-700 animate-pulse">{previewStats.total_count}</h1>
            </div>

            {/* Demographic Indicators */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-gray-700">Demographic Summary</h4>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-50/50">
                  <span className="font-semibold block text-blue-700">Male</span>
                  <span className="font-bold text-gray-900">{previewStats.male_count}</span>
                </div>
                <div className="bg-pink-50/50 p-2.5 rounded-xl border border-pink-50/50">
                  <span className="font-semibold block text-pink-700">Female</span>
                  <span className="font-bold text-gray-900">{previewStats.female_count}</span>
                </div>
                <div className="bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-50/50">
                  <span className="font-semibold block text-indigo-700">Avg Age</span>
                  <span className="font-bold text-gray-900">{previewStats.avg_age}</span>
                </div>
              </div>
            </div>

            {/* Matching Leads names list */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-gray-700">First 20 Matching Sample</h4>
              
              {previewStats.leads.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400 bg-gray-50/50 border border-gray-50 rounded-2xl italic">
                  Click "Apply Filters & Preview" to evaluate matching leads list.
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 border border-gray-100 rounded-2xl p-2.5 bg-gray-50/30">
                  {previewStats.leads.map((lead: any, idx: number) => (
                    <div key={lead.id} className="flex items-center justify-between text-xs p-1.5 bg-white border border-gray-100 rounded-lg hover:border-purple-200 transition">
                      <span className="font-semibold text-gray-800 truncate pr-2 max-w-[120px]">{lead.name}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-gray-400">{lead.gender}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                          lead.status === "New" ? "bg-blue-50 text-blue-700" :
                          lead.status === "Qualified" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}>
                          {lead.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions Form */}
            <div className="pt-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => router.back()}
                className="flex-1 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={() => setSaveDialogOpen(true)}
                disabled={!isFormValid}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Segment</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Save Confirmation Alert Dialog */}
      <ActionConfirmationDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        onConfirm={handleSaveSegment}
        title="Save Segment Configuration"
        description="Are you sure you want to save this segment configuration? It will immediately take effect and start filtering target lead records."
        confirmText="Save"
        cancelText="Cancel"
        isLoading={isSaving}
      />
    </div>
  );
}
