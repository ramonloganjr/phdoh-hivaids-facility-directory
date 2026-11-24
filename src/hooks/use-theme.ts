import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "doh-hiv-theme";
const THEMES: readonly Theme[] = ["light", "dark", "system"];
const DARK_QUERY = "(prefers-color-scheme: dark)";

// One preference shared by every toggle on the page. The header renders
// separate desktop and mobile toggles, and they must never disagree.
let current: Theme | null = null;
let systemQuery: MediaQueryList | null = null;
const listeners = new Set<() => void>();

function readStored(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return THEMES.includes(saved as Theme) ? (saved as Theme) : "system";
  } catch {
    return "system";
  }
}

function computeDark(theme: Theme): boolean {
  if (theme === "dark") return true;
  if (theme === "light") return false;
  return window.matchMedia(DARK_QUERY).matches;
}

function applyTheme(theme: Theme, animate: boolean) {
  const isDark = computeDark(theme);
  const scheme = isDark ? "dark" : "light";
  const root = document.documentElement;
  // THEME_INIT_SCRIPT in __root.tsx applies the saved theme before first
  // paint, so on page load there is usually nothing left to change.
  if (root.classList.contains("dark") === isDark && root.style.colorScheme === scheme) return;

  const commit = () => {
    root.classList.toggle("dark", isDark);
    root.style.colorScheme = scheme;
  };
  const canAnimate =
    animate &&
    typeof document.startViewTransition === "function" &&
    document.visibilityState === "visible" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canAnimate) {
    commit();
    return;
  }
  // Native cross-fade. A newer transition (a quick second click) skips this
  // one and rejects `ready`, but the theme still commits, so ignore that.
  document.startViewTransition(commit).ready.catch(() => {});
}

function onSystemChange() {
  if (current === "system") applyTheme("system", true);
}

function getSnapshot(): Theme {
  current ??= readStored();
  return current;
}

// The server can't read the saved theme, so it renders "system"; React
// re-renders with the saved value right after hydration.
function getServerSnapshot(): Theme {
  return "system";
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) {
    systemQuery = window.matchMedia(DARK_QUERY);
    systemQuery.addEventListener("change", onSystemChange);
    // Covers the rare case where the init script couldn't run (storage blocked).
    applyTheme(getSnapshot(), false);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) systemQuery?.removeEventListener("change", onSystemChange);
  };
}

function setTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage can be blocked (private browsing); the choice still applies now.
  }
  if (theme === getSnapshot()) return;
  current = theme;
  applyTheme(theme, true);
  listeners.forEach((listener) => listener());
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { theme, setTheme } as const;
}
