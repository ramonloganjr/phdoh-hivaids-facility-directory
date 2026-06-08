import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { registerPWA } from "@/lib/pwa-register";
import { InstallPrompt } from "@/components/install-prompt";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NotFound } from "@/components/not-found";
import faviconAsset from "@/assets/favicon.png.asset.json";
import ogImageAsset from "@/assets/open-graph.png.asset.json";
import { getRequestOrigin } from "@/lib/origin.functions";

const THEME_INIT_SCRIPT = `
(function(){try{
  var t = localStorage.getItem('doh-hiv-theme') || 'system';
  var dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (dark) document.documentElement.classList.add('dark');
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
}catch(e){}})();
`;

function NotFoundComponent() {
  return <NotFound />;
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();


  return (
    <div className="flex min-h-[70dvh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-on-surface">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-on-surface-muted">
          Something went wrong. Try again, or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="state-layer inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Try again
          </button>
          <a
            href="/"
            className="state-layer inline-flex items-center justify-center rounded-full border border-outline px-5 py-2.5 text-sm font-medium text-on-surface"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#FF2E51" },
      { name: "color-scheme", content: "light dark" },
      { name: "format-detection", content: "telephone=yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "HIV Care PH" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "application-name", content: "HIV Care PH" },
      { title: "Philippine HIV Care Directory — DOH-Designated Facilities" },
      {
        name: "description",
        content:
          "Search all 338 DOH-designated HIV treatment hubs and primary care facilities in the Philippines. Mirrored from Department Circular No. 2026-0065.",
      },
      { name: "keywords", content: "HIV Philippines, AIDS Philippines, DOH treatment hub, HIV primary care, ART, PrEP, PEP, HIV testing Philippines, HIV facilities directory" },
      { name: "author", content: "Ramon Logan Jr." },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      { name: "googlebot", content: "index, follow" },
      // Open Graph
      { property: "og:site_name", content: "PH HIV Care Directory" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_PH" },
      { property: "og:image", content: ogImageAsset.url },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:type", content: "image/png" },
      { name: "twitter:image", content: ogImageAsset.url },
      // Twitter
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@ramonloganjr" },
      { name: "twitter:creator", content: "@ramonloganjr" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: faviconAsset.url },
      { rel: "apple-touch-icon", href: faviconAsset.url },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,100..1000&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "#org",
              name: "Philippine HIV Care Directory",
              alternateName: "PH HIV Care Directory",
              description:
                "Independent public-information mirror of DOH-designated HIV treatment hubs and primary care facilities in the Philippines.",
              founder: {
                "@type": "Person",
                name: "Ramon Logan Jr.",
                url: "https://www.ramonloganjr.com/",
              },
              areaServed: { "@type": "Country", name: "Philippines" },
            },
            {
              "@type": "WebSite",
              "@id": "#website",
              name: "Philippine HIV Care Directory",
              inLanguage: "en-PH",
              publisher: { "@id": "#org" },
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "/facilities?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-dvh bg-background text-foreground">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    registerPWA();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:elev-2"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          <Outlet />
        </main>
        <SiteFooter />
        <InstallPrompt />
      </div>
    </QueryClientProvider>
  );
}
