import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { registerPWA } from "@/lib/pwa-register";
import { InstallPrompt } from "@/components/install-prompt";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NotFound } from "@/components/not-found";


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

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();


  return (
    <div className="flex min-h-[70dvh] items-center justify-center px-4">
      <div className="max-w-md text-center" role="alert">
        <h1 className="text-xl font-semibold tracking-tight text-on-surface">
          This page didn't finish loading
        </h1>
        <p className="mt-2 text-sm text-on-surface-muted">
          Your connection may have dropped, or the data took too long to arrive. Try again, or head
          back home — your place in the directory is safe.
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
            Back to home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async () => {
    try {
      const origin = await getRequestOrigin();
      return { origin };
    } catch {
      return { origin: "" };
    }
  },
  head: ({ loaderData }) => {
    const origin = loaderData?.origin ?? "";
    // Use the static /open-graph.png served from public/ — the CDN asset URL
    // (/__l5e/assets-v1/...) is preview-only infrastructure and not reachable
    // by Facebook / LinkedIn crawlers on production deployments.
    const ogImagePath = "/open-graph.png";
    const ogImageUrl = origin ? `${origin}${ogImagePath}` : ogImagePath;
    return ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#FFF5F6", media: "(prefers-color-scheme: light)" },
      { name: "theme-color", content: "#1A0E11", media: "(prefers-color-scheme: dark)" },
      { name: "color-scheme", content: "light dark" },
      { name: "format-detection", content: "telephone=yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "HIV Care PH" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "application-name", content: "HIV Care PH" },
      { title: "HIV Care Philippines — DOH-Designated Facilities" },
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
      { property: "og:site_name", content: "HIV Care Philippines" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_PH" },
      { property: "og:image", content: ogImageUrl },
      { property: "og:image:secure_url", content: ogImageUrl },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:alt", content: "HIV Care Philippines — DOH-designated facilities" },
      { name: "twitter:image", content: ogImageUrl },
      // Twitter
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@ramonloganjr" },
      { name: "twitter:creator", content: "@ramonloganjr" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      // Favicon set — Google/Bing SERP guidance: square, multiples of 48px,
      // reachable (not blocked by robots), consistent across the site.
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", type: "image/png", sizes: "48x48", href: "/favicon-48.png" },
      { rel: "icon", type: "image/png", sizes: "96x96", href: "/favicon-96.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/favicon-192.png" },
      { rel: "icon", type: "image/png", sizes: "512x512", href: "/favicon-512.png" },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "shortcut icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "mask-icon", href: "/favicon.png", color: "#FF2E51" },
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
              name: "HIV Care Philippines",
              alternateName: "PH HIV Care Philippines",
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
              name: "HIV Care Philippines",
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
  });
  },
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
  const router = useRouter();

  useEffect(() => {
    registerPWA();
  }, []);

  // Single global auth listener — keeps the router and query cache in sync
  // when the user signs in / out / refreshes their token. Filtered to identity
  // transitions only so it doesn't fire on every TOKEN_REFRESHED (~hourly +
  // tab focus) or INITIAL_SESSION (every mount).
  useEffect(() => {
    let mounted = true;
    void import("@/integrations/supabase/client").then(({ supabase }) => {
      if (!mounted) return;
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
        router.invalidate();
        // On SIGNED_OUT the auth gate redirects, and refetching protected
        // queries against the cleared session would just 401.
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      });
      return () => data.subscription.unsubscribe();
    });
    return () => {
      mounted = false;
    };
  }, [router, queryClient]);

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

