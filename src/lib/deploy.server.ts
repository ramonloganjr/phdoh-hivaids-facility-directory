import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Server-only helpers for triggering a Vercel redeploy, shared by the admin
 * dashboard's server function and POST /api/admin/redeploy (mobile app).
 */

export class DeployError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/** Calls the configured Vercel Deploy Hook. */
export async function triggerDeployHook() {
  const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hookUrl) {
    throw new DeployError(
      "Deploy hook isn't configured. Set VERCEL_DEPLOY_HOOK_URL in the Vercel project's environment variables.",
      500,
    );
  }
  const res = await fetch(hookUrl, { method: "POST" });
  const text = await res.text();
  if (!res.ok) {
    throw new DeployError(`Vercel responded ${res.status}: ${text.slice(0, 200)}`, 502);
  }
  return {
    ok: true as const,
    triggeredAt: new Date().toISOString(),
    response: text.slice(0, 500),
  };
}

/**
 * Verifies a Supabase access token from an `Authorization: Bearer` header and
 * that its user holds the admin role (same checks as `requireSupabaseAuth` +
 * `assertAdmin`). Throws `DeployError` with 401/403 otherwise.
 */
export async function assertAdminBearer(authorization: string | null) {
  const url = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new DeployError("Server is missing Supabase configuration.", 500);

  if (!authorization?.startsWith("Bearer ")) throw new DeployError("Sign in to continue.", 401);
  const token = authorization.slice("Bearer ".length).trim();
  if (!token) throw new DeployError("Sign in to continue.", 401);

  const supabase = createClient<Database>(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getClaims(token);
  const userId = data?.claims?.sub;
  if (error || !userId) throw new DeployError("Your session ended. Sign in again.", 401);

  const { data: role, error: roleError } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (roleError || !role) throw new DeployError("Forbidden: admin access required.", 403);
}
