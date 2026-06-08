/**
 * Aggregate, anonymous metrics beacon.
 *
 * No cookies, no IDs, no IPs collected client-side. The server route
 * (/api/public/metrics/ingest) validates against a strict allowlist and
 * stores ONLY (event, dimension_key, dimension_value, occurred_at).
 *
 * Respects user opt-out via Do-Not-Track and Global Privacy Control.
 */

export type MetricEvent =
  | "search_submitted"
  | "facility_viewed"
  | "directions_tapped"
  | "call_tapped"
  | "near_me_activated"
  | "near_me_granted"
  | "near_me_denied"
  | "share_tapped"
  | "install_accepted"
  | "faq_opened";

type Dimension = { key: string; value: string } | undefined;

function userOptedOut(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { doNotTrack?: string; globalPrivacyControl?: boolean };
  const win = typeof window !== "undefined" ? (window as Window & { doNotTrack?: string }) : undefined;
  const dnt = nav.doNotTrack ?? win?.doNotTrack ?? null;
  if (dnt === "1" || dnt === "yes") return true;
  if (nav.globalPrivacyControl === true) return true;
  return false;
}

function safeValue(v: string | undefined | null): string | undefined {
  if (!v) return undefined;
  const s = String(v).slice(0, 64).replace(/[^a-zA-Z0-9 _.\-]/g, "");
  return s.length ? s : undefined;
}

/**
 * Fire-and-forget. Never throws, never blocks UI.
 * Uses sendBeacon when available so events survive page navigation.
 */
export function track(event: MetricEvent, dimension?: Dimension): void {
  if (typeof window === "undefined") return;
  if (userOptedOut()) return;

  try {
    const payload = {
      event,
      dimension_key: dimension ? safeValue(dimension.key) : undefined,
      dimension_value: dimension ? safeValue(dimension.value) : undefined,
    };
    const body = JSON.stringify(payload);
    const url = "/api/public/metrics/ingest";

    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(url, blob);
      return;
    }
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Beacon failures are silent by design.
  }
}

/** Bucket facility search result counts to avoid cardinality leakage. */
export function resultBucket(count: number): string {
  if (count <= 0) return "0";
  if (count <= 5) return "1-5";
  if (count <= 20) return "6-20";
  return "20+";
}
