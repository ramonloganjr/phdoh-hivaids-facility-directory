import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type AppSupabase = SupabaseClient<Database>;

async function assertAdmin(supabase: AppSupabase, userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden: admin access required.");
  return supabase;
}

export type FeedbackRow = {
  id: string;
  message: string;
  region: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reviewed_at: string | null;
};

export const listFeedback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        status: z.enum(["pending", "approved", "rejected", "all"]).default("pending"),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }): Promise<FeedbackRow[]> => {
    const supabase = await assertAdmin(context.supabase, context.userId);
    let q = supabase
      .from("feedback")
      .select("id, message, region, status, created_at, reviewed_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as FeedbackRow[];
  });

export const moderateFeedback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        action: z.enum(["approve", "reject"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const supabase = await assertAdmin(context.supabase, context.userId);
    const { error } = await supabase
      .from("feedback")
      .update({
        status: data.action === "approve" ? "approved" : "rejected",
        reviewer_id: context.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteFeedback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const supabase = await assertAdmin(context.supabase, context.userId);
    const { error } = await supabase.from("feedback").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
