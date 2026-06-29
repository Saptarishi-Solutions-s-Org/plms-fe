"use client";

import { useEffect, useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getReportingManagers,
  updateOrganizationUser,
} from "@/services/organizationAdmin";
import type {
  ReportingManagerOption,
  UserDetails,
} from "@/types/organizationadmindashboard/dashboardtypes";

const editUserSchema = z
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

type EditUserForm = z.infer<typeof editUserSchema>;

const EMPTY_FORM: EditUserForm = {
  name: "",
  email: "",
  phone: "",
  roleName: "Executive",
  reportingManager: "",
};

function getInitialForm(user: UserDetails | null): EditUserForm {
  if (!user) return EMPTY_FORM;

  return {
    name: user.name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    roleName: user.role_name === "Manager" ? "Manager" : "Executive",
    reportingManager: user.reporting_manager_id ?? "",
  };
}

function FieldWrapper({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label required={required} className="text-sm font-normal text-gray-700">
        {label}
      </Label>
      <div
        className={
          error
            ? "[&_input]:border-red-500 [&_[role=combobox]]:border-red-500"
            : ""
        }
      >
        {children}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserDetails | null;
  onSuccess?: () => void | Promise<void>;
};

type ManagerState = {
  userId: string;
  options: ReportingManagerOption[];
};

export default function EditUserDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: Props) {
  const [managerState, setManagerState] = useState<ManagerState | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
    defaultValues: EMPTY_FORM,
  });

  const roleName = useWatch({ control, name: "roleName" });
  const hasManagerData =
    managerState !== null && managerState.userId === user?.id;
  const managers =
    managerState !== null && managerState.userId === user?.id
      ? managerState.options
      : [];
  const isLoadingManagers = Boolean(open && user && !hasManagerData);

  useEffect(() => {
    if (!open || !user) return;

    let cancelled = false;

    reset(getInitialForm(user));

    getReportingManagers()
      .then((data) => {
        if (cancelled) return;

        const availableManagers = data.filter(
          (manager: ReportingManagerOption) => manager.id !== user.id,
        );

        if (
          user.reporting_manager_id &&
          user.reporting_manager_name &&
          !availableManagers.some(
            (manager: ReportingManagerOption) =>
              manager.id === user.reporting_manager_id,
          )
        ) {
          availableManagers.unshift({
            id: user.reporting_manager_id,
            name: user.reporting_manager_name,
          });
        }

        setManagerState({ userId: user.id, options: availableManagers });
      })
      .catch(() => {
        if (cancelled) return;
        setManagerState({ userId: user.id, options: [] });
        toast.error("Failed to load reporting managers");
      });

    return () => {
      cancelled = true;
    };
  }, [open, reset, user]);

  const onValid = async (data: EditUserForm) => {
    if (!user) return;

    try {
      await updateOrganizationUser({
        id: user.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        roleName: data.roleName,
        reportingManager:
          data.roleName === "Manager" ? null : data.reportingManager,
      });
      toast.success("User updated successfully");
      onOpenChange(false);
      await onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update user",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] w-full max-w-[50rem] overflow-y-auto px-6 py-6">
        <DialogHeader className="pb-3">
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update the user&apos;s account and reporting details.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onValid)}
          className="flex flex-col gap-5 py-2"
        >
          <section>
            <h3 className="mb-3 text-sm font-semibold text-blue-600">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldWrapper
                label="Name"
                required
                error={errors.name?.message}
              >
                <Input placeholder="Enter the Name" {...register("name")} />
              </FieldWrapper>

              <FieldWrapper
                label="Phone Number"
                required
                error={errors.phone?.message}
              >
                <Input
                  inputMode="numeric"
                  placeholder="Enter the Phone Number"
                  {...register("phone")}
                />
              </FieldWrapper>

              <FieldWrapper
                label="Email"
                required
                error={errors.email?.message}
              >
                <Input
                  type="email"
                  placeholder="Enter The Mail"
                  {...register("email")}
                />
              </FieldWrapper>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-blue-600">
              Role &amp; Reporting
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldWrapper
                label="Role"
                required
                error={errors.roleName?.message}
              >
                <Controller
                  name="roleName"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value: EditUserForm["roleName"]) => {
                        field.onChange(value);
                        setValue(
                          "reportingManager",
                          value === "Executive" &&
                            user?.role_name === "Executive"
                            ? user.reporting_manager_id ?? ""
                            : "",
                          { shouldDirty: true, shouldValidate: true },
                        );
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Executive">Executive</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FieldWrapper>

              {roleName === "Executive" && (
                <FieldWrapper
                  label="Reporting Manager"
                  required
                  error={errors.reportingManager?.message}
                >
                  <Controller
                    name="reportingManager"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLoadingManagers}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              isLoadingManagers
                                ? "Loading managers..."
                                : "Select reporting manager"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {managers.map((manager) => (
                            <SelectItem key={manager.id} value={manager.id}>
                              {manager.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FieldWrapper>
              )}
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !user || !isDirty}
              className="min-w-[140px] bg-blue-600 text-white hover:bg-blue-700"
            >
              {isSubmitting ? "Updating..." : "Update User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
