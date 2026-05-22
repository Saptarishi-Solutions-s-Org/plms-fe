import * as z from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(3, "Organization name is required"),

  email: z.string().email("Invalid email"),

  phone: z.string().min(10, "Phone must be at least 10 digits").max(15),

  address: z.string().min(5, "Address is required"),

  country: z.string().min(1, "Country is required"),

  state: z.string().min(1, "State is required"),

  trial: z.enum(["Free", "Premium"]),
});
