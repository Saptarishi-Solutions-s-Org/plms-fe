"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

import { Reveal } from "@/components/public/Reveal";
import StickyTOC from "@/components/public/StickyTOC";

const lastUpdated = "May 11, 2026";

const privacySections = [
  {
    title: "What Samricha Stores",
    body: "Samricha stores account details, organization metadata, role and permission settings, lead records, lead activities, offer assignments, and location references required to run project lead workflows.",
  },
  {
    title: "How Data Is Used",
    body: "Data is used to authenticate users, assign work, manage lead follow-ups, review pipeline status, apply offers, support dashboards, and keep access scoped to the correct organization and role.",
  },
  {
    title: "Session And Cookies",
    body: "The portal uses secure session cookies and refresh-token cookies to keep authorized users signed in and to route them to the correct organization dashboard.",
  },
  {
    title: "Access Controls",
    body: "Users only receive access intended for their organization, role, enabled modules, permissions, and organization-specific overrides.",
  },
  {
    title: "Lead And Activity Data",
    body: "Lead records may include contact details, address information, status, source, priority, assignee, and activity notes. Activity records may include call outcomes, free-text notes, and next follow-up dates.",
  },
  {
    title: "Offer And Campaign Data",
    body: "Offer data is used to manage discount types, validity windows, assignments, and offer status. These records help teams apply campaigns consistently and audit operational decisions.",
  },
  {
    title: "Retention And Review",
    body: "Samricha data is retained for business continuity, support, audit, and reporting needs. Administrators may review records when investigating access issues, lead ownership, offer assignment, or workflow errors.",
  },
  {
    title: "Support Requests",
    body: "When users contact support, the team may use organization code, user email, lead code, and error context to diagnose issues. Support information is used only to resolve portal and workflow problems.",
  },
];

const relatedLinks = [
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "FAQs", href: "/faqs" },
  { label: "Contact", href: "/contact" },
];

function sectionId(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function PrivacyPolicyPage() {
  return (
    <div className="overflow-hidden bg-[#f7fbf7]">
      <section className="relative px-5 pb-16 pt-36 md:px-8">
        <div className="pointer-events-none absolute right-[-220px] top-[-170px] h-[620px] w-[620px] rounded-full border border-emerald-900/10" />
        <div className="pointer-events-none absolute right-[-80px] top-[-50px] h-[360px] w-[360px] rounded-full border border-emerald-900/10" />
        <div className="pointer-events-none absolute bottom-4 right-10 select-none text-[88px] font-bold leading-none text-emerald-950/[0.04] md:text-[130px]">
          Samricha
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-9 flex items-center gap-3"
          >
            <span className="h-[1.5px] w-8 bg-emerald-600" />
            <span className="text-xs font-semibold uppercase text-emerald-700">
              Privacy Policy
            </span>
          </motion.div>

          <div className="grid gap-12 lg:grid-cols-[1fr_360px] lg:items-end">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-[clamp(42px,6vw,78px)] font-bold leading-[1.07] text-[#0b1713]">
                How Samricha protects workflow data.
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600">
                This policy explains how Project Lead Management System data is
                collected, used, protected, and reviewed across public access,
                authentication, lead operations, offer workflows, and
                organization-level administration.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.28 }}
              className="rounded-[1.75rem] border border-emerald-950/10 bg-white/88 p-6 shadow-[0_24px_70px_rgba(6,78,59,0.1)] backdrop-blur"
            >
              <ShieldCheck className="mb-5 h-8 w-8 text-emerald-700" />
              <p className="text-xs font-semibold uppercase text-slate-400">
                Last Updated
              </p>
              <p className="mt-1 text-lg font-bold text-[#0b1713]">
                {lastUpdated}
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                This document applies to Samricha public access, login flow, and
                authenticated organization workflows.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-y border-emerald-950/10 bg-white px-5 py-20 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[300px_1fr]">
          <StickyTOC
            label="Contents"
            sections={privacySections.map((section) => ({
              id: sectionId(section.title),
              heading: section.title,
            }))}
            related={relatedLinks}
          />

          <div className="space-y-5">
            {privacySections.map((section, index) => (
              <Reveal key={section.title} delay={index * 0.035}>
                <article
                  id={sectionId(section.title)}
                  className="scroll-mt-28 rounded-[1.5rem] border border-emerald-950/10 bg-[#fbfefb] p-6 md:p-8"
                >
                  <div className="mb-5 flex items-center gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h2 className="text-xl font-bold text-[#0b1713]">
                      {section.title}
                    </h2>
                  </div>
                  <p className="text-sm leading-8 text-slate-600">
                    {section.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
