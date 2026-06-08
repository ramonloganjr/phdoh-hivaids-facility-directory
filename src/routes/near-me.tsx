import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Compass,
  LocateFixed,
  AlertTriangle,
  MapPin,
  Loader2,
  Sparkles,
  Hospital,
  Stethoscope,
  Navigation,
  BedDouble,
} from "lucide-react";
import { FACILITIES } from "@/data/facilities";
import facilityCoords from "@/data/facility-coords.json";
import { FacilityCard } from "@/components/facility-card";
import {
  haversineKm,
  bandFor,
  PROXIMITY_BANDS,
  PROXIMITY_RANGES,
  formatKm,
  driveMinutes,
  type LatLng,
  type ProximityBand,
} from "@/lib/geo";
import { openDirections } from "@/lib/facilities-helpers";
import { cn } from "@/lib/utils";

type CoordEntry = { lat: number; lon: number; source: "name" | "address" | "city" };
const COORDS = facilityCoords as Record<string, CoordEntry>;

export const Route = createFileRoute("/near-me")({
  head: () => ({
    meta: [
      { title: "Find HIV care near you — PH HIV Care Directory" },
      {
        name: "description",
        content:
          "See the closest DOH-designated HIV treatment hubs and primary care facilities, ranked by real distance. Your location stays on your device.",
      },
      { property: "og:title", content: "Find HIV care near you" },
      {
        property: "og:description",
        content:
          "Private, on-device proximity search across 338 DOH-designated HIV facilities in the Philippines.",
      },
      { property: "og:url", content: "/near-me" },
    ],
    links: [{ rel: "canonical", href: "/near-me" }],
  }),
  component: NearMePage,
});

type GeoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; coords: LatLng; accuracy: number; at: number }
  | { status: "error"; message: string; code?: number };

type ServiceFilter = "all" | "hub" | "primary";
type RangeId = (typeof PROXIMITY_RANGES)[number]["id"];

