"use client"

import { useCallback, useState } from "react"

import type { Offer } from "@/types/offer"
import { formatDate } from "@/lib/validators/offervalidation"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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
} from "@/components/ui/alert-dialog"

import { Button } from "@/components/ui/button"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Badge } from "@/components/ui/badge"
import { MoreHorizontal } from "lucide-react"

const DISCOUNT_TYPE_LABELS: Record<string, string> = {
  Fixed_Amount: "Fixed Amount",
  Percentage: "Percentage",
  Combo_Offer: "Combo Offer",
  Buy_One_Get_One_Free: "Buy One Get One",
  Conditional_Discount: "Conditional",
  Flag_Discount: "Flag Discount",
}

const STATUS_CONFIG = {
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
} as const

const DEFAULT_STATUS_CONFIG = {
  dot: "bg-gray-400",
  text: "text-gray-600",
  bg: "bg-gray-50 border-gray-200",
} as const

function StatusBadge({ status }: { status: string }) {
  const config =
    STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ||
    DEFAULT_STATUS_CONFIG

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function DiscountSummary({ offer }: { offer: Offer }) {
  switch (offer.discountType) {
    case "Fixed_Amount":
      return <span>₹{offer.discountAmount}</span>

    case "Percentage":
      return (
        <span>
          {offer.discountPercentage}% (max ₹{offer.maxDiscountAmount})
        </span>
      )

    case "Combo_Offer":
      return (
        <span
          className="truncate max-w-[160px] block"
          title={offer.comboDescription}
        >
          {offer.comboDescription}
        </span>
      )

    case "Buy_One_Get_One_Free":
      return (
        <span>
          Buy {offer.buyQuantity} Get {offer.getQuantity}
        </span>
      )

    case "Conditional_Discount":
      return (
        <span>
          Min ₹{offer.minPurchaseAmount} → ₹
          {offer.conditionalDiscountValue} off
        </span>
      )

    case "Flag_Discount":
      return <span>₹{offer.flagDiscountAmount}</span>

    default:
      return <span>—</span>
  }
}

interface OffersTableProps {
  offers: Offer[]
  onToggleStatus: (id: string) => void
}

export function OffersTable({
  offers,
  onToggleStatus,
}: OffersTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const handleCloseMenu = useCallback(() => {
    setOpenMenuId(null)
  }, [])

  const handleToggleStatus = useCallback(
    (id: string) => {
      onToggleStatus(id)
      setOpenMenuId(null)
    },
    [onToggleStatus]
  )

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-x-auto">
      <Table>
        <TableHeader className="bg-[#7677F41A]">
          <TableRow>
            <TableHead className="w-12">S.No</TableHead>
            <TableHead>Offer Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Offer Type</TableHead>
            <TableHead>Assigned</TableHead>
            <TableHead>Discount Type</TableHead>
            <TableHead>Discount Value</TableHead>
            <TableHead>Valid From</TableHead>
            <TableHead>Valid To</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {!offers?.length ? (
            <TableRow>
              <TableCell colSpan={11} className="h-40 text-center">
                <p className="text-sm font-medium text-gray-500">
                  No offers found
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Create your first offer to get started
                </p>
              </TableCell>
            </TableRow>
          ) : (
            offers.map((offer, index) => {
              const isExpired = offer.status === "expired"
              const isActive = offer.status === "active"
              const isMenuOpen = openMenuId === offer.id

              return (
                <TableRow
                  key={offer.id}
                  className="hover:bg-gray-50/60"
                >
                  <TableCell className="text-gray-500 text-sm">
                    {index + 1}
                  </TableCell>

                  <TableCell>
                    <span className="font-medium text-sm text-gray-800">
                      {offer.title}
                    </span>
                  </TableCell>

                  <TableCell className="text-sm text-gray-600 max-w-[220px] truncate">
                    {offer.description || "—"}
                  </TableCell>

                  <TableCell>
                    {offer.isGlobal ? (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                        Global Offer
                      </Badge>
                    ) : (
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                        Assigned
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-sm text-gray-600">
                    {offer.isGlobal
                      ? "All Users"
                      : offer.assignedUsers || "—"}
                  </TableCell>

                  <TableCell className="text-sm text-gray-700">
                    {DISCOUNT_TYPE_LABELS[offer.discountType] ??
                      offer.discountType ??
                      "—"}
                  </TableCell>

                  <TableCell className="text-sm text-gray-600">
                    <DiscountSummary offer={offer} />
                  </TableCell>

                  <TableCell className="text-sm text-gray-600">
                    {offer.validFrom
                      ? formatDate(offer.validFrom)
                      : "—"}
                  </TableCell>

                  <TableCell className="text-sm text-gray-600">
                    {offer.validTo
                      ? formatDate(offer.validTo)
                      : "—"}
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={offer.status} />
                  </TableCell>

                  <TableCell className="text-right">
                    {!isExpired && (
                      <DropdownMenu
                        open={isMenuOpen}
                        onOpenChange={(open) =>
                          setOpenMenuId(open ? offer.id : null)
                        }
                      >
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          {isActive ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) =>
                                    e.preventDefault()
                                  }
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
                                    Are you sure you want to
                                    deactivate this offer?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                  <AlertDialogCancel
                                    onClick={handleCloseMenu}
                                  >
                                    Cancel
                                  </AlertDialogCancel>

                                  <AlertDialogAction
                                    onClick={() =>
                                      handleToggleStatus(
                                        offer.id
                                      )
                                    }
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    Deactivate
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleStatus(offer.id)
                              }
                            >
                              Activate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}