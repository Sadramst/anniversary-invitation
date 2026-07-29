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

      {/* Double ring */}
      <circle cx="120" cy="120" r="112" fill="none" stroke="url(#mono-gold)" strokeWidth="1.1" opacity="0.75" />
      <circle cx="120" cy="120" r="104" fill="none" stroke="url(#mono-gold)" strokeWidth="2.2" />

      {/* Ring flourishes at the four cardinal points */}
      {[0, 90, 180, 270].map((deg) => (
        <g key={deg} transform={`rotate(${deg} 120 120)`}>
          <circle cx="120" cy="8" r="3.4" fill="url(#mono-gold)" />
        </g>
      ))}

      {/* The Roman numeral X for ten, sitting behind the initials */}
      <text
        x="120"
        y="132"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="url(#mono-rose)"
        opacity="0.34"
        style={{ fontFamily: "var(--font-dm-serif), Georgia, serif", fontSize: "138px" }}
      >
        X
      </text>

      {/* Initials interlaced across the X */}
      <text
        x={second ? "78" : "120"}
        y="118"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="url(#mono-gold)"
        style={{ fontFamily: "var(--font-dm-serif), Georgia, serif", fontSize: "76px" }}
      >
        {first}
      </text>
      {second ? (
        <text
          x="162"
          y="140"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="url(#mono-gold)"
          style={{ fontFamily: "var(--font-dm-serif), Georgia, serif", fontSize: "76px" }}
        >
          {second}
        </text>
      ) : null}

      {/* Hairline separator + caption */}
      {!compact && (
        <>
          <line x1="74" y1="176" x2="166" y2="176" stroke="url(#mono-gold)" strokeWidth="0.9" opacity="0.8" />
          <text
            x="120"
            y="196"
            textAnchor="middle"
            fill="#e6cf9d"
            style={{
              fontFamily:
                lang === "fa"
                  ? "var(--font-vazirmatn), system-ui, sans-serif"
                  : "var(--font-cormorant), Georgia, serif",
              fontSize: lang === "fa" ? "17px" : "19px",
              letterSpacing: lang === "fa" ? "0" : "7px",
            }}
          >
            {caption}
          </text>
        </>
      )}
    </svg>
  );
}
