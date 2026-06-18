"use client";

import { useEffect, useState } from "react";

import ExecutiveCards from "@/components/commoncomponents/executivedashboard/stats";
import RecentLeadsCard from "@/components/commoncomponents/executivedashboard/executiverecentleads";
import CommonOverview from "@/components/commoncomponents/managerdashboard/leadstatusoverview";
import { getExecutiveStats, getRecentLeads } from "@/services/executivestats";
import { getLeadStats } from "@/services/executivestats";
import { RecentLead } from "@/types/executivestats";
import { useRouter, useParams } from "next/navigation";
import {LEAD_LIST_CHANGED, type LeadListChangedPayload} from "@/types/realtime";
import { subscribeRealtime } from "@/lib/socket";

export default function ExecutiveDashboard() {
  const [stats, setStats] = useState({
    myLeads: 0,
    convertedLeads: 0,
    thisWeekLeads: 0,
    activeOffers: 0,
  });

  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [overview, setOverview] = useState<{ label: string; value: number }[]>(
    [],
  );
  const router = useRouter();
  const params = useParams<{ orgCode: string }>();
  const orgCode = params.orgCode;

    const fetchDashboardData = async () => {
      try {
        const [statsRes, leadsRes, overviewRes] = await Promise.all([
          getExecutiveStats(),

          getRecentLeads().catch((err) => {
            console.error("Recent leads API failed", err);
            return [];
          }),

          getLeadStats().catch((err) => {
            console.error("Lead stats API failed", err);
            return {};
          }),
        ]);

        // Stats
        const statsData = statsRes?.value || statsRes;

        setStats({
          myLeads: statsData?.totalLeads ?? 0,
          convertedLeads: statsData?.convertedLeads ?? 0,
          thisWeekLeads: statsData?.thisWeekLeads ?? 0,
          activeOffers: statsData?.activeOffers ?? 0,
        });

        // Recent Leads
        const leadsData = leadsRes?.value || leadsRes;

        setRecentLeads(
          (leadsData || []).map((lead: any) => ({
            leadId: lead.leadId,
            leadName: lead.leadName,
            status: lead.status,
            createdAt: lead.createdAt,
          })),
        );

        // Overview
        const order = ["New", "Contacted", "Qualified", "Lost"];

        const formattedOverview = order.map((status) => ({
          label: status,
          value: Number(overviewRes?.[status] || 0),
        }));

        setOverview(formattedOverview);
      } catch (err) {
        console.error("Failed to load executive dashboard", err);
      }
    };
    useEffect(() => {
      fetchDashboardData();
    }, []);

    useEffect(() => {
      return subscribeRealtime<LeadListChangedPayload>(LEAD_LIST_CHANGED, () => {
        fetchDashboardData();
      });
    }, []);

  return (
    <div className="w-full space-y-4 px-3 py-4 sm:px-5 sm:py-6 lg:px-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl lg:text-3xl">
          Executive Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500 sm:text-base">
          Personal performance metrics overview.
        </p>
      </div>

      <ExecutiveCards stats={stats} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="min-w-0 overflow-hidden lg:col-span-5">
          <RecentLeadsCard
            title="Recent Leads"
            leads={recentLeads}
            onViewAll={() => {
              router.push(`/${orgCode}/leads`);
            }}
          />
        </div>
        <div className="min-w-0 overflow-hidden lg:col-span-7">
          <CommonOverview
            title="My Stats"
            subtitle="Lead status distribution"
            data={overview}
          />
        </div>
      </div>
    </div>
  );
}
