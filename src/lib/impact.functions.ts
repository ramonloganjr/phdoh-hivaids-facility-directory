import { createServerFn } from "@tanstack/react-start";

/**
 * Public, privacy-safe impact data for the /impact page.
 *
 * - Reads only from public.metric_events via the service-role client.
 * - Numbers are rounded to the nearest 10.
 * - Any single-day breakdown below 5 events is suppressed (no individual
 *   can be inferred from the published numbers).
 */

const AGGREGATION_FLOOR = 5;
const WINDOW_DAYS = 90;

type Counts = Record<string, number>;

type MetricEventRow = {
  event: string;
  dimension_key: string | null;
  dimension_value: string | null;
  occurred_at: string;
};

type Testimonial = {
  id: string;
  quote: string;
  attribution: string;
  region: string | null;
};

export type PublicImpact = {
  windowDays: number;
  generatedAt: string;
  totals: {
    searches: number;
    facilitiesViewed: number;
    directionsTapped: number;
    nearMeActivations: number;
    shares: number;
    peopleHelped: number; // North Star: high-intent events
  };
  searchSuccessRate: number | null; // 0..1
  topRegions: Array<{ region: string; count: number }>;
  testimonials: Testimonial[];
  lastEventAt: string | null;
};

function roundTo10(n: number) {
  return Math.round(n / 10) * 10;
}

function emptyImpact(): PublicImpact {
  return {
    windowDays: WINDOW_DAYS,
    generatedAt: new Date().toISOString(),
    totals: {
      searches: 0,
      facilitiesViewed: 0,
      directionsTapped: 0,
      nearMeActivations: 0,
      shares: 0,
      peopleHelped: 0,
    },
    searchSuccessRate: null,
    topRegions: [],
    testimonials: [],
    lastEventAt: null,
  };
}

export const getPublicImpact = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicImpact> => {
    let supabaseAdmin: (typeof import("@/integrations/supabase/client.server"))["supabaseAdmin"];
    try {
      ({ supabaseAdmin } = await import("@/integrations/supabase/client.server"));
    } catch (err) {
      console.error("[impact] admin client unavailable", err);
      return emptyImpact();
    }

    const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();

    let events: MetricEventRow[] | null = null;
    let stories: Testimonial[] | null = null;
    try {
      const [eventsRes, storiesRes] = await Promise.all([
        supabaseAdmin
          .from("metric_events")
          .select("event,dimension_key,dimension_value,occurred_at")
          .gte("occurred_at", since)
          .limit(200000),
        supabaseAdmin
          .from("testimonials")
          .select("id,quote,attribution,region,consent_verified_at,published,sort_order")
          .eq("published", true)
          .not("consent_verified_at", "is", null)
          .order("sort_order", { ascending: true })
          .limit(12),
      ]);
      if (eventsRes.error) console.error("[impact] events", eventsRes.error);
      if (storiesRes.error) console.error("[impact] stories", storiesRes.error);
      events = eventsRes.error ? null : eventsRes.data;
      stories = storiesRes.error ? null : storiesRes.data;
    } catch (err) {
      console.error("[impact] database query unavailable", err);
      return emptyImpact();
    }

    const rows = events ?? [];
    const counts: Counts = {};
    const regionCounts: Counts = {};
    const searchBuckets: Counts = {};
    let lastEventAt: string | null = null;

    for (const row of rows) {
      counts[row.event] = (counts[row.event] ?? 0) + 1;
      if (!lastEventAt || row.occurred_at > lastEventAt) lastEventAt = row.occurred_at;

      if (row.event === "search_submitted" && row.dimension_key === "result_bucket") {
        const k = row.dimension_value ?? "0";
        searchBuckets[k] = (searchBuckets[k] ?? 0) + 1;
      }
      if (
        (row.event === "directions_tapped" || row.event === "facility_viewed") &&
        row.dimension_key === "region" &&
        row.dimension_value
      ) {
        regionCounts[row.dimension_value] = (regionCounts[row.dimension_value] ?? 0) + 1;
      }
    }

    const searches = counts["search_submitted"] ?? 0;
    const facilitiesViewed = counts["facility_viewed"] ?? 0;
    const directionsTapped = counts["directions_tapped"] ?? 0;
    const nearMeActivations = counts["near_me_activated"] ?? 0;
    const shares = counts["share_tapped"] ?? 0;

    // North Star: distinct "took a high-intent action" — proxied by event total
    // of view + directions + near-me (capped by searches floor to stay honest).
    const peopleHelped = facilitiesViewed + directionsTapped + nearMeActivations;

    const successes =
      (searchBuckets["1-5"] ?? 0) + (searchBuckets["6-20"] ?? 0) + (searchBuckets["20+"] ?? 0);
    const searchSuccessRate = searches > 0 ? Math.min(1, Math.max(0, successes / searches)) : null;

    const topRegions = Object.entries(regionCounts)
      .filter(([, c]) => c >= AGGREGATION_FLOOR)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([region, count]) => ({ region, count: roundTo10(count) }));

    const testimonials: Testimonial[] = (stories ?? []).map((s) => ({
      id: s.id,
      quote: s.quote,
      attribution: s.attribution,
      region: s.region,
    }));

    return {
      windowDays: WINDOW_DAYS,
      generatedAt: new Date().toISOString(),
      totals: {
        searches: roundTo10(searches),
        facilitiesViewed: roundTo10(facilitiesViewed),
        directionsTapped: roundTo10(directionsTapped),
        nearMeActivations: roundTo10(nearMeActivations),
        shares: roundTo10(shares),
        peopleHelped: roundTo10(peopleHelped),
      },
      searchSuccessRate,
      topRegions,
      testimonials,
      lastEventAt,
    };
  },
);
