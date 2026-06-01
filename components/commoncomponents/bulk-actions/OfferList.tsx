import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

import type { OfferListProps } from "@/types/offerbulk";
import { OfferCard } from "./OfferCard";


export function OfferList({
  offers,
  loading = false,
  error = null,
  selectedOfferIds,
  onSelectOffer,
  onSelectAllOffers,
}: OfferListProps) {
  const hasSelectableRows = !loading && !error && offers.length > 0;
  const allSelected = hasSelectableRows && selectedOfferIds.length === offers.length;
  const someSelected =
    hasSelectableRows && selectedOfferIds.length > 0 && !allSelected;

  return (
    <div className="min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <Table className="table-fixed">
        <TableHeader className="sticky top-0 z-10 border-b border-gray-200 bg-[#7677F41A]">
          <TableRow>
            <TableHead className="w-14 text-xs sm:text-sm">
              <div className="flex items-center justify-right">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  aria-label="Select all offers"
                  disabled={!hasSelectableRows}
                  onCheckedChange={(checked) => {
                    onSelectAllOffers(checked === true);
                  }}
                />
              </div>
            </TableHead>
            <TableHead className="min-w-[120px] text-xs sm:text-sm">
              Offer Name
            </TableHead>
            <TableHead className="min-w-[240px] text-xs sm:text-sm">
              Description
            </TableHead>
            <TableHead className="min-w-[100px] text-xs sm:text-sm">
              Valid To
            </TableHead>
            <TableHead className="min-w-[80px] text-xs sm:text-sm">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading || error || offers.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className={`py-12 text-center text-sm font-semibold ${
                  error ? "text-red-500" : "text-gray-400"
                }`}
              >
                {loading
                  ? "Loading offers..."
                  : error || "No offers found"}
              </TableCell>
            </TableRow>
          ) : (
            offers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                selected={selectedOfferIds.includes(offer.id)}
                onSelect={onSelectOffer}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
