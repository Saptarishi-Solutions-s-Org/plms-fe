"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  ContactRound,
  Gift,
  Globe2,
  Layers3,
  LineChart,
  ShieldCheck,
  Target,
  UserCog,
} from "lucide-react";
import { useRef } from "react";

import { Reveal } from "@/components/public/Reveal";

const platformModules = [
  {
    icon: Target,
    label: "Lead Capture",
    desc: "Create manual and imported leads with status, priority, source, and owner tracking.",
    color: "#047857",
    bg: "#ecfdf5",
  },
  {
    icon: Activity,
    label: "Follow-ups",
    desc: "Track calls, SMS, email, in-person visits, notes, outcomes, and next follow-up dates.",
    color: "#0f766e",
    bg: "#f0fdfa",
  },
  {
    icon: Gift,
    label: "Offers",
    desc: "Manage discounts, combo offers, validity windows, assignments, and offer status.",
    color: "#a16207",
    bg: "#fefce8",
  },
  {
    icon: UserCog,
    label: "Role Access",
    desc: "Use organization roles, modules, permissions, and overrides to keep access precise.",
    color: "#334155",
    bg: "#f1f5f9",
  },
  {
    icon: BarChart3,
    label: "Dashboards",
    desc: "Give managers and admins the pipeline visibility they need to move fast.",
    color: "#155e75",
    bg: "#ecfeff",
  },
  {
    icon: Globe2,
    label: "Locations",
    desc: "Support country, state, postal code, and organization-level operating context.",
    color: "#7f1d1d",
    bg: "#fef2f2",
  },
];

const leadPipeline = [
  { label: "New", desc: "Lead enters the system", value: "01" },
  { label: "Contacted", desc: "Executive reaches out", value: "02" },
  { label: "Qualified", desc: "Need and fit confirmed", value: "03" },
  { label: "Converted or Lost", desc: "Outcome is recorded", value: "04" },
];

const roleHighlights = [
  {
    icon: Layers3,
    title: "System Admin",
    desc: "Controls organizations, modules, and the global operating setup.",
  },
  {
    icon: ClipboardList,
    title: "Admin",
    desc: "Handles organization users, offers, and operational governance.",
  },
  {
    icon: LineChart,
    title: "Manager",
    desc: "Tracks lead status, executive performance, and follow-up discipline.",
  },
  {
    icon: ContactRound,
    title: "Executive",
    desc: "Works assigned leads, records activities, and keeps follow-ups moving.",
  },
];

const heroSignals = [
  { icon: ShieldCheck, label: "Organization-scoped access" },
  { icon: Activity, label: "Follow-up discipline" },
  { icon: Gift, label: "Offer-ready workflows" },
];

