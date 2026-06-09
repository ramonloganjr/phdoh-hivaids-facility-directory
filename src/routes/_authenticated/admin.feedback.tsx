import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, XCircle, Trash2, Loader2, Sparkles, Radio } from "lucide-react";
import {
  listFeedback,
  moderateFeedback,
  deleteFeedback,
  promoteFeedbackToStory,
  type FeedbackRow,
} from "@/lib/feedback.functions";
import { useRealtimeInvalidate } from "@/hooks/use-realtime-invalidate";


export const Route = createFileRoute("/_authenticated/admin/feedback")({
  head: () => ({
    meta: [
      { title: "Feedback queue — HIV Care Philippines admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminFeedbackPage,
});

type Filter = "pending" | "approved" | "rejected" | "all";

function AdminFeedbackPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("pending");

  const listFn = useServerFn(listFeedback);
  const moderateFn = useServerFn(moderateFeedback);
  const deleteFn = useServerFn(deleteFeedback);
  const promoteFn = useServerFn(promoteFeedbackToStory);

  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin-feedback", filter],
    queryFn: () => listFn({ data: { status: filter } as never }),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-feedback"] });

  const moderate = useMutation({
    mutationFn: (p: { id: string; action: "approve" | "reject" }) =>
      moderateFn({ data: p as never }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } as never }),
    onSuccess: invalidate,
  });
  const promote = useMutation({
    mutationFn: (p: { id: string; attribution: string }) =>
      promoteFn({ data: p as never }),
    onSuccess: () => {
      invalidate();
      navigate({ to: "/admin/stories" });
    },
  });

  const onPromote = (id: string) => {
    const attribution = window.prompt(
      "Attribution for this story (e.g. \"M., 32, Quezon City\"). The story will be created unpublished — you must record consent on the Stories page before it appears on /impact.",
      "",
    );
    if (!attribution || attribution.trim().length < 2) return;
    promote.mutate({ id, attribution: attribution.trim() });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link
        to="/admin/insights"
        className="state-layer inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-on-surface-muted hover:text-on-surface"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to insights
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-on-surface sm:text-4xl">
        Feedback queue
      </h1>
      <p className="mt-2 text-sm text-on-surface-muted">
        Anonymous messages from visitors. Approve to mark reviewed, reject to set aside, or delete
        if it's spam.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["pending", "approved", "rejected", "all"] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`state-layer rounded-full px-4 py-1.5 text-xs font-medium capitalize ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-surface-container-high text-on-surface"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <section className="mt-6 space-y-3">
        {isLoading && <p className="text-sm text-on-surface-muted">Loading…</p>}
        {!isLoading && (rows ?? []).length === 0 && (
          <p className="rounded-2xl bg-surface-container p-6 text-sm text-on-surface-muted">
            No {filter === "all" ? "" : filter} feedback right now.
          </p>
        )}
        {(rows ?? []).map((r: FeedbackRow) => (
          <article key={r.id} className="rounded-3xl bg-surface-container p-5 elev-1">
            <p className="whitespace-pre-wrap text-sm text-on-surface">{r.message}</p>
            <p className="mt-2 text-xs text-on-surface-muted">
              {new Date(r.created_at).toLocaleString()}
              {r.region ? ` · ${r.region}` : ""}
              {" · "}
              <span className="capitalize">{r.status}</span>
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => moderate.mutate({ id: r.id, action: "approve" })}
                disabled={moderate.isPending || r.status === "approved"}
                className="state-layer press inline-flex items-center gap-1.5 rounded-full bg-primary-container px-3 py-1 font-medium text-on-primary-container disabled:opacity-60"
              >
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Approve
              </button>
              <button
                type="button"
                onClick={() => moderate.mutate({ id: r.id, action: "reject" })}
                disabled={moderate.isPending || r.status === "rejected"}
                className="state-layer rounded-full bg-surface-container-high px-3 py-1 font-medium text-on-surface disabled:opacity-60"
              >
                <XCircle className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
                Reject
              </button>
              <button
                type="button"
                onClick={() => onPromote(r.id)}
                disabled={promote.isPending}
                className="state-layer press inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1 font-medium text-on-surface disabled:opacity-60"
                title="Create a draft story from this feedback"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Promote to story
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Delete this feedback permanently?")) remove.mutate(r.id);
                }}
                disabled={remove.isPending}
                className="state-layer ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-on-surface-muted hover:text-primary"
              >
                {remove.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
