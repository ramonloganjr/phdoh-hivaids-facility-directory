import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useDeferredValue } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  Hospital,
  Stethoscope,
  ListFilter,
  BedDouble,
  ArrowUp,
} from "lucide-react";
import {
  FACILITIES,
  REGION_LABELS,
  REGION_ORDER,
} from "@/data/facilities";
import type { RegionCode, ServiceType } from "@/data/facilities.types";
import { FacilityCard } from "@/components/facility-card";
import { cn } from "@/lib/utils";

type Search = {
  q?: string;
  region?: RegionCode;
  service?: "hub" | "primary";
  inpatient?: true;
};

const ALL_REGIONS = new Set<RegionCode>(REGION_ORDER);

export const Route = createFileRoute("/facilities")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const q = typeof search.q === "string" && search.q ? search.q : undefined;
    const region =
      typeof search.region === "string" && ALL_REGIONS.has(search.region as RegionCode)
        ? (search.region as RegionCode)
        : undefined;
    const service =
      search.service === "hub" || search.service === "primary" ? search.service : undefined;
    const inpatient =
      search.inpatient === true || search.inpatient === "1" || search.inpatient === "true"
        ? (true as const)
        : undefined;
    return { q, region, service, inpatient };
  },
  head: () => ({
    meta: [
      { title: "All HIV facilities — Philippine HIV Care Directory" },
      {
        name: "description",
        content:
          "Searchable list of 338 DOH-designated HIV treatment hubs and primary care facilities across the Philippines.",
      },
      { property: "og:title", content: "All HIV facilities — PH HIV Care Directory" },
      {
        property: "og:description",
        content: "Search and filter the full DOH HIV facility directory.",
      },
      { property: "og:url", content: "/facilities" },
    ],
    links: [{ rel: "canonical", href: "/facilities" }],
  }),
  component: FacilitiesPage,
});

const SERVICE_MAP: Record<"hub" | "primary", ServiceType> = {
  hub: "Treatment Hub",
  primary: "Primary HIV Care Facility",
};

