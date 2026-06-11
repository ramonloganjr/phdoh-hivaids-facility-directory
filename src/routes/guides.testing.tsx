import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, ShieldCheck, Stethoscope, Building2, FlaskConical } from "lucide-react";

const TITLE = "HIV testing in the Philippines — where to go and what to expect";
const DESCRIPTION =
  "How HIV testing works in the Philippines, who runs it, and how to find a DOH-designated facility near you. Free, confidential testing at 338 facilities nationwide.";

export const Route = createFileRoute("/guides/testing")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/guides/testing" },
    ],
    links: [{ rel: "canonical", href: "/guides/testing" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: TITLE,
          description: DESCRIPTION,
          inLanguage: "en-PH",
          articleSection: "HIV testing",
          author: { "@type": "Organization", name: "HIV Care PH" },
          publisher: { "@type": "Organization", name: "HIV Care PH" },
          datePublished: "2026-06-11",
          dateModified: "2026-06-11",
          isBasedOn:
            "Department of Health Circular No. 2026-0065 — Updated Directory of DOH-Designated HIV Treatment Hubs and Primary HIV Care Facilities in the Philippines (as of December 31, 2025).",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "/" },
            { "@type": "ListItem", position: 2, name: "Guides", item: "/guides/testing" },
            { "@type": "ListItem", position: 3, name: "HIV testing", item: "/guides/testing" },
          ],
        }),
      },
    ],
  }),
  component: TestingGuide,
});

