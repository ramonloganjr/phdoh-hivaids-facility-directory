/**
 * Public, privacy-safe impact data, shared by the /impact page (server
 * function) and the mobile app (GET /api/public/impact).
 *
 * - Reads public.metric_events through the service-role client: since the
 *   2026-06-11 migrations, anon/authenticated clients can no longer SELECT
 *   from that table, so only aggregates computed here ever leave the server.
 * - Numbers are rounded to the nearest 10.
 * - Any breakdown below 5 events is suppressed (no individual can be
 *   inferred from the published numbers).
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
    feedbackReceived: number; // approved anonymous feedback in window
  };
  searchSuccessRate: number | null; // 0..1
  topRegions: Array<{ region: string; count: number }>;
  testimonials: Testimonial[];
  lastEventAt: string | null;
};

function roundTo10(n: number) {
  return Math.round(n / 10) * 10;
}

export function emptyImpact(): PublicImpact {
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
      feedbackReceived: 0,
    },
    searchSuccessRate: null,
    topRegions: [],
    testimonials: [],
    lastEventAt: null,
  };
}

/** PostgREST caps each response (1,000 rows by default), so events are paged. */
const PAGE_SIZE = 1000;
const MAX_ROWS = 200_000;

export async function computePublicImpact(): Promise<PublicImpact> {
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();

  let rows: MetricEventRow[] = [];
  let stories: Testimonial[] | null = null;
  let feedbackCount = 0;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const fetchEvents = async (): Promise<MetricEventRow[] | null> => {
      const all: MetricEventRow[] = [];
      for (let offset = 0; offset < MAX_ROWS; offset += PAGE_SIZE) {
        const { data, error } = await supabaseAdmin
          .from("metric_events")
          .select("event,dimension_key,dimension_value,occurred_at")
          .gte("occurred_at", since)
          .order("occurred_at", { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1);
        if (error) {
          console.error("[impact] events", error);
          return null;
        }
        all.push(...(data ?? []));
        if ((data ?? []).length < PAGE_SIZE) break;
      }
      return all;
    };

    const [events, storiesRes, feedbackRes] = await Promise.all([
      fetchEvents(),
      supabaseAdmin
        .from("testimonials")
        .select("id,quote,attribution,region")
        .eq("published", true)
        .not("consent_verified_at", "is", null)
        .order("sort_order", { ascending: true })
        .limit(12),
      supabaseAdmin
        .from("feedback")
        .select("id", { count: "exact", head: true })
        .eq("status", "approved")
        .gte("created_at", since),
    ]);
    if (storiesRes.error) console.error("[impact] stories", storiesRes.error);
    if (feedbackRes.error) console.error("[impact] feedback", feedbackRes.error);
    rows = events ?? [];
    stories = storiesRes.error ? null : storiesRes.data;
    feedbackCount = feedbackRes.error ? 0 : (feedbackRes.count ?? 0);
  } catch (err) {
    console.error("[impact] database query unavailable", err);
    return emptyImpact();
  }

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
  // of view + directions + near-me.
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
      feedbackReceived: feedbackCount >= AGGREGATION_FLOOR ? roundTo10(feedbackCount) : 0,
    },
    searchSuccessRate,
    topRegions,
    testimonials,
    lastEventAt,
  };
}
