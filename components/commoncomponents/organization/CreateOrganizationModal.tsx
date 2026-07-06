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

import {
  createOrganization,
  updateOrganization,
} from "@/services/organization";
import { getCountries, getStatesByCountry } from "@/services/location";
import { createOrganizationSchema } from "@/lib/validators/organization";

export default function CreateOrganizationModal({
  open,
  setOpen,
  onSuccess,
  org,
}: any) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    country: "",
    state: "",
    trial: "",
    is_active: true,
  });

  const [errors, setErrors] = useState<any>({});
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      address: "",
      country: "",
      state: "",
      trial: "",
      is_active: true,
    });
    setErrors({});
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev: any) => ({ ...prev, [field]: "" }));
  };

  useEffect(() => {
    if (open) {
      getCountries().then(setCountries);
    }
  }, [open]);

  useEffect(() => {
    if (form.country) {
      getStatesByCountry(form.country).then(setStates);
    } else {
      setStates([]);
    }
  }, [form.country]);

  // 🔥 PREFILL (NO UI CHANGE)
  useEffect(() => {
    if (open && org) {
      setForm({
        name: org.name || "",
        email: org.email || "",
        phone: org.phone || "",
        address: org.address || "",
        country: org.country_id || "",
        state: org.state_id || "",
        trial: org.trial || "",
        is_active: org.is_active,
      });
    }
  }, [open, org]);

  const handleSubmit = async () => {
    if (!org) {
      const parsed = createOrganizationSchema.safeParse(form);

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
      if (org) {
        await updateOrganization({
          id: org.id,
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          state: form.state,
          country: form.country,
          trial: form.trial,
          is_active: form.is_active,
        });
      } else {
        await createOrganization(form);
      }

      setOpen(false);
      reset();
      onSuccess();
    } catch {
      console.error(org ? "Update failed" : "Create failed");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled =
    loading ||
    (!org &&
      (!form.name ||
        !form.email ||
        !form.phone ||
        !form.address ||
        !form.country ||
        !form.state ||
        !form.trial));

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
          <DialogTitle>
            {org ? "Edit Organization" : "Create Organization"}
          </DialogTitle>
          <DialogDescription>
            {org
              ? "Update organization details."
              : "Fill in the details to create a new organization."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label required>Organization Name</Label>
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

          <div className="space-y-1">
            <Label required>Email</Label>
            <Input
              placeholder="Enter email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

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
            <Label required>Address</Label>
            <Input
              placeholder="Enter address"
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              className={errors.address ? "border-red-500" : ""}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label required>Country</Label>
            <Select
              value={form.country}
              onValueChange={(val) => {
                setForm((prev) => ({ ...prev, country: val, state: "" }));
              }}
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
          </div>

          <div className="space-y-1">
            <Label required>State</Label>
            <Select
              value={form.state}
              onValueChange={(val) => updateField("state", val)}
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
          </div>

          <div className="space-y-1">
            <Label required>Trial Type</Label>
            <Select
              value={form.trial}
              onValueChange={(val) => updateField("trial", val)}
            >
              <SelectTrigger
                className={`w-full ${errors.trial ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select Trial Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Free">Free</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {org && (
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={form.is_active ? "active" : "inactive"}
                onValueChange={(val) =>
                  setForm((prev) => ({
                    ...prev,
                    is_active: val === "active",
                  }))
                }
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
              ? org
                ? "Updating..."
                : "Creating..."
              : org
                ? "Update"
                : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
