"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  TriangleAlert,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { resetPasswordSchema } from "@/lib/validators/reset-password";
import type { ResetPasswordForm } from "@/types/forgotpassword";
import { getDashboardPath, refreshSession, setSession } from "@/lib/auth";
import { setPassword } from "@/services/auth";

export default function SetPasswordPage() {
  const router = useRouter();

  const [form, setForm] = useState<ResetPasswordForm>({
    password: "",
    confirmPassword: "",
  });

  const [sessionLoading, setSessionLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    let cancelled = false;

    refreshSession(true).then((session) => {
      if (cancelled) return;

      if (!session) {
        toast.error("Session required", {
          description: "Please log in to change your password.",
        });
        router.replace("/");
        return;
      }

      if (!session.user.mustChangePassword) {
        router.replace(getDashboardPath(session.user));
        return;
      }

      setSessionLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  const submit = async () => {
    const parsed = resetPasswordSchema.safeParse(form);

    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await setPassword({
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      setSession(data.accessToken, data.user);

      toast.success("Password Set Successfully!", {
        description: "Your password has been set and you have been signed in",
      });

      window.location.assign(getDashboardPath(data.user));
    } catch (err: any) {
      setError(err?.message || "Failed to set password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7fbf7]">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8 text-emerald-700 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Checking session...</p>
        </div>
      </div>
    );
  }

  const isDisabled = !form.password || !form.confirmPassword || loading;

  return (
    <section className="relative min-h-[calc(100vh-58px)] overflow-hidden px-5 pb-16 pt-28 md:px-8 bg-[#f7fbf7]">
      {/* Visual background decorations to match loginForm style */}
      <div className="pointer-events-none absolute left-[-190px] top-[100px] h-[520px] w-[520px] rounded-full border border-emerald-900/10" />
      <div className="pointer-events-none absolute right-[-170px] top-[-120px] h-[560px] w-[560px] rounded-full border border-emerald-900/10" />

      <div className="mx-auto grid min-h-[620px] w-full max-w-7xl items-center gap-10 lg:grid-cols-[1fr_460px]">
        {/* Left pane details */}
        <div className="hidden lg:block">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-[1.5px] w-8 bg-emerald-600" />
            <span className="text-xs font-semibold uppercase text-emerald-700">
              Secure LMA Access
            </span>
          </div>
          <h1 className="max-w-3xl text-[clamp(42px,6vw,76px)] font-bold leading-[1.06] text-[#0b1713]">
            Secure your account.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">
            You are logging in for the first time or your password needs to be set.
            Please choose a strong password to protect your account and gain access to your workspace.
          </p>
          <div className="mt-9 grid max-w-xl gap-4 sm:grid-cols-2">
            {[
              "Minimum 8 characters long",
              "At least one capital letter",
              "At least one numeric digit",
              "At least one special character",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-emerald-950/10 bg-white/70 p-4 text-sm font-medium text-[#0b1713]"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Right pane form */}
        <Card className="mx-auto w-full max-w-md rounded-[1.75rem] border border-emerald-950/10 bg-white/90 shadow-[0_28px_90px_rgba(6,78,59,0.16)] backdrop-blur">
          <CardHeader className="items-center px-6 pb-4 pt-7 text-center">
            <div className="mb-4 flex items-center gap-3">
              <Image
                src="/sap.png"
                alt="Saptarishi"
                width={36}
                height={36}
                priority
                className="h-9 w-9"
              />
              <span className="text-sm font-bold uppercase text-[#0b1713]">
                SRS-LMA
              </span>
            </div>
            <h2 className="text-2xl font-bold text-[#0b1713]">Set Password</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Set a strong password for your workspace.
            </p>
          </CardHeader>

          <CardContent className="space-y-5 px-6 pb-8">
            {error && (
              <Alert variant="destructive">
                <TriangleAlert className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#0b1713]">
                New Password
              </label>
              <div className="relative">
                <Input
                  placeholder="Enter Password"
                  type={showPassword ? "text" : "password"}
                  className="h-11 rounded-xl border-emerald-950/15 bg-[#fbfefb] pr-10"
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    setError("");
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-emerald-800"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#0b1713]">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  placeholder="Enter Password"
                  type={showConfirm ? "text" : "password"}
                  className="h-11 rounded-xl border-emerald-950/15 bg-[#fbfefb] pr-10"
                  value={form.confirmPassword}
                  onChange={(e) => {
                    setForm({ ...form, confirmPassword: e.target.value });
                    setError("");
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-emerald-800"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              className="h-11 w-full rounded-full bg-[#0b1713] text-white hover:bg-emerald-900 mt-2"
              onClick={submit}
              disabled={isDisabled}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Updating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Update Password
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>

            <p className="text-center text-xs leading-5 text-slate-500">
              Your password must be at least 8 characters and include 1 capital letter, 1 number, and 1 special character.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
