import content from "@data/content.data.json";

import type { Lang } from "./types";

/**
 * Every visible string comes from `data/content.data.json` so the invitation can
 * be reworded without touching any code. This module only adds types and the
 * handful of helpers that need real logic.
 */

export interface Pillar {
  title: string;
  body: string;
}

export interface Copy {
  dir: "rtl" | "ltr";
  htmlLang: string;
  greetingPrefix: string;
  anniversaryLabel: string;
  invitation: string[];
  pillars: Pillar[];
  detailsTitle: string;
  whenLabel: string;
  whereLabel: string;
  dressLabel: string;
  dressValue: string;
  directionsHint: string;
  countdownTitle: string;
  countdownUnits: { days: string; hours: string; minutes: string; seconds: string };
  countdownToday: string;
  countdownPast: string;
  calendarTitle: string;
  calendarApple: string;
  calendarGoogle: string;
  footerClosing: string;
  switchTo: string;
  switchLabel: string;
  skipToContent: string;
  scrollCue: string;
  privateTitle: string;
  privateBody: string;
}

export const COPY: Record<Lang, Copy> = {
  fa: content.fa as Copy,
  en: content.en as Copy,
};

export const DEFAULT_LANG: Lang = "fa";

export function isLang(value: unknown): value is Lang {
  return value === "fa" || value === "en";
}
