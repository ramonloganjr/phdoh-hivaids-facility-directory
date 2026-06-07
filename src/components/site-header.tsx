import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";
import logoLight from "@/assets/logo-light.svg.asset.json";
import logoDark from "@/assets/logo-dark.svg.asset.json";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-8">
        <Link
          to="/"
          className="state-layer flex items-center gap-2.5 rounded-full px-2 py-1.5 text-on-surface"
          aria-label="HIV Care Directory — home"
        >
          <span className="relative inline-block h-8 w-auto sm:h-9" aria-hidden="true">
            <img
              src={logoLight.url}
              alt=""
              className="block h-8 w-auto sm:h-9 dark:hidden"
              draggable={false}
            />
            <img
              src={logoDark.url}
              alt=""
              className="hidden h-8 w-auto sm:h-9 dark:block"
              draggable={false}
            />
          </span>
          <span className="sr-only">HIV Care Directory</span>
        </Link>

        <nav className="ml-auto flex items-center gap-1" aria-label="Primary">
          <HeaderLink to="/facilities">Facilities</HeaderLink>
          <HeaderLink to="/insights">Insights</HeaderLink>
          <HeaderLink to="/faq">FAQ</HeaderLink>
          <HeaderLink to="/about">About</HeaderLink>
          <div className="mx-1.5 hidden h-5 w-px bg-outline-variant sm:block" aria-hidden="true" />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

function HeaderLink({
  to,
  children,
}: {
  to: "/facilities" | "/insights" | "/faq" | "/about";
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      activeProps={{ className: "bg-primary-container text-on-primary-container" }}
      className={cn(
        "state-layer hidden rounded-full px-4 py-2 text-sm font-medium text-on-surface-muted transition-colors hover:text-on-surface sm:inline-flex",
      )}
    >
      {children}
    </Link>
  );
}
