import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error || data !== true) {
    throw new Error("Forbidden: admin access required.");
  }
}

/**
 * Triggers a Vercel redeploy via the configured Deploy Hook.
 * Admin-only. Returns the Vercel job info on success.
 */
export const triggerVercelRedeploy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);

    const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
    if (!hookUrl) {
      throw new Error(
        "Deploy hook isn't configured. Add VERCEL_DEPLOY_HOOK_URL in Cloud → Secrets."
      );
    }

    const res = await fetch(hookUrl, { method: "POST" });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Vercel responded ${res.status}: ${text.slice(0, 200)}`);
    }

    return {
      ok: true as const,
      triggeredAt: new Date().toISOString(),
      response: text.slice(0, 500),
    };
  });
