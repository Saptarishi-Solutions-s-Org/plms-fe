import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Minimum 8 characters")
      .regex(/^[A-Z]/, "First letter must be capital")
      .regex(/[^A-Za-z0-9]/, "Must contain special character"),

    confirmPassword: z
      .string()
      .min(1, "Confirm password is required"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
