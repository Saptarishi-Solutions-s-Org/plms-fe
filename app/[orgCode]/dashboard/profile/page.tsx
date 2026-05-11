"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CalendarIcon,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Pencil,
  Save,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

import GlobalLoader from "@/components/commoncomponents/globalloader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  getDashboardPath,
  refreshSession,
  updateSessionUser,
} from "@/lib/auth";
import {
  changePasswordSchema,
  PASSWORD_RULE_MESSAGE,
} from "@/lib/validators/password";
import { profileSchema } from "@/lib/validators/profile";
import { subscribeRealtime } from "@/lib/socket";
import { getCountries, getStatesByCountry } from "@/services/location";
import { changePassword, getProfile, updateProfile } from "@/services/profile";
import { PROFILE_CHANGED, type ProfileChangedPayload } from "@/types/realtime";
import type { Country, State } from "@/types/organization";
import type { Profile, UpdateProfilePayload } from "@/types/profile";

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type FormErrors = Partial<Record<keyof UpdateProfilePayload, string>>;
type PasswordErrors = Partial<Record<keyof PasswordForm | "general", string>>;

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] || "P") + (parts[1]?.[0] || parts[0]?.[1] || "L");
}

function toDateInputValue(value?: string) {
  if (!value) return "";
  if (!value.includes("T")) return value.slice(0, 10);

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-CA");
}

function profileToForm(profile: Profile): UpdateProfilePayload {
  return {
    name: profile.name || "",
    phone: profile.phone || "",
    gender: profile.gender || "",
    dob: toDateInputValue(profile.dob),
    city: profile.city || "",
    state: profile.stateId || "",
    country: profile.countryId || "",
  };
}

