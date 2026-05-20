"use client";

// plms-fe/app/[orgCode]/leads/[leadId]/page.tsx
// Route: /<orgCode>/leads/<leadId>

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Button }       from "@/components/ui/button";
import { Badge }        from "@/components/ui/badge";
import { Separator }    from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import GlobalLoader     from "@/components/commoncomponents/globalloader";
import { getLeadDetail, addLeadActivity } from "@/services/leads";
import type { LeadDetailData, AddActivityFormData } from "@/types/leadtypes";

// ── helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)   return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString();
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const STATUS_COLORS: Record<string, string> = {
  New:       "bg-blue-100 text-blue-700 border-blue-200",
  Contacted: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Qualified: "bg-green-100 text-green-700 border-green-200",
  Lost:      "bg-red-100 text-red-700 border-red-200",
};

const PRIORITY_COLORS: Record<string, string> = {
  Low:    "bg-gray-100 text-gray-600 border-gray-200",
  Medium: "bg-orange-100 text-orange-700 border-orange-200",
  High:   "bg-red-100 text-red-700 border-red-200",
  Urgent: "bg-purple-100 text-purple-700 border-purple-200",
};

// ── sub-components ────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 w-40 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right flex-1">
        {value || "—"}
      </span>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
        <span className="text-blue-500">{icon}</span>
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  );
}

// ── Add Note form ─────────────────────────────────────────────────────────────

function AddNoteForm({
  leadId,
  onAdded,
}: {
  leadId: string;
  onAdded: () => void;
}) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const handleSubmit = async () => {
    if (!notes.trim()) {
      setError("Note cannot be empty");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await addLeadActivity(leadId, { notes } satisfies AddActivityFormData);
      setNotes("");
      onAdded();
    } catch (e: any) {
      setError(e?.message ?? "Failed to add note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {/* clipboard icon */}
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <h2 className="text-sm font-semibold text-gray-800">Activity &amp; Notes</h2>
        </div>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={loading}
          className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
          )}
          Add Note
        </Button>
      </div>

      <div className="px-5 pt-4 pb-3">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write a note or activity…"
          rows={3}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    </div>
  );
}

// ── Timeline ──────────────────────────────────────────────────────────────────

