import { api } from "@/lib/api";
import type {
  ChangePasswordPayload,
  Profile,
  UpdateProfilePayload,
} from "@/types/profile";

export const getProfile = (): Promise<Profile> =>
  api("/odata/v4/profile/getProfile()");

export const updateProfile = (payload: UpdateProfilePayload) =>
  api("/odata/v4/profile/updateProfile", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const changePassword = (payload: ChangePasswordPayload) =>
  api("/odata/v4/profile/changePassword", {
    method: "POST",
    body: JSON.stringify(payload),
  });
