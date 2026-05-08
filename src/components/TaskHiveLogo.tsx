import React from "react";

interface TaskHiveLogoProps {
  /** Overall height of the logo. Width scales proportionally. Default: 36 */
  height?: number;
  /** Class applied to the root <svg> element */
  className?: string;
  /** Inline style overrides for the root <svg> element */
  style?: React.CSSProperties;
}

/**
 * TaskHive — Ultra-premium wordmark logo.
 *
 * Drop-in ready for Next.js <header>. Works at any size; fully scalable SVG.
 * Designed for dark backgrounds (#050508). No external dependencies.
 *
 * Usage:
 *   import TaskHiveLogo from "@/components/TaskHiveLogo";
 *   <TaskHiveLogo height={36} />
 */
const TaskHiveLogo: React.FC<TaskHiveLogoProps> = ({
  height = 36,
  className,
  style,
}) => {
  // Viewbox is 220 × 48. Scale width proportionally.
  const width = (220 / 48) * height;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 220 48"
      width={width}
      height={height}
      fill="none"
      role="img"
      aria-label="TaskHive logo"
      className={className}
      style={style}
    >
      <defs>
        {/* ── Primary brand gradient: green → cyan → blue → purple ── */}
        <linearGradient
          id="th-brand"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%"   stopColor="#7DF9AA" />
          <stop offset="42%"  stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>

        {/* ── Softer version for subtle fills ── */}
        <linearGradient
          id="th-soft"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%"   stopColor="#7DF9AA" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.08" />
        </linearGradient>

        {/* ── Glow filter for the icon ── */}
        <filter id="th-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* ── Clip path so nothing bleeds outside the icon box ── */}
        <clipPath id="th-clip">
          <rect x="0" y="0" width="48" height="48" rx="11" />
        </clipPath>
      </defs>

      {/* ════════════════════════════════════════
          ICON  (48 × 48, left-anchored at 0,0)
          ════════════════════════════════════════ */}

      {/* Icon background tile */}
      <rect
        x="0" y="0"
        width="48" height="48"
        rx="11"
        fill="url(#th-soft)"
        stroke="url(#th-brand)"
        strokeWidth="0.8"
        strokeOpacity="0.45"
      />

      {/* ── Honeycomb / hive: 7 hexagon nodes arranged in a tight cluster ──
          Each hex is a regular hexagon (pointy-top) with side ≈ 6.2 px.
          Centers chosen so they tessellate with ~1.5 px gap.            */}
      <g filter="url(#th-glow)" clipPath="url(#th-clip)">

        {/* Helper: pointy-top regular hexagon, side s, center (cx,cy)
            Points: angle = 30+60*k degrees
            For s=6.2 the flat-to-flat width ≈ 10.74, height ≈ 12.4  */}

        {/* ── Center hex ── */}
        <polygon
          points="
            24,17.8
            29.37,21
            29.37,27.4
            24,30.6
            18.63,27.4
            18.63,21
          "
          fill="url(#th-brand)"
          fillOpacity="0.22"
          stroke="url(#th-brand)"
          strokeWidth="1.1"
        />

        {/* ── Top hex ── */}
        <polygon
          points="
            24,5.4
            29.37,8.6
            29.37,15
            24,18.2
            18.63,15
            18.63,8.6
          "
          fill="url(#th-brand)"
          fillOpacity="0.08"
          stroke="url(#th-brand)"
          strokeWidth="0.8"
          strokeOpacity="0.6"
        />

        {/* ── Top-right hex ── */}
        <polygon
          points="
            35.1,11.6
            40.47,14.8
            40.47,21.2
            35.1,24.4
            29.73,21.2
            29.73,14.8
          "
          fill="url(#th-brand)"
          fillOpacity="0.08"
          stroke="url(#th-brand)"
          strokeWidth="0.8"
          strokeOpacity="0.6"
        />

        {/* ── Bottom-right hex ── */}
        <polygon
          points="
            35.1,24.2
            40.47,27.4
            40.47,33.8
            35.1,37
            29.73,33.8
            29.73,27.4
          "
          fill="url(#th-brand)"
          fillOpacity="0.08"
          stroke="url(#th-brand)"
          strokeWidth="0.8"
          strokeOpacity="0.6"
        />

        {/* ── Bottom hex ── */}
        <polygon
          points="
            24,30.6
            29.37,33.8
            29.37,40.2
            24,43.4
            18.63,40.2
            18.63,33.8
          "
          fill="url(#th-brand)"
          fillOpacity="0.08"
          stroke="url(#th-brand)"
          strokeWidth="0.8"
          strokeOpacity="0.6"
        />

        {/* ── Bottom-left hex ── */}
        <polygon
          points="
            12.9,24.2
            18.27,27.4
            18.27,33.8
            12.9,37
            7.53,33.8
            7.53,27.4
          "
          fill="url(#th-brand)"
          fillOpacity="0.08"
          stroke="url(#th-brand)"
          strokeWidth="0.8"
          strokeOpacity="0.6"
        />

        {/* ── Top-left hex ── */}
        <polygon
          points="
            12.9,11.6
            18.27,14.8
            18.27,21.2
            12.9,24.4
            7.53,21.2
            7.53,14.8
          "
          fill="url(#th-brand)"
          fillOpacity="0.08"
          stroke="url(#th-brand)"
          strokeWidth="0.8"
          strokeOpacity="0.6"
        />

        {/* ── Check-mark / task tick inside the center hex ──
            Drawn as a single-line stroke so it reads as "task done"
            and merges cleanly with the hive concept.                 */}
        <polyline
          points="20.4,24.4  23.2,27.2  27.6,21.6"
          stroke="url(#th-brand)"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* ── Connector dots at hex vertices to suggest a live network ── */}
        {[
          [24, 17.8],   // top of center
          [29.37, 21],  // top-right of center
          [29.37, 27.4],
          [24, 30.6],
          [18.63, 27.4],
          [18.63, 21],
        ].map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r="1.4"
            fill="url(#th-brand)"
            fillOpacity="0.9"
          />
        ))}
      </g>

      {/* ════════════════════════════════════════
          WORDMARK  (starts at x = 60)
          ════════════════════════════════════════ */}

      {/*
        Font stack: Syne (loaded via @font-face in your global CSS or
        Next.js font config) → falls back to a clean geometric sans.
        If you use next/font:
          import { Syne } from "next/font/google";
          const syne = Syne({ subsets: ["latin"], weight: ["700","800"] });
        Then pass  className={syne.className}  to the <text> elements,
        OR just ensure Syne is in your global stylesheet.
      */}

      {/* "Task" — slightly lighter weight */}
      <text
        x="60"
        y="33"
        fontFamily="'Syne', 'DM Sans', sans-serif"
        fontSize="26"
        fontWeight="700"
        letterSpacing="-0.5"
        fill="url(#th-brand)"
      >
        Task
      </text>

      {/* "Hive" — heavier, same gradient */}
      <text
        x="118"
        y="33"
        fontFamily="'Syne', 'DM Sans', sans-serif"
        fontSize="26"
        fontWeight="800"
        letterSpacing="-0.8"
        fill="#ffffff"
        fillOpacity="0.93"
      >
        Hive
      </text>

      {/* Micro tagline below wordmark */}
      <text
        x="60.5"
        y="43"
        fontFamily="'DM Sans', sans-serif"
        fontSize="7.2"
        fontWeight="400"
        letterSpacing="2.2"
        fill="url(#th-brand)"
        fillOpacity="0.45"
      >
        MICRO-JOB NETWORK
      </text>
    </svg>
  );
};

export default TaskHiveLogo;
