"use client";

import { useParams } from "next/navigation";

import ExecutiveLeadsPage from "@/components/commoncomponents/reports/executive-leads/executive-leads-page";
import type { ExecutiveLeadRow, ExecutiveLeadSummary } from "@/types/org-reports";

const emptySummary: ExecutiveLeadSummary = {
  totalCreated: 0,
  byExecutives: 0,
  byManager: 0,
};

export default function ExecutiveReportDetails() {
  const params = useParams<{ orgCode: string; executiveId: string }>();
  const orgCode = params.orgCode;
  const executiveId = params.executiveId;
  const leads: ExecutiveLeadRow[] = [];

  return (
    <ExecutiveLeadsPage
      orgCode={orgCode}
      executiveId={executiveId}
      summary={emptySummary}
      leads={leads}
    />
  );
}
