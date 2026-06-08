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

export const Route = createFileRoute("/api/public/metrics/ingest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
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
