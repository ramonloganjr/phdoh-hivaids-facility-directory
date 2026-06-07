import { useState, useCallback } from "react";
import {
  Link2,
  Mail,
  Facebook,
  Linkedin,
  MessageCircle,
  Send,
  Share2,
  Check,
} from "lucide-react";

type ShareBarProps = {
  url: string; // relative path or absolute
  title: string;
  text?: string;
  className?: string;
  label?: string;
  compact?: boolean;
};

/** Resolve a possibly-relative URL to absolute using the current origin. */
function absUrl(url: string) {
  if (typeof window === "undefined") return url;
  try {
    return new URL(url, window.location.origin).toString();
  } catch {
    return url;
  }
}

/**
 * Universal share bar.
 * - Web Share API on supported devices (mobile)
 * - Per-platform intent URLs for X, Facebook, LinkedIn, WhatsApp, Viber,
 *   Telegram, Email
 * - "Copy link" fallback
 *
 * Instagram does not expose a public web share intent for arbitrary URLs;
 * we expose "Copy link" + the native share sheet (which lists Instagram on
 * mobile when the app is installed) instead of a broken IG button.
 */
export function ShareBar({
  url,
  title,
  text,
  className,
  label = "Share this page",
  compact = false,
}: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    const full = absUrl(url);
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Silent: clipboard blocked by permission policy.
    }
  }, [url]);

  const onNativeShare = useCallback(async () => {
    const full = absUrl(url);
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, text: text ?? title, url: full });
      } catch {
        // User cancelled or share failed; no-op.
      }
    } else {
      await onCopy();
    }
  }, [url, title, text, onCopy]);

  const enc = encodeURIComponent;
  const full = absUrl(url);
  const summary = text ?? title;

  const targets: ShareTarget[] = [
    {
      key: "x",
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${enc(full)}&text=${enc(title)}`,
      svg: <XIcon />,
    },
    {
      key: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(full)}`,
      icon: <Facebook className="h-4 w-4" aria-hidden="true" />,
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(full)}`,
      icon: <Linkedin className="h-4 w-4" aria-hidden="true" />,
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      href: `https://api.whatsapp.com/send?text=${enc(`${title} — ${full}`)}`,
      svg: <WhatsAppIcon />,
    },
    {
      key: "viber",
      label: "Viber",
      href: `viber://forward?text=${enc(`${title} — ${full}`)}`,
      svg: <ViberIcon />,
    },
    {
      key: "telegram",
      label: "Telegram",
      href: `https://t.me/share/url?url=${enc(full)}&text=${enc(title)}`,
      icon: <Send className="h-4 w-4" aria-hidden="true" />,
    },
    {
      key: "email",
      label: "Email",
      href: `mailto:?subject=${enc(title)}&body=${enc(`${summary}\n\n${full}`)}`,
      icon: <Mail className="h-4 w-4" aria-hidden="true" />,
    },
  ];

  return (
    <div className={className} aria-label={label} role="group">
      <div className="flex flex-wrap items-center gap-1.5">
        {!compact && (
          <span className="mr-1 text-xs font-medium text-on-surface-muted">
            {label}
          </span>
        )}

        <button
          type="button"
          onClick={onNativeShare}
          aria-label="Open device share sheet (Instagram, Messages, more)"
          title="More — opens device share sheet"
          className="state-layer press inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground elev-1"
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
        </button>

        {targets.map((t) => (
          <a
            key={t.key}
            href={t.href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`Share on ${t.label}`}
            title={t.label}
            className="state-layer press inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-on-surface hover:bg-primary-container hover:text-on-primary-container"
          >
            {t.svg ?? t.icon}
          </a>
        ))}

        <button
          type="button"
          onClick={onCopy}
          aria-label={copied ? "Link copied" : "Copy link"}
          title={copied ? "Copied!" : "Copy link"}
          aria-live="polite"
          className="state-layer press inline-flex h-10 items-center gap-1.5 rounded-full bg-surface-container-high px-3 text-xs font-medium text-on-surface hover:bg-primary-container hover:text-on-primary-container"
        >
          {copied ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Link2 className="h-4 w-4" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

type ShareTarget = {
  key: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  svg?: React.ReactNode;
};

/* --- inline brand glyphs for platforms without a Lucide icon --- */

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2H21.5l-7.51 8.59L23 22h-6.91l-4.84-6.32L5.6 22H2.34l8.04-9.19L1.5 2h7.08l4.38 5.79L18.24 2Zm-2.42 18.06h1.86L7.27 3.84H5.28l10.54 16.22Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.52 3.48A11.94 11.94 0 0 0 12 0C5.37 0 0 5.37 0 12a11.94 11.94 0 0 0 1.64 6.06L0 24l6.18-1.62A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52ZM12 21.82a9.8 9.8 0 0 1-5-1.36l-.36-.21-3.67.96.98-3.58-.23-.37A9.83 9.83 0 1 1 12 21.82Zm5.4-7.36c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.66.15s-.76.97-.93 1.17c-.17.2-.34.22-.64.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.79-1.68-2.09-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.29.3-.49.1-.2.05-.37-.03-.52-.07-.15-.66-1.6-.91-2.19-.24-.58-.48-.5-.66-.51l-.56-.01c-.2 0-.51.07-.78.37s-1.03 1-1.03 2.43 1.06 2.83 1.21 3.03c.15.2 2.08 3.17 5.04 4.44.7.3 1.25.48 1.68.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.69.25-1.28.18-1.4-.07-.13-.27-.2-.57-.34Z" />
    </svg>
  );
}

function ViberIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M11.4 0C9.5.1 5.6.4 3.4 2.4 1.8 4 1.2 6.2 1.2 9c0 2.8.5 5.1 2.2 6.7.8.8 1.9 1.3 3 1.6V21l3-2.6c.4 0 .8.1 1.2.1h.4c1.9 0 5.8-.3 8-2.4 1.7-1.6 2.3-3.9 2.3-6.7 0-2.8-.6-5-2.2-6.6C16.9.5 13.1.2 11.2.1Zm.4 14c-.5 0-1-.1-1.5-.2-.2 0-.4 0-.6.1l-1.8 1.5v-1.6c0-.2-.1-.4-.3-.5-1-.3-1.9-.6-2.4-1.2-1.1-1-1.5-2.7-1.5-5 0-2.4.4-4 1.5-5C6.1 1.1 8.7.7 11.5.6h.4c2.8.1 5.3.4 6.3 1.4 1.1 1 1.5 2.7 1.5 5 0 2.4-.4 4-1.5 5-1.1 1.1-3.4 1.4-6.2 1.5-.1-.5-.2-.5-.2-.5ZM7.4 5.1c.4-.1.7.2.9.6l.6 1.3c.1.3 0 .6-.3.8l-.4.3c-.2.1-.2.3-.1.5.5.8 1 1.4 2.1 2 .2.1.4.1.5 0l.3-.4c.2-.2.6-.3.8-.2l1.3.6c.4.2.5.5.4.9-.2.7-.7 1.4-1.4 1.4-.6 0-2.6-.2-4.4-2-1.7-1.7-2-3.7-2-4.3 0-.7.7-1.3 1.4-1.4Zm5.3-1.1c1.7.1 3 1.4 3.1 3.1 0 .2.1.3.3.3.2 0 .3-.1.3-.3-.1-2-1.6-3.6-3.6-3.7-.2 0-.3.1-.3.3 0 .2.1.3.2.3Zm0 1.2c1.1.1 1.9.9 2 2 0 .2.1.3.3.3s.3-.2.2-.4c-.1-1.4-1.2-2.5-2.5-2.5-.2 0-.3.1-.3.3 0 .1.1.3.3.3Zm.1 1.2c.4.1.7.4.8.8 0 .2.2.3.3.3.2 0 .3-.2.2-.4-.1-.7-.6-1.2-1.3-1.3-.2 0-.3.1-.4.3 0 .1.2.2.4.3Z" />
    </svg>
  );
}