function formatDisplayDate(value?: string) {
  if (!value) return "No Data";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function display(value?: string | null) {
  return value ? value : "No Data";
}

const MONTHS = [
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

const YEARS = Array.from(
  { length: 100 },
  (_, index) => new Date().getFullYear() - index,
);

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams<{ orgCode: string }>();
  const orgCode = params.orgCode;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<UpdateProfilePayload | null>(null);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  const loadProfile = useCallback(
    async (mode: "initial" | "realtime" = "initial") => {
      try {
        const session = await refreshSession();
        if (!session) {
          router.replace("/");
          return;
        }

        if (session.user.orgCode !== orgCode) {
          router.replace(getDashboardPath(session.user));
          return;
        }

        const [profileData, countryData] = await Promise.all([
          getProfile(),
          getCountries(),
        ]);

        setProfile(profileData);
        setForm(profileToForm(profileData));
        if (profileData.dob) {
          setCalendarMonth(
            new Date(`${toDateInputValue(profileData.dob)}T00:00:00`),
          );
        }
        if (mode === "initial") setIsEditingProfile(false);
        setCountries(countryData);

        if (profileData.countryId) {
          const stateData = await getStatesByCountry(profileData.countryId);
          setStates(stateData);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile");
      } finally {
        if (mode === "initial") setIsInitialLoading(false);
      }
    },
    [orgCode, router],
  );

  useEffect(() => {
    loadProfile("initial");
  }, [loadProfile]);

  useEffect(() => {
    return subscribeRealtime<ProfileChangedPayload>(PROFILE_CHANGED, () => {
      loadProfile("realtime");
    });
  }, [loadProfile]);

  useEffect(() => {
    if (!form?.country) {
      setStates([]);
      return;
    }

    getStatesByCountry(form.country)
      .then(setStates)
      .catch(() => setStates([]));
  }, [form?.country]);

  const initials = useMemo(
    () => getInitials(profile?.name || "PLMS"),
    [profile?.name],
  );

  const updateField = (field: keyof UpdateProfilePayload, value: string) => {
    setForm((current) => {
      if (!current) return current;
      return {
        ...current,
        [field]: value,
        ...(field === "country" ? { state: "" } : {}),
      };
    });
    setFormErrors((current) => ({ ...current, [field]: "" }));
  };

  const updatePasswordField = (field: keyof PasswordForm, value: string) => {
    setPasswordForm((current) => ({ ...current, [field]: value }));
    setPasswordErrors((current) => ({ ...current, [field]: "", general: "" }));
  };

  const handleSaveProfile = async () => {
    if (!form) return;

    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) {
      const errors: FormErrors = {};
      parsed.error.issues.forEach((issue) => {
        errors[issue.path[0] as keyof UpdateProfilePayload] = issue.message;
      });
      setFormErrors(errors);
      return;
    }

    try {
      setIsSaving(true);
      await updateProfile(parsed.data);
      updateSessionUser({ name: parsed.data.name });
      await loadProfile("realtime");
      setIsEditingProfile(false);
      toast.success("Profile updated successfully");
    } catch (err) {
      setFormErrors({
        name: err instanceof Error ? err.message : "Failed to update profile",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const parsed = changePasswordSchema.safeParse(passwordForm);
    if (!parsed.success) {
      const errors: PasswordErrors = {};
      parsed.error.issues.forEach((issue) => {
        errors[issue.path[0] as keyof PasswordErrors] = issue.message;
      });
      setPasswordErrors(errors);
      return;
    }

    try {
      setIsChangingPassword(true);
      await changePassword(parsed.data);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({});
      toast.success("Password updated successfully");
    } catch (err) {
      setPasswordErrors({
        general:
          err instanceof Error ? err.message : "Failed to update password",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isInitialLoading || !profile || !form) {
    return <GlobalLoader />;
  }

  return (
    <main className="min-h-full bg-blue-50/50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-blue-950">
              Profile Settings
            </h1>
            <p className="text-sm text-muted-foreground">
              Update your account details and security preferences.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="rounded-xl border-blue-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-950">
                <UserRound className="h-5 w-5 text-blue-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-7">
              <div className="flex flex-col gap-5 border-t pt-5 sm:flex-row sm:items-center">
                <Avatar className="h-20 w-20 rounded-xl bg-blue-950 text-white">
                  <AvatarFallback className="rounded-xl bg-blue-950 text-xl font-semibold text-white">
                    {initials.toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{profile.name}</h2>
                    <Badge
                      variant={profile.isActive ? "default" : "destructive"}
                      className={profile.isActive ? "bg-blue-600" : ""}
                    >
                      {profile.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {profile.role}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Avatar upload is not enabled for this version.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field>
                  <FieldLabel>Name</FieldLabel>
                  <Input
                    value={isEditingProfile ? form.name : display(form.name)}
                    onChange={(e) => updateField("name", e.target.value)}
                    aria-invalid={!!formErrors.name}
                    disabled={!isEditingProfile}
                  />
                  <FieldError>{formErrors.name}</FieldError>
                </Field>

                <Field>
                  <FieldLabel>Phone Number</FieldLabel>
                  <Input
                    value={isEditingProfile ? form.phone : display(form.phone)}
                    onChange={(e) => updateField("phone", e.target.value)}
                    aria-invalid={!!formErrors.phone}
                    disabled={!isEditingProfile}
                  />
                  <FieldError>{formErrors.phone}</FieldError>
                </Field>

                <Field>
                  <FieldLabel>Email ID</FieldLabel>
                  <Input value={display(profile.email)} disabled />
                </Field>

                <Field>
                  <FieldLabel>Role</FieldLabel>
                  <Input value={display(profile.role)} disabled />
                </Field>

                <Field>
                  <FieldLabel>Gender</FieldLabel>
                  {isEditingProfile ? (
                    <Select
                      value={form.gender}
                      onValueChange={(value) => updateField("gender", value)}
                    >
                      <SelectTrigger aria-invalid={!!formErrors.gender}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={display(form.gender)} disabled />
                  )}
                  <FieldError>{formErrors.gender}</FieldError>
                </Field>

                <Field>
                  <FieldLabel>Date of Birth</FieldLabel>
                  {isEditingProfile ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          aria-invalid={!!formErrors.dob}
                          className="w-full justify-start bg-white text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-blue-600" />
                          {formatDisplayDate(form.dob)}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-auto p-3">
                        <div className="mb-3 grid grid-cols-2 gap-2">
                          <Select
                            value={String(calendarMonth.getMonth())}
                            onValueChange={(value) => {
                              const next = new Date(calendarMonth);
                              next.setMonth(Number(value));
                              setCalendarMonth(next);
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                              {MONTHS.map((month, index) => (
                                <SelectItem key={month} value={String(index)}>
                                  {month}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select
                            value={String(calendarMonth.getFullYear())}
                            onValueChange={(value) => {
                              const next = new Date(calendarMonth);
                              next.setFullYear(Number(value));
                              setCalendarMonth(next);
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent className="max-h-64">
                              {YEARS.map((year) => (
                                <SelectItem key={year} value={String(year)}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Calendar
                          mode="single"
                          month={calendarMonth}
                          onMonthChange={setCalendarMonth}
                          selected={
                            form.dob
                              ? new Date(`${form.dob}T00:00:00`)
                              : undefined
                          }
                          onSelect={(date) => {
                            if (!date) return;
                            updateField(
                              "dob",
                              date.toLocaleDateString("en-CA"),
                            );
                            setCalendarMonth(date);
                          }}
                          disabled={(date) => date > new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <Input value={formatDisplayDate(form.dob)} disabled />
                  )}
                  <FieldError>{formErrors.dob}</FieldError>
                </Field>

                <Field>
                  <FieldLabel>Country</FieldLabel>
                  {isEditingProfile ? (
                    <Select
                      value={form.country}
                      onValueChange={(value) => updateField("country", value)}
                    >
                      <SelectTrigger aria-invalid={!!formErrors.country}>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.id} value={country.id}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={display(profile.country)} disabled />
                  )}
                  <FieldError>{formErrors.country}</FieldError>
                </Field>

                <Field>
                  <FieldLabel>State</FieldLabel>
                  {isEditingProfile ? (
                    <Select
                      value={form.state}
                      onValueChange={(value) => updateField("state", value)}
                      disabled={!form.country}
                    >
                      <SelectTrigger aria-invalid={!!formErrors.state}>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state.id} value={state.id}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={display(profile.state)} disabled />
                  )}
                  <FieldError>{formErrors.state}</FieldError>
                </Field>

                <Field>
                  <FieldLabel>City</FieldLabel>
                  <Input
                    value={isEditingProfile ? form.city : display(form.city)}
                    onChange={(e) => updateField("city", e.target.value)}
                    aria-invalid={!!formErrors.city}
                    disabled={!isEditingProfile}
                  />
                  <FieldError>{formErrors.city}</FieldError>
                </Field>

                <Field>
                  <FieldLabel>Organization</FieldLabel>
                  <Input value={display(profile.organization)} disabled />
                </Field>

                <Field>
                  <FieldLabel>Reporting Manager</FieldLabel>
                  <Input value={display(profile.reportingManager)} disabled />
                </Field>
              </div>

              <div className="flex justify-end">
                <div className="flex items-center gap-2">
                  {isEditingProfile && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setForm(profileToForm(profile));
                        setFormErrors({});
                        setIsEditingProfile(false);
                      }}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  )}
                  <Button
                    onClick={
                      isEditingProfile
                        ? handleSaveProfile
                        : () => setIsEditingProfile(true)
                    }
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSaving ? (
                      <Spinner className="mr-2 h-4 w-4" />
                    ) : isEditingProfile ? (
                      <Save className="mr-2 h-4 w-4" />
                    ) : (
                      <Pencil className="mr-2 h-4 w-4" />
                    )}
                    {isEditingProfile ? "Save Profile" : "Edit"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-blue-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-950">
                <LockKeyhole className="h-5 w-5 text-blue-600" />
                Password Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 border-t pt-5">
              {passwordErrors.general && (
                <Alert variant="destructive">
                  <AlertDescription>{passwordErrors.general}</AlertDescription>
                </Alert>
              )}

              <Field>
                <FieldLabel>Current Password</FieldLabel>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    placeholder="Enter current password"
                    onChange={(e) =>
                      updatePasswordField("currentPassword", e.target.value)
                    }
                    aria-invalid={!!passwordErrors.currentPassword}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <FieldError>{passwordErrors.currentPassword}</FieldError>
              </Field>

              <Field>
                <FieldLabel>New Password</FieldLabel>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      updatePasswordField("newPassword", e.target.value)
                    }
                    placeholder="Enter new password"
                    aria-invalid={!!passwordErrors.newPassword}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <FieldDescription>{PASSWORD_RULE_MESSAGE}</FieldDescription>
                <FieldError>{passwordErrors.newPassword}</FieldError>
              </Field>

              <Field>
                <FieldLabel>Confirm Password</FieldLabel>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      updatePasswordField("confirmPassword", e.target.value)
                    }
                    placeholder="Re-type password"
                    aria-invalid={!!passwordErrors.confirmPassword}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <FieldError>{passwordErrors.confirmPassword}</FieldError>
              </Field>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleChangePassword}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : (
                  <KeyRound className="mr-2 h-4 w-4" />
                )}
                Update Password
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Updating your password will log you out from all other active
                sessions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
