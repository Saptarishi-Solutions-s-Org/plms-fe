"use client";

import { useCallback, useEffect, useState } from "react";
import { Tags, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getExecutiveOffers } from "@/services/executivestats";
import type { Lead } from "@/types/leadtypes";
import {
  type ExecutiveOffersResponse,
  getOfferItems,
  getOfferPagination,
} from "@/types/leadoffer";
import {
  formatDate,
  type OfferOption,
} from "@/types/org-manager";
import { DEFAULT_PAGE_LIMIT } from "@/types/pagination";

type Props = {
  open: boolean;
  leads: Lead[];
  onClose: () => void;
  onAssign: (
    offerIds: string[],
    leadIds: string[],
    preview?: boolean
  ) => Promise<{ successCount: number; failureCount: number }>;
  isLoadingLeads?: boolean;
};

export function BulkOfferAssignDrawer({
  open,
  leads,
  onClose,
  onAssign,
  isLoadingLeads = false,
}: Props) {
  const [offers, setOffers] = useState<OfferOption[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [selectedOfferIds, setSelectedOfferIds] = useState<string[]>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertContent, setAlertContent] = useState<{title: string, description: string, success: boolean} | null>(null);

  const fetchOffers = useCallback(async () => {
    setOffersLoading(true);
    try {
      const fetchOfferPage = (nextPage: number) =>
        getExecutiveOffers({
          page: nextPage,
          limit: DEFAULT_PAGE_LIMIT,
        }) as Promise<ExecutiveOffersResponse>;

      const firstResponse = (await getExecutiveOffers({
        page: 1,
        limit: DEFAULT_PAGE_LIMIT,
      })) as ExecutiveOffersResponse;
      const firstItems = getOfferItems(firstResponse);
      const firstPagination = getOfferPagination(firstResponse);
      let items = firstItems;

      if (firstPagination?.totalPages && firstPagination.totalPages > 1) {
        const remainingResponses = await Promise.all(
          Array.from({ length: firstPagination.totalPages - 1 }, (_, index) =>
            fetchOfferPage(index + 2),
          ),
        );

        items = [firstItems, ...remainingResponses.map(getOfferItems)].flat();
      }

      setOffers(
        items
          .filter((item) => (item.status ?? "inactive").toLowerCase() === "active")
          .map((item) => ({
            id: item.id ?? "",
            title: item.title ?? "",
            description: item.description ?? "",
            status: "active",
            validTo: item.validTo ?? "",
          })),
      );
    } catch {
      setOffers([]);
    } finally {
      setOffersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) fetchOffers();
  }, [open, fetchOffers]);

  const allOffersSelected =
    offers.length > 0 && selectedOfferIds.length === offers.length;
  const someOffersSelected = selectedOfferIds.length > 0 && !allOffersSelected;

  const allLeadsSelected =
    leads.length > 0 && selectedLeadIds.length === leads.length;
  const someLeadsSelected = selectedLeadIds.length > 0 && !allLeadsSelected;

  const toggleOffer = (id: string) =>
    setSelectedOfferIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const toggleLead = (id: string) =>
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const resetSelections = () => {
    setSelectedOfferIds([]);
    setSelectedLeadIds([]);
  };

  const handleClose = () => {
    if (isSaving) return;
    resetSelections();
    onClose();
  };

  const pluralize = (
    count: number,
    singular: string,
    plural = `${singular}s`,
  ) => `${count} ${count === 1 ? singular : plural}`;

  const handleSave = async () => {
    if (selectedOfferIds.length === 0 || selectedLeadIds.length === 0) return;

    const hasInactiveOffer = offers.some(
      (o) => selectedOfferIds.includes(o.id) && o.status !== "active",
    );
    if (hasInactiveOffer) {
      toast.error("Only active offers can be assigned to leads.");
      return;
    }

    try {
      setIsSaving(true);
      const result = await onAssign(selectedOfferIds, selectedLeadIds, true);
      
      let description = `The offer can be assigned to ${result.successCount} leads and ${result.failureCount} leads are skipped as the offer is already assigned to them`;
      if (result.failureCount === 0) {
        description = `The ${selectedOfferIds.length === 1 ? 'offer' : 'offers'} can be assigned to ${result.successCount} ${result.successCount === 1 ? 'lead' : 'leads'}.`;
      } else if (result.successCount === 0) {
        description = `All ${result.failureCount} selected ${result.failureCount === 1 ? 'lead is' : 'leads are'} skipped as the offer is already assigned to them.`;
      }

      setAlertContent({
        title: "Confirm Assignment",
        description,
        success: true
      });
      setIsAlertOpen(true);
    } catch (error) {
      toast.error("Failed to fetch assignment preview");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmAssign = async () => {
    try {
      setIsSaving(true);
      await onAssign(selectedOfferIds, selectedLeadIds, false);

      toast.success("Assigned successfully");

      resetSelections();
      setIsAlertOpen(false);
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to assign offers to leads.",
      );
      setIsAlertOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const isSaveDisabled =
    isSaving ||
    offersLoading ||
    selectedOfferIds.length === 0 ||
    selectedLeadIds.length === 0;

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleClose();
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
                  Bulk Assign Offers
                </DrawerTitle>
                <DrawerDescription className="mt-0.5 text-xs text-gray-500">
                  Assign multiple offers to multiple leads at once
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

        <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:overflow-hidden">
          <section className="flex min-h-[380px] min-w-0 flex-col md:min-h-0">
            <h3 className="mb-3 text-lg font-semibold text-gray-800">Offers</h3>
            <div className="min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <Table className="table-fixed">
                <TableHeader className="sticky top-0 z-10 border-b border-gray-200 bg-[#7677F41A]">
                  <TableRow>
                    <TableHead className="w-14">
                      <Checkbox
                        checked={
                          allOffersSelected
                            ? true
                            : someOffersSelected
                              ? "indeterminate"
                              : false
                        }
                        aria-label="Select all offers"
                        disabled={!offers.length || offersLoading}
                        onCheckedChange={(checked) =>
                          setSelectedOfferIds(
                            checked === true ? offers.map((o) => o.id) : [],
                          )
                        }
                      />
                    </TableHead>
                    <TableHead className="min-w-30 text-xs sm:text-sm">
                      Offer Name
                    </TableHead>
                    <TableHead className="min-w-45 text-xs sm:text-sm">
                      Description
                    </TableHead>
                    <TableHead className="min-w-25 text-xs sm:text-sm">
                      Valid To
                    </TableHead>
                    <TableHead className="min-w-20 text-xs sm:text-sm">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offersLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-12 text-center text-sm font-semibold text-gray-400"
                      >
                        Loading offers...
                      </TableCell>
                    </TableRow>
                  ) : offers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-12 text-center text-sm font-semibold text-gray-400"
                      >
                        No offers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    offers.map((offer) => {
                      const selected = selectedOfferIds.includes(offer.id);
                      return (
                        <TableRow
                          key={offer.id}
                          tabIndex={0}
                          data-state={selected ? "selected" : undefined}
                          className="cursor-pointer hover:bg-gray-50/60"
                          onClick={() => toggleOffer(offer.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              toggleOffer(offer.id);
                            }
                          }}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selected}
                              aria-label={`Select ${offer.title}`}
                              onCheckedChange={() => toggleOffer(offer.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </TableCell>
                          <TableCell className="truncate font-medium text-gray-800">
                            {offer.title || "—"}
                          </TableCell>
                          <TableCell className="max-w-45 truncate text-gray-600">
                            {offer.description || "—"}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {formatDate(offer.validTo)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                offer.status === "active"
                                  ? "border-green-200 bg-green-50 text-green-700"
                                  : offer.status === "expired"
                                    ? "border-red-200 bg-red-50 text-red-700"
                                    : "border-gray-200 bg-gray-50 text-gray-600"
                              }
                            >
                              {offer.status.charAt(0).toUpperCase() +
                                offer.status.slice(1)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </section>

          <section className="flex min-h-95 min-w-0 flex-col md:min-h-0">
            <h3 className="mb-3 text-lg font-semibold text-gray-800">Leads</h3>
            <div className="min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <Table className="table-fixed">
                <TableHeader className="sticky top-0 z-10 border-b border-gray-200 bg-[#7677F41A]">
                  <TableRow>
                    <TableHead className="w-14">
                      <Checkbox
                        checked={
                          allLeadsSelected
                            ? true
                            : someLeadsSelected
                              ? "indeterminate"
                              : false
                        }
                        aria-label="Select all leads"
                        disabled={!leads.length}
                        onCheckedChange={(checked) =>
                          setSelectedLeadIds(
                            checked === true ? leads.map((l) => l.uuid) : [],
                          )
                        }
                      />
                    </TableHead>
                    <TableHead className="min-w-35 text-xs sm:text-sm">
                      Lead Name
                    </TableHead>
                    <TableHead className="min-w-45 text-xs sm:text-sm">
                      Email
                    </TableHead>
                    <TableHead className="min-w-25 text-xs sm:text-sm">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingLeads ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-12 text-center text-sm font-semibold text-gray-400"
                      >
                        Loading leads...
                      </TableCell>
                    </TableRow>
                  ) : leads.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-12 text-center text-sm font-semibold text-gray-400"
                      >
                        No leads found
                      </TableCell>
                    </TableRow>
                  ) : (
                    leads.map((lead) => {
                      const selected = selectedLeadIds.includes(lead.uuid);
                      return (
                        <TableRow
                          key={lead.uuid}
                          tabIndex={0}
                          data-state={selected ? "selected" : undefined}
                          className="cursor-pointer hover:bg-gray-50/60"
                          onClick={() => toggleLead(lead.uuid)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              toggleLead(lead.uuid);
                            }
                          }}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selected}
                              aria-label={`Select ${lead.name}`}
                              onCheckedChange={() => toggleLead(lead.uuid)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </TableCell>
                          <TableCell className="font-medium text-gray-800">
                            {lead.name}
                          </TableCell>
                          <TableCell className="truncate text-gray-600">
                            {lead.email}
                          </TableCell>
                          <TableCell>{lead.status || "—"}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
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

      <AlertDialog
        open={isAlertOpen}
        onOpenChange={(open) => {
          setIsAlertOpen(open);
          if (!open) {
            resetSelections();
            if (alertContent?.success) {
              onClose();
            }
          }
        }}
      >
        <AlertDialogContent className="w-[380px] max-w-[calc(100vw-2rem)] rounded-3xl border-0 bg-white p-5 shadow-2xl z-[9999]">
          <AlertDialogHeader className="flex flex-col items-center space-y-1 text-center">
            <Image
              src="/samricha.png"
              alt="Samricha"
              width={90}
              height={32}
              priority
              className="h-auto w-[90px] object-contain mb-1"
              style={{ width: "auto", height: "auto" }}
            />
            <AlertDialogTitle className="text-base font-semibold text-slate-900">
              {alertContent?.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="max-w-xs text-[13px] leading-relaxed text-slate-500">
              {alertContent?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex w-full flex-row gap-3 sm:justify-center">
            <AlertDialogCancel 
              className="mt-0 flex-1 h-9 rounded-lg text-xs font-medium"
              onClick={() => {
                setIsAlertOpen(false);
                resetSelections();
                onClose();
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="flex-1 h-9 rounded-lg bg-blue-500 text-xs font-medium text-white hover:bg-blue-600"
              onClick={(e) => {
                e.preventDefault();
                confirmAssign();
              }}
              disabled={isSaving}
            >
              {isSaving ? "Assigning..." : "OK"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Drawer>
  );
}
