import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";
import logoLight from "@/assets/logo-light.svg.asset.json";
import logoDark from "@/assets/logo-dark.svg.asset.json";

type NavTo = "/" | "/facilities" | "/insights" | "/faq" | "/about";

const NAV_ITEMS: { to: NavTo; label: string; exact?: boolean }[] = [
  { to: "/", label: "Home", exact: true },
  { to: "/facilities", label: "Facilities" },
  { to: "/insights", label: "Insights" },
  { to: "/faq", label: "FAQ" },
  { to: "/about", label: "About" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-3 px-4 sm:px-8">
        <Link
          to="/"
          className="state-layer flex items-center gap-2.5 rounded-full px-2 py-1.5 text-on-surface"
          aria-label="HIV Care Directory — home"
        >
          <span className="relative inline-block h-12 w-auto sm:h-14" aria-hidden="true">
            <img
              src={logoLight.url}
              alt=""
              className="block h-12 w-auto sm:h-14 dark:hidden"
              draggable={false}
            />
            <img
              src={logoDark.url}
              alt=""
              className="hidden h-12 w-auto sm:h-14 dark:block"
              draggable={false}
            />
          </span>
          <span className="sr-only">HIV Care Directory</span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 sm:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <HeaderLink key={item.to} to={item.to} exact={item.exact}>
              {item.label}
            </HeaderLink>
          ))}
          <div className="mx-1.5 h-5 w-px bg-outline-variant" aria-hidden="true" />
          <ThemeToggle />
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="state-layer press inline-flex h-11 w-11 items-center justify-center rounded-full text-on-surface"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav-panel"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "sm:hidden fixed inset-0 top-20 z-30 transition-opacity duration-200",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        <nav
          id="mobile-nav-panel"
          aria-label="Mobile primary"
          className={cn(
            "relative mx-4 mt-2 overflow-hidden rounded-3xl bg-surface-container-high elev-3 transition-all duration-300",
            open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
          )}
        >
          <ul className="flex flex-col p-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeOptions={item.exact ? { exact: true } : undefined}
                  activeProps={{
                    className: "bg-primary-container text-on-primary-container",
                  }}
                  onClick={() => setOpen(false)}
                  className="state-layer flex items-center rounded-2xl px-4 py-3.5 text-base font-medium text-on-surface"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

function HeaderLink({
  to,
  exact,
  children,
}: {
  to: NavTo;
  exact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      activeOptions={exact ? { exact: true } : undefined}
      activeProps={{ className: "bg-primary-container text-on-primary-container" }}
      className={cn(
        "state-layer rounded-full px-4 py-2 text-sm font-medium text-on-surface-muted transition-colors hover:text-on-surface",
      )}
    >
      {children}
    </Link>
  );
}
