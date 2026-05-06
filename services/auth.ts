import { api } from "@/lib/api";

export const loginUser = async (email: string, password: string) => {
  return api("/odata/v4/auth/login", {
    method: "POST",

    body: JSON.stringify({
      email,
      password,
    }),
  });
};

export const logoutUser = async () => {
  return api("/odata/v4/auth/logout", {
    method: "POST",
  });
};

export const getMe = async () => {
  return api("/odata/v4/auth/me");
};
