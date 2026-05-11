import Link from "next/link";
import { ArrowRight, Home, Search, ShieldQuestion } from "lucide-react";

const helpfulLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "Features", href: "/features", icon: Search },
  { label: "Support", href: "/contact", icon: ShieldQuestion },
];

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center overflow-hidden bg-[#f7fbf7] px-5 py-24 text-[#0b1713] md:px-8">
      <div className="pointer-events-none absolute right-[-220px] top-[-170px] h-[640px] w-[640px] rounded-full border border-emerald-900/10" />
      <div className="pointer-events-none absolute left-[-180px] bottom-[-220px] h-[520px] w-[520px] rounded-full border border-emerald-900/10" />

      <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[1fr_420px] lg:items-center">
        <section>
          <div className="mb-8 flex items-center gap-3">
            <span className="h-[1.5px] w-8 bg-emerald-600" />
            <span className="text-xs font-semibold uppercase text-emerald-700">
              404 - Page Not Found
            </span>
          </div>

          <h1 className="max-w-4xl text-[clamp(44px,7vw,88px)] font-bold leading-[1.05]">
            This lead went off the pipeline.
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-8 text-slate-600">
            The page you are looking for may have moved, expired, or never been
            assigned a valid route. Let&apos;s get you back to a working PLMS page.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0b1713] px-6 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(11,23,19,0.2)] transition hover:-translate-y-0.5 hover:bg-emerald-900"
            >
              Back Home
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-full border border-emerald-900/15 bg-white/70 px-6 text-sm font-semibold text-[#0b1713] transition hover:-translate-y-0.5 hover:border-emerald-600 hover:text-emerald-800"
            >
              Contact Support
            </Link>
          </div>
        </section>

        <aside className="rounded-[2rem] border border-emerald-950/10 bg-white/90 p-7 shadow-[0_28px_90px_rgba(6,78,59,0.14)] backdrop-blur">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
            Try these instead
          </p>
          <div className="space-y-3">
            {helpfulLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center justify-between rounded-2xl border border-emerald-950/10 bg-[#fbfefb] p-4 transition hover:border-emerald-300"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                    <link.icon className="h-5 w-5 text-emerald-700" />
                  </span>
                  <span className="text-sm font-semibold">{link.label}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-emerald-700 transition group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
