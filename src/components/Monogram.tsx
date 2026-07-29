import type { Lang } from "@/lib/types";

interface MonogramProps {
  /** Couple initials, e.g. "SM" -> S ✕ M. Falls back gracefully to 1 or 2 letters. */
  initials: string;
  lang: Lang;
  className?: string;
  /** Larger, fully detailed treatment for the hero; compact for the footer. */
  variant?: "hero" | "compact";
}

/**
 * The 10th-anniversary monogram, generated entirely in SVG from the couple's
 * initials interlaced with the Roman numeral X (ten). No image asset needed,
 * so it stays razor sharp at every size and adds nothing to page weight.
 */
export function Monogram({ initials, lang, className, variant = "hero" }: MonogramProps) {
  const letters = initials.replace(/[^\p{L}]/gu, "").toUpperCase();
  const first = letters[0] ?? "A";
  const second = letters[1] ?? "";

  const compact = variant === "compact";
  const caption = lang === "fa" ? "ده سال" : "TEN YEARS";

  return (
    <svg
      viewBox="0 0 240 240"
      className={className}
      role="img"
      aria-label={
        lang === "fa"
          ? `نشان دهمین سالگرد ${first}${second ? ` و ${second}` : ""}`
          : `Tenth anniversary monogram for ${first}${second ? ` and ${second}` : ""}`
      }
    >
      <defs>
        <linearGradient id="mono-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b7924f" />
          <stop offset="35%" stopColor="#eddba6" />
          <stop offset="60%" stopColor="#c9a96e" />
          <stop offset="100%" stopColor="#9d7a3f" />
        </linearGradient>
        <linearGradient id="mono-rose" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c8737a" />
          <stop offset="100%" stopColor="#e8c4c0" />
        </linearGradient>
      </defs>

      {/* Outer hairline */}
      <circle cx="120" cy="120" r="113" fill="none" stroke="url(#mono-gold)" strokeWidth="0.8" opacity="0.45" />

      {/* Main ring, broken at the top to seat the numeral */}
      <path
        d="M 164.3 29.2 A 101 101 0 1 1 75.7 29.2"
        fill="none"
        stroke="url(#mono-gold)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Roman numeral ten, sitting in the break */}
      <text
        x="120"
        y="30"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="url(#mono-gold)"
        style={{ fontFamily: "var(--font-dm-serif), Georgia, serif", fontSize: "32px", letterSpacing: "1px" }}
      >
        X
      </text>

      {/* Initials, set side by side so both stay perfectly legible */}
      {second ? (
        <>
          <text
            x="82"
            y="122"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="url(#mono-gold)"
            style={{ fontFamily: "var(--font-dm-serif), Georgia, serif", fontSize: "66px" }}
          >
            {first}
          </text>
          <text
            x="120"
            y="126"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="url(#mono-rose)"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "40px",
              fontStyle: "italic",
            }}
          >
            &amp;
          </text>
          <text
            x="158"
            y="122"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="url(#mono-gold)"
            style={{ fontFamily: "var(--font-dm-serif), Georgia, serif", fontSize: "66px" }}
          >
            {second}
          </text>
        </>
      ) : (
        <text
          x="120"
          y="122"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="url(#mono-gold)"
          style={{ fontFamily: "var(--font-dm-serif), Georgia, serif", fontSize: "76px" }}
        >
          {first}
        </text>
      )}

      {/* Hairline separator + caption */}
      {!compact && (
        <>
          <line x1="84" y1="158" x2="112" y2="158" stroke="url(#mono-gold)" strokeWidth="0.9" opacity="0.85" />
          <rect
            x="116.5"
            y="154.5"
            width="7"
            height="7"
            transform="rotate(45 120 158)"
            fill="url(#mono-gold)"
            opacity="0.9"
          />
          <line x1="128" y1="158" x2="156" y2="158" stroke="url(#mono-gold)" strokeWidth="0.9" opacity="0.85" />
          <text
            x="120"
            y="182"
            textAnchor="middle"
            fill="#e6cf9d"
            style={{
              fontFamily:
                lang === "fa"
                  ? "var(--font-vazirmatn), system-ui, sans-serif"
                  : "var(--font-cormorant), Georgia, serif",
              fontSize: lang === "fa" ? "16px" : "18px",
              letterSpacing: lang === "fa" ? "0" : "7px",
            }}
          >
            {caption}
          </text>
        </>
      )}

      {/* Small counterweight at the foot of the ring, balancing the numeral */}
      <rect
        x="116"
        y="217"
        width="8"
        height="8"
        transform="rotate(45 120 221)"
        fill="url(#mono-gold)"
        opacity="0.85"
      />
    </svg>
  );
}
