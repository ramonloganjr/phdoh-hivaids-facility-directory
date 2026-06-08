import { Link } from "@tanstack/react-router";
import { ArrowRight, Compass, HelpCircle, Home, MapPin, Search } from "lucide-react";

type QuickLink = {
  to: "/facilities" | "/insights" | "/faq" | "/about";
  label: string;
  description: string;
  icon: typeof MapPin;
};

const QUICK_LINKS: QuickLink[] = [
  {
    to: "/facilities",
    label: "Browse all facilities",
    description: "Every DOH-designated treatment hub and primary care site, in one place.",
    icon: MapPin,
  },
  {
    to: "/insights",
    label: "See the bigger picture",
    description: "Surveillance data and trends, explained simply.",
    icon: Compass,
  },
  {
    to: "/faq",
    label: "Common questions",
    description: "Plain-language answers about HIV care in the Philippines.",
    icon: HelpCircle,
  },
  {
    to: "/about",
    label: "About this directory",
    description: "Who maintains it, where the data comes from, and how it stays current.",
    icon: Search,
  },
];

export function NotFound() {
  return (
    <section className="relative mx-auto flex min-h-[78dvh] w-full max-w-5xl flex-col items-center justify-center px-4 py-16 sm:px-8 sm:py-24">
      {/* Soft brand glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-10 -z-10 mx-auto h-72 w-72 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--primary) 28%, transparent), transparent 70%)",
        }}
      />

      <div className="flex w-full flex-col items-center text-center animate-fade-up">
        <span className="eyebrow inline-flex items-center gap-2 rounded-full bg-primary-container px-3 py-1.5 text-on-primary-container">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-primary"
            aria-hidden="true"
          />
          Error 404
        </span>

        {/* Hero numeral */}
        <h1
          className="mt-6 select-none bg-gradient-to-br from-primary via-primary to-on-primary-container bg-clip-text text-[28vw] font-semibold leading-none tracking-tighter text-transparent sm:text-[180px]"
          style={{ fontVariationSettings: '"opsz" 144, "wght" 700' }}
          aria-label="404"
        >
          404
        </h1>

        <h2 className="mt-4 max-w-2xl text-balance text-3xl font-semibold tracking-tight text-on-surface sm:text-4xl">
          We can't find that page
        </h2>
        <p className="mt-3 max-w-xl text-pretty text-base text-on-surface-muted sm:text-lg">
          The link may be outdated, mistyped, or the facility record has moved.
          The full directory is always one tap away.
        </p>

        {/* Primary CTAs */}
        <div className="mt-8 flex w-full flex-wrap justify-center gap-3">
          <Link
            to="/facilities"
            className="state-layer press inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground elev-1"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Search facilities
          </Link>
          <Link
            to="/"
            className="state-layer press inline-flex items-center justify-center gap-2 rounded-full bg-surface-container-high px-6 py-3 text-sm font-medium text-on-surface"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>
        </div>
      </div>

      {/* Quick links grid */}
      <div className="mt-14 w-full">
        <p className="eyebrow mb-4 text-center text-on-surface-muted">
          Or jump to a section
        </p>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {QUICK_LINKS.map(({ to, label, description, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                className="state-layer press group flex h-full items-start gap-4 rounded-3xl bg-surface-container p-5 elev-1 transition-shadow hover:elev-2"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-base font-medium text-on-surface">
                      {label}
                    </span>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-on-surface-muted transition-transform duration-300 ease-[var(--ease-emphasized)] group-hover:translate-x-0.5 group-hover:text-on-surface"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="mt-1 block text-sm text-on-surface-muted">
                    {description}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