export default function HomePage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "7%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.35]);

  return (
    <div className="overflow-hidden">
      <section
        ref={heroRef}
        className="relative flex min-h-screen items-center px-5 pb-16 pt-28 md:px-8"
      >
        <div className="pointer-events-none absolute right-[-220px] top-[-170px] h-[640px] w-[640px] rounded-full border border-emerald-900/10" />
        <div className="pointer-events-none absolute right-[-70px] top-[-40px] h-[380px] w-[380px] rounded-full border border-emerald-900/10" />
        <div className="pointer-events-none absolute bottom-16 left-6 hidden grid-cols-4 gap-2 md:grid">
          {Array.from({ length: 16 }).map((_, index) => (
            <span
              key={index}
              className="h-1.5 w-1.5 rounded-full bg-emerald-900/12"
            />
          ))}
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[1fr_460px]"
        >
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-7 flex items-center gap-3"
            >
              <span className="h-[1.5px] w-8 bg-emerald-600" />
              <span className="text-xs font-semibold uppercase text-emerald-700">
                Project Lead Management System
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.85,
                delay: 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="max-w-4xl text-[clamp(44px,7vw,88px)] font-bold leading-[1.05] text-[#0b1713]"
            >
              Leads, follow-ups, and offers in one calm pipeline.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.72, delay: 0.26 }}
              className="mt-7 max-w-2xl text-base leading-8 text-slate-600"
            >
              Samricha gives organizations a structured way to capture leads, assign
              executives, track every activity, manage offers, and keep managers
              focused on what needs attention next.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.38 }}
              className="mt-9 flex flex-col gap-3 sm:flex-row"
            >
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0b1713] px-6 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(11,23,19,0.2)] transition hover:-translate-y-0.5 hover:bg-emerald-900"
              >
                Open Portal
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/services"
                className="inline-flex h-12 items-center justify-center rounded-full border border-emerald-900/15 bg-white/70 px-6 text-sm font-semibold text-[#0b1713] transition hover:-translate-y-0.5 hover:border-emerald-600 hover:text-emerald-800"
              >
                View Services
              </Link>
            </motion.div>

            <div className="mt-10 grid max-w-xl gap-3 sm:grid-cols-3">
              {heroSignals.map((signal, index) => (
                <motion.div
                  key={signal.label}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.48 + index * 0.08 }}
                  className="rounded-xl border border-emerald-900/10 bg-white/75 p-4 shadow-[0_12px_35px_rgba(6,95,70,0.06)] backdrop-blur"
                >
                  <signal.icon className="mb-3 h-5 w-5 text-emerald-700" />
                  <p className="text-sm font-semibold leading-6 text-[#0b1713]">
                    {signal.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative min-h-[530px]"
          >
            <div className="absolute inset-x-7 top-16 rounded-[2rem] border border-emerald-950/10 bg-white/88 p-6 shadow-[0_28px_90px_rgba(6,78,59,0.16)] backdrop-blur">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-emerald-700">
                    Pipeline
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-[#0b1713]">
                    Lead Snapshot
                  </h2>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Live
                </span>
              </div>
              <div className="space-y-3">
                {leadPipeline.map((step) => (
                  <div
                    key={step.label}
                    className="flex items-center gap-4 rounded-2xl border border-emerald-950/8 bg-[#fbfefb] p-4"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">
                      {step.value}
                    </span>
                    <div>
                      <p className="font-semibold text-[#0b1713]">{step.label}</p>
                      <p className="text-sm text-slate-500">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {platformModules
              .filter((module) => module.label !== "Dashboards")
              .slice(0, 5)
              .map((module, index) => {
                const positions = [
                  "left-0 top-0",
                  "right-10 top-5",
                  "left-[-30px] bottom-20",
                  "right-2 bottom-5",
                  "right-24 top-[235px]",
                ];
                return (
                  <motion.div
                    key={module.label}
                    className={`absolute ${positions[index]} hidden rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-[0_16px_45px_rgba(6,78,59,0.14)] backdrop-blur sm:flex`}
                    animate={{ y: [0, -9, 0] }}
                    transition={{
                      duration: 4 + index * 0.45,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <module.icon
                      className="mr-2 h-4 w-4"
                      style={{ color: module.color }}
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      {module.label}
                    </span>
                  </motion.div>
                );
              })}
          </motion.div>
        </motion.div>
      </section>

      <section className="border-y border-emerald-950/10 bg-white px-5 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-10">
            <p className="mb-3 text-xs font-semibold uppercase text-emerald-700">
              Platform Modules
            </p>
            <h2 className="max-w-3xl text-[clamp(28px,4vw,48px)] font-bold leading-tight text-[#0b1713]">
              Built around the schema that runs the work.
            </h2>
          </Reveal>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {platformModules.map((module, index) => (
              <Reveal key={module.label} delay={index * 0.05}>
                <div className="group h-full rounded-2xl border border-emerald-950/10 bg-[#fbfefb] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_55px_rgba(6,78,59,0.12)]">
                  <div
                    className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ background: module.bg }}
                  >
                    <module.icon
                      className="h-5 w-5"
                      style={{ color: module.color }}
                    />
                  </div>
                  <h3 className="text-lg font-bold text-[#0b1713]">
                    {module.label}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {module.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#eef8f0] px-5 py-20 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <p className="mb-3 text-xs font-semibold uppercase text-emerald-700">
              Role Focused
            </p>
            <h2 className="text-[clamp(28px,4vw,46px)] font-bold leading-tight text-[#0b1713]">
              Every user sees the work they own.
            </h2>
            <p className="mt-5 text-sm leading-7 text-slate-600">
              Samricha is shaped around organization roles, modules, permissions,
              and manager reporting lines. The result is a focused workspace for
              each operating layer.
            </p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {roleHighlights.map((role, index) => (
              <Reveal key={role.title} delay={index * 0.06}>
                <div className="h-full rounded-2xl border border-emerald-950/10 bg-white/85 p-6">
                  <role.icon className="mb-5 h-6 w-6 text-emerald-700" />
                  <h3 className="font-bold text-[#0b1713]">{role.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {role.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0b1713] px-5 py-20 text-white md:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <CheckCircle2 className="mx-auto mb-6 h-9 w-9 text-emerald-300" />
          <h2 className="text-[clamp(30px,5vw,56px)] font-bold leading-tight">
            Ready to move the next lead forward?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/60">
            Sign in to manage leads, update follow-ups, review offers, and keep
            the organization pipeline moving.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-emerald-300 px-6 text-sm font-bold text-[#0b1713] transition hover:-translate-y-0.5 hover:bg-emerald-200"
          >
            Go to Login
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
