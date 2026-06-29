"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PAGE_LIMIT_OPTIONS,
  type PaginationMeta,
} from "@/types/pagination";

type LeadPaginationProps = {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

export default function LeadPagination({
  pagination,
  onPageChange,
  onLimitChange,
}: LeadPaginationProps) {
  const canGoPrevious = pagination.page > 1;
  const canGoNext = pagination.page < pagination.totalPages;

  return (
    <div className="mx-2 mb-3 flex flex-col gap-3 border-t border-gray-100 px-3 py-4 sm:mx-0 sm:flex-row sm:items-center sm:justify-between sm:px-4">
      <p className="text-sm text-gray-500">
        Showing page {pagination.page} of {pagination.totalPages} -{" "}
        {pagination.total} total leads
      </p>

      <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-end">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Rows</span>
          <Select
            value={String(pagination.limit)}
            onValueChange={(value) => onLimitChange(Number(value))}
          >
            <SelectTrigger className="h-9 w-[92px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_LIMIT_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canGoPrevious}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canGoNext}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
