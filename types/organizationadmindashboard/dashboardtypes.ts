
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

export interface AdminCardsProps {
  stats: {
    total_users: number;
    active_users: number;
    inactive_users: number;
  };
};
