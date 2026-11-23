import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

async function assertAdmin(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (error || !data) {
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
    await assertAdmin(context.supabase, context.userId);

    const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
    if (!hookUrl) {
      throw new Error(
        "Deploy hook isn't configured. Set VERCEL_DEPLOY_HOOK_URL in the Vercel project's environment variables."
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
