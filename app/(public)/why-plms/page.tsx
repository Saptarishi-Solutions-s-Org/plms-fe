"use client";

import { motion } from "framer-motion";
import { CheckCircle2, FileSpreadsheet, MessagesSquare, Workflow } from "lucide-react";

import { Reveal } from "@/components/public/Reveal";

const comparisons = [
  {
    icon: FileSpreadsheet,
    title: "Beyond spreadsheets",
    desc: "Spreadsheets show rows. PLMS shows ownership, activity, status, priority, and next action.",
  },
  {
    icon: MessagesSquare,
    title: "Beyond scattered follow-ups",
    desc: "Calls, messages, notes, and follow-up dates stay attached to the lead instead of disappearing in personal chats.",
  },
  {
    icon: Workflow,
    title: "Beyond generic CRM overhead",
    desc: "PLMS focuses on project lead workflows, organization roles, managers, executives, and offers without unnecessary noise.",
  },
];

export default function WhyPlmsPage() {
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
              Why PLMS
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

      <section className="bg-[#0b1713] px-5 py-20 text-white md:px-8">
        <Reveal className="mx-auto max-w-5xl">
          <CheckCircle2 className="mb-6 h-9 w-9 text-emerald-300" />
          <h2 className="text-[clamp(30px,5vw,56px)] font-bold leading-tight">
            PLMS keeps every lead tied to an owner, an action, and an outcome.
          </h2>
        </Reveal>
      </section>
    </div>
  );
}
