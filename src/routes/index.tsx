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

/* ---------------------------------------------------------------- */
/* Interactive insights summary layer                                */
/* ---------------------------------------------------------------- */

function InsightsShowcase() {
  const totalTransmission = transmissionMode.reduce((s, t) => s + t.count, 0);
  const topTransmission = transmissionMode[0];
  const topTransmissionPct = Math.round((topTransmission.count / totalTransmission) * 100);
  const topAge = [...ageDistribution].sort((a, b) => b.pct - a.pct)[0];
  const maxMonthly = Math.max(...monthlyAvgByYear.map((d) => d.cases));

  return (
    <section className="mx-auto mt-4 max-w-6xl px-4 sm:mt-8 sm:px-6">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-on-surface-muted">
            <Activity className="h-3.5 w-3.5" aria-hidden="true" />
            {reportMeta.publisher} · {reportMeta.quarter}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl">
            Key visual insights
          </h2>
          <p className="mt-1 max-w-xl text-sm text-on-surface-muted">
            A live summary of the national HIV response — diagnosis, treatment, and viral suppression at a glance.
          </p>
        </div>
        <Link
          to="/insights"
          className="hidden text-sm font-medium text-primary hover:underline sm:inline-flex sm:items-center sm:gap-1"
        >
          Full dashboard <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <CascadeRing
          label="Diagnosed"
          sublabel="of estimated PLHIV"
          value={nationalCascade.first95}
          count={nationalCascade.diagnosed}
          target={nationalCascade.estimatedPLHIV}
        />
        <CascadeRing
          label="On ART"
          sublabel="of diagnosed"
          value={nationalCascade.second95}
          count={nationalCascade.onART}
          target={nationalCascade.diagnosed}
        />
        <CascadeRing
          label="Virally suppressed"
          sublabel="of on ART"
          value={nationalCascade.third95}
          count={nationalCascade.vlSuppressed}
          target={nationalCascade.onART}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="group rounded-3xl border border-outline-variant bg-surface-container p-5 elev-1 transition-all duration-300 hover:elev-2 sm:p-6 lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-muted">
                <TrendingUp className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Newly diagnosed · monthly average
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-on-surface sm:text-4xl">
                {quarterSnapshot.newlyDiagnosedAvgMonthly.toLocaleString()}
                <span className="ml-2 align-middle text-sm font-medium text-primary">
                  +{quarterSnapshot.yoyChangePct}% YoY
                </span>
              </p>
            </div>
          </div>
          <div className="mt-6">
            <Sparkline data={monthlyAvgByYear} max={maxMonthly} />
            <ul className="mt-3 grid grid-cols-5 text-[10px] font-medium uppercase tracking-[0.1em] text-on-surface-muted sm:text-xs">
              {monthlyAvgByYear.map((d) => (
                <li key={d.year} className="text-center">{d.year}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="group rounded-3xl border border-outline-variant bg-surface-container p-5 elev-1 transition-all duration-300 hover:elev-2 sm:p-6">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-muted">
            <Users className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            Leading transmission mode
          </p>
          <p className="mt-2 text-xl font-semibold text-on-surface">
            {topTransmission.mode}
          </p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight text-on-surface">
              {topTransmissionPct}%
            </span>
            <span className="text-xs text-on-surface-muted">of Q2 cases</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-variant">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
              style={{ width: `${topTransmissionPct}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-on-surface-muted">
            {topTransmission.count.toLocaleString()} of {totalTransmission.toLocaleString()} newly reported
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-outline-variant bg-surface-container p-5 elev-1 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-muted">
            <BarChart3 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            Newly diagnosed by age · Q2 2025
          </p>
          <p className="text-xs text-on-surface-muted">
            Peak: <span className="font-semibold text-on-surface">{topAge.group}</span> ({topAge.pct}%)
          </p>
        </div>
        <div className="mt-6 grid grid-cols-5 gap-2 sm:gap-4">
          {ageDistribution.map((a) => {
            const isPeak = a.group === topAge.group;
            const height = (a.pct / topAge.pct) * 100;
            return (
              <div key={a.group} className="group flex flex-col items-center gap-2">
                <div className="relative flex h-32 w-full items-end sm:h-40">
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-xs font-semibold text-on-surface">
                    {a.pct}%
                  </span>
                  <div
                    className={`w-full rounded-t-xl transition-all duration-500 ease-out ${
                      isPeak ? "bg-primary" : "bg-primary/25 group-hover:bg-primary/45"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-on-surface-muted sm:text-xs">
                  {a.group}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 sm:hidden">
        <Link
          to="/insights"
          className="state-layer inline-flex w-full items-center justify-center gap-2 rounded-full border border-outline bg-surface px-5 py-3 text-sm font-semibold text-on-surface"
        >
          Open full dashboard <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

function CascadeRing({
  label,
  sublabel,
  value,
  count,
  target,
}: {
  label: string;
  sublabel: string;
  value: number;
  count: number;
  target: number;
}) {
  const size = 120;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-outline-variant bg-surface-container p-5 elev-1 transition-all duration-300 hover:elev-2 sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
      />
      <div className="flex items-center gap-4">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke="currentColor"
              strokeWidth={stroke}
              fill="none"
              className="text-surface-variant"
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
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold tracking-tight text-on-surface">{value}%</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-on-surface-muted">95 goal</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-on-surface">{label}</p>
          <p className="text-xs text-on-surface-muted">{sublabel}</p>
          <p className="mt-2 text-xs text-on-surface-muted">
            <span className="font-semibold text-on-surface">{count.toLocaleString()}</span>
            {" / "}
            {target.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

function Sparkline({ data, max }: { data: { year: string; cases: number }[]; max: number }) {
  const w = 600;
  const h = 120;
  const pad = 8;
  const step = (w - pad * 2) / (data.length - 1);
  const points = data.map((d, i) => ({
    x: pad + i * step,
    y: pad + (1 - d.cases / max) * (h - pad * 2),
    cases: d.cases,
  }));
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${path} L ${points[points.length - 1].x} ${h - pad} L ${points[0].x} ${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full sm:h-28" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sparkFill)" className="text-primary" />
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} className="fill-primary">
          <title>{p.cases.toLocaleString()} avg/month</title>
        </circle>
      ))}
    </svg>
  );
}
