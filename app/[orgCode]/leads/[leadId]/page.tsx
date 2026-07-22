"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { toast } from "sonner";

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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getLeadDetail, updateLead, updateLeadActivity } from "@/services/leads";
import { getExecutiveOffers, assignOfferToLead as assignOfferToLeadExecutive } from "@/services/executivestats";
import type { LeadDetailData, LeadFormData, LeadOfferOption } from "@/types/leadtypes";
import type {
  LeadDetailResponse,
} from "@/types/leadActivity";
import { getOfferItems, getOfferPagination, type ExecutiveOffersResponse } from "@/types/leadoffer";
import { DEFAULT_PAGE_LIMIT } from "@/types/pagination";
import { LEAD_DETAIL_CHANGED, LeadDetailChangedPayload } from "@/types/realtime";
import { subscribeRealtime } from "@/lib/socket";
import { type AuthUser, getUser } from "@/lib/auth";
import { canAccess } from "@/lib/permissions";

export default function LeadDetailPage() {
  const { orgCode, leadId } = useParams<{ orgCode: string; leadId: string }>();

  const [data, setData] = useState<LeadDetailData | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [isEditOpen, setEditOpen] = useState(false);
  const [isAssignOfferOpen, setAssignOfferOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState("");
  const [isAssigningOffer, setIsAssigningOffer] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [offerOptions, setOfferOptions] = useState<LeadOfferOption[]>([]);
  const [isOfferOptionsLoading, setIsOfferOptionsLoading] = useState(false);

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
  const canAssignOffer = canUpdateLead && user?.role?.toLowerCase() === "executive";

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

  const fetchOfferOptions = useCallback(async () => {
    setIsOfferOptionsLoading(true);

    try {
      const fetchOfferPage = async (nextPage: number) => {
        return getExecutiveOffers({ page: nextPage, limit: DEFAULT_PAGE_LIMIT }) as Promise<ExecutiveOffersResponse>;
      };

      const firstResponse = await fetchOfferPage(1);
      const firstItems = getOfferItems(firstResponse);
      const firstPagination = getOfferPagination(firstResponse);
      let items = firstItems;

      if (firstPagination?.totalPages && firstPagination.totalPages > 1) {
        const remainingResponses = await Promise.all(
          Array.from({ length: firstPagination.totalPages - 1 }, (_, index) =>
            fetchOfferPage(index + 2),
          ),
        );

        items = [firstItems, ...remainingResponses.map(getOfferItems)].flat();
      }

      const mappedOffers = items.map((offer) => ({
        id: offer.id ?? "",
        title: offer.title ?? "",
        status: offer.status ?? "inactive",
      }));
      setOfferOptions(mappedOffers.filter(offer => offer.status?.toLowerCase() === "active"));
    } catch {
      setOfferOptions([]);
    } finally {
      setIsOfferOptionsLoading(false);
    }
  }, []);

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

  const handleAssignOffer = async () => {
    if (!selectedOfferId) return;

    try {
      setIsAssigningOffer(true);
      const payload = { offerId: selectedOfferId, leadId: lead.uuid };

      await assignOfferToLeadExecutive(payload);

      toast.success("Offer assigned to lead successfully.");
      setAssignOfferOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to assign offer.",
      );
    } finally {
      setIsAssigningOffer(false);
    }
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

          <div className="flex shrink-0 items-center gap-2">
            {canAssignOffer && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedOfferId("");
                  setAssignOfferOpen(true);
                  fetchOfferOptions();
                }}
              >
                Assign Offer
              </Button>
            )}

            {canUpdateLead && (
              <Button
                type="button"
                size="sm"
                onClick={() => setEditOpen(true)}
                className="flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </div>

        <LeadHeroCard lead={lead} />

        {canViewActivity ? (
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[2fr_3fr]">
            <div className="flex flex-col gap-5">
              <div className="flex h-[400px] flex-col overflow-hidden rounded-xl border border-gray-300 bg-white lg:h-[560px]">
                <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-5">
                  <h2 className="text-base font-semibold text-gray-800">
                    Timeline
                  </h2>
                </div>
                <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
                  <ActivityTimeline
                    activities={activities}
                    canEdit={canUpdateActivity}
                    onEdit={handleEditActivity}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:h-[560px] lg:auto-rows-fr">
              {canCreateActivity && (
                <div className="min-h-0 flex flex-1 flex-col">
                  <AddNoteForm leadId={lead.uuid} onAdded={fetchDetail} />
                </div>
              )}
              <div className="min-h-0 flex flex-1 flex-col">
                <OfferCard offers={offers} />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:h-[560px] lg:auto-rows-fr">
            {canCreateActivity && (
              <div className="min-h-0 flex h-full flex-1 flex-col">
                <AddNoteForm leadId={lead.uuid} onAdded={fetchDetail} />
              </div>
            )}
            <div className="min-h-0 flex h-full flex-1 flex-col">
              <OfferCard offers={offers} />
            </div>
          </div>
        )}
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

      {canAssignOffer && (
        <Dialog open={isAssignOfferOpen} onOpenChange={setAssignOfferOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Offer</DialogTitle>
            </DialogHeader>

            <p className="text-sm text-gray-500">
              Select an offer to assign to {lead.name}.
            </p>

            <Select value={selectedOfferId} onValueChange={setSelectedOfferId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select offer" />
              </SelectTrigger>
              <SelectContent>
                {isOfferOptionsLoading ? (
                  <div className="px-3 py-2 text-sm text-gray-400">
                    Loading offers...
                  </div>
                ) : offerOptions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-400">
                    No offers found
                  </div>
                ) : (
                  offerOptions.map((offer) => {
                    const isActive = offer.status?.toLowerCase() === "active";

                    return (
                      <SelectItem
                        key={offer.id}
                        value={offer.id}
                        disabled={!isActive}
                      >
                        {offer.title}
                        {offer.status ? ` (${offer.status})` : ""}
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAssignOfferOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignOffer}
                disabled={
                  !selectedOfferId || isAssigningOffer || isOfferOptionsLoading
                }
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {isAssigningOffer ? "Assigning..." : "Assign Offer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
