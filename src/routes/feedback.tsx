import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2, Send, ShieldCheck, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "Send feedback — HIV Care Philippines" },
      {
        name: "description",
        content:
          "Share anonymous feedback about the HIV Care Philippines directory. No email, no account, no tracking — just your thoughts.",
      },
      { property: "og:title", content: "Send anonymous feedback" },
      {
        property: "og:description",
        content:
          "Tell us what worked, what didn't, or what you wish was here. No sign-up. No email.",
      },
    ],
  }),
  component: FeedbackPage,
});

type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "ok" }
  | { kind: "error"; message: string };

function FeedbackPage() {
  const [message, setMessage] = useState("");
  const [region, setRegion] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const startedAtRef = useRef<number>(Date.now());
  const [state, setState] = useState<SubmitState>({ kind: "idle" });

  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  const remaining = 1000 - message.length;
  const canSubmit = message.trim().length >= 8 && state.kind !== "submitting";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setState({ kind: "submitting" });
    try {
      const res = await fetch("/api/public/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          region: region.trim() || undefined,
          website, // honeypot
          client_started_at: startedAtRef.current,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setState({
          kind: "error",
          message: json.error ?? "Could not send right now. Please try again.",
        });
        return;
      }
      setState({ kind: "ok" });
      setMessage("");
      setRegion("");
    } catch {
      setState({ kind: "error", message: "Network error. Check your connection and retry." });
    }
  };

  if (state.kind === "ok") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl bg-surface-container p-8 elev-1 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-container">
            <CheckCircle2 className="h-7 w-7 text-on-primary-container" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-on-surface">
            Thanks for writing in
          </h1>
          <p className="mt-2 text-sm text-on-surface-muted">
            Your message was received anonymously. A volunteer will read it within a few days.
          </p>
          <button
            type="button"
            onClick={() => setState({ kind: "idle" })}
            className="state-layer press mt-6 inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-4 py-2 text-sm font-medium text-on-surface"
          >
            Send another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
        Anonymous · No email needed
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-on-surface sm:text-4xl">
        Send feedback
      </h1>
      <p className="mt-2 text-sm text-on-surface-muted">
        Tell us what helped, what was confusing, or what's missing. We don't collect your name,
        email, or account — just the message you write below.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-4 rounded-3xl bg-surface-container p-6 elev-1"
        noValidate
      >
        <label className="block">
          <span className="text-sm font-medium text-on-surface">Your message</span>
          <textarea
            required
            minLength={8}
            maxLength={1000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What did you come here to do? What worked, what didn't?"
            className="mt-2 min-h-[140px] w-full rounded-2xl border border-outline-variant bg-surface p-3 text-sm text-on-surface focus:border-primary focus:outline-none"
          />
          <span
            className={`mt-1 block text-right text-xs ${
              remaining < 0 ? "text-error" : "text-on-surface-muted"
            }`}
          >
            {remaining} characters left
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-on-surface">Region (optional)</span>
          <input
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            maxLength={80}
            placeholder="e.g. Quezon City, Cebu, Davao"
            className="mt-2 h-11 w-full rounded-full border border-outline-variant bg-surface px-4 text-sm focus:border-primary focus:outline-none"
          />
        </label>

        {/* Honeypot: hidden from real users, visible to naive bots */}
        <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label>
            Website
            <input
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </label>
        </div>

        {state.kind === "error" && (
          <p
            role="alert"
            className="rounded-2xl bg-error-container px-4 py-3 text-sm text-on-error-container"
          >
            {state.message}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-on-surface-muted">
            No tracking cookies. No IP stored — only a hashed signal to limit spam.
          </p>
          <button
            type="submit"
            disabled={!canSubmit}
            className="state-layer press inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {state.kind === "submitting" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
            Send feedback
          </button>
        </div>
      </form>
    </div>
  );
}
