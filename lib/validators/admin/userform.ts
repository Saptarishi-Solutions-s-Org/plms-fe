import { z } from "zod";

export const userFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "First Name is required")
    .max(50, "First Name cannot exceed 50 characters"),

  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email format"),

  dob: z.date({
    message: "Date is required",
  }),

  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),

  gender: z
    .string()
    .min(1, "Gender is required"),

  country: z
    .string()
    .min(1, "Country is required"),

  state: z
    .string()
    .min(1, "State is required"),

  city: z
    .string()
    .trim()
    .min(1, "City is required")
    .max(100, "City cannot exceed 100 characters"),

  userRole: z
    .string()
    .min(1, "User role is required"),

  reportingManager: z.string().optional(),
});