import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribe to postgres_changes on a public table and invalidate the given
 * React Query key on any change. Debounced so a burst of events triggers a
 * single refetch (default 800ms — fast enough to feel live, slow enough to
 * avoid hammering the server during admin bulk actions or test traffic).
 *
 * Safe to mount on multiple pages: each instance owns its own channel and
 * cleans up on unmount. Channel names include the queryKey so two pages
 * watching the same table don't collide.
 */
export function useRealtimeInvalidate(opts: {
  table: "feedback" | "testimonials" | "metric_events";
  queryKey: readonly unknown[];
  filter?: string;
  debounceMs?: number;
  enabled?: boolean;
}) {
  const { table, queryKey, filter, debounceMs = 800, enabled = true } = opts;
  const qc = useQueryClient();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keyStr = JSON.stringify(queryKey);

  useEffect(() => {
    if (!enabled) return;
    const channel = supabase
      .channel(`rt:${table}:${keyStr}:${Math.random().toString(36).slice(2, 8)}`)
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        { event: "*", schema: "public", table, ...(filter ? { filter } : {}) },
        () => {
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => {
            qc.invalidateQueries({ queryKey: JSON.parse(keyStr) });
          }, debounceMs);
        },
      )
      .subscribe();

    return () => {
      if (timer.current) clearTimeout(timer.current);
      supabase.removeChannel(channel);
    };
  }, [enabled, table, filter, keyStr, debounceMs, qc]);
}
