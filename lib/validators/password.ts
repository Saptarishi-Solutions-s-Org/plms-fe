import { z } from "zod";

export const PASSWORD_RULE_MESSAGE =
  "Password must be at least 8 characters and include 1 capital letter, 1 number, and 1 special character.";

export const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Minimum 8 characters")
  .regex(/[A-Z]/, "Must contain 1 capital letter")
  .regex(/[0-9]/, "Must contain 1 number")
  .regex(/[^A-Za-z0-9]/, "Must contain 1 special character");

export const confirmPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from old password",
    path: ["newPassword"],
  });
