import { Link } from "@tanstack/react-router";
import { Hospital, Stethoscope, MapPin, ArrowUpRight, Phone, Mail, Facebook } from "lucide-react";
import type { Facility } from "@/data/facilities.types";
import { REGION_LABELS } from "@/data/facilities";
import { cn } from "@/lib/utils";

export function FacilityCard({ facility }: { facility: Facility }) {
  const isHub = facility.serviceType === "Treatment Hub";
  const Icon = isHub ? Hospital : Stethoscope;
  const phoneCount = facility.mobiles.length + facility.landlines.length;
  const hasEmail = facility.emails.length > 0;
  const hasFacebook = facility.facebook.length > 0;
  const leadContact = facility.contacts[0];

  return (
    <Link
      to="/facilities/$id"
      params={{ id: facility.id }}
      className="state-layer group block rounded-3xl border border-outline-variant bg-card p-5 elev-1 hover:elev-2"
    >
      <div className="flex items-start gap-4">
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
          {(phoneCount > 0 || hasEmail || hasFacebook) && (
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-medium text-on-surface-muted">
              {phoneCount > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3 w-3" aria-hidden="true" />
                  {phoneCount} {phoneCount === 1 ? "number" : "numbers"}
                </span>
              )}
              {hasEmail && (
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3 w-3" aria-hidden="true" />
                  Email
                </span>
              )}
              {hasFacebook && (
                <span className="inline-flex items-center gap-1">
                  <Facebook className="h-3 w-3" aria-hidden="true" />
                  Facebook
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
