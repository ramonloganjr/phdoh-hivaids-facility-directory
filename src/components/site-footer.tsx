import { Link } from "@tanstack/react-router";
import logoFooter from "@/assets/logo-footer.svg.asset.json";

export function SiteFooter() {
  return (
    <footer className="mt-16 w-full bg-surface-container">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 sm:py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.3fr_1fr] md:items-start">
          <div className="flex gap-5">
            <img
              src={logoFooter.url}
              alt=""
              aria-hidden="true"
              className="h-14 w-14 shrink-0 sm:h-16 sm:w-16"
              draggable={false}
            />
            <div className="space-y-3">
              <p className="text-sm font-semibold text-primary">HIV Care Directory</p>
              <p className="max-w-md text-sm leading-relaxed text-on-surface-muted">
                Mirrored from{" "}
                <span className="font-semibold text-on-surface">
                  DOH Department Circular No. 2026-0065
                </span>{" "}
                (4 February 2026). Verified facility listings as of 31 December 2025. Always
                confirm with the facility before visiting.
              </p>
            </div>
          </div>
          <nav
            aria-label="Footer"
            className="flex flex-wrap gap-x-1 gap-y-1 text-sm md:justify-end"
          >
            <FooterLink to="/facilities">All facilities</FooterLink>
            <FooterLink to="/insights">Insights</FooterLink>
            <FooterLink to="/faq">FAQ</FooterLink>
            <FooterLink to="/about">About</FooterLink>
            <FooterLink to="/terms">Terms</FooterLink>
            <FooterLink to="/privacy">Privacy</FooterLink>

          </nav>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-outline-variant pt-6 text-xs text-on-surface-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            Public information mirror. Not affiliated with the Department of Health. ©{" "}
            {new Date().getFullYear()}
          </p>
          <p>
            Built by{" "}
            <a
              href="https://www.ramonloganjr.com/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-on-surface hover:text-primary"
            >
              Ramon Logan Jr.
            </a>{" "}
            and dedicated to all people living with HIV/AIDS in the Philippines.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  to,
  children,
}: {
  to: "/facilities" | "/insights" | "/faq" | "/about" | "/terms" | "/privacy";
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="px-3.5 py-2 font-medium text-on-surface-muted hover:text-on-surface"
    >
      {children}
    </Link>
  );
}
