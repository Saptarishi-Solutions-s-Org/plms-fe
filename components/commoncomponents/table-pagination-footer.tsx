"use client";

import { useMemo } from "react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  PAGE_LIMIT_OPTIONS,
} from "@/types/pagination";
import type { PaginationProps } from "@/types/pagination";

export default function TablePaginationFooter({
  pagination,
  onPageChange,
  onLimitChange,
  placement = "bottom",
  totalLabel = "records",
}: PaginationProps) {
  const currentPage = Math.max(1, pagination.page);
  const totalPages = Math.max(1, pagination.totalPages);
  const limit = pagination.limit;
  const previousDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;

  const limitOptions = useMemo(() => {
    const options = new Set<number>(PAGE_LIMIT_OPTIONS);

    if (limit > 0) {
      options.add(limit);
    }

    return [...options].sort((firstOption, secondOption) => {
      return firstOption - secondOption;
    });
  }, [limit]);

  const visiblePages = useMemo(() => {
    return getVisiblePageNumbers(currentPage, totalPages);
  }, [currentPage, totalPages]);

  const previousControl = (compact = false) => (
    <PaginationPrevious
      href="#"
      aria-disabled={previousDisabled}
      tabIndex={previousDisabled ? -1 : undefined}
      onClick={(event) => {
        event.preventDefault();

        if (!previousDisabled) {
          onPageChange(currentPage - 1);
        }
      }}
      className={cn(
        compact ? "h-7 text-xs" : "h-8 text-sm",
        previousDisabled && "pointer-events-none opacity-50",
      )}
    />
  );

  const nextControl = (compact = false) => (
    <PaginationNext
      href="#"
      aria-disabled={nextDisabled}
      tabIndex={nextDisabled ? -1 : undefined}
      onClick={(event) => {
        event.preventDefault();

        if (!nextDisabled) {
          onPageChange(currentPage + 1);
        }
      }}
      className={cn(
        compact ? "h-7 text-xs" : "h-8 text-sm",
        nextDisabled && "pointer-events-none opacity-50",
      )}
    />
  );

  const paginationNav = (compact = false) => (
    <Pagination
      className={cn(
        "mx-0 w-full justify-center overflow-x-auto sm:w-auto sm:justify-start scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
        placement === "top" && "justify-end",
      )}
    >
      <PaginationContent className={compact ? "gap-2" : "gap-3"}>
        <PaginationItem>{previousControl(compact)}</PaginationItem>
        {visiblePages.map((page, index) =>
          page === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis className={compact ? "size-7" : "size-8"} />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                isActive={page === currentPage}
                onClick={(event) => {
                  event.preventDefault();
                  onPageChange(page);
                }}
                className={cn(
                  compact
                    ? "size-7 rounded-md text-xs"
                    : "size-8 rounded-md text-sm",
                  "border border-slate-200 bg-white font-medium text-black hover:bg-slate-50",
                  page === currentPage &&
                    "border-[#6C63FF] bg-[#6C63FF] text-white hover:bg-[#6C63FF] hover:text-white",
                )}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>{nextControl(compact)}</PaginationItem>
      </PaginationContent>
    </Pagination>
  );

  if (placement === "top") {
    return (
      <div className="mb-3 hidden justify-end sm:flex">
        {paginationNav(true)}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 px-3 py-3 text-sm text-slate-600 sm:flex-row sm:justify-between">
      {paginationNav(false)}
      <div className="flex w-full flex-wrap items-center justify-center gap-3 sm:w-auto sm:justify-end">
        <Select
          value={String(limit)}
          onValueChange={(value) => onLimitChange(Number(value))}
        >
          <SelectTrigger className="h-9 w-36 rounded-xl border-slate-200 px-3 text-sm text-slate-700 shadow-none">
            <span>Showing</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {limitOptions.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="whitespace-nowrap text-sm text-black">
          of {pagination.total} {totalLabel}
        </span>
      </div>
    </div>
  );
}

function getVisiblePageNumbers(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
}
