"use client";

import { motion } from "framer-motion";
import { Cookie, KeyRound, LockKeyhole, ShieldCheck, Siren, Users } from "lucide-react";

import { Reveal } from "@/components/public/Reveal";

const securityItems = [
  {
    icon: Users,
    title: "Organization Isolation",
    desc: "Users are routed through their organization code, with dashboard access tied to the active session and org hint.",
  },
  {
    icon: ShieldCheck,
    title: "Roles And Modules",
    desc: "Roles, modules, permissions, and organization overrides keep visibility aligned to responsibility.",
  },
  {
    icon: Cookie,
    title: "Session Cookies",
    desc: "Refresh cookies support authenticated routing while public pages remain visible to signed-in users.",
  },
  {
    icon: KeyRound,
    title: "Password Reset Flow",
    desc: "Reset tokens and password policies help recover access without exposing account credentials.",
  },
  {
    icon: Siren,
    title: "Maintenance Mode",
    desc: "Administrators can restrict normal usage during upgrades, fixes, or operational maintenance windows.",
  },
  {
    icon: LockKeyhole,
    title: "Scoped Support",
    desc: "Support requests use organization code, user email, and lead code context to diagnose only the relevant workflow.",
  },
];

const trustNotes = [
  "Public pages remain readable while authenticated dashboard routes stay protected.",
  "Login redirects active sessions back to the correct organization dashboard.",
  "Dashboard requests without a refresh cookie return to the public home page.",
  "Support can diagnose with organization code, user email, and lead code context.",
];

export default function SecurityPage() {
  return (
    <div className="overflow-hidden">
      <section className="relative px-5 pb-20 pt-36 md:px-8">
        <div className="pointer-events-none absolute right-[-220px] top-[-170px] h-[620px] w-[620px] rounded-full border border-emerald-900/10" />
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-9 flex items-center gap-3"
          >
            <span className="h-[1.5px] w-8 bg-emerald-600" />
            <span className="text-xs font-semibold uppercase text-emerald-700">
              Security
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl text-[clamp(42px,6vw,78px)] font-bold leading-[1.07] text-[#0b1713]"
          >
            Trust built around organizations, roles, and sessions.
          </motion.h1>
        </div>
      </section>

      <section className="border-y border-emerald-950/10 bg-white px-5 py-20 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 xl:grid-cols-3">
          {securityItems.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.05}>
              <div className="h-full rounded-2xl border border-emerald-950/10 bg-[#fbfefb] p-6">
                <item.icon className="mb-6 h-7 w-7 text-emerald-700" />
                <h2 className="text-xl font-bold text-[#0b1713]">{item.title}</h2>
                <p className="mt-4 text-sm leading-8 text-slate-600">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-[#eef8f0] px-5 py-20 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <p className="mb-3 text-xs font-semibold uppercase text-emerald-700">
              Route Protection
            </p>
            <h2 className="text-[clamp(30px,5vw,54px)] font-bold leading-tight text-[#0b1713]">
              Public browsing and protected work stay separate.
            </h2>
          </Reveal>
          <div className="grid gap-3">
            {trustNotes.map((note, index) => (
              <Reveal key={note} delay={index * 0.04}>
                <div className="rounded-2xl border border-emerald-950/10 bg-white p-5 text-sm font-semibold leading-7 text-[#0b1713]">
                  {note}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
