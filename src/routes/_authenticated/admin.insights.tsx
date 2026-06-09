import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Activity, Download, Loader2, RefreshCw, BookOpen, LogOut, Rocket, Radio } from "lucide-react";
import { getAdminInsights, exportMonthlyImpact } from "@/lib/admin.functions";
import { triggerVercelRedeploy } from "@/lib/deploy.functions";
import { signOutCleanly } from "@/lib/sign-out";
import { useRealtimeInvalidate } from "@/hooks/use-realtime-invalidate";
import { useNavigate } from "@tanstack/react-router";


export const Route = createFileRoute("/_authenticated/admin/insights")({
  head: () => ({
    meta: [
      { title: "Admin insights — HIV Care Philippines" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminInsightsPage,
});

function AdminInsightsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const insightsFn = useServerFn(getAdminInsights);
  const exportFn = useServerFn(exportMonthlyImpact);
  const deployFn = useServerFn(triggerVercelRedeploy);
  const [windowDays, setWindowDays] = useState<7 | 30 | 90>(30);
  const [exporting, setExporting] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployMsg, setDeployMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["admin-insights", windowDays],
    queryFn: () => insightsFn({ data: { windowDays } }),
    staleTime: 30_000,
  });

  // Live counters — debounced to one refresh every 4s even under heavy traffic.
  useRealtimeInvalidate({
    table: "metric_events",
    queryKey: ["admin-insights"],
    debounceMs: 4000,
  });


  const downloadMonth = async () => {
    setExporting(true);
    try {
      const now = new Date();
      const target = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const res = await exportFn({
        data: { year: target.getFullYear(), month: target.getMonth() + 1 },
      });
      const blob = new Blob([res.content], { type: res.mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const signOut = async () => {
    await signOutCleanly(queryClient);
    navigate({ to: "/auth", replace: true });
  };


  const redeploy = async () => {
    if (deploying) return;
    const confirmed = window.confirm(
      "Trigger a new Vercel deployment now? The live site will rebuild in a few minutes."
    );
    if (!confirmed) return;
    setDeploying(true);
    setDeployMsg(null);
    try {
      const res = await deployFn();
      setDeployMsg({
        kind: "ok",
        text: `Deploy started at ${new Date(res.triggeredAt).toLocaleTimeString()}. Watch progress in Vercel.`,
      });
    } catch (err) {
      setDeployMsg({ kind: "err", text: (err as Error).message });
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              <Activity className="h-3.5 w-3.5" aria-hidden="true" />
              Admin · Insights
            </p>
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-primary-container px-2.5 py-0.5 text-[10px] font-medium text-on-primary-container"
              title="Counts update automatically as new activity arrives"
            >
              <Radio className="h-2.5 w-2.5 animate-pulse" aria-hidden="true" />
              Live
            </span>
          </div>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-on-surface sm:text-4xl">
            How the directory is being used
          </h1>
          <p className="mt-2 text-sm text-on-surface-muted">
            Aggregate, anonymous counts only — no IPs, no IDs, no individual paths.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/stories"
            className="state-layer press inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-3.5 py-2 text-xs font-medium text-on-surface"
          >
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            Manage stories
          </Link>
          <Link
            to="/admin/feedback"
            className="state-layer press inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-3.5 py-2 text-xs font-medium text-on-surface"
          >
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            Feedback queue
          </Link>

          <button
            type="button"
            onClick={signOut}
            className="state-layer inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium text-on-surface-muted hover:text-on-surface"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setWindowDays(d as 7 | 30 | 90)}
            className={`state-layer rounded-full px-4 py-1.5 text-xs font-medium ${
              windowDays === d
                ? "bg-primary text-primary-foreground"
                : "bg-surface-container-high text-on-surface"
            }`}
          >
            Last {d} days
          </button>
        ))}
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="state-layer ml-auto inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-3.5 py-2 text-xs font-medium text-on-surface disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} aria-hidden="true" />
          Refresh
        </button>
        <button
          type="button"
          onClick={downloadMonth}
          disabled={exporting}
          className="state-layer press inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-70"
        >
          {exporting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          Last-month CSV
        </button>
        <button
          type="button"
          onClick={redeploy}
          disabled={deploying}
          className="state-layer press inline-flex items-center gap-1.5 rounded-full bg-surface-container-highest px-3.5 py-2 text-xs font-semibold text-on-surface disabled:opacity-70"
          title="Trigger a new Vercel deployment"
        >
          {deploying ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Rocket className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {deploying ? "Triggering…" : "Redeploy to Vercel"}
        </button>
      </div>

      {deployMsg && (
        <p
          role="status"
          className={`mt-3 rounded-2xl px-4 py-2.5 text-xs ${
            deployMsg.kind === "ok"
              ? "bg-primary-container text-on-primary-container"
              : "bg-surface-container-high text-on-surface"
          }`}
        >
          {deployMsg.text}
        </p>
      )}

      {isLoading && (
        <p className="mt-10 text-sm text-on-surface-muted">Loading the latest counts…</p>
      )}
      {error && (
        <p role="alert" className="mt-10 rounded-2xl bg-primary-container p-4 text-sm text-on-primary-container">
          We couldn't load the dashboard. {(error as Error).message}
        </p>
      )}

      {data && (
        <div className="mt-8 space-y-10">
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi label="Searches" value={data.funnel.searches} />
            <Kpi label="Facilities viewed" value={data.funnel.views} />
            <Kpi label="Directions tapped" value={data.funnel.directions} />
            <Kpi
              label="View → Directions"
              value={
                data.funnel.views > 0
                  ? `${Math.round((data.funnel.directions / data.funnel.views) * 100)}%`
                  : "—"
              }
            />
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-on-surface-muted">
              Activity by day
            </h2>
            <DailyBars daily={data.daily} />
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <TopList
              title="Top regions"
              items={data.topRegions.map((r) => ({ label: r.region, count: r.count }))}
            />
            <TopList
              title="Share channels"
              items={data.shareChannels.map((s) => ({ label: s.channel, count: s.count }))}
            />
            <TopList
              title="Most-opened FAQs"
              items={data.topFaqs.map((f) => ({ label: f.faqId, count: f.count }))}
            />
            <TopList
              title="All events"
              items={Object.entries(data.totals)
                .sort((a, b) => b[1] - a[1])
                .map(([label, count]) => ({ label, count }))}
            />
          </section>

          <p className="text-xs text-on-surface-muted">
            Last event recorded:{" "}
            {data.lastEventAt
              ? new Date(data.lastEventAt).toLocaleString()
              : "no events yet in this window"}
            .
          </p>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-3xl bg-surface-container p-5 elev-1">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-on-surface-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-on-surface">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

function TopList({ title, items }: { title: string; items: Array<{ label: string; count: number }> }) {
  return (
    <div className="rounded-3xl bg-surface-container p-5 elev-1">
      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-on-surface-muted">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-on-surface-muted">Nothing yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.slice(0, 10).map((i) => (
            <li key={i.label} className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate text-on-surface">{i.label}</span>
              <span className="tabular-nums font-medium text-on-surface">{i.count.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DailyBars({ daily }: { daily: Array<{ day: string; total: number }> }) {
  const max = Math.max(1, ...daily.map((d) => d.total));
  return (
    <div className="mt-3 overflow-x-auto rounded-3xl bg-surface-container p-5 elev-1">
      {daily.length === 0 ? (
        <p className="text-sm text-on-surface-muted">No activity in this window yet.</p>
      ) : (
        <div className="flex items-end gap-1.5" style={{ minHeight: 160 }}>
          {daily.map((d) => (
            <div key={d.day} className="flex flex-col items-center gap-1" title={`${d.day}: ${d.total}`}>
              <div
                className="w-3 rounded-t bg-primary"
                style={{ height: `${(d.total / max) * 140}px`, minHeight: 2 }}
                aria-hidden="true"
              />
              <span className="text-[9px] tabular-nums text-on-surface-muted">{d.day.slice(5)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
