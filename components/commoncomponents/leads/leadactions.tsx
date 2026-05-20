"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LeadActionsProps } from "@/types/leadtypes";
import { MoreHorizontal } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function LeadActions({
  lead,
  onEdit,
}: LeadActionsProps) {
  const { orgCode } = useParams<{ orgCode: string }>();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => router.push(`/${orgCode}/leads/${lead.uuid}`)}
        >
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(lead)}>Edit</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
