"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, Eye, EyeOff, ShieldCheck, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getDashboardPath, refreshSession, setSession } from "@/lib/auth";

const SERVER_DOWN_MESSAGE = "Server is down. Please try again later.";
const API_URL = "/api/plms";

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
    let cancelled = false;

    setMounted(true);

    const saved = localStorage.getItem("savedLogin");
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }

    refreshSession(true).then((session) => {
      if (!cancelled && session) {
        router.replace(getDashboardPath(session.user));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!mounted) return null;

  const isDisabled = !email || !password || loading;

  const handleSubmit = async () => {
    if (isDisabled) return;

    try {
      setLoading(true);
      setAlertMessage("");

      const res = await fetch(
        `${API_URL}/odata/v4/auth/login`,
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

      window.location.assign(getDashboardPath(data.user));
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
    <section className="relative min-h-[calc(100vh-58px)] overflow-hidden px-5 pb-16 pt-28 md:px-8">
      <div className="pointer-events-none absolute left-[-190px] top-[100px] h-[520px] w-[520px] rounded-full border border-emerald-900/10" />
      <div className="pointer-events-none absolute right-[-170px] top-[-120px] h-[560px] w-[560px] rounded-full border border-emerald-900/10" />

      <div className="mx-auto grid min-h-[620px] w-full max-w-7xl items-center gap-10 lg:grid-cols-[1fr_460px]">
        <div className="hidden lg:block">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-[1.5px] w-8 bg-emerald-600" />
            <span className="text-xs font-semibold uppercase text-emerald-700">
              Secure PLMS Access
            </span>
          </div>
          <h1 className="max-w-3xl text-[clamp(42px,6vw,76px)] font-bold leading-[1.06] text-[#0b1713]">
            Sign in and move the pipeline forward.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">
            Access your organization dashboard to manage leads, record
            follow-ups, review offers, and keep every role aligned.
          </p>
          <div className="mt-9 grid max-w-xl gap-4 sm:grid-cols-2">
            {[
              "Organization-scoped access",
              "Role and module permissions",
              "Lead activity visibility",
              "Offer assignment context",
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
                SRS-PLMS
              </span>
            </div>
            <h2 className="text-2xl font-bold text-[#0b1713]">Welcome back</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Continue to your project lead workspace.
            </p>
          </CardHeader>

          <CardContent className="space-y-5 px-6 pb-8">
            {alertMessage && (
              <Alert variant="destructive">
                <TriangleAlert className="h-4 w-4" />
                <AlertDescription>{alertMessage}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#0b1713]">Email</label>
              <Input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setAlertMessage("");
                }}
                placeholder="Enter email"
                className="h-11 rounded-xl border-emerald-950/15 bg-[#fbfefb]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#0b1713]">Password</label>

              <div className="relative">
                <Input
                  placeholder="*******"
                  type={showPassword ? "text" : "password"}
                  className="h-11 rounded-xl border-emerald-950/15 bg-[#fbfefb] pr-10"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setAlertMessage("");
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

            <div className="flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={remember}
                  onCheckedChange={(v) => setRemember(Boolean(v))}
                />
                <span className="text-slate-600">Remember me</span>
              </div>

              <Link
                href="/forgot-password"
                className="text-emerald-700 hover:text-emerald-900 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              className="h-11 w-full rounded-full bg-[#0b1713] text-white hover:bg-emerald-900"
              onClick={handleSubmit}
              disabled={isDisabled}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>

            <p className="text-center text-xs leading-5 text-slate-500">
              Public pages remain available while signed in. Visiting this login
              page with an active session takes you to your dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
