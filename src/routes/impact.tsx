import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getPublicImpact, type PublicImpact } from "@/lib/impact.functions";
import { useRealtimeInvalidate } from "@/hooks/use-realtime-invalidate";


const nf = new Intl.NumberFormat("en-US");
const dtf = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Manila",
});
const fmtNum = (n: number) => nf.format(n);
const fmtDate = (iso: string) => {
  try {
    return dtf.format(new Date(iso));
  } catch {
    return iso;
  }
};

const impactQuery = queryOptions({
  queryKey: ["public-impact"],
  queryFn: () => getPublicImpact(),
  staleTime: 5 * 60 * 1000,
});

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Our impact — HIV Care Philippines" },
      {
        name: "description",
        content:
          "How HIV Care Philippines helps people find care, in honest numbers. Anonymous, aggregate, and refreshed continuously.",
      },
      { property: "og:title", content: "Our impact — HIV Care Philippines" },
      {
        property: "og:description",
        content:
          "Honest, anonymous measures of how the directory helps people across the Philippines find care.",
      },
      { property: "og:url", content: "/impact" },
    ],
    links: [{ rel: "canonical", href: "/impact" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(impactQuery),
  component: ImpactPage,
  errorComponent: ({ reset }) => (
    <div role="alert" className="mx-auto max-w-2xl px-6 py-16 text-on-surface">
      <h1 className="text-2xl font-semibold">Numbers are taking a moment to load</h1>
      <p className="mt-3 text-on-surface-muted">
        The connection hiccuped. Your visit is safe — try again in a moment.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="press state-layer mt-6 rounded-full bg-primary px-5 py-2.5 text-primary-foreground"
      >
        Try again
      </button>
    </div>
  ),
});

function ImpactPage() {
  const { data } = useSuspenseQuery(impactQuery);
  // Refresh when a story is published / edited / removed.
  useRealtimeInvalidate({ table: "testimonials", queryKey: ["public-impact"], debounceMs: 1500 });
  // Refresh as new activity comes in (debounced — events can be high-volume).
  useRealtimeInvalidate({ table: "metric_events", queryKey: ["public-impact"], debounceMs: 5000 });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-8 sm:py-16">
      <Hero data={data} />
      <Tiles data={data} />
      <Stories data={data} />
      <Methodology data={data} />
    </main>
  );
}

function Hero({ data }: { data: PublicImpact }) {
  const helped = data.totals.peopleHelped;
  return (
    <header className="rounded-3xl bg-surface-container-high p-8 sm:p-12 elev-1">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-on-surface-muted">
        Our impact, in honest numbers
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-on-surface sm:text-5xl">
        How HIV Care Philippines is helping people find care
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-on-surface-muted">
        Every number on this page is aggregate and anonymous. We don&rsquo;t track who you are or
        where you live &mdash; only that something useful happened. Numbers cover the last{" "}
        {data.windowDays} days and are rounded to the nearest 10.
      </p>
      <div className="mt-8 flex flex-wrap items-baseline gap-4">
        <span className="text-5xl font-semibold text-primary sm:text-6xl">
          {fmtNum(helped)}+
        </span>
        <span className="text-base text-on-surface-muted">
          times the directory helped someone take a next step toward care
        </span>
      </div>
    </header>
  );
}

function Tiles({ data }: { data: PublicImpact }) {
  const tiles: Array<{ label: string; value: string; hint: string }> = [
    {
      label: "Searches run",
      value: `${fmtNum(data.totals.searches)}+`,
      hint:
        data.searchSuccessRate !== null
          ? `${Math.round(data.searchSuccessRate * 100)}% returned a real facility`
          : "Every search returns the closest matches",
    },
    {
      label: "Facilities opened",
      value: `${fmtNum(data.totals.facilitiesViewed)}+`,
      hint: "People learning hours, services, and contact details",
    },
    {
      label: "Directions tapped",
      value: `${fmtNum(data.totals.directionsTapped)}+`,
      hint: "Likely a real visit on the way",
    },
    {
      label: "Near Me activations",
      value: `${fmtNum(data.totals.nearMeActivations)}+`,
      hint: "People asking for care close to them",
    },
    {
      label: "Shares with friends",
      value: `${fmtNum(data.totals.shares)}+`,
      hint: "The directory reaching one more person",
    },
  ];
  return (
    <section className="mt-12" aria-label="Engagement and outcomes">
      <h2 className="text-2xl font-semibold tracking-tight text-on-surface">
        What people did with the directory
      </h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl bg-surface-container p-6 elev-1">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-on-surface-muted">
              {t.label}
            </p>
            <p className="mt-2 text-3xl font-semibold text-on-surface">{t.value}</p>
            <p className="mt-2 text-sm text-on-surface-muted">{t.hint}</p>
          </div>
        ))}
      </div>

      {data.topRegions.length > 0 && (
        <div className="mt-6 rounded-2xl bg-surface-container p-6">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-on-surface-muted">
            Where the directory is reaching
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {data.topRegions.map((r) => (
              <li
                key={r.region}
                className="rounded-full bg-primary-container px-3.5 py-1.5 text-sm text-on-primary-container"
              >
                {r.region} &middot; {fmtNum(r.count)}+
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-on-surface-muted">
            Regions with fewer than 5 events in the window are hidden to protect privacy.
          </p>
        </div>
      )}
    </section>
  );
}

function Stories({ data }: { data: PublicImpact }) {
  if (data.testimonials.length === 0) {
    return (
      <section className="mt-12" aria-label="Stories">
        <h2 className="text-2xl font-semibold tracking-tight text-on-surface">Real stories</h2>
        <p className="mt-3 max-w-2xl text-sm text-on-surface-muted">
          We&rsquo;re collecting consented stories from people the directory has helped. Check back
          soon, or write to us if you&rsquo;d like to share yours &mdash; only with your explicit
          permission.
        </p>
      </section>
    );
  }
  return (
    <section className="mt-12" aria-label="Stories from people we've helped">
      <h2 className="text-2xl font-semibold tracking-tight text-on-surface">Real stories</h2>
      <p className="mt-2 text-sm text-on-surface-muted">
        Shared with explicit consent. Names and details only appear when the person asked us to.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {data.testimonials.map((t) => (
          <figure key={t.id} className="rounded-2xl bg-surface-container p-6 elev-1">
            <blockquote className="text-base leading-relaxed text-on-surface">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-4 text-sm text-on-surface-muted">
              — {t.attribution}
              {t.region ? <span> · {t.region}</span> : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Methodology({ data }: { data: PublicImpact }) {
  return (
    <section className="mt-12 rounded-3xl bg-surface-container p-6 sm:p-8" aria-label="How we measure">
      <h2 className="text-xl font-semibold tracking-tight text-on-surface">How we measure</h2>
      <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-on-surface-muted">
        <li>No accounts. No cookies for tracking. No IP addresses stored.</li>
        <li>We count anonymous events (a search, a directions tap) and an optional region tag.</li>
        <li>Numbers are rounded to the nearest 10 and below-5 breakdowns are hidden.</li>
        <li>
          Window: last {data.windowDays} days. Refreshed every few minutes.
          {data.lastEventAt ? (
            <>
              {" "}
              Last activity recorded {fmtDate(data.lastEventAt)}.
            </>
          ) : null}
        </li>
      </ul>
      <p className="mt-4 text-sm text-on-surface-muted">
        See <Link to="/privacy" className="underline">our privacy policy</Link> for the full picture.
      </p>
    </section>
  );
}
