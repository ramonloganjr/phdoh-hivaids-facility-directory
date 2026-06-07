import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-outline bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.2fr_1fr] md:items-start">
          <div className="space-y-3">
            <p className="eyebrow text-primary">HIV Care Directory</p>
            <p className="max-w-md text-xs leading-relaxed text-on-surface-muted">
              Mirrored from{" "}
              <span className="font-bold text-on-surface">
                DOH Department Circular No. 2026-0065
              </span>{" "}
              (4 February 2026). Verified facility listings as of 31 December 2025.
              Always confirm with the facility before visiting.
            </p>
          </div>
          <nav
            aria-label="Footer"
            className="flex flex-wrap gap-x-6 gap-y-3 text-[11px] font-bold uppercase tracking-[0.18em] md:justify-end"
          >
            <Link to="/facilities" className="text-on-surface-muted hover:text-on-surface">
              All facilities
            </Link>
            <Link to="/insights" className="text-on-surface-muted hover:text-on-surface">
              Insights
            </Link>
            <Link to="/faq" className="text-on-surface-muted hover:text-on-surface">
              FAQ
            </Link>
            <Link to="/about" className="text-on-surface-muted hover:text-on-surface">
              About
            </Link>
            <a
              href="https://doh.gov.ph"
              target="_blank"
              rel="noreferrer"
              className="text-on-surface-muted hover:text-on-surface"
            >
              doh.gov.ph ↗
            </a>
          </nav>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-outline pt-6 text-[11px] text-on-surface-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            Public information mirror. Not affiliated with the Department of Health.
            © {new Date().getFullYear()}
          </p>
          <p>
            Built by{" "}
            <a
              href="https://www.ramonloganjr.com/"
              target="_blank"
              rel="noreferrer"
              className="font-bold uppercase tracking-[0.18em] text-on-surface hover:text-primary"
            >
              Ramon Logan Jr.
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
