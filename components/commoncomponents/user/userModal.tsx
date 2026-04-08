"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { createUser, updateUser } from "@/services/user";
import { getCountries, getStatesByCountry } from "@/services/location";
import { createUserSchema } from "@/lib/validators/user";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const years = Array.from(
  { length: 100 },
  (_, i) => new Date().getFullYear() - i,
);

export default function UserModal({
  open,
  setOpen,
  user,
  onSuccess,
  organizationId,
}: any) {
  const [form, setForm] = useState<any>({
    name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    country: "",
    state: "",
    is_active: true,
  });

  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      gender: "",
      dob: "",
      country: "",
      state: "",
      is_active: true,
    });
    setErrors({});
  };

  const updateField = (f: string, v: any) => {
    setForm((p: any) => ({ ...p, [f]: v }));
    setErrors((p: any) => ({ ...p, [f]: "" }));
  };

  useEffect(() => {
    if (open) getCountries().then(setCountries);
  }, [open]);

  useEffect(() => {
    if (form.country) {
      getStatesByCountry(form.country).then(setStates);
    } else {
      setStates([]);
    }
  }, [form.country]);

  useEffect(() => {
    if (open && user) {
      setForm({
        ...user,
        country: user.country_id,
        state: user.state_id,
      });
    }
  }, [open, user]);

  const handleSubmit = async () => {
    if (!user) {
      const parsed = createUserSchema.safeParse(form);

      if (!parsed.success) {
        const fieldErrors: any = {};
        parsed.error.issues.forEach((i) => {
          fieldErrors[i.path[0]] = i.message;
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setErrors({});
    setLoading(true);

    try {
      if (user) {
        await updateUser({
          id: user.id,
          name: form.name,
          phone: form.phone,
          is_active: form.is_active,
          state: form.state,
          country: form.country,
        });
      } else {
        await createUser({
          ...form,
          organizationId,
        });
      }

      setOpen(false);
      reset();
      onSuccess();
    } catch {
      console.error(user ? "Update failed" : "Create failed");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled =
    loading ||
    (!user &&
      (!form.name ||
        !form.email ||
        !form.phone ||
        !form.gender ||
        !form.dob ||
        !form.country ||
        !form.state));

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Create User"}</DialogTitle>
          <DialogDescription>
            {user ? "Update user details." : "Fill details to create user."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label required>Name</Label>
            <Input
              placeholder="Enter name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {!user && (
            <div className="space-y-1">
              <Label required>Email</Label>
              <Input
                placeholder="Enter email"
                disabled={!!user}
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
          )}

          <div className="space-y-1">
            <Label required>Phone</Label>
            <Input
              placeholder="Enter phone"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label required>Date of Birth</Label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start ${
                    errors.dob ? "border-red-500" : ""
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.dob ? format(new Date(form.dob), "PPP") : "Select Date"}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-3 rounded-lg shadow-lg border border-gray-200 space-y-3">
                <div className="flex gap-2">
                  <Select
                    value={
                      form.dob
                        ? String(new Date(form.dob).getMonth())
                        : undefined
                    }
                    onValueChange={(m) => {
                      const current = form.dob
                        ? new Date(form.dob)
                        : new Date();

                      const updated = new Date(
                        current.getFullYear(),
                        Number(m),
                        current.getDate(),
                      );

                      const newDate = updated.toLocaleDateString("en-CA");
                      updateField("dob", newDate);
                    }}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {months.map((m, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={
                      form.dob
                        ? String(new Date(form.dob).getFullYear())
                        : undefined
                    }
                    onValueChange={(y) => {
                      const current = form.dob
                        ? new Date(form.dob)
                        : new Date();

                      const updated = new Date(
                        Number(y),
                        current.getMonth(),
                        current.getDate(),
                      );

                      const newDate = updated.toLocaleDateString("en-CA");
                      updateField("dob", newDate);
                    }}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {years.map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Calendar
                  mode="single"
                  month={form.dob ? new Date(form.dob) : undefined}
                  selected={form.dob ? new Date(form.dob) : undefined}
                  onSelect={(d) => {
                    if (!d) return;

                    const local = new Date(
                      d.getFullYear(),
                      d.getMonth(),
                      d.getDate(),
                    );

                    const newDate = local.toLocaleDateString("en-CA");
                    updateField("dob", newDate);
                  }}
                />
              </PopoverContent>
            </Popover>

            {errors.dob && <p className="text-sm text-red-500">{errors.dob}</p>}
          </div>

          <div className="space-y-1">
            <Label required>Gender</Label>
            <Select
              value={form.gender}
              onValueChange={(v) => updateField("gender", v)}
            >
              <SelectTrigger
                className={`w-full ${errors.gender ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-sm text-red-500">{errors.gender}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label required>Country</Label>
            <Select
              value={form.country}
              onValueChange={(v) =>
                setForm((p: any) => ({ ...p, country: v, state: "" }))
              }
            >
              <SelectTrigger
                className={`w-full ${errors.country ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && (
              <p className="text-sm text-red-500">{errors.country}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label required>State</Label>
            <Select
              value={form.state}
              onValueChange={(v) => updateField("state", v)}
              disabled={!form.country}
            >
              <SelectTrigger
                className={`w-full ${errors.state ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent className="max-h-50">
                {states.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.state && (
              <p className="text-sm text-red-500">{errors.state}</p>
            )}
          </div>

          {user && (
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={form.is_active ? "active" : "inactive"}
                onValueChange={(v) => updateField("is_active", v === "active")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isDisabled}
            className="bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto"
          >
            {loading
              ? user
                ? "Updating..."
                : "Creating..."
              : user
                ? "Update"
                : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
