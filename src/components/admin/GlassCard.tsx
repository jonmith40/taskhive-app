import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  accentColor?: "blue" | "violet" | "emerald" | "amber" | "rose" | "cyan";
  hover?: boolean;
}

const accentMap = {
  blue: { border: "rgba(59,130,246,0.35)", glow: "rgba(59,130,246,0.08)" },
  violet: { border: "rgba(139,92,246,0.35)", glow: "rgba(139,92,246,0.08)" },
  emerald: { border: "rgba(16,185,129,0.35)", glow: "rgba(16,185,129,0.08)" },
  amber: { border: "rgba(245,158,11,0.35)", glow: "rgba(245,158,11,0.08)" },
  rose: { border: "rgba(244,63,94,0.35)", glow: "rgba(244,63,94,0.08)" },
  cyan: { border: "rgba(6,182,212,0.35)", glow: "rgba(6,182,212,0.08)" },
};

export default function GlassCard({
  children,
  className = "",
  accentColor,
  hover = false,
}: GlassCardProps) {
  const accent = accentColor ? accentMap[accentColor] : null;

  return (
    <div
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
        hover ? "hover:-translate-y-0.5 hover:shadow-xl" : ""
      } ${className}`}
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: accent
          ? `1px solid ${accent.border}`
          : "1px solid rgba(255,255,255,0.07)",
        boxShadow: accent
          ? `0 0 30px ${accent.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`
          : "inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {accentColor && (
        <div
          className="absolute top-0 left-0 right-0 h-px opacity-60"
          style={{
            background: `linear-gradient(90deg, transparent, ${accentMap[accentColor].border}, transparent)`,
          }}
        />
      )}
      {children}
    </div>
  );
}
