import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  Hospital,
  Stethoscope,
  MapPin,
  Phone,
  Mail,
  Facebook,
  User,
  ExternalLink,
  Navigation,
} from "lucide-react";
import { FACILITIES, REGION_LABELS } from "@/data/facilities";
import type { Facility } from "@/data/facilities.types";
import { findFacility, telHref, fbHref, directionsHref, openDirections } from "@/lib/facilities-helpers";
import { cn } from "@/lib/utils";
import { ShareBar } from "@/components/share-bar";

export const Route = createFileRoute("/facilities/$id")({
  loader: async ({ params }) => {
    const f = findFacility(params.id);
    if (!f) throw notFound();
    let origin = "";
    try {
      const { getRequestOrigin } = await import("@/lib/origin.functions");
      origin = await getRequestOrigin();
    } catch {
      origin = "";
    }
    return { facility: f, origin };
  },
  head: ({ loaderData, params }) => {
    const f = loaderData?.facility;
    const origin = loaderData?.origin ?? "";
    const title = f
      ? `${f.name} — ${REGION_LABELS[f.region]} | PH HIV Care Directory`
      : "Facility — PH HIV Care Directory";
    const desc = f
      ? `${f.serviceType} in ${REGION_LABELS[f.region]}. ${f.address}`
      : "DOH-designated HIV facility details.";
    const ogPath = f
      ? `/api/og?eyebrow=${encodeURIComponent(REGION_LABELS[f.region])}&title=${encodeURIComponent(f.name)}&subtitle=${encodeURIComponent(`${f.serviceType} · ${f.address}`)}`
      : `/api/og?title=${encodeURIComponent(title)}`;
    const ogImage = origin ? `${origin}${ogPath}` : ogPath;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:image", content: ogImage },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:type", content: "image/svg+xml" },
        { name: "twitter:image", content: ogImage },
        ...(f ? [{ property: "og:url", content: `/facilities/${f.id}` }] : []),
      ],
      links: f ? [{ rel: "canonical", href: `/facilities/${f.id}` }] : [],
      scripts: f
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                  {
                    "@type": "MedicalClinic",
                    "@id": `#facility-${f.id}`,
                    name: f.name,
                    description: `${f.serviceType} designated by the Philippine Department of Health.`,
                    address: {
                      "@type": "PostalAddress",
                      streetAddress: f.address,
                      addressRegion: REGION_LABELS[f.region],
                      addressCountry: "PH",
                    },
                    telephone: f.mobiles[0] ?? f.landlines[0],
                    email: f.emails[0],
                    medicalSpecialty: "InfectiousDisease",
                    areaServed: {
                      "@type": "AdministrativeArea",
                      name: REGION_LABELS[f.region],
                    },
                    availableService: [
                      { "@type": "MedicalTherapy", name: "Antiretroviral Therapy" },
                      { "@type": "MedicalTest", name: "HIV Testing" },
                    ],
                  },
                  {
                    "@type": "BreadcrumbList",
                    itemListElement: [
                      { "@type": "ListItem", position: 1, name: "Home", item: "/" },
                      { "@type": "ListItem", position: 2, name: "Facilities", item: "/facilities" },
                      {
                        "@type": "ListItem",
                        position: 3,
                        name: f.name,
                        item: `/facilities/${params.id}`,
                      },
                    ],
                  },
                ],
              }),
            },
          ]
        : [],
    };
  },
  component: FacilityDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold text-on-surface">Facility not found</h1>
      <p className="mt-2 text-sm text-on-surface-muted">
        We couldn't find that facility in the directory.
      </p>
      <Link
        to="/facilities"
        className="state-layer mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to directory
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold text-on-surface">Couldn't load facility</h1>
      <p className="mt-2 text-sm text-on-surface-muted">{error.message}</p>
    </div>
  ),
});

