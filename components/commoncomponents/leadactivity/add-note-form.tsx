"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { leadActivitySchema } from "@/lib/validators/lead-activity-schema";
import { addLeadActivity } from "@/services/leads";
import { AddNoteFormProps } from "@/types/leadActivity";
import type { AddActivityFormData } from "@/types/leadtypes";

const ACTIVITY_TYPE_OPTIONS = [
  { value: "Call", label: "Call" },
  { value: "Email", label: "Email" },
  { value: "Meeting", label: "Meeting" },
  { value: "Follow_Up", label: "Follow Up" },
  { value: "Note", label: "Note" },
];

export default function AddNoteForm({ leadId, onAdded }: AddNoteFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddActivityFormData>({
    resolver: zodResolver(leadActivitySchema),
    defaultValues: {
      type: "",
      notes: "",
    },
  });

  const onValid = async (data: AddActivityFormData) => {
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
      className="flex flex-col rounded-xl border border-gray-300 bg-white"
    >
      <div className="flex h-14 items-center justify-between border-b border-gray-200 p-4">
        <h2 className="text-base font-semibold text-gray-800">
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

      <div className="flex flex-col gap-2.5 px-5 pb-3 pt-3">
        <div className="flex w-full flex-col gap-1">
          <Label required>Activity Type</Label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className={`w-full ${
                    errors.type ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select activity type" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.type?.message && (
            <p className="text-sm text-red-500">{errors.type.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Label required>Notes</Label>
          <Textarea
            placeholder="Write a note or activity..."
            className={`h-[84px] field-sizing-fixed resize-y ${
              errors.notes ? "border-red-500" : ""
            }`}
            {...register("notes")}
          />
          <p className="min-h-5 text-sm text-red-500">
            {errors.notes?.message}
          </p>
        </div>
      </div>
    </form>
  );
}
