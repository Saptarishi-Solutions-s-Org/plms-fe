"use client";

import { FileText, MoreHorizontal, Pencil } from "lucide-react";
import { Lead } from "@/types/leadtypes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type LeadActionsProps = {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onViewDetails: (lead: Lead) => void;
};

export default function LeadActions({
  lead,
  onEdit,
  onViewDetails,
}: LeadActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-md  border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => onEdit(lead)}>
          <Pencil className="h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onViewDetails(lead)}>
          <FileText className="h-4 w-4" />
          Details
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}