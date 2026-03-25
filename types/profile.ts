export interface Profile {
  id: string;
  name: string;
  email: string;
  employeeCode: string;
  joiningDate: string | null;
  status: string;
  shiftId?: string;
  shift?: string;
  department: string;
  role: string;
  manager: string;
  probationEndDate: string | null;
  employmentType: string;
  designation: string;
}

export interface PasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}
