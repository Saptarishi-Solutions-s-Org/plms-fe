"use client";

import { motion } from "framer-motion";
import {
  Building2,
  Copy,
  ExternalLink,
  Gift,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useState } from "react";

import { Reveal } from "@/components/public/Reveal";

const contactCards = [
  {
    icon: Users,
    label: "Sales Ops",
    title: "Lead Operations",
    email: "system.admin@saptarishi.tech",
    desc: "For lead assignment, follow-up queues, activity history, and pipeline questions.",
    color: "#047857",
    bg: "#ecfdf5",
  },
  {
    icon: ShieldCheck,
    label: "Access",
    title: "Account Support",
    email: "system.admin@saptarishi.tech",
    desc: "For login, reset links, roles, permissions, organization modules, and locked accounts.",
    color: "#334155",
    bg: "#f1f5f9",
  },
  {
    icon: Gift,
    label: "Offers",
    title: "Campaign Support",
    email: "info@saptarishi.tech",
    desc: "For discount setup, offer validity, user assignment, and active campaign checks.",
    color: "#a16207",
    bg: "#fefce8",
  },
  {
    icon: Mail,
    label: "General",
    title: "General Queries",
    email: "info@saptarishi.tech",
    desc: "For anything else related to Samricha operations and internal support.",
    color: "#0f766e",
    bg: "#f0fdfa",
  },
];

const officeDetails = [
  { icon: Building2, label: "Company", value: "Saptarishi Solutions Pvt. Ltd." },
  { icon: MapPin, label: "Location", value: "Hyderabad, Telangana, India" },
  { icon: Mail, label: "Email", value: "info@saptarishi.tech" },
  { icon: Phone, label: "Support", value: "system.admin@saptarishi.tech" },
];

const quickHelp = [
  "I cannot access my organization dashboard.",
  "A lead is assigned to the wrong executive.",
  "An offer status or validity window looks incorrect.",
  "My role does not show the module I need.",
];

export default function ContactPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email).catch(() => {});
    setCopied(email);
    window.setTimeout(() => setCopied(null), 1800);
  };

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
                Contact
              </span>
            </motion.div>
            <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-end">
              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-[clamp(42px,6vw,78px)] font-bold leading-[1.07] text-[#0b1713]"
              >
                Reach the right Samricha support channel.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.28 }}
                className="text-base leading-8 text-slate-600"
              >
                Get help with lead assignments, login access, role permissions,
                organization setup, offers, and dashboard visibility.
              </motion.p>
            </div>
          </div>
        </section>

        <section className="border-y border-emerald-950/10 bg-white px-5 py-20 md:px-8">
          <div className="mx-auto max-w-7xl">
            <Reveal className="mb-10">
              <p className="mb-3 text-xs font-semibold uppercase text-emerald-700">
                Support Channels
              </p>
              <h2 className="text-[clamp(28px,4vw,44px)] font-bold text-[#0b1713]">
                Choose the closest lane.
              </h2>
            </Reveal>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {contactCards.map((card, index) => (
                <Reveal key={card.title} delay={index * 0.06}>
                  <div className="group flex h-full flex-col rounded-2xl border border-emerald-950/10 bg-[#fbfefb] p-6 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_20px_60px_rgba(6,78,59,0.12)]">
                    <div className="mb-6 flex items-start justify-between">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-2xl"
                        style={{ background: card.bg }}
                      >
                        <card.icon className="h-5 w-5" style={{ color: card.color }} />
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-400">
                        {card.label}
                      </span>
                    </div>
                    <h3 className="font-bold text-[#0b1713]">{card.title}</h3>
                    <a
                      href={`mailto:${card.email}`}
                      className="mt-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
                    >
                      {card.email}
                    </a>
                    <p className="mt-4 flex-1 text-sm leading-7 text-slate-600">
                      {card.desc}
                    </p>
                    <button
                      type="button"
                      onClick={() => copyEmail(card.email)}
                      className="mt-5 inline-flex items-center gap-2 text-left text-sm font-semibold text-slate-600 transition hover:text-emerald-800"
                    >
                      <Copy className="h-4 w-4" />
                      {copied === card.email ? "Copied" : "Copy email"}
                    </button>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#eef8f0] px-5 py-20 md:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <Reveal>
              <p className="mb-3 text-xs font-semibold uppercase text-emerald-700">
                Office
              </p>
              <h2 className="text-[clamp(28px,4vw,44px)] font-bold text-[#0b1713]">
                Saptarishi support for Samricha.
              </h2>
              <div className="mt-8 space-y-4">
                {officeDetails.map((detail) => (
                  <div
                    key={detail.label}
                    className="flex gap-4 rounded-2xl border border-emerald-950/10 bg-white p-5"
                  >
                    <detail.icon className="mt-0.5 h-5 w-5 text-emerald-700" />
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        {detail.label}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#0b1713]">
                        {detail.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="rounded-[2rem] border border-emerald-950/10 bg-[#0b1713] p-7 text-white shadow-[0_24px_70px_rgba(6,78,59,0.18)]">
                <p className="mb-3 text-xs font-semibold uppercase text-emerald-300">
                  Quick Help
                </p>
                <h3 className="text-3xl font-bold">Include this context.</h3>
                <p className="mt-4 text-sm leading-7 text-white/60">
                  Faster support starts with the organization code, user email,
                  lead code when relevant, and the exact action that failed.
                </p>
                <div className="mt-7 space-y-3">
                  {quickHelp.map((item) => (
                    <div
                      key={item}
                      className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/72"
                    >
                      <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>
    </div>
  );
}
