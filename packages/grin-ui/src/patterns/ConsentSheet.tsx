import { consentArtefact, type ConsentArtefact } from "@grin/content";
import { cn } from "../lib/cn";
import { Callout } from "../primitives/Callout";
import { DataTable } from "../primitives/DataTable";
import { PrintButton } from "../primitives/PrintButton";

/**
 * The consent and retention record Grin Legacy owes a family.
 *
 * The compliance table lists DPDP as an obligation that must be live at launch. This is
 * the artefact that discharges it: completed once per order, signed, dated, and kept for
 * as long as the recordings are. Legacy collects a dead person's voice from a living
 * relative, which is exactly the case the law is least clear about — so the sheet answers
 * it in writing instead of relying on a terms-of-service paragraph nobody reads.
 *
 * Built for paper: the print sheet in `tokens.css` drops the site chrome and this prints
 * as a standalone document.
 */
export function ConsentSheet({
  artefact = consentArtefact,
  orderRef,
  className,
}: {
  artefact?: ConsentArtefact;
  /** Written in by hand on the printed copy. */
  orderRef?: string;
  className?: string;
}) {
  return (
    <section
      aria-labelledby="consent-sheet-heading"
      className={cn("rounded-xl border border-border bg-card p-6 sm:p-8", className)}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="grin-label text-muted-foreground">Grin Legacy · per order</p>
          <h3 id="consent-sheet-heading" className="mt-1 font-display text-2xl font-bold text-foreground">
            {artefact.title}
          </h3>
        </div>
        <PrintButton accent="honey" label="Print this record" />
      </div>

      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-soft">{artefact.preamble}</p>

      {orderRef ? (
        <p className="mt-3 font-mono text-xs text-muted-foreground">Order reference: {orderRef}</p>
      ) : null}

      <DataTable
        className="mt-6"
        accent="honey"
        caption="What Grin Legacy collects, why, for how long, and how it is deleted"
        head={["Collected", "Why", "Kept for", "Deleted by"]}
        rows={artefact.fields.map((field) => [
          <span key="collected" className="font-bold text-foreground">
            {field.collected}
          </span>,
          <span key="why" className="text-ink-soft">
            {field.why}
          </span>,
          <span key="retention" className="text-ink-soft">
            {field.retention}
          </span>,
          <span key="deletion" className="text-muted-foreground">
            {field.deletionRoute}
          </span>,
        ])}
      />

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div>
          <h4 className="font-display text-base font-bold text-foreground">Retention</h4>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{artefact.retentionWindow}</p>
        </div>
        <div>
          <h4 className="font-display text-base font-bold text-foreground">Deletion</h4>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{artefact.deletionRoute}</p>
        </div>
      </div>

      <h4 className="mt-7 font-display text-base font-bold text-foreground">
        The person consenting confirms
      </h4>
      <ul className="mt-3 space-y-2.5">
        {artefact.undertakings.map((undertaking) => (
          <li key={undertaking} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
            {/* A real checkbox, not a bullet: this is a form that gets signed on paper. */}
            <span
              aria-hidden
              className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border border-border bg-background"
            />
            {undertaking}
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-6 border-t border-border pt-6 sm:grid-cols-2">
        {artefact.signatureLines.map((line) => (
          <div key={line}>
            <div className="h-10 border-b border-border" aria-hidden />
            <p className="mt-1.5 text-xs text-muted-foreground">{line}</p>
          </div>
        ))}
      </div>

      <div className="mt-7">
        <Callout tone="note" label="Why this is a form and not a paragraph">
          Everything else in the compliance table is a promise. This is the one obligation that can be
          produced on demand, signed and dated, if a family ever disagrees about what was agreed — which the
          plan expects, because the archive outlives the storyteller.
        </Callout>
      </div>
    </section>
  );
}
