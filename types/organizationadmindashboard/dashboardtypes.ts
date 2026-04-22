
export interface LeadFormData {
    name: string;
    dob: string;
    gender: string;
    email: string;
    phone: string;
    country: string;
    state: string;
    city: string;
    pinCode: string;
    userRole: string;
    reportingManager: string;
}


export interface UserDetails {
    name: string;
    email: string;
    role_name: string;
    is_active: boolean;
}

export interface AdminCardsProps {
  stats: {
    total_users: number;
    active_users: number;
    inactive_users: number;
  };
};