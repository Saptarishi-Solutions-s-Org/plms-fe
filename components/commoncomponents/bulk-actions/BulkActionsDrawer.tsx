"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { Tags, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { BulkActionsDrawerProps } from "@/types/offerbulk";

import { ExecutiveList } from "./ExecutiveList";
import { OfferList } from "./OfferList";

export function BulkActionsDrawer({
  open,
  executives,
  offers,
  offersLoading = false,
  offersError = null,
  executivesLoading = false,
  executivesError = null,
  onClose,
  onAssignOffer,
}: BulkActionsDrawerProps) {
  const [selectedExecutiveIds, setSelectedExecutiveIds] = useState<string[]>(
    [],
  );
  const [selectedOfferIds, setSelectedOfferIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleSelection = (
    id: string,
    setSelectedIds: Dispatch<SetStateAction<string[]>>,
  ) => {
    setSelectedIds((selectedIds) =>
      selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id],
    );
  };

  const toggleAllExecutives = (checked: boolean) => {
    setSelectedExecutiveIds(checked ? executives.map((executive) => executive.id) : []);
  };

  const toggleAllOffers = (checked: boolean) => {
    setSelectedOfferIds(checked ? offers.map((offer) => offer.id) : []);
  };

  const resetSelections = () => {
    setSelectedExecutiveIds([]);
    setSelectedOfferIds([]);
  };

  const pluralize = (count: number, singular: string, plural = `${singular}s`) =>
    `${count} ${count === 1 ? singular : plural}`;

  const uniqueCount = <T,>(items: T[], getId: (item: T) => string) =>
    new Set(items.map(getId)).size;

  const handleClose = () => {
    resetSelections();
    onClose();
  };

  const handleSave = async () => {
    const hasInactiveOffer = offers.some(
      (offer) =>
        selectedOfferIds.includes(offer.id) && offer.status !== "ACTIVE",
    );

    if (hasInactiveOffer) {
      toast.error("Only active offers can be assigned.");
      return;
    }

    if (!onAssignOffer) {
      toast.error("Offer assignment action is not available.");
      return;
    }

    const payload = {
      offerIds: selectedOfferIds,
      executiveIds: selectedExecutiveIds,
    };

    try {
      setIsSaving(true);

      const result = await onAssignOffer(payload);
      const assignedCount = result.assigned.length;
      const assignedOfferCount = uniqueCount(result.assigned, (item) => item.offerId);
      const assignedExecutiveCount = uniqueCount(
        result.assigned,
        (item) => item.executiveId,
      );

      if (assignedCount > 0) {
        toast.success(
          `${pluralize(assignedOfferCount, "offer")} successfully assigned to ${pluralize(assignedExecutiveCount, "selected executive")}.`,
        );
        handleClose();
      } else {
        toast.error(
          `${selectedOfferIds.length === 1 ? "This Offer was" : "These Offers were"} ${
            selectedExecutiveIds.length === 1
              ? "already assigned to this executive"
              : "already assigned to these executives"
          }.`,
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to assign offers.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const isSaveDisabled =
    isSaving ||
    offersLoading ||
    executivesLoading ||
    selectedExecutiveIds.length === 0 ||
    selectedOfferIds.length === 0;

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleClose();
        }
      }}
      direction="bottom"
    >
      <DrawerContent className="z-[1000] h-[80vh] max-h-[80vh] overflow-hidden rounded-t-xl bg-white [&>div:first-child]:hidden">
        <DrawerHeader className="!text-left border-b border-gray-200 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Tags className="h-4 w-4" />
              </div>
              <div>
                <DrawerTitle className="text-lg font-semibold leading-tight text-blue-600">
                  Bulk Action
                </DrawerTitle>
                <DrawerDescription className="mt-0.5 text-xs text-gray-500">
                  Assign promotional offers to executives
                </DrawerDescription>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClose}
              disabled={isSaving}
              className="h-8 w-8 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-5 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:overflow-hidden">
          <section className="flex min-h-[300px] min-w-0 flex-col md:min-h-0">
            <h3 className="mb-3 text-lg font-semibold text-gray-800">
              Executives
            </h3>
            <ExecutiveList
              executives={executives}
              loading={executivesLoading}
              error={executivesError}
              selectedExecutiveIds={selectedExecutiveIds}
              onSelectAllExecutives={toggleAllExecutives}
              onSelectExecutive={(id) =>
                toggleSelection(id, setSelectedExecutiveIds)
              }
            />
          </section>

          <section className="flex min-h-[380px] min-w-0 flex-col md:min-h-0">
            <h3 className="mb-3 text-lg font-semibold text-gray-800">Offers</h3>
            <OfferList
              offers={offers}
              loading={offersLoading}
              error={offersError}
              selectedOfferIds={selectedOfferIds}
              onSelectAllOffers={toggleAllOffers}
              onSelectOffer={(id) => toggleSelection(id, setSelectedOfferIds)}
            />
          </section>
        </div>

        <div className="border-t border-gray-200 bg-white px-5 py-3">
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSaving}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaveDisabled}
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isSaving ? "Assigning..." : "Assign Offers"}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
