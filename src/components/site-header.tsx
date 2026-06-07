import { Link } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface/85 backdrop-blur supports-[backdrop-filter]:bg-surface/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link
          to="/"
          className="state-layer flex items-center gap-2.5 rounded-full px-2 py-1.5 text-on-surface"
          aria-label="DOH HIV Directory home"
        >
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground elev-1"
            aria-hidden="true"
          >
            <Activity className="h-4.5 w-4.5" strokeWidth={2.5} />
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-on-surface-muted">
              DOH Philippines
            </span>
            <span className="text-sm font-semibold tracking-tight">HIV Care Directory</span>
          </span>
          <span className="text-sm font-semibold tracking-tight sm:hidden">HIV Directory</span>
        </Link>

        <nav className="ml-auto flex items-center gap-1" aria-label="Primary">
          <HeaderLink to="/facilities">Facilities</HeaderLink>
          <HeaderLink to="/about">About</HeaderLink>
          <div className="mx-1 hidden h-6 w-px bg-outline-variant sm:block" aria-hidden="true" />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

function HeaderLink({ to, children }: { to: "/facilities" | "/about"; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      activeProps={{ className: "bg-secondary text-on-surface" }}
      className={cn(
        "state-layer hidden rounded-full px-3.5 py-2 text-sm font-medium text-on-surface-muted hover:text-on-surface sm:inline-flex",
      )}
    >
      {children}
    </Link>
  );
}
