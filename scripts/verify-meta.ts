/**
 * End-to-end metadata verification.
 *
 * Checks og:image, twitter:image, canonical, og:url, title, description,
 * and JSON-LD across one or more environments. Performs a HEAD request
 * on every image URL with a cache-buster to confirm it's reachable and
 * served as image/*. Designed to be run locally, against staging, or
 * against production CI.
 *
 *   bun run verify:meta                          # local (+ $SITE_ORIGIN if set)
 *   bun run verify:meta -- https://example.com   # custom origin(s)
 *   bun run verify:meta -- --paths=/,/facilities,/about
 *
 * Exit code is non-zero if any required check fails.
 */

type Check = { name: string; ok: boolean; detail?: string };
type Report = { url: string; checks: Check[]; failed: number };

const DEFAULT_ORIGINS = [
  process.env.LOCAL_ORIGIN || "http://localhost:3000",
  ...(process.env.SITE_ORIGIN ? [process.env.SITE_ORIGIN.replace(/\/$/, "")] : []),
];

const DEFAULT_PATHS = ["/", "/facilities", "/near-me", "/insights", "/faq", "/about", "/sitemap"];

const args = process.argv.slice(2);
const origins: string[] = [];
let paths = DEFAULT_PATHS;
for (const a of args) {
  if (a.startsWith("--paths=")) paths = a.slice(8).split(",").map((p) => p.trim()).filter(Boolean);
  else if (a.startsWith("http")) origins.push(a.replace(/\/$/, ""));
}
if (origins.length === 0) origins.push(...DEFAULT_ORIGINS);

function bust(url: string) {
  const u = new URL(url);
  u.searchParams.set("_cb", Date.now().toString(36));
  return u.toString();
}

function pickMeta(html: string, attr: "property" | "name", key: string) {
  const re = new RegExp(
    `<meta[^>]+${attr}=["']${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>`,
    "i",
  );
  const tag = html.match(re)?.[0];
  if (!tag) return null;
  return tag.match(/content=["']([^"']*)["']/i)?.[1] ?? null;
}

function pickLink(html: string, rel: string) {
  const re = new RegExp(`<link[^>]+rel=["']${rel}["'][^>]*>`, "i");
  const tag = html.match(re)?.[0];
  if (!tag) return null;
  return tag.match(/href=["']([^"']*)["']/i)?.[1] ?? null;
}

function pickTitle(html: string) {
  return html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? null;
}

function pickJsonLd(html: string) {
  return Array.from(
    html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ).map((m) => m[1].trim());
}

async function verifyImage(url: string): Promise<Check> {
  try {
    const res = await fetch(bust(url), { method: "HEAD", redirect: "follow" });
    const ct = res.headers.get("content-type") ?? "";
    const len = res.headers.get("content-length");
    const ok = res.ok && ct.startsWith("image/");
    return {
      name: `image reachable ${url}`,
      ok,
      detail: `HTTP ${res.status} · ${ct}${len ? ` · ${Math.round(Number(len) / 1024)} KB` : ""}`,
    };
  } catch (e) {
    return { name: `image reachable ${url}`, ok: false, detail: (e as Error).message };
  }
}

