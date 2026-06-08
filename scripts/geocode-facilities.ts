/**
 * One-time geocoder for the facility directory.
 *
 * Strategy: OpenStreetMap Nominatim (free, no API key).
 * Hard rate-limit: <=1 req/s. We wait 1100ms between requests.
 *
 * Fallback ladder per facility:
 *   1) "name, address, Philippines"
 *   2) "address, Philippines"
 *   3) "<best-effort city>, Philippines"   (last comma-separated token of address)
 *
 * Output: src/data/facility-coords.json
 * Shape:  { [facilityId]: { lat: number, lon: number, source: "name"|"address"|"city" } }
 *
 * Re-run safely: existing entries are kept; only missing ids are fetched.
 */
import { FACILITIES } from "../src/data/facilities";
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("src/data/facility-coords.json");
const UA = "PHHIVCareDirectory/1.0 (https://github.com/ramonloganjr; contact: hello@ramonloganjr.com)";

type Entry = { lat: number; lon: number; source: "name" | "address" | "city" };

const existing: Record<string, Entry> = fs.existsSync(OUT)
  ? JSON.parse(fs.readFileSync(OUT, "utf8"))
  : {};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function nominatim(q: string): Promise<{ lat: number; lon: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ph&q=${encodeURIComponent(q)}`;
  const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (!r.ok) {
    if (r.status === 429) {
      console.warn("  429 rate-limit; backing off 5s");
      await sleep(5000);
    }
    return null;
  }
  const j = (await r.json()) as Array<{ lat: string; lon: string }>;
  if (!j.length) return null;
  return { lat: parseFloat(j[0].lat), lon: parseFloat(j[0].lon) };
}

function cityGuess(address: string): string {
  const parts = address.split(",").map((s) => s.trim()).filter(Boolean);
  return parts[parts.length - 1] || address;
}

async function geocodeOne(f: { id: string; name: string; address: string }): Promise<Entry | null> {
  const tries: Array<{ q: string; source: Entry["source"] }> = [
    { q: `${f.name}, ${f.address}, Philippines`, source: "name" },
    { q: `${f.address}, Philippines`, source: "address" },
    { q: `${cityGuess(f.address)}, Philippines`, source: "city" },
  ];
  for (const t of tries) {
    const hit = await nominatim(t.q);
    await sleep(1100);
    if (hit) return { lat: hit.lat, lon: hit.lon, source: t.source };
  }
  return null;
}

async function main() {
  const todo = FACILITIES.filter((f) => !existing[f.id]);
  console.log(`Geocoding ${todo.length} of ${FACILITIES.length} facilities (skipping ${FACILITIES.length - todo.length} cached).`);

  let done = 0;
  let saveCounter = 0;
  for (const f of todo) {
    done++;
    try {
      const entry = await geocodeOne(f);
      if (entry) {
        existing[f.id] = entry;
        console.log(`[${done}/${todo.length}] ✓ ${f.id} (${entry.source}) ${entry.lat.toFixed(4)},${entry.lon.toFixed(4)}`);
      } else {
        console.warn(`[${done}/${todo.length}] ✗ ${f.id} — no result`);
      }
    } catch (e) {
      console.warn(`[${done}/${todo.length}] ! ${f.id} — ${(e as Error).message}`);
    }
    saveCounter++;
    if (saveCounter >= 10) {
      fs.writeFileSync(OUT, JSON.stringify(existing, null, 0));
      saveCounter = 0;
    }
  }
  fs.writeFileSync(OUT, JSON.stringify(existing, null, 0));
  console.log(`Wrote ${Object.keys(existing).length} entries to ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
