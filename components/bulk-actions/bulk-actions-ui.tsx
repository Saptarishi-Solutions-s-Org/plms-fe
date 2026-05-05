"use client";

import { Button } from "@/components/ui/button";
import { DrawerClose } from "@/components/ui/drawer";
import { BulkActionsContent } from "./bulk-actions-content";
import { toast } from "sonner";
import { CheckCircleIcon } from "lucide-react";

export function BulkActionsUI() {

  const handleConfirm = () => {
    toast.success("Bulk Action Completed", {
      description: "Selected leads were updated successfully.",
    });
  };

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="border-b p-6">
        <h2 className="text-2xl font-semibold text-blue-600">Bulk Actions</h2>

        <p className="text-sm text-muted-foreground">
          Streamline your workflow with batch executive assignments and promotional offers.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <BulkActionsContent />
      </div>

      {/* Footer */}
      <div className="border-t p-6 flex justify-end gap-3">

        <DrawerClose asChild>
          <Button variant="outline">
            Cancel
          </Button>
        </DrawerClose>

        <Button
          onClick={handleConfirm}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          Confirm Bulk Action
          <CheckCircleIcon className="h-4 w-4" />
        </Button>

      </div>

    </div>
  );
}