function ActivityTimeline({
  activities,
}: {
  activities: LeadDetailData["activities"];
}) {
  if (activities.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-6">
        No activities yet
      </p>
    );
  }

  return (
    <div className="space-y-0 px-5 pt-2 pb-5">
      {activities.map((act, idx) => (
        <div key={act.id} className="flex gap-4">
          {/* line + dot */}
          <div className="flex flex-col items-center">
            <div
              className={`w-3 h-3 rounded-full border-2 mt-1 shrink-0 ${
                idx === 0
                  ? "border-blue-500 bg-blue-500"
                  : "border-gray-300 bg-gray-200"
              }`}
            />
            {idx < activities.length - 1 && (
              <div className="w-px flex-1 bg-gray-200 my-1" />
            )}
          </div>

          {/* content */}
          <div className="pb-5 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {act.createdByName}
            </p>
            {act.createdByRole && (
              <p className="text-xs text-gray-400 mb-1">{timeAgo(act.createdAt)}</p>
            )}
            {!act.createdByRole && (
              <p className="text-xs text-gray-400 mb-1">{timeAgo(act.createdAt)}</p>
            )}
            <p className="text-sm text-gray-600 leading-relaxed">
              &ldquo;{act.notes}&rdquo;
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Offer card ────────────────────────────────────────────────────────────────

function OfferCard({ offer }: { offer: LeadDetailData["assignedOffer"] }) {
  if (!offer) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center">
        <p className="text-sm text-gray-400">No offer assigned</p>
      </div>
    );
  }

  const estimatedValue =
    offer.discountAmount != null
      ? `$${Number(offer.discountAmount).toLocaleString()}`
      : offer.discountPercentage != null
      ? `${offer.discountPercentage}% off`
      : "—";

  return (
    <div className="rounded-xl border border-blue-100 bg-white px-5 py-5">
      <p className="text-xs font-semibold text-blue-600 tracking-wide uppercase mb-2">
        Assigned Offer
      </p>
      <p className="text-xl font-bold text-gray-900 leading-snug">{offer.title}</p>
      <p className="text-sm text-gray-500 mt-0.5">
        Valid until:{" "}
        <span className="font-semibold text-gray-700">
          {new Date(offer.validTo).toLocaleDateString("en-US", {
            month: "short",
            day:   "numeric",
            year:  "numeric",
          })}
        </span>
      </p>

      {offer.description && (
        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
          {offer.description}
        </p>
      )}

      <Separator className="my-4" />

      <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-1">
        Estimated value
      </p>
      <p className="text-3xl font-bold text-gray-900">{estimatedValue}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LeadDetailPage() {
  const { orgCode, leadId } = useParams<{ orgCode: string; leadId: string }>();
  const router = useRouter();

  const [data, setData]       = useState<LeadDetailData | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await getLeadDetail(leadId);
      setData(res);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load lead");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  if (isLoading) return <GlobalLoader />;

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
        <p className="text-gray-500 text-sm">{error || "Lead not found"}</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  const { lead, activities, assignedOffer } = data;

  return (
    <div className="w-full h-full p-4 sm:p-6 space-y-5 max-w-5xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Lead details
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage and review lead information and history.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 self-start"
          onClick={() =>
            router.push(`/${orgCode}/leads?edit=${lead.uuid}`)
          }
        >
          {/* pencil icon */}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a4 4 0 01-1.414.93l-3 1 1-3a4 4 0 01.93-1.414z"/>
          </svg>
          Edit Lead
        </Button>
      </div>

      {/* ── Hero card ──────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          {/* avatar */}
          <Avatar className="w-16 h-16 bg-blue-600 text-white text-xl shrink-0">
            <AvatarFallback className="bg-blue-600 text-white text-xl font-semibold">
              {initials(lead.name)}
            </AvatarFallback>
          </Avatar>

          {/* name + badges */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 truncate">
              {lead.name}
            </h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge
                variant="outline"
                className={`text-xs font-semibold ${STATUS_COLORS[lead.status] ?? ""}`}
              >
                {lead.status.toUpperCase()}
              </Badge>
              <Badge
                variant="outline"
                className={`text-xs font-semibold ${PRIORITY_COLORS[lead.priority] ?? ""}`}
              >
                {lead.priority.toUpperCase()} PRIORITY
              </Badge>
            </div>
          </div>

          {/* meta */}
          <div className="text-right text-sm shrink-0">
            <p className="text-gray-400 text-xs">Created By</p>
            <p className="font-semibold text-gray-800">{lead.createdByName}</p>
            <p className="text-gray-400 text-xs mt-2">Source</p>
            <p className="font-semibold text-gray-800">
              {lead.leadSource?.replace(/_/g, " ")}
            </p>
          </div>
        </div>
      </div>

      {/* ── 2-column grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Contact Details */}
        <SectionCard
          title="Contact Details"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          }
        >
          <div className="flex flex-col gap-1 pt-1">
            <div className="flex items-center gap-2 py-2.5 border-b border-gray-100">
              {/* phone icon */}
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-none">Phone</p>
                <p className="text-sm text-gray-900 font-medium">{lead.phone || "—"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 py-2.5 border-b border-gray-100">
              {/* email icon */}
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-none">Email</p>
                <p className="text-sm text-gray-900 font-medium">{lead.email || "—"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 py-2.5">
              {/* location icon */}
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-none">Location</p>
                <p className="text-sm text-gray-900 font-medium">
                  {[lead.city, lead.stateName, lead.countryName]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </p>
                {lead.postalCode && (
                  <p className="text-xs text-gray-400">{lead.postalCode}</p>
                )}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Lead Assignment */}
        <SectionCard
          title="Lead Assignment"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          }
        >
          <InfoRow label="Assigned To"  value={lead.assignedToName || "Unassigned"} />
          <InfoRow label="Lead Owner"   value={lead.createdByRole || lead.createdByName} />
          <InfoRow label="Traffic Source" value={lead.leadSource?.replace(/_/g, " ")} />
        </SectionCard>

        {/* Assigned Offer */}
        <OfferCard offer={assignedOffer} />

        {/* Activity & Notes — header + textarea */}
        <AddNoteForm leadId={lead.uuid} onAdded={fetchDetail} />
      </div>

      {/* ── Timeline (full width) ───────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Timeline</h2>
        </div>
        <ActivityTimeline activities={activities} />
      </div>

    </div>
  );
}