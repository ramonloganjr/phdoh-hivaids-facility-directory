import { FACILITIES } from "@/data/facilities";

const phoneClean = (s: string) => s.replace(/[^\d+]/g, "");

export function telHref(num: string): string {
  // Normalize PH numbers: drop spaces, dashes, parens; add +63 if local
  const cleaned = phoneClean(num);
  if (!cleaned) return "tel:";
  if (cleaned.startsWith("+")) return `tel:${cleaned}`;
  if (cleaned.startsWith("09") && cleaned.length === 11) return `tel:+63${cleaned.slice(1)}`;
  if (cleaned.startsWith("0") && cleaned.length >= 8) return `tel:+63${cleaned.slice(1)}`;
  return `tel:${cleaned}`;
}

export function fbHref(label: string): string {
  if (/^https?:/i.test(label)) return label;
  const slug = label.trim().replace(/\s+/g, "%20");
  return `https://www.facebook.com/search/top?q=${slug}`;
}

export function findFacility(id: string) {
  return FACILITIES.find((f) => f.id === id);
}

/**
 * Build a universal Google Maps Directions URL. SSR-safe fallback href
 * for anchors; runtime navigation should call `openDirections` to deep-link
 * into the device's native mapping app.
 *
 * Docs: https://developers.google.com/maps/documentation/urls/get-started
 */
export function directionsHref(opts: { name: string; address: string }): string {
  const q = [opts.name, opts.address].filter(Boolean).join(", ");
  return `https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=${encodeURIComponent(q)}`;
}

type Platform = "ios" | "android" | "desktop";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent || "";
  // iPadOS 13+ reports as Mac with touch — treat as iOS for native Maps deep-link
  const isIPadOS =
    /Macintosh/.test(ua) && typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/.test(ua) || isIPadOS) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

/**
 * Open turn-by-turn directions in the device's native mapping app.
 *
 * - iOS / iPadOS: Apple Maps via `maps://?daddr=...&dirflg=d`.
 * - Android: `geo:0,0?q=...` intent — OS picks user's default nav app
 *   (Google Maps, Waze, etc.).
 * - Desktop / unknown: Google Maps web in a new tab.
 *
 * Origin is omitted so the mapping app uses the user's current GPS
 * location as the starting point.
 */
export function openDirections(opts: { name: string; address: string }): void {
  if (typeof window === "undefined") return;
  const q = [opts.name, opts.address].filter(Boolean).join(", ");
  const encoded = encodeURIComponent(q);
  const webFallback = `https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=${encoded}`;
  const platform = detectPlatform();

  try {
    if (platform === "ios") {
      window.location.href = `maps://?daddr=${encoded}&dirflg=d`;
      window.setTimeout(() => {
        if (document.visibilityState === "visible") {
          window.location.href = webFallback;
        }
      }, 800);
      return;
    }
    if (platform === "android") {
      window.location.href = `geo:0,0?q=${encoded}`;
      window.setTimeout(() => {
        if (document.visibilityState === "visible") {
          window.location.href = webFallback;
        }
      }, 800);
      return;
    }
  } catch {
    // fall through to web
  }

  window.open(webFallback, "_blank", "noopener,noreferrer");
}
