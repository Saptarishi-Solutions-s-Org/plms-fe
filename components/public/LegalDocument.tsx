"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, FileText, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/public/Reveal";

type LegalSection = {
  title: string;
  body: string;
};

type LegalDocumentProps = {
  eyebrow: string;
  title: string;
  intro: string;
  lastUpdated: string;
  sections: LegalSection[];
  related: { label: string; href: string }[];
  variant: "privacy" | "terms";
};

function sectionId(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function LegalDocument({
  eyebrow,
  title,
  intro,
  lastUpdated,
  sections,
  related,
  variant,
}: LegalDocumentProps) {
  const Icon = variant === "privacy" ? ShieldCheck : FileText;

  return (
    <div className="overflow-hidden bg-[#f7fbf7]">
      <section className="relative px-5 pb-16 pt-36 md:px-8">
        <div className="pointer-events-none absolute right-[-220px] top-[-170px] h-[620px] w-[620px] rounded-full border border-emerald-900/10" />
        <div className="pointer-events-none absolute right-[-80px] top-[-50px] h-[360px] w-[360px] rounded-full border border-emerald-900/10" />
        <div className="pointer-events-none absolute bottom-4 right-10 select-none text-[88px] font-bold leading-none text-emerald-950/[0.04] md:text-[130px]">
          PLMS
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
              {eyebrow}
            </span>
          </motion.div>

          <div className="grid gap-12 lg:grid-cols-[1fr_360px] lg:items-end">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-[clamp(42px,6vw,78px)] font-bold leading-[1.07] text-[#0b1713]">
                {title}
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600">
                {intro}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.28 }}
              className="rounded-[1.75rem] border border-emerald-950/10 bg-white/88 p-6 shadow-[0_24px_70px_rgba(6,78,59,0.1)] backdrop-blur"
            >
              <Icon className="mb-5 h-8 w-8 text-emerald-700" />
              <p className="text-xs font-semibold uppercase text-slate-400">
                Last Updated
              </p>
              <p className="mt-1 text-lg font-bold text-[#0b1713]">{lastUpdated}</p>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                This document applies to PLMS public access, login flow, and
                authenticated organization workflows.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-y border-emerald-950/10 bg-white px-5 py-20 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[300px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-[1.5rem] border border-emerald-950/10 bg-[#fbfefb] p-5">
              <p className="mb-4 text-xs font-semibold uppercase text-emerald-700">
                On This Page
              </p>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <a
                    key={section.title}
                    href={`#${sectionId(section.title)}`}
                    className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>

              <div className="mt-7 border-t border-emerald-950/10 pt-5">
                <p className="mb-3 text-xs font-semibold uppercase text-slate-400">
                  Related
                </p>
                <div className="space-y-2">
                  {related.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:text-emerald-950"
                    >
                      {link.label}
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-5">
            {sections.map((section, index) => (
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
                  <p className="text-sm leading-8 text-slate-600">{section.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
