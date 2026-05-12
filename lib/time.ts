const IST = "Asia/Kolkata";

function buildParts(date: string | Date) {
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: IST,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(new Date(date));

  const map: Record<string, string> = {};
  parts.forEach((p) => {
    if (p.type !== "literal") map[p.type] = p.value;
  });

  return map;
}

export function toIST(date: string | Date | null | undefined) {
  if (!date) return "-";

  const p = buildParts(date);

  return `${p.day} ${p.month} ${p.year}, ${p.hour}:${p.minute} ${p.dayPeriod.toLowerCase()}`;
}

export function toISTDate(date: string | Date | null | undefined) {
  if (!date) return "-";

  const p = buildParts(date);

  return `${p.day} ${p.month} ${p.year}`;
}

export function toISTTime(date: string | Date | null | undefined) {
  if (!date) return "-";

  const p = buildParts(date);

  return `${p.hour}:${p.minute} ${p.dayPeriod.toLowerCase()}`;
}

export function nowUTC() {
  return new Date().toISOString();
}

export function todayIST() {
  const now = new Date();

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

// For Shifts only
export function formatTime12h(time: string | null | undefined) {
  if (!time || time === "--:--") return "--:--";

  const parts = time.split(":");
  if (parts.length < 2) return "--:--";

  const h = Number(parts[0]);
  const m = Number(parts[1]);

  if (isNaN(h) || isNaN(m)) return "--:--";

  const date = new Date();
  date.setHours(h, m, 0, 0);

  const formatted = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return formatted.replace("am", "AM").replace("pm", "PM");
}

export function toHHMM(time: string | null) {
  if (!time) return "";
  return time.slice(0, 5);
}

export function formatLabel(h: number, m: number) {
  const d = new Date();
  d.setHours(h, m);
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatTime(date: Date) {
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

export function formatWorkedTime(minutes: number) {
  if (!minutes || minutes < 0) return "00:00";

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function formatDurationHM(minutes: number | null | undefined) {
  if (!minutes || minutes <= 0) return "0 min";

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;

  return `${h} hr ${m} min`;
}

export function getISTMinutes(date: string | Date | null | undefined) {
  if (!date) return 0;

  const d = new Date(date);

  const utc = d.getTime() + d.getTimezoneOffset() * 60000;

  const ist = new Date(utc + 5.5 * 60 * 60 * 1000);

  return ist.getHours() * 60 + ist.getMinutes();
}

export function getISTDateOnly(date: string | Date) {
  const d = new Date(date);

  const ist = new Date(d.toLocaleString("en-US", { timeZone: IST }));

  ist.setHours(0, 0, 0, 0);

  return ist;
}

export function getTodayISTDateOnly() {
  const now = new Date();

  const ist = new Date(now.toLocaleString("en-US", { timeZone: IST }));

  ist.setHours(0, 0, 0, 0);

  return ist;
}
