import ExecutiveLeadsPage from "@/components/commoncomponents/reports/executive-leads/executive-leads-page";
import type {
  ExecutiveLeadRow,
  ExecutiveLeadSummary,
} from "@/types/org-reports";

const emptySummary: ExecutiveLeadSummary = {
  totalCreated: 0,
  byExecutives: 0,
  byManager: 0,
};

export default async function ExecutiveReportDetails({
  params,
  searchParams,
}: {
  params: Promise<{ orgCode: string }>;
  searchParams: Promise<{ executiveId?: string | string[] }>;
}) {
  const [{ orgCode }, { executiveId }] = await Promise.all([
    params,
    searchParams,
  ]);
  const selectedExecutiveId = Array.isArray(executiveId)
    ? executiveId[0]
    : executiveId;
  const leads: ExecutiveLeadRow[] = [];

  return (
    <ExecutiveLeadsPage
      orgCode={orgCode}
      executiveId={selectedExecutiveId ?? ""}
      summary={emptySummary}
      leads={leads}
    />
  );
}
