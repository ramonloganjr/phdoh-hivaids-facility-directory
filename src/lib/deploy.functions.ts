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
 * Admin-only. Returns the Vercel job info on success. The mobile app uses the
 * same hook through POST /api/admin/redeploy.
 */
export const triggerVercelRedeploy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { triggerDeployHook } = await import("./deploy.server");
    return triggerDeployHook();
  });
