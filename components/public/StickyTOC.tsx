"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";

type TocSection = {
  id: string;
  heading: string;
};

type RelatedLink = {
  label: string;
  href: string;
};

type StickyTOCProps = {
  label?: string;
  sections: TocSection[];
  related?: RelatedLink[];
  activeId?: string;
  onSelect?: (id: string) => void;
  observeSections?: boolean;
};

export default function StickyTOC({
  label = "Contents",
  sections,
  related,
  activeId,
  onSelect,
  observeSections = true,
}: StickyTOCProps) {
  const [observedActiveId, setObservedActiveId] = useState(sections[0]?.id ?? "");
  const currentActiveId = activeId ?? observedActiveId;

  useEffect(() => {
    if (!observeSections) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length) setObservedActiveId(visible[0].target.id);
      },
      { rootMargin: "-18% 0px -68% 0px", threshold: 0 },
    );

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [observeSections, sections]);

  const handleSelect = (id: string) => {
    if (onSelect) {
      onSelect(id);
      return;
    }

    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="hidden self-start lg:block">
      <div className="lg:fixed lg:top-28 lg:w-[260px]">
        <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          {label}
        </p>

        <nav className="relative">
          <div className="absolute bottom-0 left-0 top-0 w-0.5 rounded-full bg-emerald-950/10" />

          <div className="space-y-px pl-5">
            {sections.map((section, index) => {
              const isActive = currentActiveId === section.id;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => handleSelect(section.id)}
                  className={`group relative w-full rounded-r-lg px-2.5 py-2 text-left transition-all duration-200 ${
                    isActive ? "bg-emerald-50" : "hover:bg-emerald-50/70"
                  }`}
                >
                  <span
                    className={`absolute left-[-19px] top-1/2 w-[3px] -translate-y-1/2 rounded-full bg-emerald-600 transition-all duration-300 ${
                      isActive ? "h-7 opacity-100" : "h-0 opacity-0"
                    }`}
                  >
                  </span>
                  <span className="flex items-center gap-2.5">
                    <span
                      className={`shrink-0 text-[10px] font-bold tabular-nums transition-colors ${
                        isActive ? "text-emerald-700" : "text-emerald-950/20"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`text-[12px] font-medium leading-tight transition-colors ${
                        isActive
                          ? "text-emerald-800"
                          : "text-slate-400 group-hover:text-emerald-700"
                      }`}
                    >
                      {section.heading}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {related && related.length > 0 && (
          <div className="mt-10 border-t border-emerald-950/10 pt-7">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Related
            </p>
            <div className="space-y-2.5">
              {related.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center gap-1.5 text-[12px] font-medium text-slate-400 transition-colors hover:text-emerald-700"
                >
                  {link.label}
                  <ArrowUpRight className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
