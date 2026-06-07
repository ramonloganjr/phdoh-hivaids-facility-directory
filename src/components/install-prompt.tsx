import { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "pwa-install-dismissed-at";
const DISMISS_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

function recentlyDismissed(): boolean {
  try {
    const ts = Number(localStorage.getItem(DISMISS_KEY) || 0);
    return ts > 0 && Date.now() - ts < DISMISS_TTL_MS;
  } catch {
    return false;
  }
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // @ts-expect-error iOS Safari
    window.navigator.standalone === true
  );
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) && !/CriOS|FxiOS/.test(navigator.userAgent);
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      // Show after a short delay so it doesn't compete with initial paint.
      window.setTimeout(() => setOpen(true), 2500);
    };
    window.addEventListener("beforeinstallprompt", onBIP);

    // iOS Safari doesn't fire beforeinstallprompt — show a manual hint once.
    let iosTimer: number | undefined;
    if (isIOS()) {
      iosTimer = window.setTimeout(() => {
        setIosHint(true);
        setOpen(true);
      }, 6000);
    }

    const onInstalled = () => {
      setOpen(false);
      setDeferred(null);
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
      if (iosTimer) window.clearTimeout(iosTimer);
    };
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* noop */
    }
    setOpen(false);
  };

  const install = async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "dismissed") dismiss();
      else setOpen(false);
    } finally {
      setDeferred(null);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-desc"
      className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:bottom-4 sm:left-auto sm:right-4 sm:px-0"
    >
      <div className="mx-auto flex max-w-md items-start gap-3 rounded-3xl border border-outline-variant bg-surface-container-high p-4 elev-3 sm:max-w-sm">
        <span
          className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container"
          aria-hidden="true"
        >
          <Smartphone className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <p id="pwa-install-title" className="text-sm font-semibold text-on-surface">
            Install HIV Care Directory
          </p>
          <p id="pwa-install-desc" className="mt-1 text-xs leading-relaxed text-on-surface-muted">
            {iosHint
              ? "Tap the Share icon in Safari, then choose “Add to Home Screen” for one-tap access offline."
              : "Add to your home screen for faster access, offline browsing, and a full-screen app experience."}
          </p>
          <div className="mt-3 flex items-center gap-2">
            {deferred && !iosHint && (
              <button
                type="button"
                onClick={install}
                className="state-layer press inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground elev-1"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Install
              </button>
            )}
            <button
              type="button"
              onClick={dismiss}
              className="state-layer inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium text-on-surface-muted hover:text-on-surface"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="state-layer -mr-1 -mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-on-surface-muted hover:text-on-surface"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
