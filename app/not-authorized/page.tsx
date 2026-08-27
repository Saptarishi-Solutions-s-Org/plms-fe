"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { AuthUser, getUser, refreshSession } from "@/lib/auth";

/* ─────────────────────────────────────────────
   Correct role hierarchy:
   System Admin → Admin → Manager → Executive
───────────────────────────────────────────── */
const ROLES = [
  { id: 0, label: "System Admin", x: 0.5, y: 0.1, tier: 1 },
  { id: 1, label: "Admin", x: 0.5, y: 0.32, tier: 2 },
  { id: 2, label: "Manager", x: 0.5, y: 0.54, tier: 3 },
  { id: 3, label: "Executive", x: 0.5, y: 0.76, tier: 4 },
];

const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
];

const TIER_STYLES: Record<
  number,
  {
    fill: string;
    stroke: string;
    text: string;
    rx: number;
    ry: number;
  }
> = {
  1: { fill: "#111", stroke: "#111", text: "#fff", rx: 52, ry: 15 },
  2: { fill: "#1a1a1a", stroke: "#1a1a1a", text: "#fff", rx: 46, ry: 14 },
  3: { fill: "#EDE9FE", stroke: "#8B5CF6", text: "#5B21B6", rx: 42, ry: 13 },
  4: { fill: "#F5F2FF", stroke: "#C4B5FD", text: "#7C3AED", rx: 38, ry: 12 },
};

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "FAQs", href: "/faqs" },
  { label: "Services", href: "/services" },
  { label: "Gallery", href: "/gallery" },
];

const BG_DOTS = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: `${(i * 41 + 13) % 100}%`,
  top: `${(i * 59 + 5) % 100}%`,
  size: (i % 3) + 1,
  opacity: 0.05 + (i % 3) * 0.025,
}));

