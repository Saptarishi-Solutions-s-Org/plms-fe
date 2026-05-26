"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";

import ExecutiveLeadsPage from "@/components/commoncomponents/reports/executive-leads/executive-leads-page";
import type { ExecutiveLeadRow, ExecutiveLeadSummary } from "@/types/org-reports";

const emptySummary: ExecutiveLeadSummary = {
  totalCreated: 0,
  byExecutives: 0,
  byManager: 0,
};

const nameFromId = (id: string) =>
  id
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default function ExecutiveReportDetails() {
  const params = useParams<{ orgCode: string; executiveId: string }>();
  const orgCode = params.orgCode;
  const executiveId = params.executiveId;
  const executiveName = useMemo(() => nameFromId(executiveId), [executiveId]);
  const leads: ExecutiveLeadRow[] = [];

  return (
    <ExecutiveLeadsPage
      orgCode={orgCode}
      executiveName={executiveName}
      summary={emptySummary}
      leads={leads}
    />
  );
}
