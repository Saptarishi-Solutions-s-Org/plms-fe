"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/public/Reveal";
import { leadPipeline, roleHighlights } from "@/components/public/public-content";

const principles = [
  "Lead ownership should always be visible.",
  "Follow-ups should be recorded where the lead lives.",
  "Offers should be controlled, valid, and assigned clearly.",
  "Permissions should follow organization responsibility.",
];

export default function AboutPage() {
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
                About PLMS
              </span>
            </motion.div>

            <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-end">
              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-[clamp(42px,6vw,78px)] font-bold leading-[1.07] text-[#0b1713]"
              >
                A lead management system built for accountable growth.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.28 }}
                className="text-base leading-8 text-slate-600"
              >
                PLMS connects organizations, roles, users, leads, activities,
                offers, and location data into one governed workflow. It keeps
                executives focused, managers informed, and admins in control.
              </motion.p>
            </div>
          </div>
        </section>

        <section className="border-y border-emerald-950/10 bg-white px-5 py-20 md:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[360px_1fr]">
            <Reveal>
              <p className="mb-3 text-xs font-semibold uppercase text-emerald-700">
                Mission
              </p>
              <h2 className="text-[clamp(28px,4vw,44px)] font-bold leading-tight text-[#0b1713]">
                Make the next action obvious.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="space-y-6 text-sm leading-8 text-slate-600">
                <p>
                  Lead work breaks down when data is scattered: one person has
                  the phone call, another has the offer context, and managers
                  see the issue too late. PLMS keeps the story of each lead in
                  one place.
                </p>
                <p>
                  The backend schema shows the operating model clearly:
                  organizations own users and leads; leads own activities; users
                  can be assigned offers; and roles, modules, permissions, and
                  overrides decide what each person can access.
                </p>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {principles.map((item) => (
                  <div
                    key={item}
                    className="flex gap-3 rounded-2xl border border-emerald-950/10 bg-[#f7fbf7] p-4 text-sm font-medium text-[#0b1713]"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    {item}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="bg-[#eef8f0] px-5 py-20 md:px-8">
          <div className="mx-auto max-w-7xl">
            <Reveal className="mb-12">
              <p className="mb-3 text-xs font-semibold uppercase text-emerald-700">
                Workflow
              </p>
              <h2 className="text-[clamp(28px,4vw,44px)] font-bold text-[#0b1713]">
                From lead capture to outcome.
              </h2>
            </Reveal>
            <div className="grid gap-5 md:grid-cols-4">
              {leadPipeline.map((step, index) => (
                <Reveal key={step.label} delay={index * 0.07}>
                  <div className="relative h-full rounded-2xl border border-emerald-950/10 bg-white p-6">
                    <span className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">
                      {step.value}
                    </span>
                    <h3 className="text-lg font-bold text-[#0b1713]">{step.label}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{step.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-5 py-20 md:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <Reveal>
              <p className="mb-3 text-xs font-semibold uppercase text-emerald-700">
                Operating Roles
              </p>
              <h2 className="text-[clamp(28px,4vw,44px)] font-bold leading-tight text-[#0b1713]">
                Governance without slowing the team down.
              </h2>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2">
              {roleHighlights.map((role, index) => (
                <Reveal key={role.title} delay={index * 0.06}>
                  <div className="h-full rounded-2xl border border-emerald-950/10 bg-[#fbfefb] p-6">
                    <role.icon className="mb-5 h-6 w-6 text-emerald-700" />
                    <h3 className="font-bold text-[#0b1713]">{role.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{role.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#0b1713] px-5 py-20 text-white md:px-8">
          <Reveal className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-emerald-300">
                PLMS Portal
              </p>
              <h2 className="text-3xl font-bold">Work the pipeline with context.</h2>
            </div>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-emerald-300 px-6 text-sm font-bold text-[#0b1713] transition hover:-translate-y-0.5 hover:bg-emerald-200"
            >
              Sign In
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </section>
    </div>
  );
}
