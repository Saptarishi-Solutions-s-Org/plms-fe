import * as z from "zod";

export const leadActivitySchema = z.object({
  type: z.string().min(1, "Activity type is required"),
  notes: z.string().min(1, "Notes is required"),
});
