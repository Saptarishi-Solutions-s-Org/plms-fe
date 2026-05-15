"use client";

import { Label } from "@/components/ui/label";
import { Lead } from "@/types/leadtypes";

function FieldDisplay({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-normal text-gray-700">{label}</Label>
      <div
        className={`w-full rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 ${
          multiline
            ? "min-h-[100px] py-2 whitespace-pre-wrap"
            : "flex h-10 items-center"
        }`}
      >
        {value || "-"}
      </div>
    </div>
  );
}

export default function LeadDetails({ lead }: { lead: Lead }) {
  return (
    <div className="flex flex-col gap-5 py-2">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-blue-600">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldDisplay label="Lead ID" value={lead.leadCode} />
          <FieldDisplay label="Name" value={lead.name} />
          <FieldDisplay label="Gender" value={lead.gender} />
          <FieldDisplay label="Email" value={lead.email} />
          <FieldDisplay label="Phone Number" value={lead.phone} />
          <FieldDisplay label="City" value={lead.city} />
          <FieldDisplay label="State" value={lead.state} />
          <FieldDisplay label="Country" value={lead.country} />
          <FieldDisplay label="Postal Code" value={lead.postalCode} />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-blue-600">
          Lead Classification
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldDisplay label="Status" value={lead.status} />
          <FieldDisplay
            label="Assigned To"
            value={lead.assignedToName ?? "Unassigned"}
          />
          <FieldDisplay label="Priority" value={lead.priority} />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-blue-600">
          Additional Information
        </h3>
        <FieldDisplay label="Notes" value={lead.notes} multiline />
      </div>
    </div>
  );
}
