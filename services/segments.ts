import { api } from "@/lib/api";
import { buildApiFunctionUrl } from "@/lib/api-function-url";

export type GetSegmentsParams = {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  is_active?: boolean | string;
};

export const getSegments = (params?: GetSegmentsParams) =>
  api(buildApiFunctionUrl("/odata/v4/segment/getSegments", params));

export const getSegmentByCode = (code: string) =>
  api(`/odata/v4/segment/getSegmentByCode(code='${code}')`);

export const getActiveFilterTypes = () =>
  api("/odata/v4/segment/getActiveFilterTypes()");

export const previewSegment = (payload: {
  type: string;
  filters: any[];
  static_lead_ids: string[];
}) =>
  api("/odata/v4/segment/previewSegment", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const saveSegment = (payload: {
  id?: string;
  name: string;
  description?: string;
  type: string;
  color?: string;
  notes?: string;
  is_active?: boolean;
  filters: any[];
  static_lead_ids: string[];
}) =>
  api("/odata/v4/segment/saveSegment", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const deleteSegment = (id: string) =>
  api("/odata/v4/segment/deleteSegment", {
    method: "POST",
    body: JSON.stringify({ id }),
  });

export const assignOffersToSegment = (payload: {
  segmentId: string;
  offerIds: string[];
}) =>
  api("/odata/v4/segment/assignOffersToSegment", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getSegmentAuditHistory = (params: {
  segmentId: string;
  page?: number;
  limit?: number;
}) =>
  api(buildApiFunctionUrl("/odata/v4/segment/getSegmentAuditHistory", params));

export const exportSegment = (code: string) =>
  api(`/odata/v4/segment/exportSegment(code='${code}')`);

export const toggleSegmentFilter = (orgFilterId: string, is_enabled: boolean) =>
  api("/odata/v4/segment/toggleSegmentFilter", {
    method: "POST",
    body: JSON.stringify({ orgFilterId, is_enabled }),
  });
