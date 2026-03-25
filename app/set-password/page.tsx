"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";

import { resetPasswordSchema } from "@/lib/validators/reset-password";
import type { ResetPasswordForm } from "@/types/forgotpassword";

export default function SetPasswordPage() {
  const router = useRouter();

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

      router.replace("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-md space-y-4">
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
          Set Password
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <Button
          onClick={submit}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 block mx-auto sm:mx-0"
        >
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </div>
    </div>
  );
}
