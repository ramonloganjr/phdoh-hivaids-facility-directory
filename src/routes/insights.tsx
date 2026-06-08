import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ageDistribution,
  keyPopulationCascade,
  monthlyAvgByYear,
  nationalCascade,
  quarterSnapshot,
  regionCascade,
  reportMeta,
  sexBreakdown,
  transmissionMode,
  type RegionCascadeRow,
} from "@/data/surveillance";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Surveillance Insights — PH HIV Care Philippines" },
      {
        name: "description",
        content:
          "Interactive visualizations of the Philippines' Q2 2025 HIV & AIDS surveillance report — national 95-95-95 cascade, regional gaps, transmission, demographics.",
      },
      { property: "og:title", content: "Surveillance Insights — PH HIV Care Philippines" },
      {
        property: "og:description",
        content:
          "Interactive Q2 2025 HIV surveillance dashboard from the DOH Epidemiology Bureau report.",
      },
      { property: "og:url", content: "/insights" },
    ],
    links: [{ rel: "canonical", href: "/insights" }],
  }),
  component: InsightsPage,
});

// ─── Helpers ────────────────────────────────────────────────────────────────

const nf = new Intl.NumberFormat("en-US");

function pct(n: number, d: number) {
  return d === 0 ? 0 : Math.round((n / d) * 100);
}

const COLORS = {
  primary: "var(--color-primary)",
  primaryMuted: "color-mix(in oklab, var(--color-primary) 65%, transparent)",
  primarySoft: "color-mix(in oklab, var(--color-primary) 28%, transparent)",
  outline: "var(--color-outline-variant)",
  surface: "var(--color-surface)",
  fg: "var(--color-on-surface)",
  fgMuted: "var(--color-on-surface-muted)",
  tertiary: "var(--color-tertiary)",
};

const TOOLTIP_STYLE = {
  background: "var(--color-surface-container-highest)",
  border: "1px solid var(--color-outline-variant)",
  borderRadius: 12,
  color: "var(--color-on-surface)",
  fontSize: 12,
  padding: "8px 12px",
  boxShadow: "0 8px 24px -10px rgba(0,0,0,0.18)",
};

// ─── Page ───────────────────────────────────────────────────────────────────

function InsightsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Header />
      <Cascade />
      <section className="mt-12 grid gap-5 lg:grid-cols-2">
        <TrendCard />
        <TransmissionCard />
      </section>
      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <AgeCard />
        <SexCard />
      </section>
      <section className="mt-12">
        <KeyPopulationCard />
      </section>
      <section className="mt-12">
        <RegionTable />
      </section>
      <Footnote />
    </div>
  );
}

function Header() {
  return (
    <header className="animate-fade-up">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
        Surveillance Insights · {reportMeta.quarter}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-on-surface sm:text-4xl">
        The Philippine HIV response, in numbers
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-muted">
        Clear visualizations of the DOH Epidemiology Bureau's{" "}
        <span className="text-on-surface">{reportMeta.period}</span> surveillance report. Every
        figure here is reproduced exactly from the source — no edits, no estimates added.
      </p>
    </header>
  );
}

// ─── 95-95-95 cascade ───────────────────────────────────────────────────────

