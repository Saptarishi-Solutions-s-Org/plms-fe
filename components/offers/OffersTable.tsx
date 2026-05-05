"use client"

import type { Offer } from "@/types/offer"
import { formatDate } from "@/lib/offer-utils"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal } from "lucide-react"

// ─── Discount type label map ───────────────────────────────────────────────────

const DISCOUNT_TYPE_LABELS: Record<string, string> = {
  fixed:       "Fixed Amount",
  percentage:  "Percentage",
  combo:       "Combo Offer",
  bogo:        "Buy One Get One",
  conditional: "Conditional",
  flag:        "Flag Discount",
}

// ─── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config = {
    active:   { dot: "bg-green-500",  text: "text-green-700",  bg: "bg-green-50  border-green-200" },
    inactive: { dot: "bg-gray-400",   text: "text-gray-600",   bg: "bg-gray-50   border-gray-200"  },
    expired:  { dot: "bg-red-400",    text: "text-red-600",    bg: "bg-red-50    border-red-200"   },
  }[status] ?? {  dot: "bg-gray-400", text: "text-gray-600",   bg: "bg-gray-50   border-gray-200"  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

// ─── Discount value summary ────────────────────────────────────────────────────

function DiscountSummary({ offer }: { offer: Offer }) {
  switch (offer.discountType) {
    case "fixed":
      return <span>₹{offer.discountAmount}</span>
    case "percentage":
      return <span>{offer.discountPercentage}% (max ₹{offer.maxDiscountAmount})</span>
    case "combo":
      return (
        <span className="truncate max-w-[160px] block" title={offer.comboDescription}>
          {offer.comboDescription}
        </span>
      )
    case "bogo":
      return <span>Buy {offer.buyQuantity} Get {offer.getQuantity}</span>
    case "conditional":
      return <span>Min ₹{offer.minPurchaseAmount} → ₹{offer.conditionalDiscountValue} off</span>
    case "flag":
      return <span>₹{offer.flagDiscountAmount}</span>
    default:
      return <span>—</span>
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface OffersTableProps {
  offers: Offer[]
  onToggleStatus: (id: string) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OffersTable({ offers, onToggleStatus }: OffersTableProps) {

  if (!offers || offers.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-sm font-medium">No offers found</p>
        <p className="text-xs mt-1">Create your first offer to get started</p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>

        <TableHeader className="bg-[#7677F41A]">
          <TableRow>
            <TableHead className="w-12">S.No</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Discount Type</TableHead>
            <TableHead>Discount Value</TableHead>
            <TableHead>Valid From</TableHead>
            <TableHead>Valid To</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {offers.map((offer, index) => {
            const isExpired  = offer.status === "expired"
            const isActive   = offer.status === "active"

            return (
              <TableRow key={offer.id} className={isExpired ? "opacity-60" : ""}>

                {/* S.No */}
                <TableCell className="text-gray-500 text-sm">{index + 1}</TableCell>

                {/* Title + description */}
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-sm">{offer.title}</span>
                    {offer.description && (
                      <span className="text-xs text-gray-400 line-clamp-1">
                        {offer.description}
                      </span>
                    )}
                    {offer.isGlobal && (
                      <Badge variant="secondary" className="w-fit text-[10px] px-1.5 py-0 mt-0.5">
                        Global
                      </Badge>
                    )}
                  </div>
                </TableCell>

                {/* Discount type */}
                <TableCell>
                  <span className="text-sm text-gray-700">
                    {DISCOUNT_TYPE_LABELS[offer.discountType] ?? offer.discountType}
                  </span>
                </TableCell>

                {/* Discount value summary */}
                <TableCell className="text-sm text-gray-600">
                  <DiscountSummary offer={offer} />
                </TableCell>

                {/* Valid From */}
                <TableCell className="text-sm text-gray-600">
                  {offer.validFrom ? formatDate(offer.validFrom) : "—"}
                </TableCell>

                {/* Valid To */}
                <TableCell className="text-sm text-gray-600">
                  {offer.validTo ? formatDate(offer.validTo) : "—"}
                </TableCell>

                {/* Status */}
                <TableCell>
                  <StatusBadge status={offer.status} />
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onToggleStatus(offer.id)}
                        disabled={isExpired}
                        className={isExpired ? "text-gray-400 cursor-not-allowed" : ""}
                      >
                        {isActive ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>

              </TableRow>
            )
          })}
        </TableBody>

      </Table>
    </div>
  )
}