function FacilitiesPage() {
  const search = Route.useSearch() as Search;
  const navigate = useNavigate({ from: "/facilities" });

  const [localQ, setLocalQ] = useState(search.q ?? "");
  const deferredQ = useDeferredValue(localQ);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 480);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const setSearch = (patch: Partial<Search>) => {
    navigate({
      search: ((prev: Search) => {
        const next: Search = { ...prev, ...patch };
        for (const k of Object.keys(next) as (keyof Search)[]) {
          if (!next[k]) delete next[k];
        }
        return next;
      }) as never,
      replace: true,
    });
  };

  const onQueryChange = (v: string) => {
    setLocalQ(v);
    setSearch({ q: v || undefined });
  };

  // Pre-compute global counts (for chip badges, independent of current filters)
  const globalCounts = useMemo(() => {
    let hubs = 0;
    let primary = 0;
    let inpatient = 0;
    const region: Record<string, number> = {};
    for (const f of FACILITIES) {
      if (f.serviceType === "Treatment Hub") hubs++;
      else primary++;
      if (f.inpatient) inpatient++;
      region[f.region] = (region[f.region] ?? 0) + 1;
    }
    return { hubs, primary, inpatient, region };
  }, []);

  const filtered = useMemo(() => {
    const q = deferredQ.trim().toLowerCase();
    return FACILITIES.filter((f) => {
      if (search.region && f.region !== search.region) return false;
      if (search.service && f.serviceType !== SERVICE_MAP[search.service]) return false;
      if (search.inpatient && !f.inpatient) return false;
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        f.address.toLowerCase().includes(q) ||
        f.contacts.some((c) => c.name.toLowerCase().includes(q)) ||
        REGION_LABELS[f.region].toLowerCase().includes(q)
      );
    });
  }, [deferredQ, search.region, search.service, search.inpatient]);

  const groupedByRegion = useMemo(() => {
    const map = new Map<RegionCode, typeof FACILITIES>();
    for (const f of filtered) {
      const list = map.get(f.region) ?? [];
      list.push(f);
      map.set(f.region, list);
    }
    // Sort facilities alphabetically within each region for predictable browsing
    for (const list of map.values()) {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return REGION_ORDER.filter((r) => map.has(r)).map((r) => ({
      code: r,
      label: REGION_LABELS[r],
      facilities: map.get(r)!,
    }));
  }, [filtered]);

  const activeFilterCount =
    (search.region ? 1 : 0) + (search.service ? 1 : 0) + (search.inpatient ? 1 : 0);

  const resetAll = () => {
    setLocalQ("");
    setSearch({ q: undefined, region: undefined, service: undefined, inpatient: undefined });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-on-surface sm:text-4xl">
          Facility directory
        </h1>
        <p className="text-sm text-on-surface-muted">
          {filtered.length.toLocaleString()} of {FACILITIES.length.toLocaleString()} facilities
          {search.region ? ` in ${REGION_LABELS[search.region]}` : ""}
          {search.service ? ` · ${SERVICE_MAP[search.service]}s` : ""}
          {search.inpatient ? ` · with inpatient services` : ""}
        </p>
      </div>

      {/* Sticky filter bar — stays reachable while browsing long lists */}
      <div className="sticky top-20 z-30 -mx-4 mt-6 bg-background/90 px-4 pb-3 pt-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex flex-col gap-3">
          <label className="relative block">
            <span className="sr-only">Search facilities</span>
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              inputMode="search"
              value={localQ}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search by name, address, region, or contact…"
              className="state-layer h-12 w-full rounded-full border border-outline-variant bg-surface-container pl-11 pr-11 text-sm text-on-surface placeholder:text-on-surface-muted focus:border-primary focus:bg-surface focus:outline-none"
              aria-label="Search facilities"
            />
            {localQ && (
              <button
                type="button"
                onClick={() => onQueryChange("")}
                aria-label="Clear search"
                className="state-layer absolute right-2.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-on-surface-muted hover:text-on-surface"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </label>

          {/* Service + inpatient chips */}
          <div className="flex flex-wrap items-center gap-2">
            <ServiceChip
              active={!search.service}
              onClick={() => setSearch({ service: undefined })}
              icon={ListFilter}
              count={FACILITIES.length}
            >
              All services
            </ServiceChip>
            <ServiceChip
              active={search.service === "hub"}
              onClick={() => setSearch({ service: search.service === "hub" ? undefined : "hub" })}
              icon={Hospital}
              count={globalCounts.hubs}
            >
              Treatment hubs
            </ServiceChip>
            <ServiceChip
              active={search.service === "primary"}
              onClick={() =>
                setSearch({ service: search.service === "primary" ? undefined : "primary" })
              }
              icon={Stethoscope}
              count={globalCounts.primary}
            >
              Primary care
            </ServiceChip>
            <ServiceChip
              active={!!search.inpatient}
              onClick={() => setSearch({ inpatient: search.inpatient ? undefined : true })}
              icon={BedDouble}
              count={globalCounts.inpatient}
            >
              Inpatient
            </ServiceChip>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={() => setSearch({ region: undefined, service: undefined, inpatient: undefined })}
                className="state-layer ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-on-surface-muted hover:text-on-surface"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Clear filters
              </button>
            )}
          </div>

          {/* Region filter — compact dropdown */}
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal
              className="h-4 w-4 shrink-0 text-on-surface-muted"
              aria-hidden="true"
            />
            <label htmlFor="region-select" className="text-xs font-medium text-on-surface-muted">
              Region
            </label>
            <div className="relative">
              <select
                id="region-select"
                value={search.region ?? ""}
                onChange={(e) =>
                  setSearch({ region: (e.target.value || undefined) as RegionCode | undefined })
                }
                className={cn(
                  "state-layer appearance-none rounded-full py-1.5 pl-4 pr-9 text-sm font-medium transition-colors",
                  search.region
                    ? "bg-primary-container text-on-primary-container"
                    : "bg-surface-container-high text-on-surface"
                )}
              >
                <option value="">All regions ({FACILITIES.length})</option>
                {REGION_ORDER.map((r) => (
                  <option key={r} value={r}>
                    {REGION_LABELS[r]} ({globalCounts.region[r] ?? 0})
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-muted">▾</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick jump — only when many regions present and no region filter */}
      {!search.region && groupedByRegion.length > 1 && (
        <nav
          aria-label="Jump to region"
          className="mt-4 rounded-2xl border border-outline-variant bg-surface-container p-3"
        >
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-muted">
            Jump to region
          </p>
          <div className="flex flex-wrap gap-1.5">
            {groupedByRegion.map((g) => (
              <a
                key={g.code}
                href={`#region-${g.code}`}
                className="state-layer inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-on-surface hover:bg-surface-container-high"
              >
                {g.label}
                <span className="text-[10px] text-on-surface-muted">
                  {g.facilities.length}
                </span>
              </a>
            ))}
          </div>
        </nav>
      )}

      {/* Results */}
      <div className="mt-8 space-y-10">
        {groupedByRegion.length === 0 ? (
          <EmptyState onReset={resetAll} query={localQ} />
        ) : (
          groupedByRegion.map((group) => (
            <section
              key={group.code}
              id={`region-${group.code}`}
              aria-labelledby={`region-${group.code}-h`}
              className="scroll-mt-40"
            >
              <header className="mb-3 flex items-baseline justify-between gap-2">
                <h2
                  id={`region-${group.code}-h`}
                  className="text-sm font-semibold uppercase tracking-[0.12em] text-on-surface-muted"
                >
                  {group.label}
                </h2>
                <span className="text-xs text-on-surface-muted">
                  {group.facilities.length}{" "}
                  {group.facilities.length === 1 ? "facility" : "facilities"}
                </span>
              </header>
              <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {group.facilities.map((f) => (
                  <li key={f.id}>
                    <FacilityCard facility={f} />
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>

      {/* Back to top */}
      {showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="state-layer fixed bottom-6 right-6 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground elev-3 hover:elev-2"
        >
          <ArrowUp className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

function ServiceChip({
  active,
  onClick,
  icon: Icon,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Hospital;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "state-layer inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-outline-variant bg-surface-container text-on-surface hover:bg-surface-container-high",
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {children}
      {typeof count === "number" && (
        <span
          className={cn(
            "ml-0.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
            active
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-surface text-on-surface-muted",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function RegionChip({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "state-layer inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary-container bg-primary-container text-on-primary-container"
          : "border-outline-variant bg-surface-container text-on-surface-muted hover:text-on-surface",
      )}
    >
      {children}
      {typeof count === "number" && (
        <span
          className={cn(
            "tabular-nums text-[10px]",
            active ? "text-on-primary-container/80" : "text-on-surface-muted/70",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function EmptyState({ onReset, query }: { onReset: () => void; query: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-outline-variant bg-surface-container p-10 text-center">
      <h3 className="text-base font-semibold text-on-surface">No facilities match</h3>
      <p className="mt-1 text-sm text-on-surface-muted">
        {query
          ? <>No results for <span className="font-medium text-on-surface">“{query}”</span>. Try a different search term or clear your filters.</>
          : "Try a different search term or clear your filters."}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="state-layer mt-5 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
      >
        Reset
      </button>
    </div>
  );
}