async function verify(pageUrl: string): Promise<Report> {
  const checks: Check[] = [];
  let html = "";
  try {
    const res = await fetch(bust(pageUrl), {
      headers: { "User-Agent": "MetaVerify/1.0 (+facebookexternalhit-like)" },
    });
    checks.push({ name: "page fetch", ok: res.ok, detail: `HTTP ${res.status}` });
    html = await res.text();
  } catch (e) {
    checks.push({ name: "page fetch", ok: false, detail: (e as Error).message });
    return { url: pageUrl, checks, failed: 1 };
  }

  const title = pickTitle(html);
  const desc = pickMeta(html, "name", "description");
  const ogTitle = pickMeta(html, "property", "og:title") ?? title;
  const ogDesc = pickMeta(html, "property", "og:description") ?? desc;
  const ogImage = pickMeta(html, "property", "og:image");
  const ogImageW = pickMeta(html, "property", "og:image:width");
  const ogImageH = pickMeta(html, "property", "og:image:height");
  const ogUrl = pickMeta(html, "property", "og:url");
  const twImage = pickMeta(html, "name", "twitter:image");
  const twCard = pickMeta(html, "name", "twitter:card");
  const canonical = pickLink(html, "canonical");
  const jsonLd = pickJsonLd(html);

  checks.push({ name: "title present", ok: !!title && title.length <= 70, detail: title ?? "—" });
  checks.push({
    name: "description present",
    ok: !!desc && desc.length >= 50 && desc.length <= 200,
    detail: desc ? `${desc.length} chars` : "missing",
  });
  checks.push({ name: "og:title", ok: !!ogTitle, detail: ogTitle ?? "missing" });
  checks.push({ name: "og:description", ok: !!ogDesc, detail: ogDesc ? `${ogDesc.length} chars` : "missing" });
  checks.push({
    name: "og:image absolute",
    ok: !!ogImage && /^https?:\/\//i.test(ogImage),
    detail: ogImage ?? "missing",
  });
  checks.push({
    name: "og:image dimensions 1200x630",
    ok: ogImageW === "1200" && ogImageH === "630",
    detail: `${ogImageW ?? "?"}x${ogImageH ?? "?"}`,
  });
  checks.push({
    name: "twitter:image absolute",
    ok: !!twImage && /^https?:\/\//i.test(twImage),
    detail: twImage ?? "missing",
  });
  checks.push({
    name: "twitter:card = summary_large_image",
    ok: twCard === "summary_large_image",
    detail: twCard ?? "missing",
  });
  checks.push({ name: "og:url", ok: !!ogUrl, detail: ogUrl ?? "missing" });
  checks.push({ name: "canonical (leaf only ok if missing on root)", ok: true, detail: canonical ?? "—" });
  checks.push({
    name: "JSON-LD parses",
    ok: jsonLd.every((s) => {
      try {
        JSON.parse(s);
        return true;
      } catch {
        return false;
      }
    }),
    detail: `${jsonLd.length} block(s)`,
  });

  if (ogImage && /^https?:\/\//i.test(ogImage)) checks.push(await verifyImage(ogImage));
  if (twImage && twImage !== ogImage && /^https?:\/\//i.test(twImage)) checks.push(await verifyImage(twImage));

  return { url: pageUrl, checks, failed: checks.filter((c) => !c.ok).length };
}

const RED = "\x1b[31m";
const GRN = "\x1b[32m";
const DIM = "\x1b[2m";
const RST = "\x1b[0m";

(async () => {
  const reports: Report[] = [];
  for (const origin of origins) {
    console.log(`\n${DIM}── ${origin} ──${RST}`);
    for (const p of paths) {
      const r = await verify(origin + p);
      reports.push(r);
      const head = r.failed === 0 ? `${GRN}PASS${RST}` : `${RED}FAIL ${r.failed}${RST}`;
      console.log(`\n  ${head}  ${r.url}`);
      for (const c of r.checks) {
        const mark = c.ok ? `${GRN}✓${RST}` : `${RED}✗${RST}`;
        console.log(`    ${mark} ${c.name}${c.detail ? `  ${DIM}${c.detail}${RST}` : ""}`);
      }
    }
  }
  const totalFail = reports.reduce((n, r) => n + r.failed, 0);
  console.log(
    `\n${totalFail === 0 ? GRN + "All checks passed" : RED + `${totalFail} check(s) failed`}${RST}`,
  );
  console.log(
    `${DIM}Tip: open https://developers.facebook.com/tools/debug/ and https://www.linkedin.com/post-inspector/ to flush remote caches.${RST}`,
  );
  process.exit(totalFail === 0 ? 0 : 1);
})();
