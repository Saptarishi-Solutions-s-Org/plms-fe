"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Gift,
  Globe2,
  ShieldCheck,
  Target,
  UserCog,
} from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/public/Reveal";

const features = [
  {
    icon: Target,
    title: "Lead Capture",
    desc: "Create manual and imported leads with owner, priority, source, address, contact, and organization context.",
  },
  {
    icon: Activity,
    title: "Activity Timeline",
    desc: "Track calls, SMS, email, in-person meetings, free-text notes, call outcomes, and next follow-up dates.",
  },
  {
    icon: Gift,
    title: "Offer Management",
    desc: "Manage active, inactive, draft, and expired offers across fixed, percentage, combo, conditional, and flag discounts.",
  },
  {
    icon: UserCog,
    title: "Role Access",
    desc: "Use roles, modules, permissions, and organization overrides to keep every workflow scoped correctly.",
  },
  {
    icon: BarChart3,
    title: "Dashboards",
    desc: "Give managers and admins pipeline snapshots, lead status context, and executive performance signals.",
  },
  {
    icon: Globe2,
    title: "Location Context",
    desc: "Support country, state, postal code, and organization-level operating details for distributed lead teams.",
  },
];

export default function FeaturesPage() {
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
              Features
            </span>
          </motion.div>
          <div className="grid gap-12 lg:grid-cols-[1fr_0.75fr] lg:items-end">
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-[clamp(42px,6vw,78px)] font-bold leading-[1.07] text-[#0b1713]"
            >
              The lead operating layer your team can actually follow.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.28 }}
              className="text-base leading-8 text-slate-600"
            >
              PLMS brings capture, follow-up discipline, offers, permissions,
              and reporting into one focused workflow.
            </motion.p>
          </div>
        </div>
      </section>

      <section className="border-y border-emerald-950/10 bg-white px-5 py-20 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 0.05}>
              <div className="h-full rounded-2xl border border-emerald-950/10 bg-[#fbfefb] p-6 transition hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(6,78,59,0.12)]">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
                  <feature.icon className="h-5 w-5 text-emerald-700" />
                </div>
                <h2 className="text-xl font-bold text-[#0b1713]">{feature.title}</h2>
                <p className="mt-3 text-sm leading-8 text-slate-600">{feature.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-[#0b1713] px-5 py-20 text-white md:px-8">
        <Reveal className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <ShieldCheck className="mb-4 h-8 w-8 text-emerald-300" />
            <h2 className="text-3xl font-bold">Explore how teams use PLMS.</h2>
          </div>
          <Link
            href="/use-cases"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-emerald-300 px-6 text-sm font-bold text-[#0b1713] transition hover:-translate-y-0.5 hover:bg-emerald-200"
          >
            View Use Cases
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
