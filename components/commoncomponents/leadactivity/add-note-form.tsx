"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { leadActivitySchema } from "@/lib/validators/lead-activity-schema";
import { addLeadActivity } from "@/services/leads";
import { AddNoteFormProps } from "@/types/leadActivity";

export default function AddNoteForm({ leadId, onAdded }: AddNoteFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(leadActivitySchema),
    defaultValues: {
      notes: "",
    },
  });

  const onValid = async (data: { notes: string }) => {
    setLoading(true);
    try {
      await addLeadActivity(leadId, data);
      reset();
      onAdded();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      className="flex flex-col rounded-xl border border-gray-200 bg-white"
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-gray-800">
          Activity & Notes
        </h2>
        <Button
          type="submit"
          size="sm"
          disabled={loading}
          className="bg-blue-600 text-xs hover:bg-blue-700"
        >
          {loading ? "Adding..." : "Add Note"}
        </Button>
      </div>

      <div className="flex flex-1 flex-col space-y-1 px-5 pb-3 pt-4">
        <Label required>Notes</Label>
        <Textarea
          placeholder="Write a note or activity..."
          className={`min-h-[96px] resize-none ${
            errors.notes ? "border-red-500" : ""
          }`}
          {...register("notes")}
        />
        {errors.notes?.message && (
          <p className="text-sm text-red-500">{errors.notes.message}</p>
        )}
      </div>
    </form>
  );
}
