/**
 * Hand-drawn botanical decorations, all pure SVG so they stay razor sharp,
 * recolour with the theme and add nothing to the page weight.
 *
 * The reference invitation anchors a heavy floral cluster in two opposite
 * corners; `FloralCorner` renders one and is flipped with CSS for the other.
 */

interface CornerProps {
  className?: string;
  /** Mirrors the artwork for the opposite corner. */
  flip?: boolean;
}

function Petals({ cx, cy, r, fill, petals = 8 }: { cx: number; cy: number; r: number; fill: string; petals?: number }) {
  return (
    <g>
      {Array.from({ length: petals }, (_, i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy - r * 0.62}
          rx={r * 0.34}
          ry={r * 0.62}
          fill={fill}
          transform={`rotate(${(360 / petals) * i} ${cx} ${cy})`}
        />
      ))}
    </g>
  );
}

function Rose({ cx, cy, r, tone }: { cx: number; cy: number; r: number; tone: "wine" | "blush" | "cream" }) {
  const palette = {
    wine: { outer: "#7a1c33", mid: "#9d3b52", core: "#5e1426" },
    blush: { outer: "#e3b9b6", mid: "#f0d5d0", core: "#c8737a" },
    cream: { outer: "#f4e6d4", mid: "#fbf4ec", core: "#e6d2b8" },
  }[tone];

  return (
    <g>
      <Petals cx={cx} cy={cy} r={r} fill={palette.outer} petals={8} />
      <Petals cx={cx} cy={cy} r={r * 0.68} fill={palette.mid} petals={7} />
      <circle cx={cx} cy={cy} r={r * 0.3} fill={palette.core} />
      <circle cx={cx} cy={cy} r={r * 0.14} fill={palette.mid} opacity="0.8" />
    </g>
  );
}

function Leaf({
  x,
  y,
  len,
  angle,
  fill,
}: {
  x: number;
  y: number;
  len: number;
  angle: number;
  fill: string;
}) {
  return (
    <g transform={`rotate(${angle} ${x} ${y})`}>
      <path
        d={`M ${x} ${y} Q ${x + len * 0.32} ${y - len * 0.34} ${x + len} ${y} Q ${x + len * 0.32} ${y + len * 0.34} ${x} ${y} Z`}
        fill={fill}
      />
      <path d={`M ${x} ${y} L ${x + len} ${y}`} stroke="#c2a05a" strokeWidth="0.8" opacity="0.55" />
    </g>
  );
}

function Sprig({ x, y, angle, scale = 1 }: { x: number; y: number; angle: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
      <path d="M 0 0 Q 40 -14 84 -6" fill="none" stroke="#c2a05a" strokeWidth="1.2" />
      {[14, 30, 46, 62, 76].map((d, i) => (
        <g key={d}>
          <Leaf x={d} y={-d * 0.14 - 2} len={16 - i * 1.6} angle={-38} fill="#e8d6bb" />
          <Leaf x={d} y={-d * 0.14 - 2} len={15 - i * 1.6} angle={34} fill="#f2e4d2" />
        </g>
      ))}
    </g>
  );
}

/** One corner bouquet. Sized to the 300x300 viewBox and positioned by the caller. */
export function FloralCorner({ className, flip = false }: CornerProps) {
  return (
    <svg
      viewBox="0 0 300 300"
      className={className}
      aria-hidden="true"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      {/* Trailing greenery first so the blooms sit on top */}
      <Sprig x={196} y={70} angle={128} scale={1.15} />
      <Sprig x={214} y={112} angle={168} scale={0.95} />
      <Sprig x={236} y={40} angle={96} scale={0.8} />
      <Sprig x={150} y={150} angle={200} scale={0.9} />

      {/* Berries */}
      {[
        [128, 96],
        [140, 84],
        [118, 82],
        [196, 150],
        [208, 162],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" fill="#7a1c33" opacity="0.85" />
      ))}

      {/* Blooms, largest to smallest */}
      <Rose cx={244} cy={64} r={46} tone="cream" />
      <Rose cx={186} cy={44} r={34} tone="wine" />
      <Rose cx={252} cy={140} r={32} tone="blush" />
      <Rose cx={196} cy={104} r={24} tone="cream" />
      <Rose cx={150} cy={56} r={20} tone="blush" />
      <Rose cx={232} cy={196} r={19} tone="wine" />
    </svg>
  );
}

/** Slim gold flourish used to separate sections, mirroring the reference. */
export function Ornament({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 24" className={className} aria-hidden="true" fill="none">
      <path d="M4 12h74" stroke="#c2a05a" strokeWidth="1" strokeLinecap="round" opacity="0.75" />
      <path d="M162 12h74" stroke="#c2a05a" strokeWidth="1" strokeLinecap="round" opacity="0.75" />
      {/* Left leaf pair */}
      <path
        d="M86 12c6-7 14-8 18-3-5 5-13 6-18 3Zm0 0c6 7 14 8 18 3-5-5-13-6-18-3Z"
        fill="#c2a05a"
        opacity="0.9"
      />
      {/* Right leaf pair */}
      <path
        d="M154 12c-6-7-14-8-18-3 5 5 13 6 18 3Zm0 0c-6 7-14 8-18 3 5-5 13-6 18-3Z"
        fill="#c2a05a"
        opacity="0.9"
      />
      {/* Centre diamond */}
      <path d="M120 5.5 126.5 12 120 18.5 113.5 12Z" fill="#a9853f" />
      <circle cx="108" cy="12" r="1.8" fill="#c2a05a" />
      <circle cx="132" cy="12" r="1.8" fill="#c2a05a" />
    </svg>
  );
}
