"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CalendarClock,
  CircleDollarSign,
  KeyRound,
  PieChart,
  Target,
} from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/public/Reveal";

const services = [
  {
    icon: Target,
    num: "01",
    title: "Lead Management",
    tagline: "A clean pipeline from first touch to final status.",
    color: "#047857",
    bg: "#ecfdf5",
    features: [
      "Manual and imported leads",
      "Status, priority, source, and owner",
      "Lead codes and contact details",
      "Manager-ready pipeline visibility",
    ],
  },
  {
    icon: CalendarClock,
    num: "02",
    title: "Activity Tracking",
    tagline: "Every conversation stays attached to the lead.",
    color: "#0f766e",
    bg: "#f0fdfa",
    features: [
      "Call, SMS, email, and in-person logs",
      "Notes and call outcomes",
      "Next follow-up dates",
      "Executive activity history",
    ],
  },
  {
    icon: CircleDollarSign,
    num: "03",
    title: "Offer Management",
    tagline: "Campaign-ready offers without scattered spreadsheets.",
    color: "#a16207",
    bg: "#fefce8",
    features: [
      "Fixed, percentage, combo, and conditional discounts",
      "Valid-from and valid-to controls",
      "Active, inactive, draft, and expired states",
      "User-level offer assignments",
    ],
  },
  {
    icon: Building2,
    num: "04",
    title: "Organization Administration",
    tagline: "Keep each tenant structured and governed.",
    color: "#155e75",
    bg: "#ecfeff",
    features: [
      "Organizations with trial windows",
      "Users, managers, and executives",
      "State and country coverage",
      "Active/inactive controls",
    ],
  },
  {
    icon: KeyRound,
    num: "05",
    title: "Roles And Permissions",
    tagline: "Access that matches real operating responsibility.",
    color: "#334155",
    bg: "#f1f5f9",
    features: [
      "Modules and permissions",
      "Organization role mapping",
      "Role module permission matrix",
      "Organization-level overrides",
    ],
  },
  {
    icon: PieChart,
    num: "06",
    title: "Dashboards And Reporting",
    tagline: "Leaders see the work before it becomes a bottleneck.",
    color: "#7f1d1d",
    bg: "#fef2f2",
    features: [
      "Manager cards and status overview",
      "Executive performance context",
      "Lead and offer signals",
      "Operational snapshots",
    ],
  },
];

export default function ServicesPage() {
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
                Services
              </span>
            </motion.div>
            <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-end">
              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-[clamp(42px,6vw,78px)] font-bold leading-[1.07] text-[#0b1713]"
              >
                Services that keep lead teams moving.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.28 }}
                className="text-base leading-8 text-slate-600"
              >
                Samricha turns the backend schema into practical workflows for lead
                teams: capture, assign, follow up, offer, govern, and report.
              </motion.p>
            </div>
          </div>
        </section>

        <section className="border-y border-emerald-950/10 bg-white px-5 py-20 md:px-8">
          <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service, index) => (
              <Reveal key={service.title} delay={index * 0.05}>
                <div className="group flex h-full flex-col rounded-2xl border border-emerald-950/10 bg-[#fbfefb] p-6 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_20px_60px_rgba(6,78,59,0.12)]">
                  <div className="mb-7 flex items-start justify-between">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{ background: service.bg }}
                    >
                      <service.icon className="h-5 w-5" style={{ color: service.color }} />
                    </div>
                    <span className="text-3xl font-bold text-emerald-950/10">
                      {service.num}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-[#0b1713]">{service.title}</h2>
                  <p className="mt-2 text-sm font-semibold text-emerald-700">
                    {service.tagline}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex gap-3 text-sm leading-6 text-slate-600">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="bg-[#eef8f0] px-5 py-20 md:px-8">
          <Reveal className="mx-auto max-w-4xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase text-emerald-700">
              One System
            </p>
            <h2 className="text-[clamp(30px,5vw,56px)] font-bold leading-tight text-[#0b1713]">
              Built for project lead management, not generic CRM noise.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600">
              The public story, login experience, and dashboard entry now speak
              the same language as the Samricha schema and day-to-day operations.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0b1713] px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-900"
            >
              Open Portal
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </section>
    </div>
  );
}
