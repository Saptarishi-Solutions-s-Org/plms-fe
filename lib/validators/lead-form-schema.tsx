import * as z from "zod";

export const leadFormSchema = z.object({
  name: z.string().min(1, "Name is required"),

  gender: z.string().min(1, "Select gender"),

  email: z.string().min(1, "Email is required").email("Invalid email"),

  phone: z
    .string()
    .min(10, "Phone number must be max 10 digits")
    .max(10, "Phone number must be min 10 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),

  city: z.string().min(1, "City is required"),

  country: z.string().min(1, "Country is required"),

  state: z.string().min(1, "State is required"),

  postalCode: z
    .string()
    .min(6, "Postal code must be 6 digits")
    .max(6, "Postal code must be 6 digits")
    .regex(/^\d+$/, "Postal code must contain only digits"),

  leadSource: z.string().min(1, "Lead source is required"),

  status: z.string().min(1, "Status is required"),

  priority: z.string().min(1, "Priority is required"),

  notes: z.string().min(1, "Notes is required"),

  assignedTo: z.string().optional(),
});
