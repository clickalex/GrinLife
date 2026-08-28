import { useCallback, useEffect, useState } from "react";
import { fetchIntent, recordIntent, type IntentPayload } from "./gateApi";

/**
 * Intent counts for the product pages.
 *
 * Shared by Legacy, Social and Serendipity because all three publish the same thing:
 * how many families have asked, against the gate's 250.
 *
 * The count shown is the server's, and it only moves when the server confirms. A visitor
 * with no API behind them sees the published count (or nothing) rather than a number that
 * silently fails to save — the same rule the gates page follows.
 */
export function useIntent(productId: string) {
  const [payload, setPayload] = useState<IntentPayload | null>(null);
  const [busy, setBusy] = useState(false);
  const [asked, setAsked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchIntent().then((data) => {
      if (!cancelled) setPayload(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const ask = useCallback(async () => {
    if (asked || busy) return;
    setBusy(true);
    const data = await recordIntent(productId);
    setBusy(false);
    if (data) {
      setPayload(data);
      setAsked(true);
    }
  }, [asked, busy, productId]);

  return {
    /** Null when no API answered — the page then hides the meter rather than showing 0. */
    count: payload?.counts[productId],
    target: payload?.target,
    line: payload?.lines[productId],
    busy,
    asked,
    ask,
  };
}
