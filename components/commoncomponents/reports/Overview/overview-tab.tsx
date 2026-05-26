"use client";

import ReportStats from "@/components/commoncomponents/reports/Overview/stats";
import LeadSourceDistribution from "@/components/commoncomponents/reports/Overview/lead-source-distribution";
import SourceVsConversionRate from "@/components/commoncomponents/reports/Overview/source-vs-conversion-rate";
import type { OverviewTabProps } from "@/types/org-reports";

export default function OverviewTab({
  stats,
  leadSourceDistributionData,
  sourceConversionRateData,
}: OverviewTabProps) {
  return (
    <div className="w-full space-y-8">
      <div className="w-full overflow-x-auto">
        <ReportStats stats={stats} />
      </div>

      <section className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="w-full min-w-0 overflow-hidden rounded-[2rem]">
          <LeadSourceDistribution
            title="Lead Source Distribution"
            subtitle="Lead volume by origin"
            data={leadSourceDistributionData}
          />
        </div>

        <div className="w-full min-w-0 overflow-hidden rounded-[2rem]">
          <SourceVsConversionRate
            title="Source vs Conversion Rate"
            data={sourceConversionRateData}
          />
        </div>
      </section>
    </div>
  );
}
