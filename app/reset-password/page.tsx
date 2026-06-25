"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validators/reset-password";
import type { ResetPasswordForm } from "@/types/forgotpassword";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const params = useSearchParams();
  const token = params.get("token");

  const [form, setForm] = useState<ResetPasswordForm>({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => setError(""), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  const submit = async () => {
    if (!token) return;

    const parsed = resetPasswordSchema.safeParse(form);

    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    setError("");
    setAlertMessage("");

    try {
      await resetPassword(
        token,
        parsed.data.password,
        parsed.data.confirmPassword,
      );
      setAlertMessage("Password updated successfully!");
      setForm({ password: "", confirmPassword: "" });
    } catch (submitError) {
      setError(
        submitError instanceof TypeError
          ? "Network error. Please try again."
          : submitError instanceof Error
            ? submitError.message
            : "Unable to reset password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 font-[var(--font-poppins)]">
        <ResetPasswordHeader />

        <div className="flex flex-1 items-center justify-center px-4 py-10">
          <div className="w-full max-w-sm text-center">
            <div className="rounded-3xl border border-gray-100 bg-white px-8 py-10 shadow-sm">
              <h1 className="mb-2 text-xl font-bold text-gray-900">
                Reset password
              </h1>
              <p className="text-sm text-red-600">
                Invalid or missing reset link.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-[var(--font-poppins)]">
      <ResetPasswordHeader />

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="rounded-3xl border border-gray-100 bg-white px-8 py-10 shadow-sm">
            <div className="mb-8">
              <h1 className="mb-1 text-xl font-bold text-gray-900">
                Reset password
              </h1>
              <p className="text-sm text-gray-500">
                Enter your new password below
              </p>
            </div>

            {alertMessage && (
              <div className="mb-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-xs text-green-700">
                {alertMessage}
              </div>
            )}

            {error && (
              <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="new-password"
                  className="mb-1.5 block text-xs font-semibold text-gray-800"
                >
                  New Password
                </label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={form.password}
                    disabled={loading}
                    onChange={(event) => {
                      setForm({ ...form, password: event.target.value });
                      setError("");
                      setAlertMessage("");
                    }}
                    className="h-11 rounded-xl border-gray-200 pr-11 text-sm focus-visible:ring-violet-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-1.5 block text-xs font-semibold text-gray-800"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    disabled={loading}
                    onChange={(event) => {
                      setForm({
                        ...form,
                        confirmPassword: event.target.value,
                      });
                      setError("");
                      setAlertMessage("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") void submit();
                    }}
                    className="h-11 rounded-xl border-gray-200 pr-11 text-sm focus-visible:ring-violet-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => void submit()}
                disabled={loading || !form.password || !form.confirmPassword}
                className="h-11 w-full rounded-xl bg-[#4f35f2] text-sm font-semibold text-white transition-all hover:bg-[#442bdc] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={15} className="animate-spin" />
                    Updating...
                  </span>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            This portal is for registered LMA users only.
            <br />
            Having issues?{" "}
            <Link href="/contact" className="text-violet-500 hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordHeader() {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <Link
        href="/login"
        className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-800"
      >
        <ArrowLeft size={15} />
        Back to login
      </Link>
      <Image
        src="/saptarishi.png"
        alt="Saptarishi Solutions"
        width={100}
        height={30}
        priority
        className="hidden md:block"
      />
    </div>
  );
}

function ResetPasswordFallback() {
  return <div className="min-h-screen bg-gray-50" />;
}
