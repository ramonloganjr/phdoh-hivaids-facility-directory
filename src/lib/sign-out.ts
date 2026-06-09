import type { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Sign-out hygiene: cancel in-flight protected queries → clear cache →
 * end the Supabase session. Caller handles navigation (use `replace: true`
 * so the back button can't restore the protected route).
 *
 * Order matters: cancelling before signOut avoids a 401 storm from queries
 * that fire after the session is gone; clearing before signOut prevents the
 * back button from rendering a shell hydrated from cached protected data.
 */
export async function signOutCleanly(queryClient: QueryClient) {
  await queryClient.cancelQueries();
  queryClient.clear();
  await supabase.auth.signOut();
}
