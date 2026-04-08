import * as z from "zod";

export const createUserSchema = z.object({
  name: z.string().min(3, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10),
  gender: z.string().min(1),
  dob: z.string().min(1),
  country: z.string().min(1),
  state: z.string().min(1),
});
