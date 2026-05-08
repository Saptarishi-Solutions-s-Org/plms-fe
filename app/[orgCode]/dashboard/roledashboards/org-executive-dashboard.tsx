"use client";

import { useEffect, useState } from "react";

import ExecutiveCards from "@/components/commoncomponents/executivedashboard/stats";
import RecentLeadsCard from "@/components/commoncomponents/executivedashboard/executiverecentleads";

import { getExecutiveStats } from "@/services/executivestats";
import { getRecentLeads } from "@/services/executivestats";

import type { RecentLead } from "@/types/executivestats";

export default function ExecutiveDashboard() {
  const [stats, setStats] = useState({
    myLeads: 0,
    convertedLeads: 0,
    thisWeekLeads: 0,
    activeOffers: 0,
  });

  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await getExecutiveStats();
        const statsData = statsRes?.value || statsRes;

        setStats({
          myLeads: statsData?.totalLeads ?? 0,
          convertedLeads: statsData?.convertedLeads ?? 0,
          thisWeekLeads: statsData?.thisWeekLeads ?? 0,
          activeOffers: statsData?.activeOffers ?? 0,
        });

        // Recent Leads API
        const leadsRes = await getRecentLeads();

        const leadsData = leadsRes?.value || leadsRes;

        setRecentLeads(
          leadsData.map((lead: any) => ({
            leadId: lead.leadId,
            leadName: lead.leadName,
            status: lead.status,
            createdAt: lead.createdAt,
          }))
        );
      } catch (err) {
        console.error("Failed to load executive dashboard", err);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 p-6">
      {/* Page Header */}
      <div>
        <h1 className="mb-2 text-2xl font-bold text-slate-900">
          Executive Dashboard
        </h1>

        <p className="text-slate-500">
          Personal performance metrics overview.
        </p>
      </div>

      
      <ExecutiveCards stats={stats} />

      <RecentLeadsCard
        title="Recent Leads"
        leads={recentLeads}
        onViewAll={() => {
          console.log("View all leads");
        }}
      />
    </div>
  );
}