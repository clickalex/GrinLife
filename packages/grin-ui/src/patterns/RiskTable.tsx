import { cn } from "../lib/cn";
import { DataTable } from "../primitives/DataTable";
import type { Accent } from "../lib/accent";

const severityStyles: Record<string, string> = {
  existential: "bg-violet text-white",
  "most likely failure": "bg-coral text-white",
  certain: "bg-coral text-white",
  high: "bg-honey text-white",
  medium: "bg-muted text-ink-soft",
  accepted: "bg-muted text-ink-soft",
};

/**
 * Top risks with mitigations. Severity is rendered as a chip so the one existential
 * row is impossible to skim past.
 */
export function RiskTable({
  risks,
  accent = "coral",
  caption = "Top risks",
  className,
}: {
  risks: { risk: string; severity: string; mitigation: string }[];
  accent?: Accent;
  caption?: string;
  className?: string;
}) {
  return (
    <DataTable
      accent={accent}
      caption={caption}
      head={["Risk", "Severity", "Mitigation"]}
      rows={risks.map((risk) => [
        <span key="r" className="font-bold text-foreground">
          {risk.risk}
        </span>,
        <span
          key="s"
          className={cn(
            "inline-flex rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider",
            severityStyles[risk.severity.toLowerCase()] ?? "bg-muted text-ink-soft",
          )}
        >
          {risk.severity}
        </span>,
        <span key="m">{risk.mitigation}</span>,
      ])}
      className={className}
    />
  );
}
