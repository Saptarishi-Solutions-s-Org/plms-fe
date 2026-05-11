"use client";

import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";

import { Reveal } from "@/components/public/Reveal";
import { faqs } from "@/components/public/public-content";

export default function FaqsPage() {
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
              FAQs
            </span>
          </motion.div>
          <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-[clamp(42px,6vw,78px)] font-bold leading-[1.07] text-[#0b1713]"
            >
              Quick answers for PLMS users.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.28 }}
              className="text-base leading-8 text-slate-600"
            >
              A compact guide for login behavior, dashboard access, lead
              visibility, permissions, and support context.
            </motion.p>
          </div>
        </div>
      </section>

      <section className="border-y border-emerald-950/10 bg-white px-5 py-20 md:px-8">
        <div className="mx-auto grid max-w-5xl gap-5">
          {faqs.map((faq, index) => (
            <Reveal key={faq.question} delay={index * 0.04}>
              <article className="rounded-2xl border border-emerald-950/10 bg-[#fbfefb] p-6">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
                    <HelpCircle className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#0b1713]">
                      {faq.question}
                    </h2>
                    <p className="mt-3 text-sm leading-8 text-slate-600">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
