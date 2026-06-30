"use client";

import TablePaginationFooter, {
  type TablePaginationPlacement,
} from "@/components/commoncomponents/table-pagination-footer";
import type { PaginationMeta } from "@/types/pagination";

type LeadPaginationProps = {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  placement?: TablePaginationPlacement;
};

export default function LeadPagination(props: LeadPaginationProps) {
  return <TablePaginationFooter {...props} totalLabel="leads" />;
}
