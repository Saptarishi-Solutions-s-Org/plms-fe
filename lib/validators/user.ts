import { z } from "zod";
const genderOptions = ["Male", "Female", "Other"] as const;

export const baseUserSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .nonempty("Name is required"),

  email: z
    .string()
    .email("Invalid email")
    .nonempty("Email is required"),

  phone: z
    .string()
    .regex(/^\d+$/, "Phone must contain only numbers")
    .min(10, "Phone must be at least 10 digits")
    .nonempty("Phone is required"),

  gender: z.enum(genderOptions).refine(Boolean, {
    message: "Gender is required",
  }),

  dob: z
    .string()
    .nonempty("Date of Birth is required")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid Date of Birth",
    }),

  country: z.string().nonempty("Country is required"),
  state: z.string().nonempty("State is required"),
  is_active: z.boolean().optional(),
});
export const createUserSchema = baseUserSchema;

export const editUserSchema = baseUserSchema.partial({
  email: true,
});