function TestingGuide() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="animate-fade-up">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
          Guide
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-on-surface sm:text-4xl">
          {TITLE}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-muted">
          HIV testing in the Philippines is free and confidential at every
          DOH-designated facility. As of December 31, 2025 there are{" "}
          <strong className="text-on-surface">338 designated facilities</strong>{" "}
          nationwide — 192 treatment hubs and 146 primary HIV care facilities.
          This guide explains what each one does, what to expect on the day,
          and how to find the nearest option.
        </p>
        <p className="mt-3 text-xs text-on-surface-muted">
          Source: Department of Health Circular No. 2026-0065, Annex A. General
          information, not medical advice — for anything personal, talk with a
          healthcare provider you trust.
        </p>
      </header>

      <nav
        aria-label="On this page"
        className="mt-8 rounded-2xl border border-outline-variant bg-surface-container p-5 text-sm"
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-on-surface-muted">
          On this page
        </p>
        <ul className="mt-3 space-y-1.5">
          {[
            ["who-runs-testing", "Who runs HIV testing in the Philippines"],
            ["hub-vs-primary", "Treatment hub vs primary HIV care facility"],
            ["rhivda", "How a confirmed result is reached (RHIVDA)"],
            ["what-to-expect", "What to expect at a visit"],
            ["find-care", "Find a facility near you"],
            ["after-positive", "If your result is positive"],
            ["self-test-kits", "Self-test kits & pricing"],
            ["privacy", "Privacy and your rights"],
          ].map(([id, label]) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className="underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section id="who-runs-testing" className="mt-10 scroll-mt-24">
        <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-on-surface">
          <Stethoscope className="h-5 w-5 text-primary" aria-hidden="true" />
          Who runs HIV testing in the Philippines
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-muted">
          Under Republic Act No. 11166 (the Philippine HIV and AIDS Policy Act),
          the Department of Health designates public and private hospitals and
          clinics to provide HIV services. Testing at these facilities is
          confidential and accessible regardless of where you live.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-muted">
          The 338 designated facilities span every region — from Baguio General
          Hospital and the Ilocos Training and Regional Medical Center in the
          north to Cebu South Medical Center, Davao Regional Medical Center, and
          DOGH Arts Clinic in the south. The full directory is available on{" "}
          <Link
            to="/facilities"
            className="underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
          >
            our facilities page
          </Link>
          .
        </p>
      </section>

      <section id="hub-vs-primary" className="mt-10 scroll-mt-24">
        <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-on-surface">
          <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
          Treatment hub vs primary HIV care facility
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-muted">
          DOH designates two kinds of facility. Either can be your starting
          point for testing.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-outline-variant bg-surface-container p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
              Treatment hub
            </p>
            <p className="mt-2 text-sm font-medium text-on-surface">
              192 facilities nationwide
            </p>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-muted">
              Outpatient and inpatient services. Hubs handle testing, starting
              antiretroviral treatment (ART), ongoing care, and admission when
              someone needs hospital-level support. Most are tertiary hospitals
              with an HIV/AIDS Core Team (HACT).
            </p>
          </div>
          <div className="rounded-2xl border border-outline-variant bg-surface-container p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
              Primary HIV care facility
            </p>
            <p className="mt-2 text-sm font-medium text-on-surface">
              146 facilities nationwide
            </p>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-muted">
              Outpatient services. Primary care facilities — including local
              health offices, wellness centers, and clinics — provide testing,
              counseling, and continued ART for stable clients. They refer to
              a hub when inpatient care is needed.
            </p>
          </div>
        </div>
      </section>

      <section id="rhivda" className="mt-10 scroll-mt-24">
        <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-on-surface">
          <FlaskConical className="h-5 w-5 text-primary" aria-hidden="true" />
          How a confirmed result is reached (RHIVDA)
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-muted">
          The Philippines uses the{" "}
          <strong className="text-on-surface">
            Rapid HIV Diagnostic Algorithm (RHIVDA)
          </strong>{" "}
          — a sequence of rapid tests done at the facility. A reactive first
          test is followed by additional confirmatory tests. Only a
          DOH-licensed{" "}
          <strong className="text-on-surface">
            certified RHIVDA confirmatory laboratory
          </strong>{" "}
          can issue a confirmed positive result. This keeps a single reactive
          test from being treated as a diagnosis on its own.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-muted">
          Many treatment hubs are also confirmatory labs, so the full sequence
          often happens in one visit. If not, your facility coordinates the
          confirmatory step for you.
        </p>
      </section>

      <section id="what-to-expect" className="mt-10 scroll-mt-24">
        <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-on-surface">
          <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
          What to expect at a visit
        </h2>
        <ol className="mt-4 space-y-3 text-sm leading-relaxed text-on-surface-muted">
          <li className="rounded-2xl border border-outline-variant bg-surface-container p-4">
            <strong className="text-on-surface">Pre-test counseling.</strong>{" "}
            A nurse or counselor walks you through what the test is, what the
            possible results mean, and answers any questions. Nothing is
            disclosed to anyone else.
          </li>
          <li className="rounded-2xl border border-outline-variant bg-surface-container p-4">
            <strong className="text-on-surface">Rapid test.</strong> A small
            finger-prick blood sample. Results from the first rapid test are
            usually ready within 15–30 minutes.
          </li>
          <li className="rounded-2xl border border-outline-variant bg-surface-container p-4">
            <strong className="text-on-surface">
              Confirmatory tests if the first is reactive.
            </strong>{" "}
            Additional rapid tests are run on the same day at facilities with
            a RHIVDA confirmatory laboratory.
          </li>
          <li className="rounded-2xl border border-outline-variant bg-surface-container p-4">
            <strong className="text-on-surface">Post-test counseling.</strong>{" "}
            Whether the result is non-reactive or confirmed positive, you
            sit down with a counselor to talk through next steps —
            prevention, repeat testing windows, or starting treatment.
          </li>
        </ol>
        <p className="mt-3 text-xs text-on-surface-muted">
          Bring a valid ID if you have one. Many facilities will see you
          without an appointment; some prefer that you call or message ahead.
          Contact details for each facility are on the directory.
        </p>
      </section>

      <section id="find-care" className="mt-10 scroll-mt-24">
        <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-on-surface">
          <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
          Find a facility near you
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-muted">
          Two ways to start, depending on what you know.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            to="/near-me"
            className="state-layer press group rounded-2xl border border-outline-variant bg-primary-container p-5 text-on-primary-container transition-colors"
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.18em]">
              Sort by distance
            </p>
            <p className="mt-2 text-base font-semibold">Find care near me</p>
            <p className="mt-2 text-sm leading-relaxed opacity-80">
              We use your location once to rank facilities by distance.
              Nothing leaves your device.
            </p>
          </Link>
          <Link
            to="/facilities"
            className="state-layer press group rounded-2xl border border-outline-variant bg-surface-container p-5 transition-colors"
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
              Browse the directory
            </p>
            <p className="mt-2 text-base font-semibold text-on-surface">
              All 338 facilities
            </p>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-muted">
              Filter by region, service type, and what each facility offers.
            </p>
          </Link>
        </div>
      </section>

      <section id="after-positive" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-semibold tracking-tight text-on-surface">
          If your result is positive
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-muted">
          A confirmed positive result is the start of treatment, not the end
          of a normal life. People living with HIV who start antiretroviral
          therapy (ART) early and stay on it can expect a long, healthy life,
          and once the virus is suppressed it cannot be passed on sexually
          (U=U: undetectable equals untransmittable).
        </p>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-muted">
          ART is provided at every DOH-designated facility. The facility that
          confirms your result will either start treatment themselves or refer
          you to the nearest hub. Antiretroviral medication is procured
          centrally and tracked through OHASIS, so supply is coordinated
          across the country.
        </p>
      </section>

      <section id="privacy" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-semibold tracking-tight text-on-surface">
          Privacy and your rights
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-muted">
          Under RA 11166, your HIV status is confidential. Facilities cannot
          disclose it to employers, schools, or family members without your
          written consent. Testing of anyone under 15 generally requires
          parental or guardian consent; adolescents 15–17 may consent to
          testing on their own under the law.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-muted">
          If you experience discrimination connected to your status, the
          Philippine National AIDS Council (PNAC) and DOH have grievance
          mechanisms. Your facility's HACT can point you to them.
        </p>
      </section>

      <footer className="mt-12 rounded-2xl border border-outline-variant bg-surface-container p-5 text-xs text-on-surface-muted">
        <p>
          <strong className="text-on-surface">Sources.</strong> Department of
          Health Circular No. 2026-0065 — Updated Directory of DOH-Designated
          HIV Treatment Hubs and Primary HIV Care Facilities in the Philippines
          (as of December 31, 2025), Annex A. Republic Act No. 11166 — Philippine
          HIV and AIDS Policy Act.
        </p>
        <p className="mt-2">
          This page does not list testing prices or self-test kit brands.
          Pricing varies by facility (most public testing is free) and the
          self-test landscape changes; check with the facility nearest you for
          current details.
        </p>
      </footer>
    </article>
  );
}