function NearMePage() {
  const [geo, setGeo] = useState<GeoState>({ status: "idle" });
  const [range, setRange] = useState<RangeId>("25");
  const [service, setService] = useState<ServiceFilter>("all");
  const [inpatientOnly, setInpatientOnly] = useState(false);
  const watcherId = useRef<number | null>(null);

  // Stop any in-flight watcher when the page unmounts.
  useEffect(() => {
    return () => {
      if (watcherId.current != null && typeof navigator !== "undefined") {
        navigator.geolocation.clearWatch(watcherId.current);
      }
    };
  }, []);

  const requestLocation = () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setGeo({
        status: "error",
        message:
          "This browser can't share your location. Try a recent version of Chrome, Safari, or Firefox — or browse the full directory instead.",
      });
      return;
    }
    setGeo({ status: "loading" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({
          status: "ready",
          coords: { lat: pos.coords.latitude, lon: pos.coords.longitude },
          accuracy: pos.coords.accuracy,
          at: Date.now(),
        });
      },
      (err) => {
        const message =
          err.code === err.PERMISSION_DENIED
            ? "Location is off for this site. You can still browse the full directory, or turn on location in your browser settings to sort facilities by distance."
            : err.code === err.POSITION_UNAVAILABLE
              ? "Your device couldn't get a location fix right now. Move somewhere with a clearer GPS or Wi-Fi signal and try again."
              : err.code === err.TIMEOUT
                ? "Locating you is taking longer than expected. Try again in a moment."
                : "We couldn't read your location. Try again, or browse the full directory instead.";
        setGeo({ status: "error", message, code: err.code });
      },
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 12_000 },
    );
  };

  // Compute distance-annotated, filtered, sorted, and banded results.
  const result = useMemo(() => {
    const total = FACILITIES.length;
    const mapped = FACILITIES.filter((f) => COORDS[f.id]);
    const unmapped = total - mapped.length;

    if (geo.status !== "ready") {
      return { total, mapped: mapped.length, unmapped, items: [], grouped: [] as GroupedBand[] };
    }
    const user = geo.coords;
    const maxKm = PROXIMITY_RANGES.find((r) => r.id === range)?.maxKm ?? Infinity;

    type Item = (typeof FACILITIES)[number] & { distanceKm: number; band: ProximityBand };
    const items: Item[] = [];
    for (const f of mapped) {
      const c = COORDS[f.id]!;
      const km = haversineKm(user, { lat: c.lat, lon: c.lon });
      if (km > maxKm) continue;
      if (service === "hub" && f.serviceType !== "Treatment Hub") continue;
      if (service === "primary" && f.serviceType !== "Primary HIV Care Facility") continue;
      if (inpatientOnly && !f.inpatient) continue;
      items.push({ ...f, distanceKm: km, band: bandFor(km) });
    }
    items.sort((a, b) => a.distanceKm - b.distanceKm);

    const grouped: GroupedBand[] = [];
    for (const band of PROXIMITY_BANDS) {
      const list = items.filter((i) => i.band.id === band.id);
      if (list.length) grouped.push({ band, items: list });
    }
    return { total, mapped: mapped.length, unmapped, items, grouped };
  }, [geo, range, service, inpatientOnly]);

  // Smart recommendation: closest treatment hub overall, regardless of range filter.
  const recommendation = useMemo(() => {
    if (geo.status !== "ready") return null;
    let best: { f: (typeof FACILITIES)[number]; km: number } | null = null;
    for (const f of FACILITIES) {
      if (f.serviceType !== "Treatment Hub") continue;
      const c = COORDS[f.id];
      if (!c) continue;
      const km = haversineKm(geo.coords, { lat: c.lat, lon: c.lon });
      if (!best || km < best.km) best = { f, km };
    }
    return best;
  }, [geo]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 sm:pt-10">
      {/* Hero */}
      <header className="rounded-[2rem] bg-gradient-to-br from-primary-container via-surface-container-high to-surface-container p-6 sm:p-10 elev-1">
        <div className="flex flex-col items-start gap-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-foreground">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            Care close to you
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-on-surface sm:text-5xl">
            Find HIV care near you
          </h1>
          <p className="max-w-2xl text-sm text-on-surface-muted sm:text-base">
            Share your location once and we'll show the closest DOH-designated treatment hubs and primary
            care facilities, ranked by real distance with one-tap directions. Your location stays on your
            device — nothing is sent to a server, and we don't track you.
          </p>
          <LocationCta geo={geo} onRequest={requestLocation} />
        </div>
      </header>

      {/* Status strip — coverage transparency */}
      <p className="mt-4 text-xs text-on-surface-muted">
        Mapped so far:{" "}
        <span className="font-medium text-on-surface tabular-nums">
          {result.mapped.toLocaleString()} of {result.total.toLocaleString()}
        </span>{" "}
        facilities ({Math.round((result.mapped / result.total) * 100)}%).
        {result.unmapped > 0 && (
          <>
            {" "}
            {result.unmapped} are still being verified — you'll find them in the{" "}
            <Link to="/facilities" className="font-medium text-primary underline-offset-2 hover:underline">
              full directory
            </Link>
            .
          </>
        )}
      </p>



      {geo.status === "ready" && (
        <>
          {/* Smart recommendation */}
          {recommendation && (
            <RecommendationCard
              facility={recommendation.f}
              distanceKm={recommendation.km}
              outsideRange={recommendation.km > (PROXIMITY_RANGES.find((r) => r.id === range)?.maxKm ?? Infinity)}
            />
          )}

          {/* Filters */}
          <div className="sticky top-20 z-30 -mx-4 mt-6 bg-background/90 px-4 pb-3 pt-3 backdrop-blur-md sm:-mx-6 sm:px-6">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-muted">
                  Range
                </span>
                {PROXIMITY_RANGES.map((r) => (
                  <Chip key={r.id} active={range === r.id} onClick={() => setRange(r.id)}>
                    {r.label}
                  </Chip>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-muted">
                  Service
                </span>
                <Chip active={service === "all"} onClick={() => setService("all")}>
                  All services
                </Chip>
                <Chip active={service === "hub"} onClick={() => setService("hub")} icon={Hospital}>
                  Treatment hubs
                </Chip>
                <Chip
                  active={service === "primary"}
                  onClick={() => setService("primary")}
                  icon={Stethoscope}
                >
                  Primary care
                </Chip>
                <Chip
                  active={inpatientOnly}
                  onClick={() => setInpatientOnly((v) => !v)}
                  icon={BedDouble}
                >
                  Inpatient
                </Chip>
              </div>
            </div>
          </div>

          {/* Results */}
          <section className="mt-6">
            <h2 className="sr-only">Nearby facilities</h2>
            {result.items.length === 0 ? (
              <EmptyResult />
            ) : (
              <div className="space-y-10">
                {result.grouped.map(({ band, items }) => (
                  <section key={band.id} aria-labelledby={`band-${band.id}-h`}>
                    <header className="mb-3 flex items-baseline justify-between gap-2">
                      <div>
                        <h3
                          id={`band-${band.id}-h`}
                          className="text-sm font-semibold uppercase tracking-[0.12em] text-on-surface"
                        >
                          {band.label}
                        </h3>
                        <p className="text-xs text-on-surface-muted">{band.hint}</p>
                      </div>
                      <span className="rounded-full bg-surface-container-high px-2.5 py-0.5 text-xs font-medium tabular-nums text-on-surface-muted">
                        {items.length} {items.length === 1 ? "facility" : "facilities"}
                      </span>
                    </header>
                    <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {items.map((f) => (
                        <li key={f.id}>
                          <FacilityCard facility={f} distanceKm={f.distanceKm} />
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {geo.status === "idle" && (
        <IntroPanel />
      )}
    </div>
  );
}

type GroupedBand = {
  band: ProximityBand;
  items: ((typeof FACILITIES)[number] & { distanceKm: number; band: ProximityBand })[];
};

function LocationCta({ geo, onRequest }: { geo: GeoState; onRequest: () => void }) {
  if (geo.status === "ready") {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-2 text-xs font-medium text-on-surface">
          <span className="relative inline-flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
          Location active · accurate to ±{Math.round(geo.accuracy)} m
        </span>
        <button
          type="button"
          onClick={onRequest}
          className="state-layer press inline-flex items-center gap-1.5 rounded-full bg-surface px-3.5 py-2 text-xs font-medium text-on-surface"
        >
          <LocateFixed className="h-3.5 w-3.5" aria-hidden="true" />
          Refresh location
        </button>
      </div>
    );
  }
  if (geo.status === "loading") {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground opacity-80"
      >
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Locating you…
      </button>
    );
  }
  if (geo.status === "error") {
    return (
      <div className="flex w-full max-w-xl flex-col gap-3 rounded-2xl bg-surface p-4 elev-1">
        <p className="flex items-start gap-2 text-sm text-on-surface">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          {geo.message}
        </p>
        <button
          type="button"
          onClick={onRequest}
          className="state-layer press self-start rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Try again
        </button>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onRequest}
      className="state-layer press inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground elev-2"
    >
      <Compass className="h-4 w-4" aria-hidden="true" />
      Use my current location
    </button>
  );
}

function Chip({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon?: typeof Hospital;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "state-layer press inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-outline-variant bg-surface-container text-on-surface hover:bg-surface-container-high",
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
      {children}
    </button>
  );
}

function RecommendationCard({
  facility,
  distanceKm,
  outsideRange,
}: {
  facility: (typeof FACILITIES)[number];
  distanceKm: number;
  outsideRange: boolean;
}) {
  return (
    <section
      aria-labelledby="recommendation-h"
      className="mt-6 rounded-3xl bg-surface-container-highest p-5 elev-2 sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
            aria-hidden="true"
          >
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p
              id="recommendation-h"
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary"
            >
              Closest treatment hub
            </p>
            <h2 className="mt-1 text-lg font-semibold leading-snug text-on-surface sm:text-xl">
              {facility.name}
            </h2>
            <p className="mt-1 flex items-center gap-1 text-xs text-on-surface-muted">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="line-clamp-1">{facility.address}</span>
            </p>
            <p className="mt-2 text-sm text-on-surface">
              <span className="font-semibold tabular-nums">{formatKm(distanceKm)}</span>{" "}
              <span className="text-on-surface-muted">
                away · approx. {driveMinutes(distanceKm)} min drive
              </span>
              {outsideRange && (
                <span className="ml-1 inline-flex items-center rounded-full bg-primary-container px-2 py-0.5 text-[10px] font-medium text-on-primary-container">
                  Outside selected range
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          <button
            type="button"
            onClick={() => openDirections({ name: facility.name, address: facility.address })}
            className="state-layer press inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <Navigation className="h-4 w-4" aria-hidden="true" />
            Directions
          </button>
          <Link
            to="/facilities/$id"
            params={{ id: facility.id }}
            className="state-layer press inline-flex items-center gap-1.5 rounded-full bg-surface px-4 py-2.5 text-sm font-medium text-on-surface"
          >
            View details
          </Link>
        </div>
      </div>
    </section>
  );
}

function IntroPanel() {
  return (
    <section className="mt-8 grid gap-4 sm:grid-cols-3">
      {[
        {
          title: "Real distance",
          body: "Great-circle distance from your device to each facility, ranked nearest first.",
          icon: Compass,
        },
        {
          title: "Smart clusters",
          body: "Results grouped by walking, nearby, citywide, regional, and farther afield bands.",
          icon: Sparkles,
        },
        {
          title: "Native directions",
          body: "Open turn-by-turn navigation in Apple Maps, Google Maps, or your default app.",
          icon: Navigation,
        },
      ].map((c) => (
        <article
          key={c.title}
          className="rounded-3xl bg-surface-container p-5 elev-1"
        >
          <span
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container"
            aria-hidden="true"
          >
            <c.icon className="h-5 w-5" />
          </span>
          <h2 className="mt-3 text-base font-semibold text-on-surface">{c.title}</h2>
          <p className="mt-1 text-sm text-on-surface-muted">{c.body}</p>
        </article>
      ))}
    </section>
  );
}

function EmptyResult() {
  return (
    <div className="rounded-3xl border border-dashed border-outline-variant bg-surface-container p-10 text-center">
      <h3 className="text-base font-semibold text-on-surface">No facilities in this range</h3>
      <p className="mt-1 text-sm text-on-surface-muted">
        Try widening the proximity range, switching service type, or turning off the inpatient filter.
      </p>
    </div>
  );
}
