import { Link } from "@tanstack/react-router";
import { Hospital, Stethoscope, MapPin, ArrowUpRight } from "lucide-react";
import type { Facility } from "@/data/facilities.types";
import { REGION_LABELS } from "@/data/facilities";
import { cn } from "@/lib/utils";

export function FacilityCard({ facility }: { facility: Facility }) {
  const isHub = facility.serviceType === "Treatment Hub";
  const Icon = isHub ? Hospital : Stethoscope;

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
        </div>
      </div>
    </Link>
  );
}
