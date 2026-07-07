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
  offerOptions = [],
  isOfferOptionsLoading = false,
  onAssignOffer,
}: LeadActionsProps) {
  const { orgCode } = useParams<{ orgCode: string }>();
  const router = useRouter();
  const [isAssignOpen, setAssignOpen] = useState(false);
  const [isAssignOfferOpen, setAssignOfferOpen] = useState(false);
  const [assignedTo, setAssignedTo] = useState("");
  const [selectedOfferId, setSelectedOfferId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [isAssigningOffer, setIsAssigningOffer] = useState(false);
  const canAssign = Boolean(onAssign && !lead.assignedTo);
  const canAssignOffer = Boolean(onAssignOffer);
  const availableExecutives = canAssign ? executives : [];
  const currentExecutiveName =
    executives.find((executive) => executive.id === lead.assignedTo)?.name ??
    lead.assignedToName ??
    "Unassigned";

  useEffect(() => {
    if (isAssignOpen) setAssignedTo("");
  }, [isAssignOpen]);

  useEffect(() => {
    if (isAssignOfferOpen) setSelectedOfferId("");
  }, [isAssignOfferOpen]);

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

  const handleAssignOffer = async () => {
    if (!selectedOfferId || !onAssignOffer) return;

    try {
      setIsAssigningOffer(true);
      await onAssignOffer(lead, selectedOfferId);
      setAssignOfferOpen(false);
    } finally {
      setIsAssigningOffer(false);
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
            onClick={() =>
              router.push(
                `/${orgCode}/leads/${encodeURIComponent(lead.leadCode)}`,
              )
            }
          >
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(lead)}>Edit</DropdownMenuItem>
          {canAssign && (
            <DropdownMenuItem
              onClick={() => {
                setAssignedTo("");
                setAssignOpen(true);
              }}
            >
              Assign To
            </DropdownMenuItem>
          )}
          {canAssignOffer && (
            <DropdownMenuItem
              onClick={() => {
                setSelectedOfferId("");
                setAssignOfferOpen(true);
              }}
            >
              Assign Offer
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {canAssign && (
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

      {canAssignOffer && (
        <Dialog open={isAssignOfferOpen} onOpenChange={setAssignOfferOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Offer</DialogTitle>
            </DialogHeader>

            <p className="text-sm text-gray-500">
              Select an offer to assign to {lead.name}.
            </p>

            <Select value={selectedOfferId} onValueChange={setSelectedOfferId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select offer" />
              </SelectTrigger>
              <SelectContent>
                {isOfferOptionsLoading ? (
                  <div className="px-3 py-2 text-sm text-gray-400">
                    Loading offers...
                  </div>
                ) : offerOptions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-400">
                    No offers found
                  </div>
                ) : (
                  offerOptions.map((offer) => {
                    const isActive = offer.status?.toLowerCase() === "active";

                    return (
                      <SelectItem
                        key={offer.id}
                        value={offer.id}
                        disabled={!isActive}
                      >
                        {offer.title}
                        {offer.status ? ` (${offer.status})` : ""}
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAssignOfferOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignOffer}
                disabled={
                  !selectedOfferId || isAssigningOffer || isOfferOptionsLoading
                }
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {isAssigningOffer ? "Assigning..." : "Assign Offer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
