import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, FileText, Database, ExternalLink, Code2 } from "lucide-react";
import { FACILITY_COUNT, TREATMENT_HUB_COUNT, PRIMARY_CARE_COUNT } from "@/data/facility-meta";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the data — PH HIV Care Directory" },
      {
        name: "description",
        content:
          "Source, legal basis, and methodology for the Philippine HIV Care Directory — mirrored from DOH Department Circular 2026-0065.",
      },
      { property: "og:title", content: "About the data — PH HIV Care Directory" },
      { property: "og:description", content: "Source, legal basis, and methodology." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-on-surface-muted">
        About this directory
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-on-surface sm:text-4xl">
        A faithful, accessible mirror of the DOH HIV facility directory.
      </h1>
      <p className="mt-4 text-base leading-relaxed text-on-surface-muted">
        Everything you see here comes straight from the Department of Health — every name,
        address, contact, and designation. We just made it easier to search and faster to use on
        any device, especially when you're on the go.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Stat label="Facilities" value={FACILITY_COUNT} />
        <Stat label="Treatment hubs" value={TREATMENT_HUB_COUNT} />
        <Stat label="Primary care" value={PRIMARY_CARE_COUNT} />
      </div>

      <section className="mt-12 space-y-6">
        <Block icon={FileText} title="Source document">
          <p>
            <strong className="font-semibold text-on-surface">
              Department Circular No. 2026-0065
            </strong>{" "}
            — "Updated Directory of DOH-Designated Human Immunodeficiency Virus (HIV)
            Treatment Hubs and Primary HIV Care Facilities in the Philippines as of December
            31, 2025." Signed 4 February 2026 by Asst. Sec. Gloria J. Balboa, MD, MPH, MHA,
            CEO VI, CESO III, by authority of the Secretary of Health.
          </p>
        </Block>

        <Block icon={ShieldCheck} title="Legal basis">
          <p>
            Pursuant to <strong className="font-semibold text-on-surface">Article V,
            Section 33 of Republic Act No. 11166</strong> — the Philippine HIV and AIDS
            Policy Act — the Department of Health is mandated to designate public and
            private hospitals as HIV treatment facilities.
          </p>
        </Block>

        <Block icon={Database} title="Data integrity">
          <p>
            All 338 records (192 treatment hubs + 146 primary HIV care facilities) come directly
            from the Department of Health of the Philippines. Nothing was added, removed, or
            edited. Phone numbers are lightly reformatted so tap-to-call works on your phone, but
            the original text is preserved on every facility page.
          </p>

          <p className="mt-3">
            Hours, contacts, and services can change — for anything time-sensitive, please call
            the facility directly or check the original circular.
          </p>
        </Block>

        <Block icon={Code2} title="About the developer">
          <p>
            <a
              href="https://www.ramonloganjr.com/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              Ramon Logan Jr.
              <ExternalLink className="ml-0.5 inline h-3 w-3" aria-hidden="true" />
            </a>{" "}
            is the developer behind{" "}
            <a
              href="https://abakada.org"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary hover:underline"
            >
              Abakada.org
            </a>{" "}
            and{" "}
            <a
              href="https://bettersolano.org"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary hover:underline"
            >
              BetterSolano.org
            </a>
            . Based in the United Arab Emirates, he works in IT and practices full-stack
            development.
          </p>
          <p className="mt-3">
            He also started{" "}
            <a
              href="https://hellopinas.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary hover:underline"
            >
              HelloPinas.com
            </a>{" "}
            and contributes to{" "}
            <a
              href="https://bettergov.ph"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary hover:underline"
            >
              BetterGov.ph
            </a>
            , a volunteer-driven civic-tech effort focused on improving access to local
            government information in the Philippines.
          </p>
        </Block>

        <div className="rounded-3xl border border-outline-variant bg-surface-container p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-on-surface-muted">
            Disclaimer
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-on-surface">
            This is an independent public-information mirror. It is not affiliated with,
            endorsed by, or operated by the Department of Health of the Philippines. For
            official communications, visit{" "}
            <a
              href="https://doh.gov.ph"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary hover:underline"
            >
              doh.gov.ph
              <ExternalLink className="ml-0.5 inline h-3 w-3" aria-hidden="true" />
            </a>
            .
          </p>
        </div>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          to="/facilities"
          className="state-layer inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground elev-1"
        >
          Browse facilities
        </Link>
        <Link
          to="/"
          className="state-layer inline-flex items-center justify-center rounded-full border border-outline px-5 py-2.5 text-sm font-semibold text-on-surface"
        >
          Home
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-outline-variant bg-surface-container p-4 elev-1">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-on-surface-muted">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-on-surface">{value}</p>
    </div>
  );
}

function Block({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof FileText;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <h2 className="text-base font-semibold text-on-surface">{title}</h2>
      </div>
      <div className="ml-10 space-y-2 text-sm leading-relaxed text-on-surface-muted">
        {children}
      </div>
    </div>
  );
}
