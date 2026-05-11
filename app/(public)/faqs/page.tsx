"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

import StickyTOC from "@/components/public/StickyTOC";

const faqs = [
  {
    category: "Getting Started",
    question: "What is PLMS?",
    answer:
      "PLMS is the Project Lead Management System used to manage organizations, users, leads, follow-up activities, offers, permissions, locations, and dashboard visibility.",
  },
  {
    category: "Getting Started",
    question: "Who should use PLMS?",
    answer:
      "System admins, organization admins, managers, and executives use PLMS to keep project lead operations structured from capture to follow-up and outcome.",
  },
  {
    category: "Access",
    question: "Can logged-in users still view public pages?",
    answer:
      "Yes. Home, About, Services, FAQs, Contact, Privacy Policy, and Terms remain visible even when a user has an active session.",
  },
  {
    category: "Access",
    question: "What happens if I open /login while already signed in?",
    answer:
      "The proxy reads the PLMS refresh cookie and organization hint, then redirects you to your organization dashboard.",
  },
  {
    category: "Access",
    question: "Why am I redirected to home when opening a dashboard link?",
    answer:
      "Dashboard routes require the PLMS refresh cookie. If it is missing or expired, the app sends you to the public home page.",
  },
  {
    category: "Roles",
    question: "Who can see leads and offers?",
    answer:
      "Visibility is controlled by organization roles, enabled modules, permissions, and organization-level overrides configured by admins.",
  },
  {
    category: "Roles",
    question: "How are managers and executives connected?",
    answer:
      "Executive users can be assigned to a reporting manager. This allows managers to review pipeline movement, lead status, and performance context for their team.",
  },
  {
    category: "Leads",
    question: "What information is stored for a lead?",
    answer:
      "A lead can include name, gender, code, date of birth, phone, email, status, priority, source, import type, assigned executive, address, country, state, and postal code.",
  },
  {
    category: "Leads",
    question: "Which lead statuses are supported?",
    answer:
      "The backend schema supports New, Contacted, Qualified, and Lost. These states help teams understand where every lead sits in the pipeline.",
  },
  {
    category: "Leads",
    question: "Can leads be imported?",
    answer:
      "Yes. PLMS distinguishes manual entry and imported leads, so teams can track how records entered the system.",
  },
  {
    category: "Activities",
    question: "What activity types can be tracked?",
    answer:
      "PLMS supports call, SMS, email, in-person, and other activity types. Notes, call status, free text, and next follow-up date can be attached to a lead activity.",
  },
  {
    category: "Activities",
    question: "Why is next follow-up date important?",
    answer:
      "Next follow-up dates help managers and executives prevent warm leads from going cold and keep the pipeline accountable.",
  },
  {
    category: "Offers",
    question: "What kinds of offers can PLMS manage?",
    answer:
      "PLMS supports fixed amount, percentage, combo, buy-one-get-one, conditional, and flag discount models with validity windows and statuses.",
  },
  {
    category: "Offers",
    question: "Can offers be assigned to users?",
    answer:
      "Yes. Offer assignments link an offer to users, helping admins control which team members or workflows can use active campaigns.",
  },
  {
    category: "Organizations",
    question: "Does PLMS support multiple organizations?",
    answer:
      "Yes. The schema supports organizations with code, contact details, active status, country, state, trial dates, users, roles, modules, and permission overrides.",
  },
  {
    category: "Security",
    question: "How does PLMS protect access?",
    answer:
      "The app uses session cookies, refresh tokens, password reset tokens, role mappings, module permissions, and organization-specific permission overrides.",
  },
  {
    category: "Security",
    question: "What happens during maintenance mode?",
    answer:
      "Maintenance mode can restrict normal access while administrators perform upgrades, fixes, or operational work.",
  },
  {
    category: "Support",
    question: "What should I include when asking for support?",
    answer:
      "Share your organization code, user email, lead code when relevant, and the action that failed so support can trace the correct workflow.",
  },
];

export default function FaqsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [openQuestion, setOpenQuestion] = useState(faqs[0]?.question ?? "");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(faqs.map((faq) => faq.category)))],
    [],
  );

  const filteredFaqs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return faqs.filter((faq) => {
      const matchesCategory = category === "All" || faq.category === category;
      const matchesQuery =
        !normalizedQuery ||
        faq.question.toLowerCase().includes(normalizedQuery) ||
        faq.answer.toLowerCase().includes(normalizedQuery) ||
        faq.category.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <div className="overflow-hidden bg-[#f7fbf7]">
      <section className="relative px-5 pb-20 pt-36 md:px-8">
        <div className="pointer-events-none absolute right-[-220px] top-[-170px] h-[620px] w-[620px] rounded-full border border-emerald-900/10" />
        <div className="pointer-events-none absolute left-10 top-28 hidden grid-cols-3 gap-2 md:grid">
          {Array.from({ length: 9 }).map((_, index) => (
            <span key={index} className="h-1.5 w-1.5 rounded-full bg-emerald-900/15" />
          ))}
        </div>

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

          <div className="grid gap-12 lg:grid-cols-[1fr_420px] lg:items-end">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-[clamp(42px,6vw,78px)] font-bold leading-[1.07] text-[#0b1713]">
                Answers before the pipeline slows down.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600">
                Search common PLMS questions across access, roles, leads,
                activities, offers, organizations, security, and support.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.28 }}
              className="rounded-[1.75rem] border border-emerald-950/10 bg-white/85 p-5 shadow-[0_24px_70px_rgba(6,78,59,0.1)] backdrop-blur"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-700" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search questions"
                  className="h-12 w-full rounded-full border border-emerald-950/10 bg-[#fbfefb] pl-11 pr-4 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      category === item
                        ? "bg-[#0b1713] text-white"
                        : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-y border-emerald-950/10 bg-white px-5 py-20 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[280px_1fr]">
          <StickyTOC
            label="Categories"
            sections={categories.map((item) => ({ id: item, heading: item }))}
            activeId={category}
            observeSections={false}
            onSelect={setCategory}
            related={[{ label: "Still need help", href: "/contact" }]}
          />

          <div className="space-y-4">
            {filteredFaqs.length ? (
              filteredFaqs.map((faq, index) => {
                const isOpen = openQuestion === faq.question;
                return (
                  <motion.article
                    key={faq.question}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: index * 0.025 }}
                    className="overflow-hidden rounded-2xl border border-emerald-950/10 bg-[#fbfefb]"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenQuestion(isOpen ? "" : faq.question)}
                      className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left"
                    >
                      <span>
                        <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                          {faq.category}
                        </span>
                        <span className="text-base font-bold text-[#0b1713]">
                          {faq.question}
                        </span>
                      </span>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-emerald-800 shadow-sm">
                        {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28 }}
                        >
                          <p className="border-t border-emerald-950/10 px-5 py-5 text-sm leading-8 text-slate-600">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.article>
                );
              })
            ) : (
              <div className="rounded-2xl border border-emerald-950/10 bg-[#fbfefb] p-8 text-center">
                <p className="font-semibold text-[#0b1713]">No FAQs found.</p>
                <p className="mt-2 text-sm text-slate-600">
                  Try a different search term or category.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
