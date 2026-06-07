import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";
import logoLight from "@/assets/logo-light.svg.asset.json";
import logoDark from "@/assets/logo-dark.svg.asset.json";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-outline bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-8">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-on-surface"
          aria-label="HIV Care Directory — home"
        >
          <span className="relative inline-block h-9 w-auto sm:h-10" aria-hidden="true">
            <img
              src={logoLight.url}
              alt=""
              className="block h-9 w-auto sm:h-10 dark:hidden"
              draggable={false}
            />
            <img
              src={logoDark.url}
              alt=""
              className="hidden h-9 w-auto sm:h-10 dark:block"
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
          <div className="mx-2 hidden h-5 w-px bg-outline sm:block" aria-hidden="true" />
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
      activeProps={{ className: "text-primary" }}
      className={cn(
        "hidden px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-muted transition-colors hover:text-on-surface sm:inline-flex",
      )}
    >
      {children}
    </Link>
  );
}
