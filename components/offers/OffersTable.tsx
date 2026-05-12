"use client"

import { memo, useCallback, useState } from "react"

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

// ─── Constants (moved outside component to prevent recreation) ───

const DISCOUNT_TYPE_LABELS = {
  fixed: "Fixed Amount",
  percentage: "Percentage",
  combo: "Combo Offer",
  bogo: "Buy One Get One",
  conditional: "Conditional",
  flag: "Flag Discount",
} as const

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

// ─── Memoized Sub-components ─────────────────────────────────────

const StatusBadge = memo(({ status }: { status: string }) => {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || DEFAULT_STATUS_CONFIG

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
})

StatusBadge.displayName = 'StatusBadge'

const DiscountSummary = memo(({ offer }: { offer: Offer }) => {
  switch (offer.discountType) {
    case "fixed":
      return <span>₹{offer.discountAmount}</span>

    case "percentage":
      return (
        <span>
          {offer.discountPercentage}% (max ₹{offer.maxDiscountAmount})
        </span>
      )

    case "combo":
      return (
        <span
          className="truncate max-w-[160px] block"
          title={offer.comboDescription}
        >
          {offer.comboDescription}
        </span>
      )

    case "bogo":
      return (
        <span>
          Buy {offer.buyQuantity} Get {offer.getQuantity}
        </span>
      )

    case "conditional":
      return (
        <span>
          Min ₹{offer.minPurchaseAmount} → ₹{offer.conditionalDiscountValue} off
        </span>
      )

    case "flag":
      return <span>₹{offer.flagDiscountAmount}</span>

    default:
      return <span>—</span>
  }
})

DiscountSummary.displayName = 'DiscountSummary'

// ─── Props ────────────────────────────────────────────────────────

interface OffersTableProps {
  offers: Offer[]
  onToggleStatus: (id: string) => void
}

// ─── Main Component ───────────────────────────────────────────────

export const OffersTable = memo(function OffersTable({
  offers,
  onToggleStatus,
}: OffersTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const handleCloseMenu = useCallback(() => {
    setOpenMenuId(null)
  }, [])

  const handleToggleStatus = useCallback((id: string) => {
    onToggleStatus(id)
    setOpenMenuId(null)
  }, [onToggleStatus])

  if (!offers?.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm font-medium">No offers found</p>
          <p className="text-xs mt-1">Create your first offer to get started</p>
        </div>
      </div>
    )
  }

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
          {offers.map((offer, index) => (
            <OfferRow
              key={offer.id}
              offer={offer}
              index={index}
              openMenuId={openMenuId}
              onMenuOpenChange={setOpenMenuId}
              onToggleStatus={handleToggleStatus}
              onCloseMenu={handleCloseMenu}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
})

// ─── Row Component (memoized for better performance) ─────────────

const OfferRow = memo(function OfferRow({
  offer,
  index,
  openMenuId,
  onMenuOpenChange,
  onToggleStatus,
  onCloseMenu,
}: {
  offer: Offer
  index: number
  openMenuId: string | null
  onMenuOpenChange: (id: string | null) => void
  onToggleStatus: (id: string) => void
  onCloseMenu: () => void
}) {
  const isExpired = offer.status === "expired"
  const isActive = offer.status === "active"
  const isMenuOpen = openMenuId === offer.id

  return (
    <TableRow className={isExpired ? "opacity-60" : ""}>
      <TableCell className="text-gray-500 text-sm">{index + 1}</TableCell>
      
      <TableCell>
        <span className="font-medium text-sm text-gray-800">{offer.title}</span>
      </TableCell>
      
      <TableCell className="text-sm text-gray-600 max-w-[220px] truncate">
        {offer.description || "—"}
      </TableCell>
      
      <TableCell>
        {offer.isGlobal ? (
          <Badge variant="secondary">Global Offer</Badge>
        ) : (
          <Badge variant="outline">Assigned</Badge>
        )}
      </TableCell>
      
      <TableCell className="text-sm text-gray-600">
        {offer.isGlobal ? "All Users" : offer.assignedUsers || "Assigned Users"}
      </TableCell>
      
      <TableCell>
        <span className="text-sm text-gray-700">
          {DISCOUNT_TYPE_LABELS[offer.discountType as keyof typeof DISCOUNT_TYPE_LABELS] ?? offer.discountType}
        </span>
      </TableCell>
      
      <TableCell className="text-sm text-gray-600">
        <DiscountSummary offer={offer} />
      </TableCell>
      
      <TableCell className="text-sm text-gray-600">
        {offer.validFrom ? formatDate(offer.validFrom) : "—"}
      </TableCell>
      
      <TableCell className="text-sm text-gray-600">
        {offer.validTo ? formatDate(offer.validTo) : "—"}
      </TableCell>
      
      <TableCell>
        <StatusBadge status={offer.status} />
      </TableCell>
      
      <TableCell className="text-right">
        {!isExpired && (
          <DropdownMenu open={isMenuOpen} onOpenChange={(open) => onMenuOpenChange(open ? offer.id : null)}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end">
              {isActive ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      Deactivate
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  
                  <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-blue-600">
                        Deactivate Offer
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to deactivate this offer?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onToggleStatus(offer.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Deactivate
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <DropdownMenuItem onClick={() => onToggleStatus(offer.id)}>
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

OfferRow.displayName = 'OfferRow'