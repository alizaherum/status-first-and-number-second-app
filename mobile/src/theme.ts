import { CategoryKey, EffortKey } from "./types";

export interface Palette {
  bg: string;
  surface: string;
  surface2: string;
  ink: string;
  ink2: string;
  inkMuted: string;
  border: string;
  borderStrong: string;
  accent: string;
  accentInk: string;
  accentSoft: string;
  category: Record<CategoryKey, string>;
  sequential: string[];
  status: { good: string; warning: string; critical: string };
}

export const lightPalette: Palette = {
  bg: "#f5f6f8",
  surface: "#ffffff",
  surface2: "#eef0f4",
  ink: "#14161b",
  ink2: "#52565f",
  inkMuted: "#898781",
  border: "rgba(11,11,11,0.10)",
  borderStrong: "rgba(11,11,11,0.16)",
  accent: "#4a3aa7",
  accentInk: "#ffffff",
  accentSoft: "#4a3aa71a",
  category: {
    admin: "#2a78d6",
    comm: "#eb6834",
    creative: "#1baf7a",
    learning: "#c98500",
    errands: "#e87ba4",
    physical: "#008300",
  },
  sequential: ["#cde2fb", "#9ec5f4", "#6da7ec", "#3987e5", "#256abf", "#184f95", "#0d366b"],
  status: { good: "#0ca30c", warning: "#c9820a", critical: "#d03b3b" },
};

export const darkPalette: Palette = {
  bg: "#0e0f12",
  surface: "#17181d",
  surface2: "#1e2026",
  ink: "#f3f4f7",
  ink2: "#c3c2b7",
  inkMuted: "#8b8d96",
  border: "rgba(255,255,255,0.10)",
  borderStrong: "rgba(255,255,255,0.18)",
  accent: "#9085e9",
  accentInk: "#14161b",
  accentSoft: "#9085e926",
  category: {
    admin: "#3987e5",
    comm: "#d95926",
    creative: "#199e70",
    learning: "#c98500",
    errands: "#d55181",
    physical: "#3fbf3f",
  },
  sequential: ["#12233b", "#15335a", "#184f95", "#256abf", "#3987e5", "#6da7ec", "#9ec5f4"],
  status: { good: "#0ca30c", warning: "#e0a020", critical: "#e66767" },
};

export const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "admin", label: "Admin" },
  { key: "comm", label: "Communication" },
  { key: "creative", label: "Creative" },
  { key: "learning", label: "Learning" },
  { key: "errands", label: "Errands" },
  { key: "physical", label: "Physical" },
];

export const EFFORT_LEVELS: { key: EffortKey; label: string; short: string; minutes: number }[] = [
  { key: "quick", label: "Quick (< 15 min)", short: "Quick", minutes: 10 },
  { key: "medium", label: "Medium (15–60 min)", short: "Medium", minutes: 35 },
  { key: "deep", label: "Deep (60 min+)", short: "Deep", minutes: 90 },
];

export interface TimeBucket {
  key: string;
  label: string;
  short: string;
  phrase: string;
  test: (h: number) => boolean;
}

export const TIME_BUCKETS: TimeBucket[] = [
  { key: "night", label: "Night", short: "10p–6a", phrase: "scheduled late at night (10pm–6am)", test: (h) => h >= 22 || h < 6 },
  { key: "early", label: "Early", short: "6–9a", phrase: "scheduled early (6–9am)", test: (h) => h >= 6 && h < 9 },
  { key: "morning", label: "Morning", short: "9–12p", phrase: "scheduled midmorning (9am–12pm)", test: (h) => h >= 9 && h < 12 },
  { key: "midday", label: "Midday", short: "12–3p", phrase: "scheduled around midday (12–3pm)", test: (h) => h >= 12 && h < 15 },
  { key: "afternoon", label: "Afternoon", short: "3–6p", phrase: "scheduled in the afternoon (3–6pm)", test: (h) => h >= 15 && h < 18 },
  { key: "evening", label: "Evening", short: "6–10p", phrase: "scheduled in the evening (6–10pm)", test: (h) => h >= 18 && h < 22 },
];

export function bucketForHour(h: number): TimeBucket {
  return TIME_BUCKETS.find((tb) => tb.test(h)) ?? TIME_BUCKETS[0];
}

export function fmtHour(h: number): string {
  const period = h < 12 ? "AM" : "PM";
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:00 ${period}`;
}
