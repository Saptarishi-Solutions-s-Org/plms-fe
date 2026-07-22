"use client";

import { useCallback, useState } from "react";

import type { Offer } from "@/types/Createoffer";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MoreHorizontal } from "lucide-react";

const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "—";

  const d = new Date(date);

  if (isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const DISCOUNT_TYPE_LABELS: Record<string, string> = {
  Fixed_Amount: "Fixed Amount",
  Percentage: "Percentage",
  Combo_Offer: "Combo Offer",
  Buy_One_Get_One_Free: "Buy One Get One",
  Conditional_Discount: "Conditional",
  Flag_Discount: "Flag Discount",
};

const STATUS_CONFIG: Record<
  string,
  {
    dot: string;
    text: string;
    bg: string;
  }
> = {
  active: {
    dot: "bg-green-500",
    text: "text-green-700",
    bg: "bg-green-50 border-green-200",
  },

  inactive: {
    dot: "bg-gray-400",
    text: "text-gray-600",
    bg: "bg-gray-50 border-gray-200",
  },

  expired: {
    dot: "bg-red-400",
    text: "text-red-600",
    bg: "bg-red-50 border-red-200",
  },
};

const DEFAULT_STATUS_CONFIG = {
  dot: "bg-gray-400",
  text: "text-gray-600",
  bg: "bg-gray-50 border-gray-200",
};
function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? DEFAULT_STATUS_CONFIG;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />

      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function DiscountSummary({ offer }: { offer: Offer }) {
  switch (offer.discountType) {
    case "Fixed_Amount":
      return <span>₹{offer.discountAmount}</span>;

    case "Percentage":
      return (
        <span>
          {offer.discountPercentage}% (max ₹{offer.maxDiscountAmount})
        </span>
      );

    case "Combo_Offer":
      return (
        <span
          className="block max-w-[200px] truncate"
          title={offer.comboDescription}
        >
          {offer.comboDescription}
        </span>
      );

    case "Buy_One_Get_One_Free":
      return (
        <span>
          Buy {offer.buyQuantity} Get {offer.getQuantity}
        </span>
      );

    case "Conditional_Discount":
      return (
        <span>
          Min ₹{offer.minPurchaseAmount} → ₹{offer.conditionalDiscountValue} off
        </span>
      );

    case "Flag_Discount":
      return <span>₹{offer.flagDiscountAmount}</span>;

    default:
      return <span>—</span>;
  }
}

interface OffersTableProps {
  offers: Offer[];
  onToggleStatus?: (id: string) => void;
  onEdit?: (offer: Offer) => void;
  rowOffset?: number;
}

export function OffersTable({
  offers,
  onToggleStatus,
  onEdit,
  rowOffset = 0,
}: OffersTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleCloseMenu = useCallback(() => {
    setOpenMenuId(null);
  }, []);

  const handleToggleStatus = useCallback(
    (id: string) => {
      onToggleStatus?.(id);
      setOpenMenuId(null);
    },
    [onToggleStatus],
  );

  const hasActions = Boolean(onEdit || onToggleStatus);

  const handleEdit = useCallback(
    (offer: Offer) => {
      onEdit?.(offer);
      setOpenMenuId(null);
    },
    [onEdit],
  );

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <Table>
        <TableHeader className="border-b border-gray-200 bg-[#7677F41A]">
          <TableRow>
            <TableHead className="w-10 whitespace-nowrap text-xs sm:text-sm">
              S.No
            </TableHead>

            <TableHead className="min-w-[160px] whitespace-nowrap text-xs sm:text-sm">
              Offer Name
            </TableHead>

            <TableHead className="min-w-[200px] whitespace-nowrap text-xs sm:text-sm">
              Description
            </TableHead>

            <TableHead className="min-w-[120px] whitespace-nowrap text-xs sm:text-sm">
              Assigned
            </TableHead>

            <TableHead className="min-w-[140px] whitespace-nowrap text-xs sm:text-sm">
              Discount Type
            </TableHead>

            <TableHead className="min-w-[160px] whitespace-nowrap text-xs sm:text-sm">
              Discount Value
            </TableHead>

            <TableHead className="min-w-[110px] whitespace-nowrap text-xs sm:text-sm">
              Valid From
            </TableHead>

            <TableHead className="min-w-[110px] whitespace-nowrap text-xs sm:text-sm">
              Valid To
            </TableHead>

            <TableHead className="min-w-[120px] whitespace-nowrap text-xs sm:text-sm">
              Offer Type
            </TableHead>

            <TableHead className="min-w-[100px] whitespace-nowrap text-xs sm:text-sm">
              Status
            </TableHead>

            {hasActions && (
              <TableHead className="w-20 whitespace-nowrap text-center text-xs sm:text-sm">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {offers.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={hasActions ? 11 : 10}
                className="py-12 text-center text-sm font-semibold text-gray-400"
              >
                No offers found
              </TableCell>
            </TableRow>
          ) : (
            offers.map((offer, index) => {
              const isExpired = offer.status === "expired";
              const isActive = offer.status === "active";
              const isMenuOpen = openMenuId === offer.id;

              return (
                <TableRow
                  key={offer.id ?? index}
                  className="hover:bg-gray-50/60"
                >
                  <TableCell className="w-10 text-xs text-gray-600 sm:text-sm">
                    {rowOffset + index + 1}
                  </TableCell>

                  <TableCell
                    className="max-w-50 truncate text-xs font-medium text-gray-800 sm:text-sm"
                    title={offer.title}
                  >
                    {offer.title}
                  </TableCell>

                  <TableCell className="min-w-[200px] max-w-[200px] truncate text-xs text-gray-600 sm:text-sm" title={offer.description}>
                    {offer.description || "—"}
                  </TableCell>

                  <TableCell className="min-w-[120px] text-xs text-gray-600 sm:text-sm">
                    {offer.isGlobal ? "All Users" : offer.assignedUsers || "—"}
                  </TableCell>

                  <TableCell className="min-w-[140px] text-xs text-gray-700 sm:text-sm">
                    {DISCOUNT_TYPE_LABELS[offer.discountType] ??
                      offer.discountType ??
                      "—"}
                  </TableCell>

                  <TableCell className="min-w-[160px] text-xs text-gray-600 sm:text-sm">
                    <DiscountSummary offer={offer} />
                  </TableCell>

                  <TableCell className="min-w-[110px] whitespace-nowrap text-xs text-gray-600 sm:text-sm">
                    {offer.validFrom ? formatDate(offer.validFrom) : "—"}
                  </TableCell>

                  <TableCell className="min-w-[110px] whitespace-nowrap text-xs text-gray-600 sm:text-sm">
                    {offer.validTo ? formatDate(offer.validTo) : "—"}
                  </TableCell>

                  <TableCell className="min-w-[120px]">
                    {offer.isGlobal ? (
                      <Badge className="border-blue-200 bg-blue-100 text-xs text-blue-700">
                        Global Offer
                      </Badge>
                    ) : (
                      <Badge className="border-purple-200 bg-purple-100 text-xs text-purple-700">
                        Manager Scope
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="min-w-[100px]">
                    <StatusBadge status={offer.status} />
                  </TableCell>

                  {hasActions && (
                  <TableCell className="w-20 text-center">
                    <div className="flex justify-center">
                      <DropdownMenu
                        open={!isExpired && isMenuOpen}
                        onOpenChange={(open) =>
                          !isExpired && setOpenMenuId(open ? offer.id : null)
                        }
                      >
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isExpired}
                            className={
                              isExpired ? "cursor-disabled opacity-50" : ""
                            }
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          {onEdit && (
                            <DropdownMenuItem
                              onClick={() => handleEdit(offer)}
                            >
                              Edit
                            </DropdownMenuItem>
                          )}

                          {onToggleStatus && (isActive ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  Deactivate
                                </DropdownMenuItem>
                              </AlertDialogTrigger>

                              <AlertDialogContent className="sm:max-w-md">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-blue-600">
                                    Deactivate Offer
                                  </AlertDialogTitle>

                                  <AlertDialogDescription>
                                    Are you sure you want to deactivate this
                                    offer?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={handleCloseMenu}>
                                    Cancel
                                  </AlertDialogCancel>

                                  <AlertDialogAction
                                    onClick={() => handleToggleStatus(offer.id)}
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                  >
                                    Deactivate
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(offer.id)}
                            >
                              Activate
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
