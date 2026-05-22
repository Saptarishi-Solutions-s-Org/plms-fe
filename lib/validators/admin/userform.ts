import { z} from "zod";

export const userFormSchema = z.object({
  name: z
    .string()
    .min(1, "First Name is required")
    .max(50),

    email: z.string().min(1, "Email is required").email("Invalid email format"),

      dob: z.date().min(new Date("1900-01-01"), "Date is required"),

    phone : z.string().min(1, "Phone number is required").max(20),

    gender : z.string().min(1, "Gender is required").max(20),

    country : z.string().min(1, "Country is required").max(100),

    state : z.string().min(1, "State is required").max(100),

    city : z.string().min(1, "City is required").max(100),
    
    userRole : z.string().min(1, "User role is required").max(50),

    reportingManager : z.string().optional(),
});