"use client";

import { motion } from "framer-motion";
import { ArrowRight, ClipboardList, ContactRound, Layers3, LineChart } from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/public/Reveal";

const useCases = [
  {
    icon: Layers3,
    role: "System Admin",
    title: "Configure the operating model.",
    desc: "Create organizations, modules, roles, permissions, and access overrides so every tenant starts with the right guardrails.",
  },
  {
    icon: ClipboardList,
    role: "Organization Admin",
    title: "Run users and offers cleanly.",
    desc: "Manage users, reporting managers, campaign offers, organization details, and active operating windows.",
  },
  {
    icon: LineChart,
    role: "Manager",
    title: "Keep pipeline movement visible.",
    desc: "Review lead status, executive performance, offer signals, and follow-up discipline before work stalls.",
  },
  {
    icon: ContactRound,
    role: "Executive",
    title: "Work the next best follow-up.",
    desc: "Update assigned leads, record calls and messages, add notes, and keep follow-up dates current.",
  },
];

export default function UseCasesPage() {
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
              Use Cases
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl text-[clamp(42px,6vw,78px)] font-bold leading-[1.07] text-[#0b1713]"
          >
            Built around the people who move leads forward.
          </motion.h1>
        </div>
      </section>

      <section className="border-y border-emerald-950/10 bg-white px-5 py-20 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2">
          {useCases.map((useCase, index) => (
            <Reveal key={useCase.role} delay={index * 0.06}>
              <div className="h-full rounded-[1.5rem] border border-emerald-950/10 bg-[#fbfefb] p-7">
                <useCase.icon className="mb-6 h-7 w-7 text-emerald-700" />
                <p className="mb-3 text-xs font-semibold uppercase text-emerald-700">
                  {useCase.role}
                </p>
                <h2 className="text-2xl font-bold text-[#0b1713]">{useCase.title}</h2>
                <p className="mt-4 text-sm leading-8 text-slate-600">{useCase.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-[#eef8f0] px-5 py-20 md:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <h2 className="text-[clamp(30px,5vw,54px)] font-bold text-[#0b1713]">
            Compare it with scattered work.
          </h2>
          <Link
            href="/why-plms"
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0b1713] px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-900"
          >
            Why PLMS
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
