import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-outline-variant bg-surface-container">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md space-y-2">
            <p className="text-sm font-semibold text-on-surface">HIV Care Directory</p>
            <p className="text-xs leading-relaxed text-on-surface-muted">
              Mirrored from{" "}
              <span className="font-medium text-on-surface">
                DOH Department Circular No. 2026-0065
              </span>{" "}
              (4 February 2026). Verified facility listings as of 31 December 2025.
              Always confirm with the facility before visiting.
            </p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link to="/facilities" className="text-on-surface-muted hover:text-on-surface">
              All facilities
            </Link>
            <Link to="/about" className="text-on-surface-muted hover:text-on-surface">
              About & legal basis
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
        <p className="mt-8 text-[11px] text-on-surface-muted">
          This is a public information mirror. Not affiliated with the Department of
          Health. © {new Date().getFullYear()} · Built by{" "}
          <a
            href="https://www.ramonloganjr.com/"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-on-surface hover:underline"
          >
            Ramon Logan Jr.
          </a>
        </p>
      </div>
    </footer>
  );
}
