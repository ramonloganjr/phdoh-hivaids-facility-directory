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
