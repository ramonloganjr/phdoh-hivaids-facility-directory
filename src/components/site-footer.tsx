import { Link } from "@tanstack/react-router";
import logoFooter from "@/assets/logo-footer.svg.asset.json";

export function SiteFooter() {
  return (
    <footer className="mt-6 w-full bg-surface-container">
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-10 sm:py-10">

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
              <p className="text-sm font-semibold text-primary">HIV Care Philippines</p>
              <p className="max-w-md text-sm leading-relaxed text-on-surface-muted">
                A community-built mirror of{" "}
                <span className="font-semibold text-on-surface">
                  DOH Department Circular No. 2026-0065
                </span>{" "}
                (4 February 2026), with facility listings verified as of 31 December 2025. Hours,
                contacts, and services can change — please call ahead before visiting.
              </p>
            </div>
          </div>
          <nav
            aria-label="Footer"
            className="flex flex-wrap gap-x-1 gap-y-1 text-sm md:justify-end"
          >
            <FooterLink to="/facilities">All facilities</FooterLink>
            <FooterLink to="/insights">Insights</FooterLink>
            <FooterLink to="/impact">Impact</FooterLink>
            <FooterLink to="/faq">FAQ</FooterLink>
            <FooterLink to="/about">About</FooterLink>
            <FooterLink to="/sitemap">Sitemap</FooterLink>
            <FooterLink to="/terms">Terms</FooterLink>
            <FooterLink to="/privacy">Privacy</FooterLink>
          </nav>
        </div>
        <div className="mt-10 flex flex-col items-start gap-5 border-t border-outline-variant pt-6 text-xs leading-relaxed text-on-surface-muted md:gap-6">
          <p className="w-full">
            An independent public-information mirror. Not affiliated with the Department of Health,
            and not a substitute for medical advice. ©{" "}
            <span className="tabular-nums">{new Date().getFullYear()}</span>
          </p>
          <div
            aria-hidden="true"
            className="h-px w-12 rounded-full bg-outline-variant"
          />
          <p className="w-full">
            Built with care by{" "}
            <a
              href="https://www.ramonloganjr.com/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-on-surface hover:text-primary"
            >
              Ramon Logan Jr.
            </a>{" "}
            for people living with HIV in the Philippines, and everyone who loves them.
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
  to:
    | "/facilities"
    | "/insights"
    | "/impact"
    | "/faq"
    | "/about"
    | "/sitemap"
    | "/terms"
    | "/privacy";
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
