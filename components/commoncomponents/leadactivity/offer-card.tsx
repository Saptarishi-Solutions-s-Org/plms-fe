import { Calendar } from "lucide-react";
import type { AssignedOffer } from "@/types/leadtypes";

function formatDate(iso: any) {
  if (!iso) return "N/A";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function OfferItem({ offer }: { offer: AssignedOffer }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-gray-900">{offer.title}</p>
        </div>
        <span
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${offer.status === "Active"
            ? "border-green-200 bg-green-50 text-green-700"
            : offer.status === "Expired"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-gray-200 bg-gray-100 text-gray-600"
            }`}
        >
          <div className="h-1.5 w-1.5 rounded-full bg-current"></div>
          {offer.status}
        </span>
      </div>

      {offer.description && (
        <p className="text-xs text-gray-600">{offer.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>{formatDate(offer.validFrom)} – {formatDate(offer.validTo)}</span>
        </div>
        {offer.assignedByName && (
          <>
            <span className="text-gray-300">•</span>
            <span
              className={`font-medium ${offer.assignedByName.startsWith("Segment:")
                ? "text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-md"
                : "text-gray-600"
                }`}
            >
              {offer.assignedByName.startsWith("Segment:")
                ? offer.assignedByName
                : `Assigned by: ${offer.assignedByName}`}
            </span>
          </>
        )}
      </div>

    </div>
  );
}

export default function OfferCard({ offers }: { offers?: AssignedOffer[] }) {
  return (
    <div className="flex min-h-[180px] flex-1 flex-col rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-gray-800">Offers Assigned</h2>
      </div>

      {!offers || offers.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-5 py-8 text-center">
          <p className="text-sm text-gray-400">No offer assigned</p>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
          {offers.map((offer) => (
            <OfferItem key={offer.assignmentId} offer={offer} />
          ))}
        </div>
      )}
    </div>
  );
}
