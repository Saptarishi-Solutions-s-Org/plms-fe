import { useState } from "react";

export function useLeadFilters() {
  const [pendingSearch,     setPendingSearch]     = useState("");
  const [pendingSource,     setPendingSource]     = useState("All");
  const [pendingStatus,     setPendingStatus]     = useState("All");
  const [pendingPriority,   setPendingPriority]   = useState("All");
  const [pendingAssignedTo, setPendingAssignedTo] = useState("All");

  const [search,           setSearch]           = useState("");
  const [sourceFilter,     setSourceFilter]     = useState("All");
  const [statusFilter,     setStatusFilter]     = useState("All");
  const [priorityFilter,   setPriorityFilter]   = useState("All");
  const [assignedToFilter, setAssignedToFilter] = useState("All");

  const handleApply = () => {
    setSearch(pendingSearch);
    setSourceFilter(pendingSource);
    setStatusFilter(pendingStatus);
    setPriorityFilter(pendingPriority);
    setAssignedToFilter(pendingAssignedTo);
  };

  const handleClearAll = () => {
    setPendingSearch("");
    setPendingSource("All");
    setPendingStatus("All");
    setPendingPriority("All");
    setPendingAssignedTo("All");

    setSearch("");
    setSourceFilter("All");
    setStatusFilter("All");
    setPriorityFilter("All");
    setAssignedToFilter("All");
  };

  return {
    pendingSearch,     setPendingSearch,
    pendingSource,     setPendingSource,
    pendingStatus,     setPendingStatus,
    pendingPriority,   setPendingPriority,
    pendingAssignedTo, setPendingAssignedTo,

    search,
    sourceFilter,
    statusFilter,
    priorityFilter,
    assignedToFilter,

    handleApply,
    handleClearAll,
  };
}