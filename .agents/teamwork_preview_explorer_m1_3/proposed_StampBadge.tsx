import React from "react";

export type StampBadgeVariant = "navy" | "brass" | "saffron" | "green" | "danger" | "neutral";
export type StampBadgeStatus = "positive" | "negative" | "inconclusive" | "pending" | "verified" | string;

export interface StampBadgeProps {
  /** Status string from test results (e.g. 'positive', 'negative', 'inconclusive') */
  status?: StampBadgeStatus;
  /** Explicit styling variant matching DBIM / UX4G palette */
  variant?: StampBadgeVariant;
  /** Custom text to display; if omitted, defaults to status or variant label */
  text?: string;
  /** Size variant: 'sm' for dense tables, 'md' for cards/forms, 'lg' for certificates */
  size?: "sm" | "md" | "lg";
  /** Optional secondary seal label (e.g., 'EVIDENCE SEALED' or 'FORM-4A VERIFIED') */
  subtext?: string;
  /** Additional custom Tailwind class names */
  className?: string;
}

/**
 * StampBadge — Official Government Forensic Evidence Stamp / Seal
 * Conforms to GIGW 3.0 & Digital India UX4G design standards.
 * Features sharp rectangular borders, double-frame outline, high-contrast semantic palette,
 * crisp monospace typography, and zero tilt / rotation.
 */
export function StampBadge({
  status,
  variant,
  text,
  size = "md",
  subtext,
  className = "",
}: StampBadgeProps) {
  // Resolve effective variant
  let resolvedVariant: StampBadgeVariant = "navy";

  if (variant) {
    resolvedVariant = variant;
  } else if (status) {
    const s = status.toLowerCase();
    if (s === "positive" || s === "danger" || s === "flagged") {
      resolvedVariant = "danger";
    } else if (s === "negative" || s === "clear" || s === "pass") {
      resolvedVariant = "green";
    } else if (s === "inconclusive" || s === "retest" || s === "warning") {
      resolvedVariant = "brass";
    } else if (s === "saffron" || s === "pending") {
      resolvedVariant = "saffron";
    } else {
      resolvedVariant = "navy";
    }
  }

  // Determine display label
  const displayText = text || (status ? status.toUpperCase() : resolvedVariant.toUpperCase());

  // High-contrast semantic color tokens (WCAG 2.1 AA compliant)
  // Fallbacks support CSS variables --color-navy (#003366) and --color-brass (#854D0E)
  const variantStyles: Record<StampBadgeVariant, {
    border: string;
    text: string;
    bg: string;
    outline: string;
    defaultSubtext: string;
  }> = {
    danger: {
      border: "border-red-700",
      text: "text-red-800",
      bg: "bg-red-50/80",
      outline: "outline-red-700",
      defaultSubtext: "NARCOTIC DETECTED",
    },
    green: {
      border: "border-[#138808]",
      text: "text-[#138808]",
      bg: "bg-[#F0FDF4]",
      outline: "outline-[#138808]",
      defaultSubtext: "SAMPLE CLEAR",
    },
    brass: {
      border: "border-[var(--color-brass,#854D0E)]",
      text: "text-[var(--color-brass,#854D0E)]",
      bg: "bg-amber-50/80",
      outline: "outline-[var(--color-brass,#854D0E)]",
      defaultSubtext: "RETEST REQUIRED",
    },
    navy: {
      border: "border-[var(--color-navy,#003366)]",
      text: "text-[var(--color-navy,#003366)]",
      bg: "bg-[#F0F4F8]",
      outline: "outline-[var(--color-navy,#003366)]",
      defaultSubtext: "OFFICIAL RECORD",
    },
    saffron: {
      border: "border-[#C2410C]",
      text: "text-[#9A3412]",
      bg: "bg-[#FFF7ED]",
      outline: "outline-[#C2410C]",
      defaultSubtext: "PENDING REVIEW",
    },
    neutral: {
      border: "border-slate-500",
      text: "text-slate-800",
      bg: "bg-slate-50",
      outline: "outline-slate-500",
      defaultSubtext: "ARCHIVED",
    },
  };

  const style = variantStyles[resolvedVariant] || variantStyles.navy;
  const sealSubtext = subtext !== undefined ? subtext : (size === "lg" ? style.defaultSubtext : null);

  // Size configurations: sharp corners, high-contrast borders, orthogonal 0-deg alignment
  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs border tracking-wider",
    md: "px-3 py-1.5 text-sm border-2 tracking-widest",
    lg: "px-5 py-2.5 text-base border-2 tracking-widest",
  };

  return (
    <div
      role="status"
      aria-label={`Status: ${displayText}`}
      className={`inline-flex flex-col items-center justify-center font-mono font-bold uppercase select-none rounded-none outline outline-1 outline-offset-1 transition-none ${style.border} ${style.text} ${style.bg} ${style.outline} ${sizeStyles[size]} ${className}`}
    >
      <span className="leading-tight font-extrabold">{displayText}</span>
      {sealSubtext && (
        <span className="text-[9px] font-sans font-semibold tracking-wider opacity-80 border-t border-current/20 mt-1 pt-0.5 w-full text-center">
          {sealSubtext}
        </span>
      )}
    </div>
  );
}

export default StampBadge;
