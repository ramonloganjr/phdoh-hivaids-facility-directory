import { createFileRoute } from "@tanstack/react-router";
import { useDeferredValue, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { faqCategories, faqs, type FaqItem } from "@/data/faqs";
import { cn } from "@/lib/utils";
import { track } from "@/lib/metrics";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "HIV & AIDS — Frequently Asked Questions" },
      {
        name: "description",
        content:
          "Plain-language answers to the most common questions about HIV & AIDS — transmission, prevention, testing, treatment, and living well — based on UNAIDS guidance.",
      },
      { property: "og:title", content: "HIV & AIDS — Frequently Asked Questions" },
      {
        property: "og:description",
        content:
          "Authoritative answers to common HIV & AIDS questions, distilled from UNAIDS.",
      },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] =
    useState<(typeof faqCategories)[number]>("All");
  const deferred = useDeferredValue(query.trim().toLowerCase());

  const visible = useMemo(() => {
    return faqs.filter((f) => {
      if (category !== "All" && f.category !== category) return false;
      if (!deferred) return true;
      return (
        f.question.toLowerCase().includes(deferred) ||
        f.answer.toLowerCase().includes(deferred)
      );
    });
  }, [category, deferred]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="animate-fade-up">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
          Knowledge base
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-on-surface sm:text-4xl">
          Your questions about HIV &amp; AIDS, answered
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-muted">
          Clear, judgment-free answers in plain language, drawn from{" "}
          <a
            href="https://www.unaids.org/en/frequently-asked-questions-about-hiv-and-aids"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
          >
            UNAIDS
          </a>{" "}
          guidance. This is general information, not medical advice — for anything personal, talk
          with a healthcare provider you trust.
        </p>
      </header>

      {/* Search */}
      <div className="mt-8 flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container px-4 py-2.5 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
        <Search className="h-4 w-4 text-on-surface-muted" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions…"
          aria-label="Search FAQs"
          className="flex-1 bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-muted"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="state-layer rounded-full px-2 py-0.5 text-xs text-on-surface-muted hover:text-on-surface"
          >
            Clear
          </button>
        )}
      </div>

      {/* Categories */}
      <div
        role="radiogroup"
        aria-label="Filter by category"
        className="mt-4 flex flex-wrap gap-2"
      >
        {faqCategories.map((c) => {
          const active = category === c;
          return (
            <button
              key={c}
              role="radio"
              aria-checked={active}
              onClick={() => setCategory(c)}
              className={cn(
                "state-layer rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-outline-variant bg-surface text-on-surface-muted hover:text-on-surface",
              )}
            >
              {c}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-on-surface-muted" aria-live="polite">
        Showing <span className="tabular-nums text-on-surface">{visible.length}</span> of{" "}
        {faqs.length} questions
      </p>

      <div className="mt-4 space-y-2">
        {visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-outline-variant bg-surface p-8 text-center text-sm text-on-surface-muted">
            Nothing matches that search yet. Try a different word, or pick another category above.
          </div>
        ) : (
          visible.map((f, i) => <FaqRow key={f.id} item={f} index={i} />)
        )}
      </div>
    </div>
  );
}

function FaqRow({ item, index }: { item: FaqItem; index: number }) {
  const [open, setOpen] = useState(false);
  const panelId = `faq-panel-${item.id}`;
  const buttonId = `faq-trigger-${item.id}`;
  const toggle = () => {
    setOpen((v) => {
      const next = !v;
      if (next) track("faq_opened", { key: "faq_id", value: item.id });
      return next;
    });
  };
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-outline-variant bg-surface-container transition-colors",
        open && "bg-surface-container-high",
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}
    >
      <h3>
        <button
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={toggle}
          className="state-layer flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        >
          <span className="flex items-baseline gap-3">
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.14em] text-primary sm:inline">
              {item.category}
            </span>
            <span className="text-sm font-medium text-on-surface sm:text-[15px]">
              {item.question}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 flex-shrink-0 text-on-surface-muted transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
              open && "rotate-180 text-primary",
            )}
            aria-hidden="true"
          />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        className="px-5 pb-5 text-sm leading-relaxed text-on-surface-muted"
      >
        {item.answer}
      </div>
    </div>
  );
}
