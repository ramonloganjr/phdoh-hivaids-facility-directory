import { createFileRoute } from "@tanstack/react-router";

/**
 * GET /api/public/impact — the same privacy-safe aggregate the /impact page
 * shows, as JSON, for the mobile app. Contains only rounded totals, regions
 * above the suppression floor, and consented, published stories.
 */

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "content-type",
};

export const Route = createFileRoute("/api/public/impact")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async () => {
        const { computePublicImpact, emptyImpact } = await import("@/lib/impact.server");
        let body;
        try {
          body = await computePublicImpact();
        } catch (err) {
          console.error("[api/impact]", err);
          body = emptyImpact();
        }
        return new Response(JSON.stringify(body), {
          status: 200,
          headers: {
            ...CORS,
            "content-type": "application/json; charset=utf-8",
            // Numbers move slowly and are rounded; a short shared cache keeps
            // the database quiet under load.
            "cache-control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
          },
        });
      },
    },
  },
});
