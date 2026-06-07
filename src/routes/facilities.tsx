import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useDeferredValue } from "react";
import { Search, X, SlidersHorizontal, Hospital, Stethoscope, ListFilter } from "lucide-react";
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
    return { q, region, service };
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
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/facilities" });

  const [localQ, setLocalQ] = useState(search.q ?? "");
  const deferredQ = useDeferredValue(localQ);

  const setSearch = (patch: Partial<Search>) => {
    navigate({
      search: (prev) => {
        const next = { ...prev, ...patch };
        // strip empty values
        for (const k of Object.keys(next) as (keyof Search)[]) {
          if (!next[k]) delete next[k];
        }
        return next;
      },
      replace: true,
    });
  };

  // Sync URL with debounced query
  const onQueryChange = (v: string) => {
    setLocalQ(v);
    setSearch({ q: v || undefined });
  };

  const filtered = useMemo(() => {
    const q = deferredQ.trim().toLowerCase();
    return FACILITIES.filter((f) => {
      if (search.region && f.region !== search.region) return false;
      if (search.service && f.serviceType !== SERVICE_MAP[search.service]) return false;
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        f.address.toLowerCase().includes(q) ||
        f.contacts.some((c) => c.name.toLowerCase().includes(q)) ||
        REGION_LABELS[f.region].toLowerCase().includes(q)
      );
    });
  }, [deferredQ, search.region, search.service]);

  const groupedByRegion = useMemo(() => {
    const map = new Map<RegionCode, typeof FACILITIES>();
    for (const f of filtered) {
      const list = map.get(f.region) ?? [];
      list.push(f);
      map.set(f.region, list);
    }
    return REGION_ORDER.filter((r) => map.has(r)).map((r) => ({
      code: r,
      label: REGION_LABELS[r],
      facilities: map.get(r)!,
    }));
  }, [filtered]);

  const activeFilterCount = (search.region ? 1 : 0) + (search.service ? 1 : 0);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-on-surface sm:text-4xl">
          Facility directory
        </h1>
        <p className="text-sm text-on-surface-muted">
          {filtered.length} of {FACILITIES.length} facilities
          {search.region ? ` in ${REGION_LABELS[search.region]}` : ""}
          {search.service ? ` · ${SERVICE_MAP[search.service]}s` : ""}
        </p>
      </div>

      {/* Search bar */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
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
      </div>

      {/* Service chips */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <ServiceChip
          active={!search.service}
          onClick={() => setSearch({ service: undefined })}
          icon={ListFilter}
        >
          All services
        </ServiceChip>
        <ServiceChip
          active={search.service === "hub"}
          onClick={() => setSearch({ service: search.service === "hub" ? undefined : "hub" })}
          icon={Hospital}
        >
          Treatment hubs
        </ServiceChip>
        <ServiceChip
          active={search.service === "primary"}
          onClick={() =>
            setSearch({ service: search.service === "primary" ? undefined : "primary" })
          }
          icon={Stethoscope}
        >
          Primary care
        </ServiceChip>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={() => setSearch({ region: undefined, service: undefined })}
            className="state-layer ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-on-surface-muted hover:text-on-surface"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Clear filters
          </button>
        )}
      </div>

      {/* Region filter rail */}
      <div className="mt-3 -mx-4 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:px-0">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-on-surface-muted" aria-hidden="true" />
          <RegionChip
            active={!search.region}
            onClick={() => setSearch({ region: undefined })}
          >
            All regions
          </RegionChip>
          {REGION_ORDER.map((r) => (
            <RegionChip
              key={r}
              active={search.region === r}
              onClick={() =>
                setSearch({ region: search.region === r ? undefined : r })
              }
            >
              {REGION_LABELS[r]}
            </RegionChip>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="mt-8 space-y-10">
        {groupedByRegion.length === 0 ? (
          <EmptyState onReset={() => {
            setLocalQ("");
            setSearch({ q: undefined, region: undefined, service: undefined });
          }} />
        ) : (
          groupedByRegion.map((group) => (
            <section key={group.code} aria-labelledby={`region-${group.code}`}>
              <header className="mb-3 flex items-baseline justify-between gap-2">
                <h2
                  id={`region-${group.code}`}
                  className="text-sm font-semibold uppercase tracking-[0.12em] text-on-surface-muted"
                >
                  {group.label}
                </h2>
                <span className="text-xs text-on-surface-muted">
                  {group.facilities.length}
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
    </div>
  );
}

function ServiceChip({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Hospital;
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
    </button>
  );
}

function RegionChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "state-layer inline-flex shrink-0 items-center rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary-container bg-primary-container text-on-primary-container"
          : "border-outline-variant bg-surface-container text-on-surface-muted hover:text-on-surface",
      )}
    >
      {children}
    </button>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-3xl border border-dashed border-outline-variant bg-surface-container p-10 text-center">
      <h3 className="text-base font-semibold text-on-surface">No facilities match</h3>
      <p className="mt-1 text-sm text-on-surface-muted">
        Try a different search term or clear your filters.
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
