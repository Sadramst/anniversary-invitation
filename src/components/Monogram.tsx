import type { Lang } from "@/lib/types";

interface MonogramProps {
  /** Latin initials, e.g. "NS". */
  initials: string;
  /** Persian initials, e.g. "ن ص". Falls back to the Latin pair. */
  initialsFa?: string;
  lang: Lang;
  className?: string;
}

/**
 * A gold laurel wreath enclosing the couple's two initials, split by a hairline
 * rule - the small crest that sits in the corner of the reference invitation.
 *
 * Drawn entirely in SVG so it stays sharp at any size, recolours with the theme
 * and costs nothing to download. In Farsi the Persian initials are used, so the
 * crest never mixes scripts with the rest of the page.
 */
export function Monogram({ initials, initialsFa, lang, className }: MonogramProps) {
  const fa = lang === "fa";

  const latin = initials.replace(/[^\p{L}]/gu, "").toUpperCase();
  const persian = (initialsFa ?? "").replace(/\s+/g, "");

  const pair = fa && persian.length >= 2 ? [persian[0], persian[1]] : [latin[0] ?? "A", latin[1] ?? ""];

  const fontFamily = fa
    ? "var(--font-vazirmatn), system-ui, sans-serif"
    : "var(--font-dm-serif), Georgia, serif";

  /** One side of the laurel, mirrored for the other. */
  const laurel = (
    <g>
      {/* Curved stem hugging the ring */}
      <path
        d="M 100 22 A 78 78 0 0 0 22 100 A 78 78 0 0 0 100 178"
        fill="none"
        stroke="#c2a05a"
        strokeWidth="1.1"
        opacity="0.9"
      />
      {/* Leaves stepping along the stem */}
      {Array.from({ length: 11 }, (_, i) => {
        const t = 0.06 + i * 0.088; // position along the arc
        const angle = 90 + t * 180; // degrees around the circle
        const rad = (angle * Math.PI) / 180;
        const cx = 100 + 78 * Math.cos(rad);
        const cy = 100 + 78 * Math.sin(rad);
        const size = 13 - Math.abs(i - 5) * 0.85;
        return (
          <ellipse
            key={i}
            cx={cx}
            cy={cy}
            rx={size}
            ry={size * 0.4}
            fill="#c2a05a"
            opacity="0.85"
            transform={`rotate(${angle + 24} ${cx} ${cy})`}
          />
        );
      })}
    </g>
  );

  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label={
        fa
          ? `نشان سالگرد ${pair[0]}${pair[1] ? ` و ${pair[1]}` : ""}`
          : `Anniversary crest for ${pair[0]}${pair[1] ? ` and ${pair[1]}` : ""}`
      }
    >
      {laurel}
      <g transform="scale(-1 1) translate(-200 0)">{laurel}</g>

      {/* Ribbon knot where the two stems meet at the foot */}
      <path
        d="M 92 179 q 8 -6 16 0 q -8 8 -16 0 Z"
        fill="#c2a05a"
        opacity="0.9"
      />

      {/* Initials, split by a hairline rule. In Farsi the first initial sits on
          the right, because Persian reads right-to-left. */}
      <text
        x={pair[1] ? (fa ? 124 : 76) : 100}
        y="104"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#a9853f"
        style={{ fontFamily, fontSize: "46px" }}
      >
        {pair[0]}
      </text>

      {pair[1] ? (
        <>
          <line x1="100" y1="74" x2="100" y2="130" stroke="#c2a05a" strokeWidth="1.1" opacity="0.8" />
          <text
            x={fa ? 76 : 124}
            y="104"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#a9853f"
            style={{ fontFamily, fontSize: "46px" }}
          >
            {pair[1]}
          </text>
        </>
      ) : null}
    </svg>
  );
}
