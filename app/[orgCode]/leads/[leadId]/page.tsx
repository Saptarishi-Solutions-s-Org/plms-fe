"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import ActivityTimeline from "@/components/commoncomponents/leadactivity/activity-timeline";
import AddNoteForm from "@/components/commoncomponents/leadactivity/add-note-form";
import LeadContactCard from "@/components/commoncomponents/leadactivity/lead-contact-card";
import LeadHeroCard from "@/components/commoncomponents/leadactivity/lead-title";
import OfferCard from "@/components/commoncomponents/leadactivity/offer-card";
import GlobalLoader from "@/components/commoncomponents/globalloader";
import { getLeadDetail, getLeadsWithStats } from "@/services/leads";
import type { LeadDetailData } from "@/types/leadtypes";
import type {
  LeadDetailResponse,
  LeadsWithStatsResponse,
} from "@/types/leadActivity";
import {LEAD_DETAIL_CHANGED, LeadDetailChangedPayload} from "@/types/realtime";
import { subscribeRealtime } from "@/lib/socket";

export default function LeadDetailPage() {
  const { leadId } = useParams<{ orgCode: string; leadId: string }>();

  const [data, setData] = useState<LeadDetailData | null>(null);
  const [isLoading, setLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);

      const [leadsRes, detailRes] = await Promise.all([
        getLeadsWithStats() as Promise<LeadsWithStatsResponse>,
        getLeadDetail(leadId) as Promise<LeadDetailResponse>,
      ]);

      const lead = leadsRes.leads?.find((item) => item.uuid === leadId);

      if (!lead) {
        setData(null);
        return;
      }

      setData({
        lead,
        activities: detailRes.activities ?? [],
        assignedOffer: null,
      });
    } catch (err) {
      console.error(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  useEffect(() => {
    return subscribeRealtime<LeadDetailChangedPayload>(LEAD_DETAIL_CHANGED, (payload) => {
      fetchDetail();
    });
  }, [fetchDetail]);

  if (isLoading) {
    return (
      <>
        <GlobalLoader />
      </>
    );
  }

  if (!data) return null;

  const { lead, activities = [] } = data;

  return (
    <div className="h-full w-full space-y-5 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
            Lead details
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Manage and review lead information and history.
          </p>
        </div>
      </div>

      <LeadHeroCard lead={lead} />

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <LeadContactCard lead={lead} />
          <AddNoteForm leadId={lead.uuid} onAdded={fetchDetail} />
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex h-[300px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="shrink-0 border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-800">Timeline</h2>
            </div>
            <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
              <ActivityTimeline activities={activities} />
            </div>
          </div>

          <OfferCard />
        </div>
      </div>
    </div>
  );
}
