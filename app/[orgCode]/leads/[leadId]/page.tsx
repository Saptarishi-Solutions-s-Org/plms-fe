"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";

import ActivityTimeline from "@/components/commoncomponents/leadactivity/activity-timeline";
import AddNoteForm from "@/components/commoncomponents/leadactivity/add-note-form";
import LeadHeroCard from "@/components/commoncomponents/leadactivity/lead-title";
import OfferCard from "@/components/commoncomponents/leadactivity/offer-card";
import GlobalLoader from "@/components/commoncomponents/globalloader";
import LeadForm from "@/components/commoncomponents/leads/leadform";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getLeadDetail, getLeadsWithStats, updateLead } from "@/services/leads";
import type { LeadDetailData, LeadFormData } from "@/types/leadtypes";
import type {
  LeadDetailResponse,
  LeadsWithStatsResponse,
} from "@/types/leadActivity";
import { LEAD_DETAIL_CHANGED, LeadDetailChangedPayload } from "@/types/realtime";
import { subscribeRealtime } from "@/lib/socket";

export default function LeadDetailPage() {
  const { orgCode, leadId } = useParams<{ orgCode: string; leadId: string }>();

  const [data, setData] = useState<LeadDetailData | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [isEditOpen, setEditOpen] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

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
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  }, [leadId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  useEffect(() => {
    return subscribeRealtime<LeadDetailChangedPayload>(
      LEAD_DETAIL_CHANGED,
      () => {
        fetchDetail();
      },
    );
  }, [fetchDetail]);

  const isInitialLoading = isLoading && !hasLoaded;

  if (isInitialLoading) {
    return (
      <>
        <GlobalLoader />
      </>
    );
  }

  if (!data) return null;

  const { lead, activities = [] } = data;

  const handleEditSubmit = async (formData: LeadFormData) => {
    await updateLead({
      id: lead.uuid,
      ...formData,
      assignedTo: lead.assignedTo,
    });

    await fetchDetail();
    setEditOpen(false);
  };

  return (
    <>
      <div className="h-full w-full space-y-5 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-900 rounded-full shrink-0"
            >
              <Link href={`/${orgCode}/leads`} aria-label="Back to leads">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
                Lead details
              </h1>
              <p className="mt-0.5 text-sm text-gray-500">
                Manage and review lead information and history.
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => setEditOpen(true)}
            className="flex shrink-0 items-center gap-1 bg-blue-600 text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </div>

        <LeadHeroCard lead={lead} />

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <div className="flex h-[420px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white lg:h-[620px]">
              <div className="flex h-16 shrink-0 items-center border-b border-gray-100 px-5">
                <h2 className="text-base font-semibold text-gray-800">
                  Timeline
                </h2>
              </div>
              <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
                <ActivityTimeline activities={activities} />
              </div>
            </div>
          </div>

          <div className="grid h-[620px] grid-rows-2 gap-5">
            <AddNoteForm leadId={lead.uuid} onAdded={fetchDetail} />
            <OfferCard />
          </div>
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
        <DialogContent className="w-full max-w-[50rem] max-h-[85vh] overflow-y-auto px-6 py-6">
          <DialogHeader className="pb-3">
            <DialogTitle>Edit Lead</DialogTitle>
          </DialogHeader>
          <LeadForm
            onSubmit={handleEditSubmit}
            onCancel={() => setEditOpen(false)}
            initialData={lead}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
