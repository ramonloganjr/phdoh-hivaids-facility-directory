import { createFileRoute } from "@tanstack/react-router";
import { getRequestIP, getRequestHeader } from "@tanstack/react-start/server";
import { createHash } from "crypto";
import { z } from "zod";

/**
 * Anonymous feedback submission endpoint.
 *
 * Anti-abuse layers (all enforced server-side):
 *  1. Zod schema validation (length, allowed chars, types)
 *  2. Honeypot field (`website`) — must be empty; bots that auto-fill every input get caught
 *  3. Time-trap — `client_started_at` must be at least MIN_FILL_MS before now
 *  4. Per-IP+UA rate limit — max 3 / hour and 10 / day (stored as hashed signal, no raw IP)
 *  5. Basic content shape check (no URL flooding, no excessive uppercase)
 *
 * No email, no account, no cookies required.
 */

const MIN_FILL_MS = 3000; // a real person needs > 3s to read + type
const MAX_FILL_MS = 1000 * 60 * 60 * 2; // 2h — token too old, replay
const HOUR_LIMIT = 3;
const DAY_LIMIT = 10;

const Schema = z.object({
  message: z.string().trim().min(8).max(1000),
  region: z
    .string()
    .trim()
    .max(80)
    .regex(/^[\p{L}\p{N} .,'\-]*$/u, "Use letters, numbers, spaces, and basic punctuation only.")
    .optional()
    .or(z.literal("")),
  website: z.string().max(0, "Spam detected.").optional().or(z.literal("")), // honeypot
  client_started_at: z.number().int().positive(),
  turnstile_token: z.string().min(10).max(4096),
});

type Body = z.infer<typeof Schema>;

function hashSignal(ip: string, ua: string) {
  const salt = process.env.SUPABASE_URL ?? "feedback-salt";
  return createHash("sha256").update(`${ip}::${ua}::${salt}`).digest("hex");
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function suspiciousContent(message: string): string | null {
  const urls = (message.match(/https?:\/\//gi) ?? []).length;
  if (urls > 2) return "Too many links.";
  const letters = message.replace(/[^A-Za-z]/g, "");
  if (letters.length > 20) {
    const upper = letters.replace(/[^A-Z]/g, "").length;
    if (upper / letters.length > 0.7) return "Too much shouting — please use normal capitalization.";
  }
  return null;
}

export const Route = createFileRoute("/api/public/feedback")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "POST, OPTIONS",
            "access-control-allow-headers": "content-type",
          },
        }),
      POST: async ({ request }) => {
        // 1. Parse + validate body
        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return json(400, { error: "Invalid JSON body." });
        }
        const parsed = Schema.safeParse(raw);
        if (!parsed.success) {
          const first = parsed.error.issues[0];
          return json(400, { error: first?.message ?? "Invalid input." });
        }
        const body: Body = parsed.data;

        // 2. Honeypot
        if (body.website && body.website.length > 0) {
          // Pretend it succeeded so bots don't learn
          return json(200, { ok: true });
        }

        // 3. Time-trap
        const elapsed = Date.now() - body.client_started_at;
        if (elapsed < MIN_FILL_MS || elapsed > MAX_FILL_MS) {
          return json(429, { error: "Please take a moment to write your feedback, then submit." });
        }

        // 4. Content heuristics
        const flag = suspiciousContent(body.message);
        if (flag) return json(400, { error: flag });

        // 5. Fingerprint for rate limiting (hashed, never stored raw)
        const ip = getRequestIP({ xForwardedFor: true }) ?? "0.0.0.0";
        const ua = getRequestHeader("user-agent") ?? "";
        const ipHash = hashSignal(ip, "");
        const uaHash = hashSignal("", ua);
        const fpHash = hashSignal(ip, ua);

        // 6. Insert + rate-limit (admin client; RLS policies still validate WITH CHECK)
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const { count: hourCount, error: hourErr } = await supabaseAdmin
          .from("feedback")
          .select("id", { count: "exact", head: true })
          .eq("ip_hash", fpHash)
          .gte("created_at", hourAgo);
        if (hourErr) {
          console.error("[feedback] rate-check hour", hourErr);
          return json(500, { error: "Something went wrong. Try again in a moment." });
        }
        if ((hourCount ?? 0) >= HOUR_LIMIT) {
          return json(429, {
            error: "You've sent a few messages recently. Please try again in an hour.",
          });
        }
        const { count: dayCount } = await supabaseAdmin
          .from("feedback")
          .select("id", { count: "exact", head: true })
          .eq("ip_hash", fpHash)
          .gte("created_at", dayAgo);
        if ((dayCount ?? 0) >= DAY_LIMIT) {
          return json(429, {
            error: "Daily feedback limit reached. Please try again tomorrow.",
          });
        }

        const { error: insertErr } = await supabaseAdmin.from("feedback").insert({
          message: body.message,
          region: body.region && body.region.length > 0 ? body.region : null,
          status: "pending",
          ip_hash: fpHash,
          ua_hash: uaHash.slice(0, 16) + ipHash.slice(0, 0), // keep ua_hash short; ipHash kept for index
        });
        if (insertErr) {
          console.error("[feedback] insert", insertErr);
          return json(500, { error: "Could not save feedback. Try again in a moment." });
        }

        return json(200, { ok: true });
      },
    },
  },
});
