import * as z from "zod";

export const leadActivitySchema = z.object({
    notes: z.string().min(1, "Notes is required"),
});