function Cascade() {
  const c = nationalCascade;
  const steps = [
    {
      label: "Estimated PLHIV",
      sub: "Modelled total",
      value: c.estimatedPLHIV,
      ofTotal: 100,
      tone: "neutral" as const,
    },
    {
      label: "Diagnosed",
      sub: `1st 95 — ${c.first95}%`,
      value: c.diagnosed,
      ofTotal: pct(c.diagnosed, c.estimatedPLHIV),
      tone: "primary" as const,
    },
    {
      label: "On ART",
      sub: `2nd 95 — ${c.second95}% of diagnosed`,
      value: c.onART,
      ofTotal: pct(c.onART, c.estimatedPLHIV),
      tone: "primary" as const,
    },
    {
      label: "Virally suppressed",
      sub: `3rd 95 — ${c.third95}% of on-ART`,
      value: c.vlSuppressed,
      ofTotal: pct(c.vlSuppressed, c.estimatedPLHIV),
      tone: "primary" as const,
    },
  ];

  return (
    <section className="mt-10">
      <SectionHeading
        eyebrow="95-95-95 cascade"
        title="National progress toward UNAIDS targets"
        caption={`As of ${reportMeta.asOf}. Each step shows the share of the estimated 252,800 PLHIV.`}
      />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <article
            key={s.label}
            className="group relative overflow-hidden rounded-3xl border border-outline-variant bg-surface-container p-5 elev-1 transition-shadow hover:elev-2"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-on-surface-muted">
              {s.label}
            </span>
            <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-on-surface">
              {nf.format(s.value)}
            </p>
            <p className="mt-1 text-xs text-on-surface-muted">{s.sub}</p>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-outline-variant/60">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  s.tone === "primary" ? "bg-primary" : "bg-on-surface-muted",
                )}
                style={{ width: `${s.ofTotal}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] tabular-nums text-on-surface-muted">
              {s.ofTotal}% of estimated PLHIV
            </p>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Avg. new diagnoses / month" value={nf.format(quarterSnapshot.newlyDiagnosedAvgMonthly)} hint={`+${quarterSnapshot.yoyChangePct}% vs. same period last year`} />
        <Stat label="Newly enrolled on ART" value={nf.format(quarterSnapshot.newlyEnrolledART)} hint={`Median baseline CD4 ${quarterSnapshot.medianBaselineCD4} cells/mm³`} />
        <Stat label="Newly reported deaths" value={nf.format(quarterSnapshot.newlyReportedDeaths)} hint={`${reportMeta.period}`} />
        <Stat label="Cumulative cases since 1984" value={nf.format(quarterSnapshot.totalReportedSince1984)} hint={`${nf.format(quarterSnapshot.totalDeathsSince1984)} reported deaths`} />
      </div>
    </section>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-3xl border border-outline-variant bg-surface p-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-on-surface-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-on-surface">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-on-surface-muted">{hint}</p>}
    </div>
  );
}

// ─── Cards ──────────────────────────────────────────────────────────────────

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-3xl border border-outline-variant bg-surface-container p-5 elev-1 sm:p-6">
      <header className="mb-4">
        <h3 className="text-base font-semibold tracking-tight text-on-surface">{title}</h3>
        {subtitle && <p className="mt-1 text-xs text-on-surface-muted">{subtitle}</p>}
      </header>
      <div className="h-72 w-full">{children}</div>
    </article>
  );
}

function TrendCard() {
  return (
    <ChartCard
      title="New diagnoses per month, average by year"
      subtitle="A 64% increase since 2021 — the steepest rise to date in Q2 2025."
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={monthlyAvgByYear} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.5} />
              <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={COLORS.outline} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="year" stroke={COLORS.fgMuted} fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke={COLORS.fgMuted} fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ stroke: COLORS.primary, strokeOpacity: 0.4 }}
            formatter={(v: number) => [`${nf.format(v)} / mo`, "Avg. new diagnoses"]}
          />
          <Area
            type="monotone"
            dataKey="cases"
            stroke={COLORS.primary}
            strokeWidth={2.5}
            fill="url(#trendFill)"
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function TransmissionCard() {
  return (
    <ChartCard
      title="Mode of transmission, Q2 2025"
      subtitle="96% of newly reported cases were acquired through sexual contact."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={transmissionMode}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
        >
          <CartesianGrid stroke={COLORS.outline} strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" stroke={COLORS.fgMuted} fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            dataKey="mode"
            type="category"
            stroke={COLORS.fgMuted}
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={140}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ fill: COLORS.primarySoft }}
            formatter={(v: number) => [nf.format(v), "Cases"]}
          />
          <Bar dataKey="count" radius={[0, 8, 8, 0]} fill={COLORS.primary} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function AgeCard() {
  return (
    <ChartCard
      title="New diagnoses by age group, Q2 2025"
      subtitle="78% of newly diagnosed cases were 15–34 years old."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={ageDistribution} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke={COLORS.outline} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="group" stroke={COLORS.fgMuted} fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke={COLORS.fgMuted} fontSize={12} tickLine={false} axisLine={false} unit="%" />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ fill: COLORS.primarySoft }}
            formatter={(v: number) => [`${v}%`, "Share"]}
          />
          <Bar dataKey="pct" radius={[8, 8, 0, 0]}>
            {ageDistribution.map((_, i) => (
              <Cell
                key={i}
                fill={i === 2 ? COLORS.primary : COLORS.primaryMuted}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function SexCard() {
  return (
    <ChartCard
      title="Cumulative diagnosed cases by sex"
      subtitle="January 1984 – June 2025 · n = 153,798"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={sexBreakdown}
            dataKey="value"
            nameKey="label"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={3}
            stroke="var(--color-surface-container)"
            strokeWidth={4}
          >
            <Cell fill={COLORS.primary} />
            <Cell fill={COLORS.tertiary} />
          </Pie>
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v: number, _n, item: { payload?: { pct?: number } }) => [
              `${nf.format(v)} (${item?.payload?.pct ?? 0}%)`,
              "Cases",
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="-mt-6 flex justify-center gap-5 text-xs">
        {sexBreakdown.map((s, i) => (
          <span key={s.label} className="inline-flex items-center gap-2 text-on-surface-muted">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: i === 0 ? COLORS.primary : COLORS.tertiary }}
            />
            <span className="font-medium text-on-surface">{s.label}</span> · {s.pct}%
          </span>
        ))}
      </div>
    </ChartCard>
  );
}

function KeyPopulationCard() {
  return (
    <article className="rounded-3xl border border-outline-variant bg-surface-container p-5 elev-1 sm:p-6">
      <header className="mb-5">
        <h3 className="text-base font-semibold tracking-tight text-on-surface">
          Care cascade by key population
        </h3>
        <p className="mt-1 text-xs text-on-surface-muted">
          MSM make up the largest population on ART; PWID show the largest treatment gap.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {keyPopulationCascade.map((k) => (
          <div
            key={k.group}
            className="rounded-2xl border border-outline-variant bg-surface p-4"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h4 className="text-sm font-semibold text-on-surface">{k.group}</h4>
              <span className="text-[11px] tabular-nums text-on-surface-muted">
                Est. {nf.format(k.estimated)}
              </span>
            </div>
            <div className="mt-4 space-y-2.5">
              <BarRow label="1st 95 — diagnosed" value={k.first95} />
              <BarRow label="2nd 95 — on ART" value={k.second95} />
              <BarRow label="3rd 95 — suppressed" value={k.third95} />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function BarRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px] text-on-surface-muted">
        <span>{label}</span>
        <span className="tabular-nums text-on-surface">{value}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-outline-variant/60">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// ─── Region table ──────────────────────────────────────────────────────────

type SortKey = keyof Pick<RegionCascadeRow, "estimated" | "diagnosed" | "first95" | "second95" | "third95">;

function RegionTable() {
  const [sortBy, setSortBy] = useState<SortKey>("estimated");
  const rows = useMemo(
    () => [...regionCascade].sort((a, b) => b[sortBy] - a[sortBy]),
    [sortBy],
  );

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "estimated", label: "Estimated PLHIV" },
    { key: "diagnosed", label: "Diagnosed" },
    { key: "first95", label: "1st 95" },
    { key: "second95", label: "2nd 95" },
    { key: "third95", label: "3rd 95" },
  ];

  return (
    <article className="rounded-3xl border border-outline-variant bg-surface-container p-5 elev-1 sm:p-6">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-on-surface">
            Regional 95-95-95 cascade
          </h3>
          <p className="mt-1 text-xs text-on-surface-muted">
            Sort to surface gaps. Bars are proportional to the row's maximum on that metric.
          </p>
        </div>
        <div
          role="radiogroup"
          aria-label="Sort by"
          className="inline-flex flex-wrap gap-1 rounded-full bg-surface p-1"
        >
          {sortOptions.map((o) => {
            const active = sortBy === o.key;
            return (
              <button
                key={o.key}
                role="radio"
                aria-checked={active}
                onClick={() => setSortBy(o.key)}
                className={cn(
                  "state-layer rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-on-surface-muted hover:text-on-surface",
                )}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-y-1 text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-[0.12em] text-on-surface-muted">
              <th className="px-3 py-2 font-medium">Region</th>
              <th className="px-3 py-2 font-medium tabular-nums">Estimated</th>
              <th className="px-3 py-2 font-medium tabular-nums">Diagnosed</th>
              <th className="px-3 py-2 font-medium">1st 95</th>
              <th className="px-3 py-2 font-medium">2nd 95</th>
              <th className="px-3 py-2 font-medium">3rd 95</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.region} className="bg-surface hover:bg-surface-container-high">
                <td className="rounded-l-xl px-3 py-3 font-medium text-on-surface">{r.region}</td>
                <td className="px-3 py-3 tabular-nums text-on-surface-muted">{nf.format(r.estimated)}</td>
                <td className="px-3 py-3 tabular-nums text-on-surface-muted">{nf.format(r.diagnosed)}</td>
                <td className="px-3 py-3"><Pill pct={r.first95} /></td>
                <td className="px-3 py-3"><Pill pct={r.second95} /></td>
                <td className="rounded-r-xl px-3 py-3"><Pill pct={r.third95} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function Pill({ pct }: { pct: number }) {
  const tone =
    pct >= 70
      ? "bg-primary text-primary-foreground"
      : pct >= 50
      ? "bg-primary/15 text-on-surface"
      : "bg-outline-variant/60 text-on-surface-muted";
  return (
    <span
      className={cn(
        "inline-flex min-w-[44px] items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
        tone,
      )}
    >
      {pct}%
    </span>
  );
}

// ─── Section heading & footer ──────────────────────────────────────────────

function SectionHeading({
  eyebrow,
  title,
  caption,
}: {
  eyebrow: string;
  title: string;
  caption?: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-on-surface sm:text-2xl">
        {title}
      </h2>
      {caption && <p className="mt-1.5 max-w-2xl text-sm text-on-surface-muted">{caption}</p>}
    </div>
  );
}

function Footnote() {
  return (
    <p className="mt-12 text-[11px] leading-relaxed text-on-surface-muted">
      Source: Department of Health · Epidemiology Bureau —{" "}
      <em>HIV &amp; AIDS Surveillance of the Philippines, {reportMeta.period}</em>. Figures
      reproduced verbatim from the published report. This page is an independent visualization
      and is not affiliated with the DOH.
    </p>
  );
}