/* ── Interactive SVG hierarchy component ── */
function HierarchySVG({ currentRole }: { currentRole: string }) {
  const W = 420,
    H = 360;
  const [hovered, setHovered] = useState<number | null>(null);
  const [pulse, setPulse] = useState(0.38);

  const currentNode =
    ROLES.find((r) => r.label.toLowerCase() === currentRole.toLowerCase()) ??
    ROLES[3];

  useEffect(() => {
    let t = 0;
    let raf: number;
    const tick = () => {
      t += 0.035;
      setPulse(parseFloat((Math.sin(t) * 0.22 + 0.38).toFixed(3)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <svg
      viewBox={`30 0 ${W} ${H}`}
      width="120%"
      style={{ overflow: "visible" }}
      aria-label="SRS LMA role hierarchy"
    >
      {/* ── Edges ── */}
      {EDGES.map(([a, b], i) => {
        const n1 = ROLES[a],
          n2 = ROLES[b];
        const t1 = TIER_STYLES[n1.tier],
          t2 = TIER_STYLES[n2.tier];
        const x1 = n1.x * W,
          y1 = n1.y * H + t1.ry + 1;
        const x2 = n2.x * W,
          y2 = n2.y * H - t2.ry - 1;
        const mx = (x1 + x2) / 2,
          my = (y1 + y2) / 2;
        const d =
          Math.abs(x1 - x2) > 10
            ? `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`
            : `M${x1},${y1} L${x2},${y2}`;
        return (
          <g key={i}>
            <path
              d={d}
              fill="none"
              stroke="#d0ccc4"
              strokeWidth="0.85"
              strokeDasharray="3 3"
              opacity="0.75"
            />
            <circle cx={x2} cy={y2} r="2" fill="#C4B5FD" opacity="0.65" />
          </g>
        );
      })}

      {/* ── Nodes ── */}
      {ROLES.map((role) => {
        const cx = role.x * W,
          cy = role.y * H;
        const t = TIER_STYLES[role.tier];
        const isCur = role.id === currentNode.id;
        const isTop = role.id === 0;
        const isHov = hovered === role.id;

        return (
          <g
            key={role.id}
            style={{ cursor: "default" }}
            onMouseEnter={() => setHovered(role.id)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Breathing pulse ring on current user node */}
            {isCur && (
              <ellipse
                cx={cx}
                cy={cy}
                rx={t.rx + 14}
                ry={t.ry + 10}
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="1"
                strokeDasharray="5 3"
                opacity={pulse}
              />
            )}

            {/* Hover glow */}
            {isHov && !isCur && (
              <ellipse
                cx={cx}
                cy={cy}
                rx={t.rx + 8}
                ry={t.ry + 7}
                fill="#8B5CF6"
                fillOpacity="0.07"
              />
            )}

            {/* Node pill */}
            <ellipse
              cx={cx}
              cy={cy}
              rx={isHov && !isCur ? t.rx + 4 : t.rx}
              ry={isHov && !isCur ? t.ry + 3 : t.ry}
              fill={isCur ? "#8B5CF6" : t.fill}
              stroke={isCur ? "#7C3AED" : t.stroke}
              strokeWidth={isCur ? "1.8" : "1"}
              style={{ transition: "rx 0.2s, ry 0.2s, fill 0.2s" }}
            />

            {/* Label */}
            <text
              x={cx}
              y={cy + 4.5}
              textAnchor="middle"
              fontSize="11"
              fontFamily="'Poppins', sans-serif"
              fontWeight="600"
              letterSpacing="0.03em"
              fill={isCur ? "#fff" : isHov ? "#5B21B6" : t.text}
              style={{ pointerEvents: "none", transition: "fill 0.2s" }}
            >
              {role.label}
            </text>

            {/* YOU badge */}
            {isCur && (
              <g>
                <rect
                  x={cx + t.rx + 5 - 14}
                  y={cy - t.ry - 8}
                  width="28"
                  height="14"
                  rx="7"
                  fill="#8B5CF6"
                />
                <text
                  x={cx + t.rx + 5}
                  y={cy - t.ry + 0.5}
                  textAnchor="middle"
                  fontSize="8"
                  fontFamily="'Poppins', sans-serif"
                  fontWeight="700"
                  fill="#fff"
                  letterSpacing="0.1em"
                  style={{ pointerEvents: "none" }}
                >
                  YOU
                </text>
              </g>
            )}

            {/* Lock icon on System Admin node */}
            {isTop && (
              <g
                transform={`translate(${cx - 8}, ${cy - t.ry - 21})`}
                opacity="0.55"
              >
                <rect
                  x="1"
                  y="7"
                  width="14"
                  height="10"
                  rx="2.5"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="1.5"
                />
                <path
                  d="M4 7V5.5a4 4 0 0 1 8 0V7"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle cx="8" cy="12.5" r="1.5" fill="#fff" />
              </g>
            )}
          </g>
        );
      })}

      {/* "access denied" annotation from top node */}
      {(() => {
        const topCx = ROLES[0].x * W;
        const topCy = ROLES[0].y * H;
        const ax1 = topCx + TIER_STYLES[1].rx + 4,
          ay1 = topCy - 4;
        const ax2 = ax1 + 48,
          ay2 = ay1 - 20;
        return (
          <g opacity="0.5">
            <path
              d={`M${ax1},${ay1} C${ax1 + 20},${ay1} ${ax2 - 10},${ay2} ${ax2},${ay2}`}
              fill="none"
              stroke="#C4B5FD"
              strokeWidth="0.65"
              strokeDasharray="2.5 3"
            />
            <text
              x={ax2 + 3}
              y={ay2 + 1}
              fontSize="8"
              fill="#C4B5FD"
              fontFamily="'Playfair Display', Georgia, serif"
              fontStyle="italic"
            >
              access denied
            </text>
          </g>
        );
      })()}
    </svg>
  );
}

/* ── Page ── */
export default function NotAuthorizedPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(() => getUser());

  useEffect(() => {
    setMounted(true);
    if (!user) {
      refreshSession().then((session) => {
        if (session) setUser(session.user);
      });
    }
  }, [user]);

  const userRole = user?.role ?? "Executive";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-16 relative overflow-hidden select-none"
      style={{ background: "#FAFAF7", fontFamily: "var(--font-poppins)" }}
    >
      {/* Background scatter dots */}
      {BG_DOTS.map((d) => (
        <div
          key={d.id}
          className="absolute rounded-full bg-[#8B5CF6] pointer-events-none"
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            opacity: d.opacity,
          }}
        />
      ))}

      {/* Decorative rings */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute right-[-240px] top-[-200px] w-[680px] h-[680px] rounded-full border border-[#e4e0d8]" />
        <div className="absolute right-[-100px] top-[-70px] w-[420px] h-[420px] rounded-full border border-[#ede9e0]" />
        <div className="absolute left-[-200px] bottom-[-180px] w-[560px] h-[560px] rounded-full border border-[#e8e4da]" />
        <div
          className="absolute top-20 left-12 grid gap-2"
          style={{ gridTemplateColumns: "repeat(3, 6px)" }}
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]/10" />
          ))}
        </div>
        <div
          className="absolute bottom-20 right-12 grid gap-2"
          style={{ gridTemplateColumns: "repeat(3, 6px)" }}
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]/20" />
          ))}
        </div>
        <span
          className="absolute bottom-8 right-10 font-bold text-[#f0ece4] leading-none pointer-events-none"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 96,
          }}
          aria-hidden
        >
          SRS
        </span>
      </div>

      {/* Main content */}
      <div
        className="relative z-10 w-full max-w-4xl"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <div className="relative h-[38px] w-[130px]">
            <Image
              src="/samricha.png"
              alt="Samricha"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Two-col grid */}
        <div className="grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-16 items-center mb-14">
          {/* LEFT — Hierarchy diagram */}
          <div className="relative w-full">
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              aria-hidden
            >
              <span
                className="font-bold text-[#f0ece4] leading-none"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "clamp(88px, 15vw, 152px)",
                  letterSpacing: "-0.05em",
                }}
              >
                403
              </span>
            </div>
            <div className="relative z-10">
              <HierarchySVG currentRole={userRole} />
            </div>
          </div>

          {/* RIGHT — Copy */}
          <div>
            <div className="flex items-center gap-3 mb-7">
              <span className="w-8 h-[1.5px] bg-[#8B5CF6]" />
              <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#8B5CF6]">
                Error 403
              </span>
            </div>

            <h1
              className="text-[clamp(32px,4.5vw,52px)] font-bold tracking-[-0.03em] leading-[1.07] text-[#111] mb-5"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Not{" "}
              <span
                className="italic text-[#8B5CF6]"
                style={{
                  fontFamily: "'Dancing Script', cursive",
                  fontSize: "1.05em",
                }}
              >
                your territory.
              </span>
            </h1>

            <p className="text-[14px] text-[#777] leading-[1.9] mb-5 max-w-xs">
              Your current role{" "}
              <span className="font-semibold text-[#1a1a1a]">({userRole})</span>{" "}
              doesn't have permission to access this page. Contact your
              administrator to review your access level.
            </p>

            {/* Permission chip */}
            <div className="inline-flex items-center gap-2.5 bg-white border border-[#ece8e0] rounded-full px-4 py-2 mb-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C4B5FD"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span className="text-[12px] font-semibold text-[#555]">
                Insufficient permissions for this route
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mb-10">
              <button
                onClick={() => router.back()}
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#1a1a1a] text-white text-[13px] font-semibold tracking-wide rounded-full hover:bg-[#2a2a2a] transition-all duration-200 hover:scale-[1.02] cursor-pointer"
              >
                <ArrowLeft size={14} />
                Go Back
              </button>
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 border border-[#d0ccc4] text-[#333] text-[13px] font-semibold tracking-wide rounded-full hover:border-[#8B5CF6] hover:text-[#8B5CF6] transition-all duration-200"
              >
                Dashboard
                <ArrowUpRight
                  size={13}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                />
              </Link>
            </div>

            {/* Quick links */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-[#e8e4da]" />
              <span className="text-[11px] text-[#ccc] tracking-wide">
                Quick Links
              </span>
              <div className="flex-1 h-px bg-[#e8e4da]" />
            </div>

            <div className="flex flex-wrap gap-2">
              {QUICK_LINKS.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-[11px] font-semibold px-3.5 py-1.5 rounded-full border border-[#ddd8d0] text-[#666] hover:border-[#8B5CF6] hover:text-[#8B5CF6] transition-all duration-200"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#e8e4da] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-[#c0bab2] tracking-wide">
            © {new Date().getFullYear()} Saptarishi Solutions Pvt. Ltd. ·
            Hyderabad
          </p>
          <p className="text-[11px] text-[#c0bab2]">
            Access is governed by your role in{" "}
            <span
              className="italic"
              style={{
                fontFamily: "'Dancing Script', cursive",
                fontSize: "1.18em",
                color: "#C4B5FD",
              }}
            >
              SRS LMA
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
