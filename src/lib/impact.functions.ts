import { createServerFn } from "@tanstack/react-start";
import type { PublicImpact } from "./impact.server";

export type { PublicImpact } from "./impact.server";

/**
 * Public, privacy-safe impact data for the /impact page. The aggregation
 * lives in `impact.server.ts`, shared with GET /api/public/impact (used by the
 * mobile app).
 */
export const getPublicImpact = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicImpact> => {
    const { computePublicImpact } = await import("./impact.server");
    return computePublicImpact();
  },
);
