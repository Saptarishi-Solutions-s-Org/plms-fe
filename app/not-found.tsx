import Link from "next/link";
import {
  ArrowRight,
  CircleOff,
  Home,
  Layers3,
  Radar,
  Route,
  Search,
  ShieldQuestion,
} from "lucide-react";

const helpfulLinks = [
  {
    label: "Back Home",
    href: "/",
    icon: Home,
    text: "Return to the public PLMS landing page.",
  },
  {
    label: "Features",
    href: "/features",
    icon: Search,
    text: "Explore lead, offer, activity, and dashboard capabilities.",
  },
  {
    label: "Contact Support",
    href: "/contact",
    icon: ShieldQuestion,
    text: "Reach the system maintainers for route or access help.",
  },
];

const statusRows = [
  {
    label: "Route scan",
    value: "No public page matched",
    icon: Route,
  },
  {
    label: "Session safety",
    value: "No dashboard data exposed",
    icon: ShieldQuestion,
  },
  {
    label: "Next action",
    value: "Choose a verified destination",
    icon: ArrowRight,
  },
];

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center overflow-hidden bg-[#f7fbf7] px-5 py-20 text-[#0b1713] md:px-8">
      <div className="pointer-events-none absolute right-[-260px] top-[-220px] h-[720px] w-[720px] rounded-full border border-emerald-900/10" />
      <div className="pointer-events-none absolute right-20 top-16 h-[520px] w-[520px] rounded-full border border-emerald-900/[0.06]" />
      <div className="pointer-events-none absolute left-[-220px] bottom-[-260px] h-[620px] w-[620px] rounded-full border border-emerald-900/10" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-700/25 to-transparent" />

      <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[1fr_420px] lg:items-center">
        <section className="relative">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-emerald-900/10 bg-white/80 px-4 py-2 shadow-[0_14px_40px_rgba(6,78,59,0.08)] backdrop-blur">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50">
              <CircleOff className="h-4 w-4 text-emerald-700" />
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              Route Not Found
            </span>
          </div>

          <div className="relative">
            <p className="absolute -top-16 left-0 select-none text-[clamp(92px,16vw,210px)] font-black leading-none text-emerald-950/[0.05]">
              404
            </p>
            <h1 className="relative max-w-4xl text-[clamp(44px,7vw,92px)] font-black leading-[0.98] tracking-tight">
              This route slipped out of the PLMS pipeline.
            </h1>
          </div>

          <p className="mt-7 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
            The page may have moved, expired, or was never assigned to a valid
            public route. You can recover from here without losing your place in
            the Project Lead Management System.
          </p>

          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            {["Lead route", "Access state", "Recovery"].map((item, index) => (
              <div
                key={item}
                className="rounded-2xl border border-emerald-950/10 bg-white/75 p-4 shadow-sm"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                  0{index + 1}
                </p>
                <p className="mt-2 text-sm font-bold text-[#0b1713]">{item}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {index === 0
                    ? "No matching page"
                    : index === 1
                      ? "Safe public view"
                      : "Suggested paths ready"}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0b1713] px-6 text-sm font-bold text-white shadow-[0_18px_44px_rgba(11,23,19,0.24)] transition hover:-translate-y-0.5 hover:bg-emerald-900"
            >
              Back Home
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/features"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-emerald-900/15 bg-white/80 px-6 text-sm font-bold text-[#0b1713] shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-600 hover:text-emerald-800"
            >
              Features
              <Layers3 className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-full border border-emerald-900/15 bg-white/50 px-6 text-sm font-bold text-[#0b1713] transition hover:-translate-y-0.5 hover:border-emerald-600 hover:text-emerald-800"
            >
              Contact Support
            </Link>
          </div>
        </section>

        <aside className="relative">
          <div className="absolute -inset-4 rounded-[2.5rem] border border-emerald-900/10 bg-emerald-50/40 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-emerald-950/10 bg-white/92 shadow-[0_32px_100px_rgba(6,78,59,0.18)] backdrop-blur">
            <div className="border-b border-emerald-950/10 bg-[#0b1713] px-7 py-6 text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">
                  Pipeline Check
                </span>
                <span className="rounded-full bg-red-400/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-red-100">
                  Missing
                </span>
              </div>
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="text-6xl font-black leading-none">404</p>
                  <p className="mt-2 text-sm text-white/60">Route lookup failed</p>
                </div>
                <Radar className="h-14 w-14 text-emerald-300" />
              </div>
            </div>

            <div className="space-y-3 p-6">
              {statusRows.map(({ label, value, icon: Icon }) => (
                <div
                  key={label as string}
                  className="flex items-center gap-4 rounded-2xl border border-emerald-950/10 bg-[#fbfefb] p-4"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                    <Icon className="h-5 w-5 text-emerald-700" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#0b1713]">
                      {value}
                    </p>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                  Suggested Links
                </p>
                <div className="space-y-2.5">
                  {helpfulLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group flex items-start justify-between gap-4 rounded-2xl border border-emerald-950/10 bg-white p-4 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_16px_38px_rgba(6,78,59,0.1)]"
                    >
                      <span className="flex gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                          <link.icon className="h-5 w-5 text-emerald-700" />
                        </span>
                        <span>
                          <span className="block text-sm font-bold text-[#0b1713]">
                            {link.label}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-slate-500">
                            {link.text}
                          </span>
                        </span>
                      </span>
                      <ArrowRight className="mt-3 h-4 w-4 shrink-0 text-emerald-700 transition group-hover:translate-x-1" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
