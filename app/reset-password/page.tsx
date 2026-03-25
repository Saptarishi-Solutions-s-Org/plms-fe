"use client";

import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";

import { resetPasswordSchema } from "@/lib/validators/reset-password";
import type { ResetPasswordForm } from "@/types/forgotpassword";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
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
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
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
      setAlertMessage("Password updated successfully!");
      setForm({ password: "", confirmPassword: "" });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 relative">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="absolute top-3 left-3 sm:top-4 sm:left-4"
        >
          ← Back
        </Button>

        <div className="text-center space-y-3">
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
          <p className="text-sm text-red-700">Invalid or missing reset link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6">
      <Button
        variant="ghost"
        onClick={() => router.push("/")}
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
          Reset Password
        </h2>

        {alertMessage && (
          <Alert>
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="relative">
          <Input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <Button
          onClick={submit}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 block sm:mx-0 mx-auto"
        >
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </div>
    </div>
  );
}
