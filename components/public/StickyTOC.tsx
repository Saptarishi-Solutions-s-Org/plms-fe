"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

type RailMode = "normal" | "fixed" | "bottom";

type RailState = {
  mode: RailMode;
  left: number;
  top: number;
  width: number;
  height: number;
};

const STICKY_OFFSET = 112;

export default function StickyTOC({
  label = "Contents",
  sections,
  related,
  activeId,
  onSelect,
  observeSections = true,
}: StickyTOCProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [observedActiveId, setObservedActiveId] = useState(sections[0]?.id ?? "");
  const [railState, setRailState] = useState<RailState>({
    mode: "normal",
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });
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

  useEffect(() => {
    let frame = 0;

    const syncRail = () => {
      const wrapper = wrapperRef.current;
      const rail = railRef.current;
      const container = wrapper?.parentElement;
      if (!wrapper || !rail || !container) return;

      const scrollY = window.scrollY;
      const wrapperRect = wrapper.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const railHeight = rail.offsetHeight;
      const wrapperTop = wrapperRect.top + scrollY;
      const containerTop = containerRect.top + scrollY;
      const containerBottom = containerRect.bottom + scrollY;
      const width = wrapperRect.width;

      let nextState: RailState;
      if (scrollY + STICKY_OFFSET < containerTop) {
        nextState = {
          mode: "normal",
          left: 0,
          top: 0,
          width,
          height: railHeight,
        };
      } else if (scrollY + STICKY_OFFSET + railHeight >= containerBottom) {
        nextState = {
          mode: "bottom",
          left: 0,
          top: Math.max(containerBottom - wrapperTop - railHeight, 0),
          width,
          height: railHeight,
        };
      } else {
        nextState = {
          mode: "fixed",
          left: wrapperRect.left,
          top: STICKY_OFFSET,
          width,
          height: railHeight,
        };
      }

      setRailState((current) => {
        if (
          current.mode === nextState.mode &&
          Math.abs(current.left - nextState.left) < 0.5 &&
          Math.abs(current.top - nextState.top) < 0.5 &&
          Math.abs(current.width - nextState.width) < 0.5 &&
          Math.abs(current.height - nextState.height) < 0.5
        ) {
          return current;
        }

        return nextState;
      });
    };

    const requestSync = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(syncRail);
    };

    requestSync();
    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestSync);
      window.removeEventListener("resize", requestSync);
    };
  }, [sections.length, related?.length]);

  const handleSelect = (id: string) => {
    if (onSelect) {
      onSelect(id);
      return;
    }

    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const railStyle: CSSProperties =
    railState.mode === "fixed"
      ? {
          position: "fixed",
          left: railState.left,
          top: railState.top,
          width: railState.width,
        }
      : railState.mode === "bottom"
        ? {
            position: "absolute",
            left: 0,
            top: railState.top,
            width: railState.width,
          }
        : {
            position: "relative",
            width: "100%",
          };

  return (
    <div
      ref={wrapperRef}
      className="relative hidden self-start lg:block"
      style={{ minHeight: railState.height || undefined }}
    >
      <div ref={railRef} style={railStyle}>
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
