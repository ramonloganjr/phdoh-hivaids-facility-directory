import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";
import logoLight from "@/assets/logo-light.svg.asset.json";
import logoDark from "@/assets/logo-dark.svg.asset.json";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface/85 backdrop-blur supports-[backdrop-filter]:bg-surface/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link
          to="/"
          className="state-layer flex items-center gap-2.5 rounded-full px-2 py-1.5 text-on-surface"
          aria-label="HIV Care Directory — home"
        >
          <span className="relative inline-block h-7 w-auto" aria-hidden="true">
            <img
              src={logoLight.url}
              alt=""
              className="block h-7 w-auto dark:hidden"
              draggable={false}
            />
            <img
              src={logoDark.url}
              alt=""
              className="hidden h-7 w-auto dark:block"
              draggable={false}
            />
          </span>
          <span className="sr-only">HIV Care Directory</span>
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
