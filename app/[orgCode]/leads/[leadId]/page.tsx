"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
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
import { getLeadDetail, getLeadsWithStats, updateLead, updateLeadActivity } from "@/services/leads";
import type { LeadDetailData, LeadFormData } from "@/types/leadtypes";
import type {
  LeadDetailResponse,
  LeadsWithStatsResponse,
} from "@/types/leadActivity";
import { LEAD_DETAIL_CHANGED, LeadDetailChangedPayload } from "@/types/realtime";
import { subscribeRealtime } from "@/lib/socket";
import { type AuthUser, getUser } from "@/lib/auth";
import { canAccess } from "@/lib/permissions";

export default function LeadDetailPage() {
  const { orgCode, leadId } = useParams<{ orgCode: string; leadId: string }>();

  const [data, setData] = useState<LeadDetailData | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [isEditOpen, setEditOpen] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const [user, setUser] = useState<AuthUser | null>(() => getUser());

  useEffect(() => {
    const syncUser = () => setUser(getUser());
    window.addEventListener("LMA-auth-changed", syncUser);
    return () => window.removeEventListener("LMA-auth-changed", syncUser);
  }, []);

  const canViewActivity = useMemo(
    () => canAccess(user, ["lead_activity"], ["view"]),
    [user]
  );
  const canCreateActivity = useMemo(
    () => canAccess(user, ["lead_activity"], ["create"]),
    [user]
  );
  const canUpdateActivity = useMemo(
    () => canAccess(user, ["lead_activity"], ["update"]),
    [user]
  );
  const canUpdateLead = useMemo(
    () => canAccess(user, ["lead"], ["update"]),
    [user]
  );

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      const detailRes =
        (await getLeadDetail(leadId)) as LeadDetailResponse;

      if (!detailRes || !detailRes.lead) {
        setData(null);
        return;
      }

      setData({
        lead: detailRes.lead,
        activities: detailRes.activities ?? [],
        offers: detailRes.offers ?? [],
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

  const { lead, activities = [], offers = [] } = data;

  const handleEditSubmit = async (formData: LeadFormData) => {
    await updateLead({
      id: lead.uuid,
      ...formData,
      assignedTo: lead.assignedTo,
    });

    await fetchDetail();
    setEditOpen(false);
  };

  const handleEditActivity = async (id: string, notes: string) => {
    await updateLeadActivity(id, notes);
    await fetchDetail();
  };

  return (
    <>
       <div className="min-h-full w-full space-y-4 p-4 sm:p-5">
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
          {canUpdateLead && (
            <Button
              type="button"
              size="sm"
              onClick={async () => {
                await fetchDetail();
                setEditOpen(true);
              }}
              className="flex shrink-0 items-center gap-1 bg-blue-600 text-white hover:bg-blue-700"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          )}
        </div>

        <LeadHeroCard lead={lead} />

        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[2fr_3fr]">
          <div className="flex flex-col gap-5">
            <div className="flex h-[400px] flex-col overflow-hidden rounded-xl border border-gray-300 bg-white lg:h-[560px]">
              <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-5">
                <h2 className="text-base font-semibold text-gray-800">
                  Timeline
                </h2>
              </div>
              <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
                {canViewActivity ? (
                  <ActivityTimeline 
                    activities={activities}
                    canEdit={canUpdateActivity}
                    onEdit={handleEditActivity}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-4 text-sm text-gray-500 text-center">
                    You do not have permission to view lead activities.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:h-[560px]">
            {canCreateActivity && (
              <AddNoteForm leadId={lead.uuid} onAdded={fetchDetail} />
            )}
            <OfferCard offers={offers} />
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
