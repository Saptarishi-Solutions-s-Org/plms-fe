"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LeadActionsProps } from "@/types/leadtypes";
import { MoreHorizontal } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function LeadActions({
  lead,
  onEdit,
  executives = [],
  onAssign,
}: LeadActionsProps) {
  const { orgCode } = useParams<{ orgCode: string }>();
  const router = useRouter();
  const [isAssignOpen, setAssignOpen] = useState(false);
  const [assignedTo, setAssignedTo] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const availableExecutives = executives.filter(
    (executive) => executive.id !== lead.assignedTo,
  );
  const currentExecutiveName =
    executives.find((executive) => executive.id === lead.assignedTo)?.name ??
    lead.assignedToName ??
    "Unassigned";

  useEffect(() => {
    if (isAssignOpen) setAssignedTo("");
  }, [isAssignOpen]);

  const handleAssign = async () => {
    if (!assignedTo || !onAssign) return;

    try {
      setIsAssigning(true);
      await onAssign(lead, assignedTo);
      setAssignOpen(false);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <>
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
          {onAssign && (
            <DropdownMenuItem
              onClick={() => {
                setAssignedTo("");
                setAssignOpen(true);
              }}
            >
              Assign To
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {onAssign && (
        <Dialog open={isAssignOpen} onOpenChange={setAssignOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Assign To</DialogTitle>
            </DialogHeader>

            <p className="text-sm text-gray-500">
              Current executive: {currentExecutiveName}
            </p>

            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select executive" />
              </SelectTrigger>
              <SelectContent>
                {availableExecutives.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-400">
                    No other executives found
                  </div>
                ) : (
                  availableExecutives.map((executive) => (
                    <SelectItem key={executive.id} value={executive.id}>
                      {executive.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAssign}
                disabled={!assignedTo || isAssigning}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {isAssigning ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
