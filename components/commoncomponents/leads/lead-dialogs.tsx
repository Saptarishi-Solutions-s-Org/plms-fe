"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LeadForm from "@/components/commoncomponents/leads/leadform";
import LeadDetails from "@/components/commoncomponents/leads/leaddetails";
import { Lead, LeadFormData } from "@/types/leadtypes";

interface LeadDialogsProps {
  isFormOpen: boolean;
  editingLead: Lead | null;
  onFormSubmit: (data: LeadFormData) => Promise<void>;
  onFormClose: () => void;
  selectedLead: Lead | null;
  onDetailsClose: () => void;
  fixedAssignedToId?: string;
  hideAssignedTo?: boolean;
}

export default function LeadDialogs({
  isFormOpen,
  editingLead,
  onFormSubmit,
  onFormClose,
  selectedLead,
  onDetailsClose,
  fixedAssignedToId,
  hideAssignedTo = false,
}: LeadDialogsProps) {
  return (
    <>
      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) onFormClose();
        }}
      >
        <DialogContent className="w-full max-w-[50rem] max-h-[85vh] overflow-y-auto px-6 py-6">
          <DialogHeader className="pb-3">
            <DialogTitle>
              {editingLead ? "Edit Lead" : "Add New Lead"}
            </DialogTitle>
          </DialogHeader>
          <LeadForm
            onSubmit={onFormSubmit}
            onCancel={onFormClose}
            initialData={editingLead ?? undefined}
            fixedAssignedToId={fixedAssignedToId}
            hideAssignedTo={hideAssignedTo}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(selectedLead)}
        onOpenChange={(open) => {
          if (!open) onDetailsClose();
        }}
      >
        <DialogContent className="w-full max-w-[50rem] max-h-[85vh] overflow-y-auto px-6 py-6">
          <DialogHeader className="pb-3">
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {selectedLead && <LeadDetails lead={selectedLead} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
