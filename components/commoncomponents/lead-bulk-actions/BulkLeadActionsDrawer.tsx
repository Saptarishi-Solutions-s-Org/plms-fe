"use client";

import { useMemo, useState } from "react";
import { ListChecks, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BulkLeadActionsDrawerProps } from "@/types/leadtypes";

export function BulkLeadActionsDrawer({
  open,
  executives,
  leads,
  isLoadingLeads = false,
  onClose,
  onAssign,
}: BulkLeadActionsDrawerProps) {
  const [selectedExecutiveId, setSelectedExecutiveId] = useState("");
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const selectedExecutive = executives.find(
    (executive) => executive.id === selectedExecutiveId,
  );

  const executiveLeadCounts = useMemo(() => {
    return leads.reduce<Record<string, number>>((counts, lead) => {
      if (lead.assignedTo) {
        counts[lead.assignedTo] = (counts[lead.assignedTo] ?? 0) + 1;
      }
      return counts;
    }, {});
  }, [leads]);

  const selectableLeads = leads;

  const allLeadsSelected =
    selectableLeads.length > 0 &&
    selectedLeadIds.length === selectableLeads.length;
  const someLeadsSelected =
    selectedLeadIds.length > 0 && !allLeadsSelected;

  const resetSelections = () => {
    setSelectedExecutiveId("");
    setSelectedLeadIds([]);
  };

  const handleClose = () => {
    if (isSaving) return;
    resetSelections();
    onClose();
  };

  const toggleLead = (lead: (typeof leads)[number]) => {
    const leadId = lead.uuid;
    setSelectedLeadIds((current) =>
      current.includes(leadId)
        ? current.filter((id) => id !== leadId)
        : [...current, leadId],
    );
  };

  const handleSave = async () => {
    if (!selectedExecutiveId || selectedLeadIds.length === 0) return;

    try {
      setIsSaving(true);
      const result = await onAssign(selectedLeadIds, selectedExecutiveId);
      const executiveName = selectedExecutive?.name ?? "executive";

      if (result.failureCount === 0) {
        toast.success(
          `${result.successCount} ${result.successCount === 1 ? "lead" : "leads"} assigned to ${executiveName}.`,
        );
        resetSelections();
        onClose();
      } else if (result.successCount > 0) {
        toast.warning(
          `Assigned ${result.successCount} of ${selectedLeadIds.length} selected leads to ${executiveName}.`,
        );
        setSelectedLeadIds([]);
      } else {
        toast.error(
          result.failures[0]?.message || "The selected leads could not be assigned.",
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to assign leads.",
      );
    } finally {
      setIsSaving(false);
    }
  };

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
                <ListChecks className="h-4 w-4" />
              </div>
              <div>
                <DrawerTitle className="text-lg font-semibold leading-tight text-blue-600">
                  Bulk Assign Leads
                </DrawerTitle>
                <DrawerDescription className="mt-0.5 text-xs text-gray-500">
                  Assign unassigned leads to one executive
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
              Select Executive
            </h3>
            <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm">
              <RadioGroup
                value={selectedExecutiveId}
                onValueChange={setSelectedExecutiveId}
                className="gap-0"
              >
                {executives.length === 0 ? (
                  <p className="py-12 text-center text-sm font-semibold text-gray-400">
                    No executives found
                  </p>
                ) : (
                  executives.map((executive) => (
                    <label
                      key={executive.id}
                      className="flex cursor-pointer items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0 hover:bg-gray-50"
                    >
                      <RadioGroupItem
                        value={executive.id}
                        aria-label={`Select ${executive.name}`}
                      />
                      <span className="min-w-0 flex-1 truncate font-medium text-gray-800">
                        {executive.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {executiveLeadCounts[executive.id] ?? 0} leads
                      </span>
                    </label>
                  ))
                )}
              </RadioGroup>
            </div>
          </section>

          <section className="flex min-h-[380px] min-w-0 flex-col md:min-h-0">
            <h3 className="mb-3 text-lg font-semibold text-gray-800">
              Select Leads
            </h3>
            <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-gray-200 bg-white shadow-sm">
              <Table>
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
                        disabled={isLoadingLeads || selectableLeads.length === 0}
                        onCheckedChange={(checked) =>
                          setSelectedLeadIds(
                            checked === true
                              ? selectableLeads.map((lead) => lead.uuid)
                              : [],
                          )
                        }
                      />
                    </TableHead>
                    <TableHead>Lead Name</TableHead>
                    <TableHead className="w-72">Email</TableHead>
                    <TableHead className="w-28">Status</TableHead>
                    <TableHead className="w-44">Assigned To</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingLeads ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-12 text-center text-sm font-semibold text-gray-400"
                      >
                        Loading leads...
                      </TableCell>
                    </TableRow>
                  ) : leads.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
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
                          onClick={() => toggleLead(lead)}
                          onKeyDown={(event) => {
                            if (
                              event.key === "Enter" || event.key === " "
                            ) {
                              event.preventDefault();
                              toggleLead(lead);
                            }
                          }}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selected}
                              aria-label={`Select ${lead.name}`}
                              onCheckedChange={() => toggleLead(lead)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </TableCell>
                          <TableCell
                            className="max-w-0 truncate font-medium text-gray-800"
                            title={lead.name}
                          >
                            {lead.name}
                          </TableCell>
                          <TableCell
                            className="max-w-0 truncate text-gray-600"
                            title={lead.email}
                          >
                            {lead.email}
                          </TableCell>
                          <TableCell>{lead.status || "-"}</TableCell>
                          <TableCell
                            className="max-w-0 truncate text-center text-gray-600"
                            title={lead.assignedToName}
                          >
                            {lead.assignedToName || "-"}
                          </TableCell>
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
              disabled={
                isSaving ||
                isLoadingLeads ||
                !selectedExecutiveId ||
                selectedLeadIds.length === 0
              }
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isSaving ? "Assigning..." : "Assign Leads"}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
