import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Trash2, Plus, Loader2, CheckCircle2 } from "lucide-react";
import {
  listTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/stories")({
  head: () => ({
    meta: [
      { title: "Stories — HIV Care Philippines admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminStoriesPage,
});

type Story = {
  id: string;
  quote: string;
  attribution: string;
  region: string | null;
  consent_verified_at: string | null;
  published: boolean;
  sort_order: number;
};

function AdminStoriesPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listTestimonials);
  const createFn = useServerFn(createTestimonial);
  const updateFn = useServerFn(updateTestimonial);
  const deleteFn = useServerFn(deleteTestimonial);

  const { data: stories, isLoading } = useQuery({
    queryKey: ["admin-stories"],
    queryFn: () => listFn(),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-stories"] });

  type NewStory = {
    quote: string;
    attribution: string;
    region?: string;
    consent_verified_at?: string;
    published?: boolean;
    sort_order?: number;
  };
  const create = useMutation({
    mutationFn: (payload: NewStory) => createFn({ data: payload as never }),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: (payload: { id: string; patch: Partial<Story> }) =>
      updateFn({ data: payload as never }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } as never }),
    onSuccess: invalidate,
  });

  const [draft, setDraft] = useState({ quote: "", attribution: "", region: "" });
  const onCreate = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(
      {
        quote: draft.quote,
        attribution: draft.attribution,
        region: draft.region || undefined,
      },
      { onSuccess: () => setDraft({ quote: "", attribution: "", region: "" }) },
    );
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
        Curated stories
      </h1>
      <p className="mt-2 text-sm text-on-surface-muted">
        Stories appear on the public Impact page only after consent is recorded and they're marked
        published.
      </p>

      <form onSubmit={onCreate} className="mt-8 space-y-3 rounded-3xl bg-surface-container p-6 elev-1">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-on-surface-muted">
          New story
        </h2>
        <textarea
          required
          minLength={8}
          maxLength={600}
          value={draft.quote}
          onChange={(e) => setDraft((d) => ({ ...d, quote: e.target.value }))}
          placeholder="The quote, in the person's own words…"
          className="min-h-[100px] w-full rounded-2xl border border-outline-variant bg-surface p-3 text-sm text-on-surface focus:border-primary focus:outline-none"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            required
            value={draft.attribution}
            onChange={(e) => setDraft((d) => ({ ...d, attribution: e.target.value }))}
            placeholder="Attribution (e.g. M., 32, Quezon City)"
            className="h-11 rounded-full border border-outline-variant bg-surface px-4 text-sm focus:border-primary focus:outline-none"
          />
          <input
            value={draft.region}
            onChange={(e) => setDraft((d) => ({ ...d, region: e.target.value }))}
            placeholder="Region (optional)"
            className="h-11 rounded-full border border-outline-variant bg-surface px-4 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={create.isPending}
          className="state-layer press inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-70"
        >
          {create.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Plus className="h-4 w-4" aria-hidden="true" />
          )}
          Add story
        </button>
      </form>

      <section className="mt-8 space-y-3">
        {isLoading && <p className="text-sm text-on-surface-muted">Loading stories…</p>}
        {(stories ?? []).map((s: Story) => (
          <StoryRow
            key={s.id}
            story={s}
            onUpdate={(patch) => update.mutate({ id: s.id, patch })}
            onDelete={() => {
              if (confirm("Delete this story? This can't be undone.")) remove.mutate(s.id);
            }}
            saving={update.isPending}
            deleting={remove.isPending}
          />
        ))}
        {!isLoading && (stories ?? []).length === 0 && (
          <p className="rounded-2xl bg-surface-container p-6 text-sm text-on-surface-muted">
            No stories yet. Add the first one above.
          </p>
        )}
      </section>
    </div>
  );
}

function StoryRow({
  story,
  onUpdate,
  onDelete,
  saving,
  deleting,
}: {
  story: Story;
  onUpdate: (patch: Partial<Story>) => void;
  onDelete: () => void;
  saving: boolean;
  deleting: boolean;
}) {
  const togglePublish = () => {
    if (!story.consent_verified_at && !story.published) {
      alert("Record consent first before publishing.");
      return;
    }
    onUpdate({ published: !story.published });
  };
  const recordConsent = () => {
    onUpdate({ consent_verified_at: new Date().toISOString() });
  };

  return (
    <article className="rounded-3xl bg-surface-container p-5 elev-1">
      <p className="text-sm text-on-surface">"{story.quote}"</p>
      <p className="mt-2 text-xs text-on-surface-muted">
        — {story.attribution}
        {story.region ? ` · ${story.region}` : ""}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${
            story.consent_verified_at
              ? "bg-primary-container text-on-primary-container"
              : "bg-surface-container-high text-on-surface-muted"
          }`}
        >
          {story.consent_verified_at ? (
            <>
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
              Consent recorded {new Date(story.consent_verified_at).toLocaleDateString()}
            </>
          ) : (
            "No consent recorded"
          )}
        </span>
        {!story.consent_verified_at && (
          <button
            type="button"
            onClick={recordConsent}
            className="state-layer rounded-full bg-surface-container-high px-3 py-1 font-medium text-on-surface"
          >
            Mark consent verified
          </button>
        )}
        <button
          type="button"
          onClick={togglePublish}
          disabled={saving}
          className={`state-layer press rounded-full px-3 py-1 font-medium ${
            story.published
              ? "bg-primary text-primary-foreground"
              : "bg-surface-container-high text-on-surface"
          }`}
        >
          {story.published ? "Published" : "Publish"}
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="state-layer ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-on-surface-muted hover:text-primary"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Delete
        </button>
      </div>
    </article>
  );
}
