import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

/**
 * Anonymous, aggregate metrics ingest endpoint.
 *
 * - Strict allowlist of event names; anything else returns 204 silently.
 * - No personal data accepted: only event + optional short dimension key/value.
 * - No IP, no user-agent, no headers persisted.
 * - 1 KB request body cap.
 */

const ALLOWED_EVENTS = [
  "search_submitted",
  "facility_viewed",
  "directions_tapped",
  "call_tapped",
  "near_me_activated",
  "near_me_granted",
  "near_me_denied",
  "share_tapped",
  "install_accepted",
  "faq_opened",
] as const;

const SAFE_TEXT = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-zA-Z0-9 _.\-]+$/);

const Payload = z.object({
  event: z.enum(ALLOWED_EVENTS),
  dimension_key: SAFE_TEXT.optional().nullable(),
  dimension_value: SAFE_TEXT.optional().nullable(),
});

function ack() {
  return new Response(null, { status: 204 });
}

/**
 * Best-effort in-memory rate limit per client IP.
 * Token bucket: BUCKET_MAX events per BUCKET_WINDOW_MS.
 *
 * Note: This is per-worker-instance. Cloudflare may spin up multiple
 * isolates, so the effective ceiling is N * BUCKET_MAX. For stricter
 * guarantees, move to a Durable Object or KV-backed counter.
 */
const BUCKET_MAX = 30;
const BUCKET_WINDOW_MS = 60_000;
const MAX_BUCKETS = 5_000;
const buckets = new Map<string, { count: number; resetAt: number }>();

function hashIp(ip: string): string {
  // Tiny non-cryptographic hash — we just need a stable bucket key
  // without persisting raw IPs.
  let h = 2166136261;
  for (let i = 0; i < ip.length; i++) {
    h ^= ip.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h.toString(36);
}

function isRateLimited(request: Request): boolean {
  const fwd = request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? "unknown";
  const key = hashIp(fwd);
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    if (buckets.size > MAX_BUCKETS) buckets.clear();
    buckets.set(key, { count: 1, resetAt: now + BUCKET_WINDOW_MS });
    return false;
  }
  bucket.count++;
  return bucket.count > BUCKET_MAX;
}

export const Route = createFileRoute("/api/public/metrics/ingest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          if (isRateLimited(request)) return ack();

          const raw = await request.text();
          if (!raw || raw.length > 1024) return ack();

          let parsed: unknown;
          try {
            parsed = JSON.parse(raw);
          } catch {
            return ack();
          }

          const result = Payload.safeParse(parsed);
          if (!result.success) return ack();

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          await supabaseAdmin.from("metric_events").insert({
            event: result.data.event,
            dimension_key: result.data.dimension_key ?? null,
            dimension_value: result.data.dimension_value ?? null,
          });
        } catch {
          // Swallow all errors — analytics must never affect the user.
        }
        return ack();
      },
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }),
    },
  },
});
