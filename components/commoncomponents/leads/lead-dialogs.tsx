"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LeadForm from "@/components/commoncomponents/leads/leadform";
import LeadDetails from "@/components/commoncomponents/leads/leaddetails";
import {LeadDialogsProps} from "@/types/leadtypes";

export default function LeadDialogs({
  isFormOpen,
  editingLead,
  onFormSubmit,
  onFormClose,
  selectedLead,
  onDetailsClose,
  assignees,
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
            assignees={editingLead ? undefined : assignees}
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
