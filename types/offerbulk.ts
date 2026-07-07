export interface Executive {
  id: string;
  name: string;
  leadCount: number;
  activeOfferCount: number;
}
 
export interface Offer {
  id: string;
  title: string;
  description: string;
  validTo: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
}
 
export interface AssignOfferToExecutivesPayload {
  offerIds: string[];
  executiveIds: string[];
}

export interface BulkOfferAssignmentItem {
  offerId: string;
  executiveId: string;
  assignmentId: string;
}

export interface BulkOfferAssignmentSkip {
  offerId: string;
  executiveId: string;
  reason: string;
}

export interface BulkOfferAssignmentResponse {
  message: string;
  assigned: BulkOfferAssignmentItem[];
  skipped: BulkOfferAssignmentSkip[];
}
 
export interface BulkActionsDrawerProps {
  open: boolean;
  executives: Executive[];
  offers: Offer[];
  offersLoading?: boolean;
  offersError?: string | null;
  executivesLoading?: boolean;
  executivesError?: string | null;
  onClose: () => void;
  onAssignOffer?: (
    payload: AssignOfferToExecutivesPayload,
  ) => Promise<BulkOfferAssignmentResponse>;
}

export interface ExecutiveListProps {
  executives: Executive[];
  loading?: boolean;
  error?: string | null;
  selectedExecutiveIds: string[];
  onSelectExecutive: (id: string) => void;
  onSelectAllExecutives: (checked: boolean) => void;
}

export interface OfferListProps {
  offers: Offer[];
  loading?: boolean;
  error?: string | null;
  selectedOfferIds: string[];
  onSelectOffer: (id: string) => void;
  onSelectAllOffers: (checked: boolean) => void;
}