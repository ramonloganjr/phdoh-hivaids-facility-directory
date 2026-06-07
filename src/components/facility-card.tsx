import { Link } from "@tanstack/react-router";
import { Hospital, Stethoscope, MapPin, ArrowUpRight, Phone, Mail, Facebook } from "lucide-react";
import type { Facility } from "@/data/facilities.types";
import { REGION_LABELS } from "@/data/facilities";
import { cn } from "@/lib/utils";

export function FacilityCard({ facility }: { facility: Facility }) {
  const isHub = facility.serviceType === "Treatment Hub";
  const Icon = isHub ? Hospital : Stethoscope;
  const phones = [...facility.mobiles, ...facility.landlines];
  const primaryPhone = phones[0];
  const primaryEmail = facility.emails[0];
  const primaryFacebook = facility.facebook[0];
  const leadContact = facility.contacts[0];
  const extraPhones = Math.max(0, phones.length - 1);

  const telHref = (n: string) => `tel:${n.replace(/[^\d+]/g, "")}`;
  const fbHref = (f: string) =>
    f.startsWith("http") ? f : `https://facebook.com/${f.replace(/^@/, "")}`;

  return (
    <article className="state-layer group relative block rounded-3xl border border-outline-variant bg-card p-5 elev-1 hover:elev-2">
      <Link
        to="/facilities/$id"
        params={{ id: facility.id }}
        aria-label={`Open ${facility.name}`}
        className="absolute inset-0 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      />
      <div className="relative flex items-start gap-4">
        <span
          className={cn(
            "mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
            isHub
              ? "bg-primary-container text-on-primary-container"
              : "bg-accent text-accent-foreground",
          )}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[15px] font-semibold leading-snug text-card-foreground">
              {facility.name}
            </h3>
            <ArrowUpRight
              className="mt-0.5 h-4 w-4 shrink-0 text-on-surface-muted opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden="true"
            />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                isHub
                  ? "bg-primary-container text-on-primary-container"
                  : "bg-accent text-accent-foreground",
              )}
            >
              {facility.serviceType}
            </span>
            {facility.inpatient && (
              <span className="inline-flex items-center rounded-full bg-surface-container-high px-2.5 py-0.5 text-[11px] font-medium text-on-surface-muted">
                Inpatient
              </span>
            )}
            <span className="inline-flex items-center rounded-full bg-surface-container-high px-2.5 py-0.5 text-[11px] font-medium text-on-surface-muted">
              {REGION_LABELS[facility.region]}
            </span>
          </div>
          <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-on-surface-muted">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="line-clamp-2">{facility.address}</span>
          </p>
          {leadContact?.name && (
            <p className="mt-2 truncate text-xs text-on-surface-muted">
              {leadContact.role ? (
                <span className="text-on-surface-muted/70">{leadContact.role}: </span>
              ) : null}
              <span className="font-medium text-on-surface">{leadContact.name}</span>
            </p>
          )}
          {(primaryPhone || primaryEmail || primaryFacebook) && (
            <div className="relative z-10 mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-medium">
              {primaryPhone && (
                <a
                  href={telHref(primaryPhone)}
                  onClick={(e) => e.stopPropagation()}
                  className="state-layer press inline-flex items-center gap-1.5 rounded-full bg-primary-container px-2.5 py-1 text-on-primary-container"
                  aria-label={`Call ${facility.name} at ${primaryPhone}`}
                >
                  <Phone className="h-3 w-3" aria-hidden="true" />
                  <span className="tabular-nums">{primaryPhone}</span>
                  {extraPhones > 0 && (
                    <span className="opacity-70">+{extraPhones}</span>
                  )}
                </a>
              )}
              {primaryEmail && (
                <a
                  href={`mailto:${primaryEmail}`}
                  onClick={(e) => e.stopPropagation()}
                  className="state-layer press inline-flex max-w-[14rem] items-center gap-1.5 rounded-full bg-surface-container-high px-2.5 py-1 text-on-surface"
                  aria-label={`Email ${facility.name}`}
                >
                  <Mail className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">{primaryEmail}</span>
                </a>
              )}
              {primaryFacebook && (
                <a
                  href={fbHref(primaryFacebook)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="state-layer press inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-2.5 py-1 text-on-surface"
                  aria-label={`Open ${facility.name} on Facebook`}
                >
                  <Facebook className="h-3 w-3" aria-hidden="true" />
                  <span>Facebook</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
