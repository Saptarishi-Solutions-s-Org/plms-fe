import { api } from "@/lib/api";
import type {
  ForgotPasswordForm,
  ResetPasswordForm,
  ResetPasswordPayload,
} from "@/types/forgotpassword";

export const forgotPassword = (payload: ForgotPasswordForm) =>
  api("/odata/v4/auth/forgotPassword", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const resetPassword = (payload: ResetPasswordPayload) =>
  api("/odata/v4/auth/resetPassword", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const setPassword = (payload: ResetPasswordForm) =>
  api("/odata/v4/auth/setPassword", {
    method: "POST",
    body: JSON.stringify(payload),
  });
