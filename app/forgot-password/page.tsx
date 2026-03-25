"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { forgotPasswordSchema } from "@/lib/validators/forgot-password";
import type { ForgotPasswordForm } from "@/types/forgotpassword";

export default function ForgotPasswordPage() {
  const router = useRouter();

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

    setLoading(true);

    try {
      setMessage(
        "If this email is registered, you will receive a password reset link shortly.",
      );

      setForm({ email: "" });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="absolute top-3 left-3 sm:top-4 sm:left-4"
      >
        ← Back
      </Button>

      <div className="w-full max-w-md space-y-4 bg-white/0">
        <div className="flex justify-center mt-6 sm:mt-8">
          <Image
            src="/saptarishi.png"
            alt="Saptarishi"
            width={100}
            height={50}
            priority
            className="h-auto w-24 sm:w-28 md:w-32"
          />
        </div>

        <h2 className="mt-4 sm:mt-5 text-xl font-semibold text-center sm:text-left">
          Forgot Password
        </h2>

        {message && (
          <div className="bg-green-100 text-green-700 text-sm p-3 rounded-lg">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        <Input
          placeholder="Enter your registered email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <Button
          onClick={submit}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 block sm:mx-0 mx-auto"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </div>
    </div>
  );
}