function FacilityDetail() {
  const { facility: f } = Route.useLoaderData() as { facility: Facility };
  const isHub = f.serviceType === "Treatment Hub";
  const Icon = isHub ? Hospital : Stethoscope;

  const otherInRegion = FACILITIES.filter(
    (x) => x.region === f.region && x.id !== f.id,
  ).slice(0, 4);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
      <Link
        to="/facilities"
        className="state-layer inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-on-surface-muted hover:text-on-surface"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All facilities
      </Link>

      {/* Hero card */}
      <article className="mt-4 overflow-hidden rounded-3xl border border-outline-variant bg-card elev-2">
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span
              className={cn(
                "inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl",
                isHub
                  ? "bg-primary-container text-on-primary-container"
                  : "bg-accent text-accent-foreground",
              )}
              aria-hidden="true"
            >
              <Icon className="h-6 w-6" strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-on-surface-muted">
                {REGION_LABELS[f.region]}
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-card-foreground sm:text-3xl">
                {f.name}
              </h1>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium",
                    isHub
                      ? "bg-primary-container text-on-primary-container"
                      : "bg-accent text-accent-foreground",
                  )}
                >
                  {f.serviceType}
                </span>
                {f.inpatient && (
                  <span className="inline-flex items-center rounded-full bg-surface-container-high px-2.5 py-1 text-[11px] font-medium text-on-surface-muted">
                    Outpatient & Inpatient
                  </span>
                )}
                {!f.inpatient && (
                  <span className="inline-flex items-center rounded-full bg-surface-container-high px-2.5 py-1 text-[11px] font-medium text-on-surface-muted">
                    Outpatient
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <Section title="Address" icon={MapPin}>
              <p className="text-sm leading-relaxed text-on-surface">{f.address}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={directionsHref({ name: f.name, address: f.address })}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    openDirections({ name: f.name, address: f.address });
                  }}
                  className="state-layer press inline-flex min-h-[2.25rem] items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground"
                  aria-label={`Get directions to ${f.name}`}
                >
                  <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
                  Directions
                </a>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${f.name}, ${f.address}`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="state-layer press inline-flex min-h-[2.25rem] items-center gap-1.5 rounded-full bg-surface-container-high px-4 py-1.5 text-xs font-medium text-on-surface"
                >
                  Open in Maps <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </div>
            </Section>

            {f.contacts.length > 0 && (
              <Section title="Contact persons" icon={User}>
                <ul className="space-y-2">
                  {f.contacts.map((c, i) => (
                    <li key={i} className="text-sm">
                      {c.role && (
                        <span className="text-on-surface-muted">{c.role}: </span>
                      )}
                      <span className="font-medium text-on-surface">{c.name}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </div>
        </div>

        {/* Contact actions */}
        {(f.mobiles.length > 0 ||
          f.landlines.length > 0 ||
          f.emails.length > 0 ||
          f.facebook.length > 0) && (
          <div className="border-t border-outline-variant bg-surface-container-high/40 p-6 sm:p-8">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-muted">
              Reach the facility
            </h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {f.mobiles.map((n) => (
                <ContactLink
                  key={`m-${n}`}
                  href={telHref(n)}
                  icon={Phone}
                  label="Mobile"
                  value={n}
                />
              ))}
              {f.landlines.map((n) => (
                <ContactLink
                  key={`l-${n}`}
                  href={telHref(n)}
                  icon={Phone}
                  label="Landline"
                  value={n}
                />
              ))}
              {f.emails.map((e) => (
                <ContactLink
                  key={`e-${e}`}
                  href={`mailto:${e}`}
                  icon={Mail}
                  label="Email"
                  value={e}
                />
              ))}
              {f.facebook.map((p) => (
                <ContactLink
                  key={`f-${p}`}
                  href={fbHref(p)}
                  icon={Facebook}
                  label="Facebook"
                  value={p}
                  external
                />
              ))}
            </div>
            {f.extra.length > 0 && (
              <p className="mt-4 text-xs text-on-surface-muted">
                Additional: {f.extra.join(" · ")}
              </p>
            )}
          </div>
        )}
      </article>

      {/* Share */}
      <section className="mt-6 rounded-3xl bg-surface-container p-5 sm:p-6">
        <ShareBar
          url={`/facilities/${f.id}`}
          title={`${f.name} — DOH-designated ${f.serviceType}`}
          text={`${f.serviceType} in ${REGION_LABELS[f.region]}. ${f.address}`}
          label="Share this facility"
        />
      </section>

      {/* Other in region */}
      {otherInRegion.length > 0 && (
        <section className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-on-surface-muted">
            More in {REGION_LABELS[f.region]}
          </h2>
          <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {otherInRegion.map((o) => (
              <li key={o.id}>
                <Link
                  to="/facilities/$id"
                  params={{ id: o.id }}
                  className="state-layer flex items-center justify-between gap-3 rounded-2xl border border-outline-variant bg-surface-container p-4 elev-1 hover:elev-2"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-on-surface">
                      {o.name}
                    </span>
                    <span className="block truncate text-xs text-on-surface-muted">
                      {o.serviceType}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof MapPin;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-on-surface-muted" aria-hidden="true" />
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-muted">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function ContactLink({
  href,
  icon: Icon,
  label,
  value,
  external,
}: {
  href: string;
  icon: typeof Phone;
  label: string;
  value: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="state-layer flex items-center gap-3 rounded-2xl border border-outline-variant bg-surface p-3.5 hover:bg-surface-container"
    >
      <span
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-container text-on-primary-container"
        aria-hidden="true"
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-medium uppercase tracking-[0.12em] text-on-surface-muted">
          {label}
        </span>
        <span className="block truncate text-sm font-medium text-on-surface">{value}</span>
      </span>
      {external && (
        <ExternalLink className="h-3.5 w-3.5 text-on-surface-muted" aria-hidden="true" />
      )}
    </a>
  );
}
