import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
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
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-8 sm:py-8">
      <article className="rule bg-outline">
        {/* ===== Section 01 — Masthead + hero + facility tallies ===== */}
        <section className="grid grid-cols-1 gap-px bg-outline md:grid-cols-12">
          {/* Hero */}
          <div className="bg-surface p-6 sm:p-10 md:col-span-8 lg:p-14">
            <div className="flex flex-col gap-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 border border-outline px-2.5 py-1 eyebrow text-on-surface">
                  <span className="h-1.5 w-1.5 bg-primary" aria-hidden="true" />
                  DOH DC 2026-0065 · Verified 31 Dec 2025
                </span>
                <span className="eyebrow text-on-surface-muted">
                  No. 01 / Directory
                </span>
              </div>

              <h1 className="text-balance font-display text-4xl font-medium uppercase leading-[0.95] tracking-tight text-on-surface sm:text-6xl lg:text-7xl">
                Every DOH-designated{" "}
                <span className="text-primary">HIV facility</span> in the Philippines.
              </h1>

              <p className="max-w-xl text-pretty text-base leading-relaxed text-on-surface-muted sm:text-lg">
                Search {FACILITY_COUNT} treatment hubs and primary care clinics by name,
                region, or service. Tap to call, message, or open directions — built
                mobile-first for people who need answers fast.
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  to="/facilities"
                  className="group inline-flex items-center gap-3 bg-primary px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground transition-colors hover:bg-on-surface hover:text-background"
                >
                  Search the directory
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-3 bg-surface px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-on-surface transition-colors hover:bg-secondary"
                >
                  About the data
                </Link>
              </div>
            </div>
          </div>

          {/* Stat stack */}
          <div className="grid grid-cols-1 gap-px bg-outline md:col-span-4 md:grid-rows-3">
            <StatTile
              label="Total facilities"
              value={FACILITY_COUNT}
              accent
            />
            <StatTile label="Treatment hubs" value={TREATMENT_HUB_COUNT} />
            <StatTile label="Primary care" value={PRIMARY_CARE_COUNT} />
          </div>
        </section>

        {/* ===== Section 02 — Surveillance insights ===== */}
        <section className="bg-surface p-6 sm:p-10 lg:p-14">
          <header className="mb-10 flex flex-col items-start justify-between gap-4 border-b border-outline pb-6 md:flex-row md:items-end">
            <div className="space-y-3">
              <p className="eyebrow text-primary">
                No. 02 / {reportMeta.publisher} · {reportMeta.quarter}
              </p>
              <h2 className="font-display text-3xl font-medium uppercase tracking-tight text-on-surface sm:text-4xl">
                Key visual insights
              </h2>
              <p className="max-w-lg text-sm leading-relaxed text-on-surface-muted">
                A live summary of the national HIV response — diagnosis, treatment, and
                viral suppression at a glance.
              </p>
            </div>
            <Link
              to="/insights"
              className="group inline-flex items-center gap-1.5 border-b-2 border-primary pb-1 text-xs font-bold uppercase tracking-[0.18em] text-on-surface"
            >
              Full dashboard
              <ArrowUpRight
                className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </header>

          {/* 95-95-95 cascade — three inline rings */}
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            <CascadeRow
              percent={nationalCascade.first95}
              label="Diagnosed"
              numerator={nationalCascade.diagnosed}
              denominator={nationalCascade.estimatedPLHIV}
            />
            <CascadeRow
              percent={nationalCascade.second95}
              label="On ART"
              numerator={nationalCascade.onART}
              denominator={nationalCascade.diagnosed}
            />
            <CascadeRow
              percent={nationalCascade.third95}
              label="Suppressed"
              numerator={nationalCascade.vlSuppressed}
              denominator={nationalCascade.onART}
            />
          </div>

          {/* Trend + transmission + age — ruled bento */}
          <div className="mt-12 grid grid-cols-1 gap-px border border-outline bg-outline md:grid-cols-12">
            {/* Trend */}
            <div className="bg-surface p-6 sm:p-8 md:col-span-8">
              <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
                <p className="eyebrow text-on-surface-muted">
                  Newly diagnosed · monthly average
                </p>
                <p className="font-display text-3xl font-medium tracking-tight text-on-surface sm:text-4xl">
                  {quarterSnapshot.newlyDiagnosedAvgMonthly.toLocaleString()}{" "}
                  <span className="ml-1 text-sm font-bold text-primary">
                    +{quarterSnapshot.yoyChangePct}% YoY
                  </span>
                </p>
              </div>

              <BarTrend data={monthlyAvgByYear} max={maxMonthly} />
              <ul className="mt-3 flex justify-between text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-muted">
                {monthlyAvgByYear.map((d) => (
                  <li key={d.year}>{d.year}</li>
                ))}
              </ul>
            </div>

            {/* Transmission */}
            <div className="bg-surface p-6 sm:p-8 md:col-span-4">
              <p className="eyebrow text-on-surface-muted">Leading transmission mode</p>
              <p className="mt-5 font-display text-2xl font-medium tracking-tight text-on-surface">
                {topTransmission.mode}
              </p>
              <div className="mt-6 flex items-baseline justify-between">
                <span className="font-display text-5xl font-medium tracking-tight text-primary">
                  {topTransmissionPct}%
                </span>
                <span className="eyebrow text-on-surface-muted">of Q2 cases</span>
              </div>
              <div className="mt-3 h-3 w-full border border-outline bg-surface">
                <div
                  className="h-full bg-primary transition-[width] duration-700 ease-out"
                  style={{ width: `${topTransmissionPct}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-on-surface-muted">
                {topTransmission.count.toLocaleString()} of{" "}
                {totalTransmission.toLocaleString()} newly reported
              </p>
            </div>

            {/* Age distribution */}
            <div className="bg-surface p-6 sm:p-8 md:col-span-12">
              <div className="mb-6 flex items-baseline justify-between">
                <p className="eyebrow text-on-surface-muted">
                  Newly diagnosed by age · Q2 2025
                </p>
                <p className="text-xs text-on-surface-muted">
                  Peak:{" "}
                  <span className="font-bold text-on-surface">{topAge.group}</span> (
                  {topAge.pct}%)
                </p>
              </div>
              <div className="grid grid-cols-5 gap-px bg-outline">
                {ageDistribution.map((a) => {
                  const isPeak = a.group === topAge.group;
                  const height = (a.pct / topAge.pct) * 100;
                  return (
                    <div key={a.group} className="bg-surface p-4">
                      <div className="relative flex h-28 items-end sm:h-36">
                        <div
                          className={
                            isPeak
                              ? "w-full bg-primary transition-all duration-500"
                              : "w-full bg-secondary transition-all duration-500"
                          }
                          style={{ height: `${height}%` }}
                        />
                        <span className="absolute -top-1 left-0 font-display text-base font-medium text-on-surface sm:text-lg">
                          {a.pct}%
                        </span>
                      </div>
                      <p className="mt-3 eyebrow text-on-surface-muted">{a.group}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ===== Section 03 — Regions ===== */}
        <section className="bg-surface p-6 sm:p-10 lg:p-14">
          <header className="mb-10 flex flex-col items-start justify-between gap-4 border-b border-outline pb-6 md:flex-row md:items-end">
            <div className="space-y-3">
              <p className="eyebrow text-primary">No. 03 / Geography</p>
              <h2 className="font-display text-3xl font-medium uppercase tracking-tight text-on-surface sm:text-4xl">
                Browse by region
              </h2>
              <p className="text-sm text-on-surface-muted">
                {regionCounts.length} regions, from Batanes to Tawi-Tawi.
              </p>
            </div>
            <Link
              to="/facilities"
              className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-on-surface hover:text-primary"
            >
              See all regions
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </header>

          <ul className="grid grid-cols-1 gap-px border border-outline bg-outline sm:grid-cols-2 lg:grid-cols-3">
            {regionCounts.map((r, i) => (
              <li key={r.code}>
                <Link
                  to="/facilities"
                  search={{ region: r.code }}
                  className="group flex items-center justify-between bg-surface p-5 transition-colors hover:bg-secondary"
                >
                  <div>
                    <p className="eyebrow text-primary">
                      {String(i + 1).padStart(2, "0")} · {r.code}
                    </p>
                    <p className="mt-2 font-display text-lg font-medium tracking-tight text-on-surface">
                      {r.label}
                    </p>
                    <p className="mt-1 text-xs text-on-surface-muted">
                      {r.count} {r.count === 1 ? "facility" : "facilities"}
                    </p>
                  </div>
                  <ArrowRight
                    className="h-4 w-4 -translate-x-1 text-on-surface opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ===== Section 04 — Legal & definitions ===== */}
        <section className="grid grid-cols-1 gap-px bg-outline md:grid-cols-3">
          <InfoBlock
            n="04"
            accent
            title="Legal basis"
            body="Article V, Section 33 of RA 11166 — the Philippine HIV and AIDS Policy Act."
          />
          <InfoBlock
            n="05"
            title="Treatment hubs"
            body="Public and private hospitals offering outpatient & inpatient HIV care, including ART."
          />
          <InfoBlock
            n="06"
            title="Primary HIV care"
            body="Outpatient facilities providing testing, counseling, and entry to treatment."
          />
        </section>
      </article>
    </div>
  );
}

/* ---------- pieces ---------- */

function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={
        accent
          ? "flex flex-col justify-between gap-6 bg-primary p-6 text-primary-foreground sm:p-8"
          : "flex flex-col justify-between gap-6 bg-surface p-6 text-on-surface sm:p-8"
      }
    >
      <span className={accent ? "eyebrow opacity-90" : "eyebrow text-on-surface-muted"}>
        {label}
      </span>
      <span className="font-display text-6xl font-medium leading-none tracking-tight sm:text-7xl">
        {value}
      </span>
    </div>
  );
}

function CascadeRow({
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
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="none"
            className="text-outline-variant"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="text-primary transition-[stroke-dashoffset] duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-xl font-medium text-on-surface">{percent}%</span>
        </div>
      </div>
      <div>
        <p className="eyebrow text-on-surface-muted">{label}</p>
        <p className="mt-1 text-sm font-medium text-on-surface">
          {numerator.toLocaleString()} <span className="text-on-surface-muted">/ {denominator.toLocaleString()}</span>
        </p>
        <p className="mt-1 eyebrow text-primary">95% goal</p>
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
    <div className="flex h-40 items-end gap-1 border border-outline-variant bg-secondary p-2 sm:h-48">
      {data.map((d, i) => {
        const isLast = i === data.length - 1;
        const h = (d.cases / max) * 100;
        return (
          <div
            key={d.year}
            className={
              isLast
                ? "flex-1 bg-primary transition-all duration-500"
                : "flex-1 bg-outline-variant transition-all duration-500 hover:bg-on-surface-muted"
            }
            style={{ height: `${h}%` }}
            title={`${d.year}: ${d.cases.toLocaleString()} avg/month`}
          />
        );
      })}
    </div>
  );
}

function InfoBlock({
  n,
  title,
  body,
  accent,
}: {
  n: string;
  title: string;
  body: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-surface p-6 sm:p-8">
      <p className={accent ? "eyebrow text-primary" : "eyebrow text-on-surface-muted"}>
        {n} · {title}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-on-surface">{body}</p>
    </div>
  );
}
