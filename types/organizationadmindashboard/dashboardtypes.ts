
import type { ReactNode } from "react";

export interface LeadFormData {
    name: string;
    dob: Date;
    gender: string;
    email: string;
    phone: string;
    country: string;
    state: string;
    city: string;
    userRole: string;
    reportingManager: string;
}


export interface UserDetails {
    id: string;
    name: string;
    email: string;
    phone: string;
    role_name: string;
    reporting_manager_id: string | null;
    reporting_manager_name: string | null;
    is_active: boolean;
}

export interface ReportingManagerOption {
    id: string;
    name: string;
}

export interface EditUserFormData {
    name: string;
    email: string;
    phone: string;
    roleName: "Manager" | "Executive";
    reportingManager: string;
}

export interface EditUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserDetails | null;
    onSuccess?: () => void | Promise<void>;
}

export interface EditUserFieldWrapperProps {
    label: string;
    required?: boolean;
    error?: string;
    children: ReactNode;
}

export interface ReportingManagerState {
    userId: string;
    options: ReportingManagerOption[];
}

export interface AdminCardsProps {
  stats: {
    total_users: number;
    active_users: number;
    inactive_users: number;
  };
};
