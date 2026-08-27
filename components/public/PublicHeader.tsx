"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogIn, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const publicNavLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
];

export default function PublicHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-emerald-950/10 bg-[#f7fbf7]/92 shadow-[0_10px_40px_rgba(6,95,70,0.08)] backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[58px] max-w-7xl items-center justify-between px-5 md:px-8">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/"
              className="flex items-center gap-3"
              aria-label="Samricha home"
            >
              <Image
                src="/samricha.png"
                alt="Samricha Logo"
                width={120}
                height={38}
                priority
                className="h-9 w-auto object-contain"
                style={{ width: "auto", height: "auto" }}
              />
            </Link>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            align="start"
            className="max-w-[280px] bg-slate-900 border border-slate-800 text-slate-100 p-4 rounded-xl shadow-xl z-[100]"
          >
            <div className="space-y-2 text-xs">
              <p className="font-bold text-sm text-white">
                <span className="text-violet-400">Sam</span>
                <span className="text-emerald-400">ri</span>
                <span className="text-amber-400">cha</span>
              </p>
              <div className="space-y-1.5 leading-relaxed text-slate-300">
                <p>
                  <strong className="text-violet-400 font-semibold">SAM:</strong> Smart, Structured, and Strategic management
                </p>
                <p>
                  <strong className="text-emerald-400 font-semibold">RI:</strong> Relationships and Intelligence
                </p>
                <p>
                  <strong className="text-amber-400 font-semibold">CHA:</strong> Customer Handling and Advancement
                </p>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>

        <nav className="hidden items-center gap-1 md:flex">
          {publicNavLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative px-4 py-2 text-[13px] font-medium transition-colors ${
                  active
                    ? "text-emerald-800"
                    : "text-slate-600 hover:text-emerald-800"
                }`}
              >
                {link.label}
                <span
                  className={`absolute bottom-0 left-4 right-4 h-[1.5px] origin-left bg-emerald-600 transition-transform duration-300 ${
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
          <Link
            href="/login"
            className="ml-4 inline-flex h-9 items-center gap-2 rounded-full bg-[#0b1713] px-5 text-[13px] font-semibold text-white shadow-[0_14px_30px_rgba(11,23,19,0.18)] transition hover:-translate-y-0.5 hover:bg-emerald-900"
          >
            <LogIn className="h-4 w-4" />
            Login
          </Link>
        </nav>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMenuOpen((next) => !next)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <div
        className={`overflow-hidden border-t border-emerald-950/10 bg-[#f7fbf7] transition-all duration-300 md:hidden ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-1 px-5 py-4">
          {publicNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-md px-3 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#0b1713] px-5 py-3 text-sm font-semibold text-white"
          >
            <LogIn className="h-4 w-4" />
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
