import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search, Hospital, Stethoscope, ShieldCheck, MapPin, TrendingUp, Activity, Users, BarChart3 } from "lucide-react";
import {
  FACILITIES,
  REGION_LABELS,
  REGION_ORDER,
  FACILITY_COUNT,
  TREATMENT_HUB_COUNT,
  PRIMARY_CARE_COUNT,
} from "@/data/facilities";
import {
  nationalCascade,
  quarterSnapshot,
  monthlyAvgByYear,
  ageDistribution,
  transmissionMode,
  reportMeta,
} from "@/data/surveillance";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Philippine HIV Care Directory — DOH-Designated Facilities" },
      {
        name: "description",
        content:
          "All 338 DOH-designated HIV treatment hubs and primary care facilities in the Philippines, in one searchable directory.",
      },
      { property: "og:title", content: "Philippine HIV Care Directory" },
      {
        property: "og:description",
        content:
          "Find DOH-designated HIV treatment hubs and primary care facilities across the Philippines.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Philippine HIV Care Directory",
          description:
            "Mirror of DOH Department Circular No. 2026-0065 — designated HIV treatment hubs and primary care facilities.",
        }),
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const regionCounts = REGION_ORDER.map((code) => ({
    code,
    label: REGION_LABELS[code],
    count: FACILITIES.filter((f) => f.region === code).length,
  })).filter((r) => r.count > 0);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-40 -z-10 mx-auto h-[480px] max-w-5xl rounded-[100%] bg-primary/15 blur-3xl"
        />
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-20">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-on-surface-muted">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              DOH DC 2026-0065 · Verified 31 Dec 2025
            </p>
            <h1 className="mt-5 max-w-3xl text-balance text-4xl font-semibold tracking-tight text-on-surface sm:text-6xl">
              Every DOH-designated HIV facility in the Philippines, in one place.
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-on-surface-muted sm:text-lg">
              Search 338 treatment hubs and primary care clinics by name, region, or service.
              Tap to call, message, or open directions — built mobile-first for people who need
              answers fast.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/facilities"
                className="state-layer inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground elev-2"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Search the directory
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/about"
                className="state-layer inline-flex items-center gap-2 rounded-full border border-outline bg-surface px-6 py-3 text-sm font-semibold text-on-surface"
              >
                About the data
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-3 sm:gap-4">
            <Stat label="Total facilities" value={FACILITY_COUNT} accent />
            <Stat
              label="Treatment hubs"
              value={TREATMENT_HUB_COUNT}
              icon={Hospital}
            />
            <Stat
              label="Primary care"
              value={PRIMARY_CARE_COUNT}
              icon={Stethoscope}
            />
          </div>
        </div>
      </section>

      {/* INSIGHTS — interactive summary layer */}
      <InsightsShowcase />

      {/* REGIONS */}
      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl">
              Browse by region
            </h2>
            <p className="mt-1 text-sm text-on-surface-muted">
              {regionCounts.length} regions, from Batanes to Tawi-Tawi.
            </p>
          </div>
          <Link
            to="/facilities"
            className="hidden text-sm font-medium text-primary hover:underline sm:inline-flex sm:items-center sm:gap-1"
          >
            See all <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {regionCounts.map((r) => (
            <li key={r.code}>
              <Link
                to="/facilities"
                search={{ region: r.code }}
                className="state-layer group flex items-center justify-between rounded-2xl border border-outline-variant bg-surface-container p-4 elev-1 hover:elev-2"
              >
                <span className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
                    <MapPin className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-on-surface">
                      {r.label}
                    </span>
                    <span className="block text-xs text-on-surface-muted">
                      {r.count} {r.count === 1 ? "facility" : "facilities"}
                    </span>
                  </span>
                </span>
                <ArrowRight
                  className="h-4 w-4 text-on-surface-muted transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* INFO STRIP */}
      <section className="mx-auto mt-12 max-w-6xl px-4 sm:px-6">
        <div className="grid gap-4 rounded-3xl border border-outline-variant bg-surface-container p-6 sm:grid-cols-3 sm:p-8">
          <InfoBlock
            title="Legal basis"
            body="Article V, Section 33 of RA 11166 — the Philippine HIV and AIDS Policy Act."
          />
          <InfoBlock
            title="Treatment hubs"
            body="Public and private hospitals offering outpatient & inpatient HIV care, including ART."
          />
          <InfoBlock
            title="Primary HIV care"
            body="Outpatient facilities providing testing, counseling, and entry to treatment."
          />
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon?: typeof Hospital;
  accent?: boolean;
}) {
  return (
    <div
      className={
        accent
          ? "rounded-3xl bg-primary p-5 text-primary-foreground elev-2 sm:p-6"
          : "rounded-3xl border border-outline-variant bg-surface-container p-5 elev-1 sm:p-6"
      }
    >
      <div className="flex items-center gap-2">
        {Icon ? (
          <Icon
            className={accent ? "h-4 w-4 opacity-80" : "h-4 w-4 text-on-surface-muted"}
            aria-hidden="true"
          />
        ) : null}
        <p
          className={
            accent
              ? "text-[11px] font-medium uppercase tracking-[0.14em] opacity-90"
              : "text-[11px] font-medium uppercase tracking-[0.14em] text-on-surface-muted"
          }
        >
          {label}
        </p>
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{value}</p>
    </div>
  );
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
        {title}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-on-surface">{body}</p>
    </div>
  );
}
