import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import type { Offer } from "@/types/offerbulk";

interface OfferCardProps {
  offer: Offer;
  selected: boolean;
  onSelect: (id: string) => void;
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function OfferCard({ offer, selected, onSelect }: OfferCardProps) {
  const isActive = offer.status === "ACTIVE";
  const isExpired = offer.status === "EXPIRED";

  return (
    <TableRow
      tabIndex={0}
      data-state={selected ? "selected" : undefined}
      className="cursor-pointer hover:bg-gray-50/60"
      onClick={() => onSelect(offer.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(offer.id);
        }
      }}
    >
      <TableCell className="w-14">
        <Checkbox
          checked={selected}
          aria-label={`Select ${offer.title}`}
          onCheckedChange={() => onSelect(offer.id)}
          onClick={(event) => event.stopPropagation()}
        />
      </TableCell>

      <TableCell className="min-w-[120px]">
        <p className="text-xs font-medium text-gray-800 sm:text-sm">
          {offer.title}
        </p>
      </TableCell>

      <TableCell className="min-w-[240px]">
        <p
          title={offer.description || undefined}
          className="truncate text-xs text-gray-500"
        >
          {offer.description || "-"}
        </p>
      </TableCell>

      <TableCell className="min-w-[100px] whitespace-nowrap text-xs text-gray-600 sm:text-sm">
        {offer.validTo ? formatDate(offer.validTo) : "-"}
      </TableCell>

      <TableCell className="min-w-[80px]">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${
            isActive
              ? "border-green-200 bg-green-50 text-green-700"
              : isExpired
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-gray-200 bg-gray-50 text-gray-600"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isActive ? "bg-green-500" : isExpired ? "bg-red-400" : "bg-gray-400"
            }`}
          />
          {isActive ? "Active" : isExpired ? "Expired" : "Inactive"}
        </span>
      </TableCell>
    </TableRow>
  );
}
