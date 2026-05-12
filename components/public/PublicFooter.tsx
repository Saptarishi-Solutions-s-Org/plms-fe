import Image from "next/image";
import Link from "next/link";

const publicNavLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Features", href: "/features" },
  { label: "Use Cases", href: "/use-cases" },
  { label: "Why PLMS", href: "/why-plms" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
];

const platformModules = [
  { label: "Lead Capture" },
  { label: "Follow-ups" },
  { label: "Offers" },
  { label: "Role Access" },
  { label: "Dashboards" },
  { label: "Locations" },
];

const supportEmails = [
  "system.admin@saptarishi.tech",
  "info@saptarishi.tech",
];

const marketingLinks = [
  { label: "Security", href: "/security" },
  { label: "Request Demo", href: "/request-demo" },
];

const footerHelpLinks = [
  { label: "FAQs", href: "/faqs" },
  { label: "Contact", href: "/contact" },
];

export default function PublicFooter() {
  return (
    <footer className="bg-[#0b1713] text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8">
        <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-[1.25fr_0.75fr_0.75fr_0.75fr_1fr]">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <Image
                src="/saptarishi.png"
                alt="Saptarishi Solutions"
                width={130}
                height={42}
                className="brightness-0 invert"
              />
              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">
                PLMS
              </span>
            </div>
            <p className="max-w-sm text-sm leading-7 text-white/58">
              Project Lead Management System for capturing leads, organizing
              follow-ups, managing offers, and giving every role a clear view of
              the pipeline.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
              </span>
              <span className="text-[11px] tracking-wide text-white/58">
                Portal Operational
              </span>
            </div>
          </div>

          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
              Navigation
            </p>
            <ul className="space-y-3">
              {publicNavLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/58 transition hover:text-emerald-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
              Marketing
            </p>
            <ul className="space-y-3">
              {marketingLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/58 transition hover:text-emerald-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
              Legal
            </p>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/58 transition hover:text-emerald-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mb-4 mt-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
              Help
            </p>
            <ul className="space-y-3">
              {footerHelpLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/58 transition hover:text-emerald-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
              Core Modules
            </p>
            <div className="flex flex-wrap gap-2">
              {platformModules.slice(0, 6).map((module) => (
                <span
                  key={module.label}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/58"
                >
                  {module.label}
                </span>
              ))}
            </div>
            <div className="mt-6 space-y-2">
              {supportEmails.map((email) => (
                <a
                  key={email}
                  href={`mailto:${email}`}
                  className="block text-sm text-emerald-200 transition hover:text-white"
                >
                  {email}
                </a>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Portal
              </p>
              <Link
                href="/login"
                className="block text-sm font-semibold text-emerald-200 transition hover:text-white"
              >
                Login
              </Link>
              <p className="mt-2 text-xs text-white/35">Authorized users only</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-7 text-xs text-white/35 md:flex-row md:items-center md:justify-between">
          <p>
            Copyright {new Date().getFullYear()} Saptarishi Solutions Pvt. Ltd.
            All rights reserved.
          </p>
          <p>Internal business workflows. Confidential portal data.</p>
        </div>
      </div>
    </footer>
  );
}
