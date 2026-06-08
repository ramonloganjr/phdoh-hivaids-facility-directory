import { createFileRoute } from "@tanstack/react-router";

/**
 * Dynamic Open Graph image (SVG, 1200x630).
 *
 * Why SVG: runs on Cloudflare Workers with no native-binary dependency.
 * Facebook, LinkedIn, X (since 2023), WhatsApp, Telegram and Discord all
 * render SVG og:images. If a crawler doesn't, it falls back gracefully to
 * og:title + og:description, which we always set.
 *
 * Query params:
 *   ?title=...   (required, <= 140 chars, plain text)
 *   ?subtitle=...(optional, <= 160 chars)
 *   ?eyebrow=... (optional, <= 60 chars, small label)
 */
export const Route = createFileRoute("/api/og")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const u = new URL(request.url);
        const title = clamp(u.searchParams.get("title") ?? "Philippine HIV Care Philippines", 140);
        const subtitle = clamp(
          u.searchParams.get("subtitle") ??
            "All 338 DOH-designated treatment hubs and primary care facilities.",
          160,
        );
        const eyebrow = clamp(u.searchParams.get("eyebrow") ?? "HIV CARE DIRECTORY", 60);

        const svg = renderSvg({ title, subtitle, eyebrow });

        return new Response(svg, {
          status: 200,
          headers: {
            "Content-Type": "image/svg+xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400, immutable",
            "X-Content-Type-Options": "nosniff",
          },
        });
      },
    },
  },
});

function clamp(s: string, n: number) {
  s = s.replace(/\s+/g, " ").trim();
  return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s;
}

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapText(text: string, maxCharsPerLine: number, maxLines: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const next = current ? current + " " + w : w;
    if (next.length > maxCharsPerLine) {
      if (current) lines.push(current);
      current = w;
      if (lines.length === maxLines - 1) break;
    } else {
      current = next;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  if (lines.length === maxLines) {
    const last = lines[maxLines - 1];
    if (last.length > maxCharsPerLine - 1) {
      lines[maxLines - 1] = last.slice(0, maxCharsPerLine - 1).trimEnd() + "…";
    }
  }
  return lines;
}

function renderSvg(opts: { title: string; subtitle: string; eyebrow: string }) {
  const titleLines = wrapText(escapeXml(opts.title), 28, 3);
  const subtitleLines = wrapText(escapeXml(opts.subtitle), 60, 2);
  const eyebrow = escapeXml(opts.eyebrow.toUpperCase());

  const titleY = 230;
  const titleLeading = 90;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1a0a10"/>
      <stop offset="0.55" stop-color="#0f0a12"/>
      <stop offset="1" stop-color="#070608"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.15" cy="0.2" r="0.6">
      <stop offset="0" stop-color="#FF2E51" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#FF2E51" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- Ribbon mark -->
  <g transform="translate(80,72)">
    <path d="M0 36 L18 0 L36 36 L18 72 Z" fill="#FF2E51"/>
    <circle cx="18" cy="36" r="6" fill="#0f0a12"/>
  </g>

  <text x="140" y="105" font-family="'Helvetica Neue', Arial, sans-serif"
        font-size="28" font-weight="700" fill="#ffffff" letter-spacing="-0.5">
    HIV Care Philippines
  </text>
  <text x="140" y="135" font-family="'Helvetica Neue', Arial, sans-serif"
        font-size="18" font-weight="500" fill="#FF8FA0" letter-spacing="3">
    DOH PHILIPPINES
  </text>

  <!-- Eyebrow -->
  <text x="80" y="${titleY - 50}" font-family="'Helvetica Neue', Arial, sans-serif"
        font-size="20" font-weight="600" fill="#FF8FA0" letter-spacing="4">
    ${eyebrow}
  </text>

  <!-- Title -->
  ${titleLines
    .map(
      (line, i) =>
        `<text x="80" y="${titleY + i * titleLeading}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="74" font-weight="700" fill="#ffffff" letter-spacing="-2">${line}</text>`,
    )
    .join("\n  ")}

  <!-- Subtitle -->
  ${subtitleLines
    .map(
      (line, i) =>
        `<text x="80" y="${titleY + titleLines.length * titleLeading + 30 + i * 42}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="30" font-weight="400" fill="#c8c0c4">${line}</text>`,
    )
    .join("\n  ")}

  <!-- Footer rule + url -->
  <rect x="80" y="540" width="1040" height="1" fill="#3a2530"/>
  <text x="80" y="580" font-family="'Helvetica Neue', Arial, sans-serif"
        font-size="22" font-weight="500" fill="#c8c0c4">
    Public information mirror · Not affiliated with the DOH
  </text>
</svg>`;
}
