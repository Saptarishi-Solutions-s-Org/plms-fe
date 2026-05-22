"use client";

import { useState, useEffect } from "react";
import { Phone, Mail, HelpCircle, Move } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Position = "bottom-right" | "bottom-left" | "top-right" | "top-left";

const POSITION_CLASSES: Record<Position, string> = {
  "bottom-right": "bottom-6 right-6",
  "bottom-left": "bottom-6 left-6",
  "top-right": "top-6 right-6",
  "top-left": "top-6 left-6",
};

const TEAM = [
  {
    name: "Sriram Gandrothu",
    role: "System Maintainer",
    phone: "+91 78427 13943",
    phoneHref: "tel:+917842713943",
    email: "sriram.gandrothu@saptarishi.tech",
  },
  {
    name: "Nani Rongali",
    role: "System Maintainer",
    phone: "+91 83328 89468",
    phoneHref: "tel:+918332889468",
    email: "nani.rongali@saptarishi.tech",
  },
] as const;

export function SystemAssistancePopover() {
  const [position, setPosition] = useState<Position>("bottom-right");
  const [posOpen, setPosOpen] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("system-assist-position") as Position | null;
    if (saved && POSITION_CLASSES[saved]) {
      window.setTimeout(() => setPosition(saved), 0);
    }
  }, []);

  const updatePosition = (pos: Position) => {
    setPosition(pos);
    setPosOpen(false);
    sessionStorage.setItem("system-assist-position", pos);
  };

  return (
    <div className={`fixed z-[999] ${POSITION_CLASSES[position]}`}>
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-950/10 bg-white shadow-sm transition-all duration-200 hover:border-emerald-300 hover:shadow-md"
            aria-label="System assistance"
          >
            <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <HelpCircle size={16} className="text-emerald-700" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          side="top"
          align="end"
          sideOffset={10}
          className="w-[260px] overflow-hidden rounded-2xl border border-emerald-950/10 bg-white p-0 shadow-[0_8px_40px_rgba(6,78,59,0.14)]"
        >
          <div className="flex items-center justify-between border-b border-emerald-950/10 bg-[#f7fbf7] px-4 py-3">
            <div className="flex items-center gap-2">
              <HelpCircle size={13} className="text-emerald-700" />
              <span className="text-[12px] font-semibold text-[#0b1713]">
                System Assistance
              </span>
            </div>

            <Popover open={posOpen} onOpenChange={setPosOpen}>
              <PopoverTrigger asChild>
                <button
                  className="flex h-6 w-6 items-center justify-center rounded-lg border border-emerald-950/10 bg-white transition hover:border-emerald-300 hover:bg-emerald-50"
                  aria-label="Move widget"
                >
                  <Move size={11} className="text-slate-400" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="left"
                align="start"
                className="w-40 rounded-xl border border-emerald-950/10 bg-white p-1.5 shadow-[0_4px_20px_rgba(6,78,59,0.1)]"
              >
                <p className="px-2 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Move to
                </p>
                {(
                  [
                    ["top-left", "Top Left"],
                    ["top-right", "Top Right"],
                    ["bottom-left", "Bottom Left"],
                    ["bottom-right", "Bottom Right"],
                  ] as [Position, string][]
                ).map(([pos, label]) => (
                  <button
                    key={pos}
                    onClick={() => updatePosition(pos)}
                    className={`w-full rounded-lg px-2 py-1.5 text-left text-[12px] font-medium transition-colors ${
                      position === pos
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                    }`}
                  >
                    {label}
                    {position === pos && <span className="ml-1.5 text-[10px]">✓</span>}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </div>

          <div className="divide-y divide-emerald-950/10">
            {TEAM.map((person) => (
              <div key={person.email} className="px-4 py-4">
                <div className="mb-3">
                  <p className="text-[13px] font-semibold leading-tight text-[#0b1713]">
                    {person.name}
                  </p>
                  <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                    {person.role}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <a
                    href={person.phoneHref}
                    className="group flex items-center gap-2 text-[11px] text-slate-600 transition-colors hover:text-emerald-700"
                  >
                    <Phone size={11} className="shrink-0 text-emerald-300 group-hover:text-emerald-700" />
                    <span className="font-medium">{person.phone}</span>
                  </a>
                  <a
                    href={`mailto:${person.email}`}
                    className="group flex items-center gap-2 text-[11px] text-slate-600 transition-colors hover:text-emerald-700"
                  >
                    <Mail size={11} className="shrink-0 text-emerald-300 group-hover:text-emerald-700" />
                    <span className="truncate font-medium">{person.email}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-emerald-950/10 bg-[#f7fbf7] px-4 py-2.5 text-center">
            <p className="text-[10px] tracking-wide text-slate-400">
              Please feel free to contact us.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
