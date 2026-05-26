"use client";

import { motion } from "framer-motion";
import { ArrowRight, Mail, Phone, ShieldCheck } from "lucide-react";

import { Reveal } from "@/components/public/Reveal";

const demoContacts = [
  {
    label: "Email",
    value: "info@saptarishi.tech",
    href: "mailto:info@saptarishi.tech?subject=LMA%20Demo%20Request",
    icon: Mail,
  },
  {
    label: "Support",
    value: "system.admin@saptarishi.tech",
    href: "mailto:system.admin@saptarishi.tech?subject=LMA%20Demo%20Request",
    icon: ShieldCheck,
  },
  {
    label: "Phone",
    value: "+91 78427 13943",
    href: "tel:+917842713943",
    icon: Phone,
  },
];

const demoChecklist = [
  "Your organization or team structure",
  "How leads are currently captured",
  "Who manages executives and follow-ups",
  "Offer or discount workflows you want to control",
];

export default function RequestDemoPage() {
  return (
    <div className="overflow-hidden">
      <section className="relative px-5 pb-20 pt-36 md:px-8">
        <div className="pointer-events-none absolute right-[-220px] top-[-170px] h-[620px] w-[620px] rounded-full border border-emerald-900/10" />
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_430px] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-9 flex items-center gap-3">
              <span className="h-[1.5px] w-8 bg-emerald-600" />
              <span className="text-xs font-semibold uppercase text-emerald-700">
                Request Demo
              </span>
            </div>
            <h1 className="text-[clamp(42px,6vw,78px)] font-bold leading-[1.07] text-[#0b1713]">
              See how LMA can organize your lead workflow.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600">
              Share your organization context, current lead process, and the
              roles you want to support. The team will help map LMA to your
              workflow.
            </p>
          </motion.div>

          <Reveal>
            <div className="rounded-[2rem] border border-emerald-950/10 bg-white/90 p-7 shadow-[0_28px_90px_rgba(6,78,59,0.14)]">
              <p className="mb-5 text-xs font-semibold uppercase text-emerald-700">
                Contact Options
              </p>
              <div className="space-y-3">
                {demoContacts.map((contact) => (
                  <a
                    key={contact.label}
                    href={contact.href}
                    className="group flex items-center justify-between rounded-2xl border border-emerald-950/10 bg-[#fbfefb] p-4 transition hover:border-emerald-300"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                        <contact.icon className="h-5 w-5 text-emerald-700" />
                      </span>
                      <span>
                        <span className="block text-xs font-semibold uppercase text-slate-400">
                          {contact.label}
                        </span>
                        <span className="text-sm font-semibold text-[#0b1713]">
                          {contact.value}
                        </span>
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-emerald-700 transition group-hover:translate-x-1" />
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-emerald-950/10 bg-white px-5 py-20 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <p className="mb-3 text-xs font-semibold uppercase text-emerald-700">
              Demo Prep
            </p>
            <h2 className="text-[clamp(30px,5vw,54px)] font-bold leading-tight text-[#0b1713]">
              Bring the current workflow. LMA maps around it.
            </h2>
          </Reveal>
          <div className="grid gap-3 sm:grid-cols-2">
            {demoChecklist.map((item, index) => (
              <Reveal key={item} delay={index * 0.05}>
                <div className="rounded-2xl border border-emerald-950/10 bg-[#fbfefb] p-5 text-sm font-semibold leading-7 text-[#0b1713]">
                  {item}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
