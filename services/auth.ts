import { api } from "@/lib/api";
import type { ResetPasswordForm } from "@/types/forgotpassword";

export const setPassword = (payload: ResetPasswordForm) =>
  api("/odata/v4/auth/setPassword", {
    method: "POST",
    body: JSON.stringify(payload),
  });
