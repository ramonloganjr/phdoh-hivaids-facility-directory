import { createFileRoute } from "@tanstack/react-router";
import { FACILITIES } from "@/data/facilities";

/**
 * Dynamic sitemap. Uses the request origin so the URLs stay correct on
 * preview, published, and any custom domain without baking in a value.
 */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;

        const staticPaths = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/facilities", changefreq: "weekly", priority: "0.9" },
          { path: "/insights", changefreq: "monthly", priority: "0.7" },
          { path: "/faq", changefreq: "monthly", priority: "0.7" },
          { path: "/about", changefreq: "yearly", priority: "0.5" },
          { path: "/terms", changefreq: "yearly", priority: "0.3" },
          { path: "/privacy", changefreq: "yearly", priority: "0.3" },
        ];

        const facilityUrls = FACILITIES.map((f) => ({
          path: `/facilities/${f.id}`,
          changefreq: "monthly" as const,
          priority: "0.6",
        }));

        const all = [...staticPaths, ...facilityUrls];

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...all.map((e) =>
            [
              `  <url>`,
              `    <loc>${origin}${e.path}</loc>`,
              `    <changefreq>${e.changefreq}</changefreq>`,
              `    <priority>${e.priority}</priority>`,
              `  </url>`,
            ].join("\n"),
          ),
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
