import { Checkbox } from "@/components/ui/checkbox";
import {
  TableCell,
  TableRow,
} from "@/components/ui/table";
import type { Executive } from "@/types/offerbulk";

interface ExecutiveRowProps {
  executive: Executive;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function ExecutiveRow({
  executive,
  selected,
  onSelect,
}: ExecutiveRowProps) {
  return (
    <TableRow
      tabIndex={0}
      data-state={selected ? "selected" : undefined}
      className="cursor-pointer hover:bg-gray-50/60"
      onClick={() => onSelect(executive.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(executive.id);
        }
      }}
    >
      <TableCell className="w-18">
        <Checkbox
          checked={selected}
          aria-label={`Select ${executive.name}`}
          onCheckedChange={() => onSelect(executive.id)}
          onClick={(event) => event.stopPropagation()}
        />
      </TableCell>
      <TableCell className="min-w-[140px] text-xs font-medium text-gray-800 sm:text-sm">
        {executive.name}
      </TableCell>
      <TableCell className="min-w-[80px] text-xs text-gray-600 sm:text-sm">
        {executive.leadCount}
      </TableCell>
      <TableCell className="min-w-[120px] text-xs text-gray-600 sm:text-sm">
        {executive.activeOfferCount}
      </TableCell>
    </TableRow>
  );
}
