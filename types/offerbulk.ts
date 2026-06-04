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
  status: "ACTIVE" | "INACTIVE";
}
 
export interface AssignOfferToExecutivesPayload {
  offerId: string;
  executiveIds: string[];
}

export interface BulkAssignFailure {
  executiveId: string;
  message: string;
}

export interface BulkAssignResult {
  offerId: string;
  successCount: number;
  failureCount: number;
  failures: BulkAssignFailure[];
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
    payload: AssignOfferToExecutivesPayload
  ) => Promise<BulkAssignResult>;
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