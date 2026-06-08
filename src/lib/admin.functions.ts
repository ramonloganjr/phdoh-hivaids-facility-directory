import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/**
 * Admin server functions for the insights dashboard and stories CRUD.
 *
 * Every function:
 * 1. Validates the user via `requireSupabaseAuth`.
 * 2. Re-verifies admin role via service-role `has_role(uid, 'admin')`.
 * 3. Uses `supabaseAdmin` for the actual data work — RLS is bypassed only
 *    after the role check passes.
 */

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error || data !== true) {
    throw new Error("Forbidden: admin access required.");
  }
  return supabaseAdmin;
}

// ----- Insights --------------------------------------------------------------

export type AdminInsights = {
  windowDays: number;
  totals: Record<string, number>;
  daily: Array<{ day: string; total: number; perEvent: Record<string, number> }>;
  funnel: { searches: number; views: number; directions: number };
  topRegions: Array<{ region: string; count: number }>;
  topFaqs: Array<{ faqId: string; count: number }>;
  shareChannels: Array<{ channel: string; count: number }>;
  lastEventAt: string | null;
};

export const getAdminInsights = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { windowDays?: number }) => ({
    windowDays: Math.min(Math.max(input?.windowDays ?? 30, 1), 365),
  }))
  .handler(async ({ data, context }): Promise<AdminInsights> => {
    const supabase = await assertAdmin(context.userId);
    const since = new Date(Date.now() - data.windowDays * 86400_000).toISOString();

    const { data: rows, error } = await supabase
      .from("metric_events")
      .select("event,dimension_key,dimension_value,occurred_at")
      .gte("occurred_at", since)
      .limit(500000);
    if (error) throw new Error(error.message);

    const totals: Record<string, number> = {};
    const dayBuckets = new Map<string, { total: number; perEvent: Record<string, number> }>();
    const regions: Record<string, number> = {};
    const faqs: Record<string, number> = {};
    const channels: Record<string, number> = {};
    let lastEventAt: string | null = null;

    for (const r of rows ?? []) {
      totals[r.event] = (totals[r.event] ?? 0) + 1;
      if (!lastEventAt || r.occurred_at > lastEventAt) lastEventAt = r.occurred_at;

      const day = r.occurred_at.slice(0, 10);
      const bucket = dayBuckets.get(day) ?? { total: 0, perEvent: {} };
      bucket.total += 1;
      bucket.perEvent[r.event] = (bucket.perEvent[r.event] ?? 0) + 1;
      dayBuckets.set(day, bucket);

      if (r.dimension_key === "region" && r.dimension_value) {
        regions[r.dimension_value] = (regions[r.dimension_value] ?? 0) + 1;
      }
      if (r.event === "faq_opened" && r.dimension_key === "faq_id" && r.dimension_value) {
        faqs[r.dimension_value] = (faqs[r.dimension_value] ?? 0) + 1;
      }
      if (r.event === "share_tapped" && r.dimension_key === "channel" && r.dimension_value) {
        channels[r.dimension_value] = (channels[r.dimension_value] ?? 0) + 1;
      }
    }

    const daily = Array.from(dayBuckets.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([day, v]) => ({ day, ...v }));

    return {
      windowDays: data.windowDays,
      totals,
      daily,
      funnel: {
        searches: totals["search_submitted"] ?? 0,
        views: totals["facility_viewed"] ?? 0,
        directions: totals["directions_tapped"] ?? 0,
      },
      topRegions: Object.entries(regions)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([region, count]) => ({ region, count })),
      topFaqs: Object.entries(faqs)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([faqId, count]) => ({ faqId, count })),
      shareChannels: Object.entries(channels)
        .sort((a, b) => b[1] - a[1])
        .map(([channel, count]) => ({ channel, count })),
      lastEventAt,
    };
  });

// ----- Monthly report --------------------------------------------------------

export const exportMonthlyImpact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { year: number; month: number }) =>
    z.object({ year: z.number().int().min(2024).max(2100), month: z.number().int().min(1).max(12) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const supabase = await assertAdmin(context.userId);
    const start = new Date(Date.UTC(data.year, data.month - 1, 1)).toISOString();
    const end = new Date(Date.UTC(data.year, data.month, 1)).toISOString();

    const { data: rows, error } = await supabase
      .from("metric_events")
      .select("event,dimension_key,dimension_value,occurred_at")
      .gte("occurred_at", start)
      .lt("occurred_at", end)
      .limit(500000);
    if (error) throw new Error(error.message);

    const totals: Record<string, number> = {};
    for (const r of rows ?? []) totals[r.event] = (totals[r.event] ?? 0) + 1;

    const header = "event,count\n";
    const body = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .map(([e, c]) => `${e},${c}`)
      .join("\n");

    const yyyy = String(data.year);
    const mm = String(data.month).padStart(2, "0");
    return {
      filename: `impact-${yyyy}-${mm}.csv`,
      mime: "text/csv",
      content: header + body + "\n",
      totals,
    };
  });

// ----- Testimonials CRUD -----------------------------------------------------

export const listTestimonials = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = await assertAdmin(context.userId);
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const StorySchema = z.object({
  quote: z.string().trim().min(8).max(600),
  attribution: z.string().trim().min(2).max(120),
  region: z.string().trim().max(80).nullish(),
  consent_verified_at: z.string().datetime().nullish(),
  published: z.boolean().optional(),
  sort_order: z.number().int().min(0).max(9999).optional(),
});

export const createTestimonial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => StorySchema.parse(input))
  .handler(async ({ data, context }) => {
    const supabase = await assertAdmin(context.userId);
    const { data: row, error } = await supabase
      .from("testimonials")
      .insert({
        quote: data.quote,
        attribution: data.attribution,
        region: data.region ?? null,
        consent_verified_at: data.consent_verified_at ?? null,
        published: data.published ?? false,
        sort_order: data.sort_order ?? 0,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateTestimonial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), patch: StorySchema.partial() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const supabase = await assertAdmin(context.userId);
    const { data: row, error } = await supabase
      .from("testimonials")
      .update(data.patch)
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteTestimonial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const supabase = await assertAdmin(context.userId);
    const { error } = await supabase.from("testimonials").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
