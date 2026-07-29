"use client";

import { useEffect, useState } from "react";

import { toFaDigits } from "@/lib/event";
import { useLanguage } from "./LanguageProvider";

interface CountdownProps {
  /** Event start as a UTC ISO string, resolved at build time. */
  startUtcIso: string;
}

function diff(target: number, now: number) {
  const ms = Math.max(0, target - now);
  return {
    total: ms,
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms / 3_600_000) % 24),
    minutes: Math.floor((ms / 60_000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  };
}

export function Countdown({ startUtcIso }: CountdownProps) {
  const { lang, copy } = useLanguage();
  const target = new Date(startUtcIso).getTime();

  // null until mounted: the server has no "now", so we render a stable placeholder
  // first and avoid any hydration mismatch.
  const [left, setLeft] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    const tick = () => setLeft(diff(target, Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  const fmt = (n: number) => {
    const padded = String(n).padStart(2, "0");
    return lang === "fa" ? toFaDigits(padded) : padded;
  };

  const units = left
    ? ([
        { value: fmt(left.days), label: copy.countdownUnits.days },
        { value: fmt(left.hours), label: copy.countdownUnits.hours },
        { value: fmt(left.minutes), label: copy.countdownUnits.minutes },
        { value: fmt(left.seconds), label: copy.countdownUnits.seconds },
      ] as const)
    : ([
        { value: "—", label: copy.countdownUnits.days },
        { value: "—", label: copy.countdownUnits.hours },
        { value: "—", label: copy.countdownUnits.minutes },
        { value: "—", label: copy.countdownUnits.seconds },
      ] as const);

  const finished = left !== null && left.total === 0;

  return (
    <section aria-labelledby="countdown-title" data-testid="countdown" className="text-center">
      <h3 id="countdown-title" className="text-xs uppercase tracking-[0.28em] text-gold-soft/85">
        {copy.countdownTitle}
      </h3>

      {finished ? (
        <p className="heading mt-5 text-2xl text-rose-soft">{copy.countdownPast}</p>
      ) : (
        <ul
          className="mt-5 flex items-stretch justify-center gap-2.5 sm:gap-4"
          aria-live="off"
        >
          {units.map((unit) => (
            <li
              key={unit.label}
              className="glass-card flex min-w-[68px] flex-col items-center gap-1 rounded-2xl px-3 py-3.5 sm:min-w-[86px] sm:px-5"
            >
              <span
                className="heading gold-text text-2xl tabular-nums sm:text-4xl"
                // Digits are the same visual sequence in both scripts; keep them LTR.
                dir="ltr"
              >
                {unit.value}
              </span>
              <span className="text-[0.62rem] tracking-wider text-cream-dim sm:text-xs">{unit.label}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
