import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(userId: string) {
  const { createClient } = await import("@supabase/supabase-js");
  const supabaseUrl = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    throw new Error("Backend auth isn't configured. Add backend URL and publishable key secrets.");
  }

  const supabase = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
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
