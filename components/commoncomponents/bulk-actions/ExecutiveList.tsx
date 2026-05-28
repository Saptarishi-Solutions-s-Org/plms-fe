import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

import type { ExecutiveListProps } from "@/types/offerbulk";
import { ExecutiveRow } from "./ExecutiveCard";


export function ExecutiveList({
  executives,
  loading = false,
  error = null,
  selectedExecutiveIds,
  onSelectExecutive,
  onSelectAllExecutives,
}: ExecutiveListProps) {
  const hasSelectableRows = !loading && !error && executives.length > 0;
  const allSelected = hasSelectableRows && selectedExecutiveIds.length === executives.length;
  const someSelected =
    hasSelectableRows && selectedExecutiveIds.length > 0 && !allSelected;

  return (
    <div className="min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <Table className="table-fixed">
        <TableHeader className="sticky top-0 z-10 border-b border-gray-200 bg-[#7677F41A]">
          <TableRow>
            <TableHead className="w-14 text-xs sm:text-sm">
              <div className="flex items-center justify-right">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  aria-label="Select all executives"
                  disabled={!hasSelectableRows}
                  onCheckedChange={(checked) => {
                    onSelectAllExecutives(checked === true);
                  }}
                />
              </div>
            </TableHead>
            <TableHead className="min-w-[140px] text-xs sm:text-sm">
              Executive Name
            </TableHead>
            <TableHead className="min-w-[80px] text-xs sm:text-sm">
              Leads
            </TableHead>
            <TableHead className="min-w-[120px] text-xs sm:text-sm">
              Active Offers
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading || error || executives.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className={`py-12 text-center text-sm font-semibold ${
                  error ? "text-red-500" : "text-gray-400"
                }`}
              >
                {loading
                  ? "Loading executives..."
                  : error || "No executives found"}
              </TableCell>
            </TableRow>
          ) : (
            executives.map((executive) => (
              <ExecutiveRow
                key={executive.id}
                executive={executive}
                selected={selectedExecutiveIds.includes(executive.id)}
                onSelect={onSelectExecutive}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
