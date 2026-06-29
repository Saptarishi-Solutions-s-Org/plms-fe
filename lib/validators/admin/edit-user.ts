import { z } from "zod";

export const editUser = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(50, "Name cannot exceed 50 characters"),
    email: z.string().trim().email("Enter a valid email address"),
    phone: z
      .string()
      .trim()
      .regex(/^\d{10}$/, "Phone number must contain exactly 10 digits"),
    roleName: z.enum(["Manager", "Executive"]),
    reportingManager: z.string(),
  })
  .refine(
    (data) =>
      data.roleName !== "Executive" || data.reportingManager.length > 0,
    {
      path: ["reportingManager"],
      message: "Reporting manager is required for an Executive",
    },
  );
