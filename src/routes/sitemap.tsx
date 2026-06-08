import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Compass,
  Map as MapIcon,
  BarChart3,
  HeartHandshake,
  HelpCircle,
  Info,
  Lock,
  ScrollText,
  Hospital,
  LogIn,
  Home,
  Sitemap as SitemapIcon,
} from "lucide-react";

export const Route = createFileRoute("/sitemap")({
  head: () => ({
    meta: [
      { title: "Sitemap — HIV Care Philippines" },
      {
        name: "description",
        content:
          "Every page on HIV Care Philippines, grouped for quick navigation — directory, insights, impact, and the legal pages.",
      },
      { property: "og:title", content: "Sitemap — HIV Care Philippines" },
      {
        property: "og:description",
        content:
          "An at-a-glance map of every page on HIV Care Philippines.",
      },
      { property: "og:url", content: "/sitemap" },
    ],
    links: [{ rel: "canonical", href: "/sitemap" }],
  }),
  component: SitemapPage,
});

type Entry = {
  to:
    | "/"
    | "/facilities"
    | "/near-me"
    | "/insights"
    | "/impact"
    | "/faq"
    | "/about"
    | "/privacy"
    | "/terms"
    | "/auth"
    | "/sitemap";
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

type Group = {
  title: string;
  caption: string;
  entries: Entry[];
};

const GROUPS: Group[] = [
  {
    title: "Find care",
    caption: "Search, filter, and locate HIV facilities across the Philippines.",
    entries: [
      {
        to: "/",
        label: "Home",
        description: "Start here — a calm entry point to the directory.",
        icon: Home,
      },
      {
        to: "/facilities",
        label: "All facilities",
        description: "Searchable list of 338 DOH-designated facilities.",
        icon: Hospital,
      },
      {
        to: "/near-me",
        label: "Near me",
        description: "Find the closest treatment hubs and primary care sites.",
        icon: Compass,
      },
    ],
  },
  {
    title: "Learn",
    caption: "Plain-language context, surveillance data, and answers.",
    entries: [
      {
        to: "/insights",
        label: "Insights",
        description: "Q2 2025 surveillance dashboard with the 95-95-95 cascade.",
        icon: BarChart3,
      },
      {
        to: "/faq",
        label: "FAQ",
        description: "Common questions about HIV, testing, and treatment.",
        icon: HelpCircle,
      },
      {
        to: "/impact",
        label: "Impact",
        description: "Anonymous, aggregate measures of how the directory helps.",
        icon: HeartHandshake,
      },
    ],
  },
  {
    title: "About this site",
    caption: "Who built it, how it's measured, and the rules of the road.",
    entries: [
      {
        to: "/about",
        label: "About",
        description: "The people and intent behind HIV Care Philippines.",
        icon: Info,
      },
      {
        to: "/privacy",
        label: "Privacy",
        description: "What we record, what we don't, and why.",
        icon: Lock,
      },
      {
        to: "/terms",
        label: "Terms",
        description: "How you can use the directory.",
        icon: ScrollText,
      },
    ],
  },
  {
    title: "Utilities",
    caption: "Sign in and machine-readable maps of the site.",
    entries: [
      {
        to: "/auth",
        label: "Sign in",
        description: "Optional account for saving favorites and notes.",
        icon: LogIn,
      },
      {
        to: "/sitemap",
        label: "Sitemap",
        description: "You're here. A human-readable map of every page.",
        icon: SitemapIcon,
      },
    ],
  },
];

function SitemapPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="animate-fade-up">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
          Sitemap
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-on-surface sm:text-4xl">
          Every page on HIV Care Philippines
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-muted">
          A quick map of the whole site, grouped so you can find what you need without
          guessing. Looking for the machine-readable version? It lives at{" "}
          <a
            href="/sitemap.xml"
            className="font-medium text-on-surface underline-offset-4 hover:underline"
          >
            /sitemap.xml
          </a>
          .
        </p>
      </header>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {GROUPS.map((group) => (
          <section
            key={group.title}
            aria-label={group.title}
            className="rounded-3xl bg-surface-container p-5 elev-1 sm:p-6"
          >
            <header className="mb-4">
              <h2 className="text-base font-semibold tracking-tight text-on-surface">
                {group.title}
              </h2>
              <p className="mt-1 text-xs text-on-surface-muted">{group.caption}</p>
            </header>
            <ul className="space-y-1.5">
              {group.entries.map((entry) => {
                const Icon = entry.icon;
                return (
                  <li key={entry.to}>
                    <Link
                      to={entry.to}
                      className="state-layer press group flex items-start gap-3 rounded-2xl bg-surface p-3.5 transition-shadow hover:elev-1"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container"
                      >
                        <Icon className="h-4.5 w-4.5" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-on-surface group-hover:text-primary">
                          {entry.label}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-on-surface-muted">
                          {entry.description}
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className="mt-1.5 inline-block text-on-surface-muted/60 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                      >
                        →
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <aside
        className="mt-10 flex items-start gap-3 rounded-3xl bg-surface-container-high p-5 text-sm text-on-surface-muted sm:p-6"
        aria-label="Missing a page?"
      >
        <MapIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <p>
          Looking for something you can't find? Try{" "}
          <Link to="/faq" className="font-medium text-on-surface underline-offset-4 hover:underline">
            the FAQ
          </Link>{" "}
          or head straight to{" "}
          <Link
            to="/facilities"
            className="font-medium text-on-surface underline-offset-4 hover:underline"
          >
            All facilities
          </Link>{" "}
          to search the full directory.
        </p>
      </aside>
    </main>
  );
}
