"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Eye, EyeOff, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getDashboardPath, setSession } from "@/lib/auth";

const SERVER_DOWN_MESSAGE = "Server is down. Please try again later.";

type LoginResponse = {
  accessToken?: string;
  user?: Parameters<typeof getDashboardPath>[0];
  error?: {
    message?: string;
  };
  message?: string;
};

function getLoginErrorMessage(data: LoginResponse | null, fallback?: string) {
  return (
    data?.error?.message ||
    data?.message ||
    fallback ||
    "Unable to sign in. Please try again."
  );
}

export default function LoginForm() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    setMounted(true);

    const saved = localStorage.getItem("savedLogin");
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  if (!mounted) return null;

  const isDisabled = !email || !password || loading;

  const handleSubmit = async () => {
    if (isDisabled) return;

    try {
      setLoading(true);
      setAlertMessage("");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/odata/v4/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        },
      );

      let data: LoginResponse | null = null;
      let fallbackMessage = "";

      try {
        const json = await res.json();
        data = json?.value || json;
      } catch {
        fallbackMessage = await res.text();
      }

      if (!res.ok || !data?.accessToken || !data.user) {
        throw new Error(getLoginErrorMessage(data, fallbackMessage));
      }

      if (remember) {
        localStorage.setItem("savedLogin", email);
      } else {
        localStorage.removeItem("savedLogin");
      }

      setSession(data.accessToken, data.user);

      toast.success("Welcome to PLMS portal", {
        description: "You have successfully signed in",
      });

      router.push(getDashboardPath(data.user));
    } catch (err) {
      console.error("LOGIN ERROR FE:", err);
      setAlertMessage(
        err instanceof TypeError
          ? SERVER_DOWN_MESSAGE
          : err instanceof Error
            ? err.message || SERVER_DOWN_MESSAGE
            : SERVER_DOWN_MESSAGE,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="grid w-full max-w-4xl grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:flex justify-center">
          <Image
            src="/login.svg"
            alt="Login Illustration"
            width={360}
            height={360}
            priority
            style={{ width: "auto", height: "auto" }}
          />
        </div>

        <Card className="w-full max-w-md mx-auto shadow-lg rounded-2xl border-0">
          <CardHeader className="flex justify-center items-center pt-6 pb-4">
            <Image
              src="/saptarishi.png"
              alt="Logo"
              width={100}
              height={40}
              priority
              style={{ width: "auto", height: "auto" }}
            />
          </CardHeader>

          <CardContent className="space-y-5 px-6 pb-8">
            {alertMessage && (
              <Alert variant="destructive">
                <TriangleAlert className="h-4 w-4" />
                <AlertDescription>{alertMessage}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <Input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setAlertMessage("");
                }}
                placeholder="Enter email"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Password</label>

              <div className="relative">
                <Input
                  placeholder="*******"
                  type={showPassword ? "text" : "password"}
                  className="pr-10"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setAlertMessage("");
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={remember}
                  onCheckedChange={(v) => setRemember(Boolean(v))}
                />
                Remember me
              </div>

              <span className="text-primary cursor-pointer hover:underline">
                Forgot Password?
              </span>
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSubmit}
              disabled={isDisabled}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
