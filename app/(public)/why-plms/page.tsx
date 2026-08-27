"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  FileSpreadsheet,
  ListChecks,
  MessagesSquare,
  ShieldCheck,
  TrendingUp,
  Workflow,
} from "lucide-react";

import { Reveal } from "@/components/public/Reveal";

const comparisons = [
  {
    icon: FileSpreadsheet,
    title: "Beyond spreadsheets",
    desc: "Spreadsheets show rows. Samricha shows ownership, activity, status, priority, and next action.",
  },
  {
    icon: MessagesSquare,
    title: "Beyond scattered follow-ups",
    desc: "Calls, messages, notes, and follow-up dates stay attached to the lead instead of disappearing in personal chats.",
  },
  {
    icon: Workflow,
    title: "Beyond generic CRM overhead",
    desc: "Samricha focuses on project lead workflows, organization roles, managers, executives, and offers without unnecessary noise.",
  },
];

const outcomes = [
  {
    icon: ListChecks,
    title: "Clear next action",
    desc: "Every lead can carry a status, owner, activity history, priority, and follow-up date so teams know what happens next.",
  },
  {
    icon: TrendingUp,
    title: "Manager visibility",
    desc: "Managers get status and performance context without chasing updates from every executive individually.",
  },
  {
    icon: ShieldCheck,
    title: "Governed access",
    desc: "Organizations, modules, roles, permissions, and overrides keep the right people focused on the right work.",
  },
];

const painPoints = [
  "Lead ownership changes are hard to trace.",
  "Follow-up notes sit in chats, calls, or memory.",
  "Offer validity and assignment rules become unclear.",
  "Managers only notice stalled leads after the opportunity cools down.",
];

export default function WhySamrichaPage() {
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
              Why Samricha
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl text-[clamp(42px,6vw,78px)] font-bold leading-[1.07] text-[#0b1713]"
          >
            Because lead work needs discipline, not another loose list.
          </motion.h1>
        </div>
      </section>

      <section className="border-y border-emerald-950/10 bg-white px-5 py-20 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {comparisons.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.06}>
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
              What Samricha Solves
            </p>
            <h2 className="text-[clamp(30px,5vw,54px)] font-bold leading-tight text-[#0b1713]">
              It replaces the quiet leakage in lead operations.
            </h2>
            <p className="mt-5 text-sm leading-8 text-slate-600">
              Samricha is not trying to be everything. It focuses on keeping project
              leads structured enough for executives to act and managers to
              inspect.
            </p>
          </Reveal>

          <div className="grid gap-3">
            {painPoints.map((point, index) => (
              <Reveal key={point} delay={index * 0.04}>
                <div className="rounded-2xl border border-emerald-950/10 bg-white p-5 text-sm font-semibold text-[#0b1713]">
                  {point}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {outcomes.map((outcome, index) => (
            <Reveal key={outcome.title} delay={index * 0.06}>
              <div className="h-full rounded-2xl border border-emerald-950/10 bg-[#fbfefb] p-6">
                <outcome.icon className="mb-6 h-7 w-7 text-emerald-700" />
                <h2 className="text-xl font-bold text-[#0b1713]">{outcome.title}</h2>
                <p className="mt-4 text-sm leading-8 text-slate-600">{outcome.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-[#0b1713] px-5 py-20 text-white md:px-8">
        <Reveal className="mx-auto max-w-5xl">
          <CheckCircle2 className="mb-6 h-9 w-9 text-emerald-300" />
          <h2 className="text-[clamp(30px,5vw,56px)] font-bold leading-tight">
            Samricha keeps every lead tied to an owner, an action, and an outcome.
          </h2>
        </Reveal>
      </section>
    </div>
  );
}
