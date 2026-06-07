import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Hospital, Stethoscope, ShieldCheck } from "lucide-react";
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

  const totalTransmission = transmissionMode.reduce((s, t) => s + t.count, 0);
  const topTransmission = transmissionMode[0];
  const topTransmissionPct = Math.round((topTransmission.count / totalTransmission) * 100);
  const topAge = [...ageDistribution].sort((a, b) => b.pct - a.pct)[0];
  const maxMonthly = Math.max(...monthlyAvgByYear.map((d) => d.cases));

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-10">
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden rounded-3xl bg-surface-container px-6 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
        <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
          <div className="space-y-7 lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-1.5 text-xs font-medium text-on-primary-container">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              DOH DC 2026-0065 · Verified 31 Dec 2025
            </span>
            <h1 className="text-balance font-display text-4xl font-medium leading-[1.05] tracking-tight text-on-surface sm:text-5xl lg:text-6xl">
              Every DOH-designated{" "}
              <span className="text-primary">HIV facility</span> in the Philippines.
            </h1>
            <p className="max-w-xl text-pretty text-base leading-relaxed text-on-surface-muted sm:text-lg">
              Search {FACILITY_COUNT} treatment hubs and primary care clinics by name,
              region, or service. Tap to call, message, or open directions — built
              mobile-first for people who need answers fast.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/facilities"
                className="state-layer press group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground elev-1 transition-shadow hover:elev-2"
              >
                Search the directory
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
              <Link
                to="/about"
                className="state-layer press inline-flex items-center gap-2 rounded-full bg-surface-container-high px-6 py-3.5 text-sm font-semibold text-on-surface"
              >
                About the data
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-1">
            <StatTile label="Total facilities" value={FACILITY_COUNT} accent />
            <StatTile label="Treatment hubs" value={TREATMENT_HUB_COUNT} icon={Hospital} />
            <StatTile label="Primary care" value={PRIMARY_CARE_COUNT} icon={Stethoscope} />
          </div>
        </div>
      </section>

      {/* ===== Section 02 — Surveillance insights ===== */}
      <section className="rounded-3xl bg-surface-container p-6 sm:p-10 lg:p-12">
        <header className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              {reportMeta.publisher} · {reportMeta.quarter}
            </p>
            <h2 className="font-display text-3xl font-medium tracking-tight text-on-surface sm:text-4xl">
              Key visual insights
            </h2>
            <p className="max-w-lg text-sm leading-relaxed text-on-surface-muted">
              A live summary of the national HIV response — diagnosis, treatment, and
              viral suppression at a glance.
            </p>
          </div>
          <Link
            to="/insights"
            className="state-layer press group inline-flex items-center gap-1.5 rounded-full bg-surface px-4 py-2 text-xs font-semibold text-on-surface"
          >
            Full dashboard
            <ArrowUpRight
              className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </header>

        {/* 95-95-95 cascade rings */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <CascadeCard
            percent={nationalCascade.first95}
            label="Diagnosed"
            numerator={nationalCascade.diagnosed}
            denominator={nationalCascade.estimatedPLHIV}
          />
          <CascadeCard
            percent={nationalCascade.second95}
            label="On ART"
            numerator={nationalCascade.onART}
            denominator={nationalCascade.diagnosed}
          />
          <CascadeCard
            percent={nationalCascade.third95}
            label="Suppressed"
            numerator={nationalCascade.vlSuppressed}
            denominator={nationalCascade.onART}
          />
        </div>

        {/* Trend + transmission + age */}
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-12">
          {/* Trend */}
          <div className="rounded-2xl bg-surface p-6 md:col-span-8">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-on-surface-muted">
                Newly diagnosed · monthly average
              </p>
              <p className="font-display text-2xl font-medium tracking-tight text-on-surface sm:text-3xl">
                {quarterSnapshot.newlyDiagnosedAvgMonthly.toLocaleString()}{" "}
                <span className="ml-1 text-xs font-semibold text-primary">
                  +{quarterSnapshot.yoyChangePct}% YoY
                </span>
              </p>
            </div>

            <BarTrend data={monthlyAvgByYear} max={maxMonthly} />
            <ul className="mt-3 flex justify-between text-[10px] font-medium tracking-[0.1em] text-on-surface-muted">
              {monthlyAvgByYear.map((d) => (
                <li key={d.year}>{d.year}</li>
              ))}
            </ul>
          </div>

          {/* Transmission */}
          <div className="rounded-2xl bg-surface p-6 md:col-span-4">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-on-surface-muted">
              Leading transmission mode
            </p>
            <p className="mt-3 text-base font-medium text-on-surface">
              {topTransmission.mode}
            </p>
            <div className="mt-5 flex items-baseline justify-between">
              <span className="font-display text-5xl font-medium tracking-tight text-primary">
                {topTransmissionPct}%
              </span>
              <span className="text-xs text-on-surface-muted">of Q2 cases</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-outline-variant/60">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
                style={{ width: `${topTransmissionPct}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-on-surface-muted">
              {topTransmission.count.toLocaleString()} of{" "}
              {totalTransmission.toLocaleString()} newly reported
            </p>
          </div>

          {/* Age distribution */}
          <div className="rounded-2xl bg-surface p-6 md:col-span-12">
            <div className="mb-6 flex items-baseline justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-on-surface-muted">
                Newly diagnosed by age · Q2 2025
              </p>
              <p className="text-xs text-on-surface-muted">
                Peak: <span className="font-semibold text-on-surface">{topAge.group}</span>{" "}
                ({topAge.pct}%)
              </p>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {ageDistribution.map((a) => {
                const isPeak = a.group === topAge.group;
                const height = (a.pct / topAge.pct) * 100;
                return (
                  <div key={a.group} className="rounded-xl bg-surface-container p-3">
                    <div className="relative flex h-28 items-end sm:h-36">
                      <div
                        className={
                          isPeak
                            ? "w-full rounded-lg bg-primary transition-all duration-500"
                            : "w-full rounded-lg bg-primary-container transition-all duration-500"
                        }
                        style={{ height: `${height}%` }}
                      />
                      <span className="absolute -top-1 left-0 font-display text-base font-medium text-on-surface sm:text-lg">
                        {a.pct}%
                      </span>
                    </div>
                    <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.12em] text-on-surface-muted">
                      {a.group}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Section 03 — Regions ===== */}
      <section className="rounded-3xl bg-surface-container p-6 sm:p-10 lg:p-12">
        <header className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Geography
            </p>
            <h2 className="font-display text-3xl font-medium tracking-tight text-on-surface sm:text-4xl">
              Browse by region
            </h2>
            <p className="text-sm text-on-surface-muted">
              {regionCounts.length} regions, from Batanes to Tawi-Tawi.
            </p>
          </div>
          <Link
            to="/facilities"
            className="state-layer press group inline-flex items-center gap-1.5 rounded-full bg-surface px-4 py-2 text-xs font-semibold text-on-surface"
          >
            See all regions
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </header>

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {regionCounts.map((r) => (
            <li key={r.code}>
              <Link
                to="/facilities"
                search={{ region: r.code }}
                className="state-layer press group flex items-center justify-between gap-4 rounded-2xl bg-surface p-5 transition-shadow hover:elev-1"
              >
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                    {r.code}
                  </p>
                  <p className="mt-1.5 truncate font-display text-base font-medium tracking-tight text-on-surface">
                    {r.label}
                  </p>
                  <p className="mt-0.5 text-xs text-on-surface-muted">
                    {r.count} {r.count === 1 ? "facility" : "facilities"}
                  </p>
                </div>
                <ArrowRight
                  className="h-4 w-4 shrink-0 -translate-x-1 text-on-surface-muted opacity-0 transition-all group-hover:translate-x-0 group-hover:text-primary group-hover:opacity-100"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ===== Section 04 — Legal & definitions ===== */}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <InfoCard
          accent
          title="Legal basis"
          body="Article V, Section 33 of RA 11166 — the Philippine HIV and AIDS Policy Act."
        />
        <InfoCard
          title="Treatment hubs"
          body="Public and private hospitals offering outpatient & inpatient HIV care, including ART."
        />
        <InfoCard
          title="Primary HIV care"
          body="Outpatient facilities providing testing, counseling, and entry to treatment."
        />
      </section>
    </div>
  );
}

/* ---------- pieces ---------- */

function StatTile({
  label,
  value,
  accent,
  icon: Icon,
}: {
  label: string;
  value: number;
  accent?: boolean;
  icon?: typeof Hospital;
}) {
  return (
    <div
      className={
        accent
          ? "flex items-center justify-between gap-4 rounded-2xl bg-primary p-6 text-primary-foreground elev-1"
          : "flex items-center justify-between gap-4 rounded-2xl bg-surface p-6 text-on-surface"
      }
    >
      <div>
        <p
          className={
            accent
              ? "text-xs font-medium uppercase tracking-[0.12em] opacity-90"
              : "text-xs font-medium uppercase tracking-[0.12em] text-on-surface-muted"
          }
        >
          {label}
        </p>
        <p className="mt-2 font-display text-4xl font-medium leading-none tracking-tight sm:text-5xl">
          {value}
        </p>
      </div>
      {Icon && (
        <span
          className={
            accent
              ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground/15"
              : "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container"
          }
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </span>
      )}
    </div>
  );
}

function CascadeCard({
  percent,
  label,
  numerator,
  denominator,
}: {
  percent: number;
  label: string;
  numerator: number;
  denominator: number;
}) {
  const size = 96;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;

  return (
    <div className="flex items-center gap-5 rounded-2xl bg-surface p-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            className="text-outline-variant"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="text-primary transition-[stroke-dashoffset] duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-xl font-semibold text-on-surface">
            {percent}%
          </span>
        </div>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-on-surface-muted">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium text-on-surface">
          {numerator.toLocaleString()}{" "}
          <span className="text-on-surface-muted">
            / {denominator.toLocaleString()}
          </span>
        </p>
        <p className="mt-0.5 text-[11px] font-semibold tracking-wide text-primary">
          95% goal
        </p>
      </div>
    </div>
  );
}

function BarTrend({
  data,
  max,
}: {
  data: { year: string; cases: number }[];
  max: number;
}) {
  return (
    <div className="flex h-40 items-end gap-1.5 rounded-xl bg-surface-container p-3 sm:h-48">
      {data.map((d, i) => {
        const isLast = i === data.length - 1;
        const h = (d.cases / max) * 100;
        return (
          <div
            key={d.year}
            className={
              isLast
                ? "flex-1 rounded-md bg-primary transition-all duration-500"
                : "flex-1 rounded-md bg-primary-container transition-all duration-500 hover:bg-on-primary-container/30"
            }
            style={{ height: `${h}%` }}
            title={`${d.year}: ${d.cases.toLocaleString()}`}
          />
        );
      })}
    </div>
  );
}

function InfoCard({
  title,
  body,
  accent,
}: {
  title: string;
  body: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        accent
          ? "rounded-3xl bg-primary-container p-8 text-on-primary-container"
          : "rounded-3xl bg-surface-container p-8 text-on-surface"
      }
    >
      <h3 className="font-display text-xl font-medium tracking-tight">{title}</h3>
      <p
        className={
          accent
            ? "mt-3 text-sm leading-relaxed text-on-primary-container/80"
            : "mt-3 text-sm leading-relaxed text-on-surface-muted"
        }
      >
        {body}
      </p>
    </div>
  );
}
