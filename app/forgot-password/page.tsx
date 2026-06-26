"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPassword } from "@/services/auth";
import { forgotPasswordSchema } from "@/lib/validators/forgot-password";
import type { ForgotPasswordForm } from "@/types/forgotpassword";

export default function ForgotPasswordPage() {
  const [form, setForm] = useState<ForgotPasswordForm>({ email: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    setMessage("");
    setError("");

    const parsed = forgotPasswordSchema.safeParse(form);

    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    try {
      setLoading(true);
      await forgotPassword({
        email: parsed.data.email.trim().toLowerCase(),
      });
      setMessage(
        "If this email is registered, you will receive a password reset link shortly.",
      );
      setForm({ email: "" });
    } catch (submitError) {
      setError(
        submitError instanceof TypeError
          ? "Network error. Please try again."
          : submitError instanceof Error
            ? submitError.message
            : "Unable to send the reset link. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-[var(--font-poppins)]">
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

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="rounded-3xl border border-gray-100 bg-white px-8 py-10 shadow-sm">
            <div className="mb-8">
              <h1 className="mb-1 text-xl font-bold text-gray-900">
                Forgot password
              </h1>
              <p className="text-sm text-gray-500">
                Enter your email to receive reset link
              </p>
            </div>

            {message && (
              <div className="mb-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-xs text-green-700">
                {message}
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
                  htmlFor="forgot-password-email"
                  className="mb-1.5 block text-xs font-semibold text-gray-700"
                >
                  Email address
                </label>
                <Input
                  id="forgot-password-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(event) => {
                    setForm({ email: event.target.value });
                    setError("");
                    setMessage("");
                  }}
                  disabled={loading}
                  className="rounded-xl border-gray-200 text-sm focus-visible:ring-violet-400"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void submit();
                  }}
                />
              </div>

              <Button
                type="button"
                onClick={() => void submit()}
                disabled={loading || !form.email.trim()}
                className="h-11 w-full rounded-xl bg-[#9b8cf5] text-sm font-semibold text-white transition-all hover:bg-[#8978ef] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={15} className="animate-spin" />
                    Sending...
                  </span>
                ) : (
                  "Send Reset Link"
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
