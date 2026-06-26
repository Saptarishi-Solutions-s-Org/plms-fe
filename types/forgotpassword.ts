export type ForgotPasswordForm = {
  email: string;
};

export type ResetPasswordForm = {
  password: string;
  confirmPassword: string;
};

export type ResetPasswordPayload = {
  token: string;
  newPassword: string;
  confirmPassword: string;
};
