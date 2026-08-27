import type { ComponentProps, ReactNode } from "react";
import { cn } from "../lib/cn";
import { accentOf, type Accent } from "../lib/accent";

export type CalloutTone = "note" | "gate" | "warning" | "kill" | "rule";

const toneConfig: Record<CalloutTone, { accent: Accent; label: string; icon: string }> = {
  note: { accent: "moss", label: "Note", icon: "✦" },
  gate: { accent: "coral", label: "Gate", icon: "★" },
  warning: { accent: "honey", label: "Warning", icon: "!" },
  kill: { accent: "violet", label: "Kill signal", icon: "✕" },
  rule: { accent: "coral", label: "The rule", icon: "§" },
};

type CalloutProps = ComponentProps<"div"> & {
  tone?: CalloutTone;
  /** Overrides the automatic label. */
  label?: string;
  title?: ReactNode;
};

/**
 * A framed aside. The plan documents lean heavily on these — kill signals, exit
 * criteria, the one rule — so it earns its own primitive.
 */
export function Callout({ tone = "note", label, title, className, children, ...props }: CalloutProps) {
  const config = toneConfig[tone];
  const a = accentOf(config.accent);

  return (
    <div
      role={tone === "warning" || tone === "kill" ? "note" : undefined}
      className={cn(
        "rounded-lg border-l-4 p-5 sm:p-6",
        a.bgSoft,
        a.border,
        className,
      )}
      {...props}
    >
      <p className={cn("grin-label mb-2 flex items-center gap-2 font-bold", a.text)}>
        <span aria-hidden>{config.icon}</span>
        {label ?? config.label}
      </p>
      {title ? <p className={cn("mb-1 font-display text-lg font-bold", a.text)}>{title}</p> : null}
      <div className={cn("space-y-2 text-[0.97rem] leading-relaxed", a.text, "opacity-95")}>{children}</div>
    </div>
  );
}
