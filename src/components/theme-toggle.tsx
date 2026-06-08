import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type Theme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

const options: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Light theme" },
  { value: "system", icon: Monitor, label: "System theme" },
  { value: "dark", icon: Moon, label: "Dark theme" },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.value === theme),
  );

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      data-no-color-transition
      className={cn(
        "relative inline-flex items-center gap-1 rounded-full bg-surface-container p-1 elev-1",
        className,
      )}
    >
      {/* Animated indicator pill */}
      <span
        aria-hidden="true"
        data-no-color-transition
        className="pointer-events-none absolute top-1 left-1 h-9 w-9 rounded-full bg-primary shadow-[0_4px_14px_-2px_color-mix(in_oklab,var(--color-primary)_55%,transparent)] transition-[transform,background-color] duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ transform: `translateX(${activeIndex * 40}px)` }}
      />
      {options.map(({ value, icon: Icon, label }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            role="radio"
            aria-checked={active}
            aria-label={label}
            onClick={() => setTheme(value)}
            data-no-color-transition
            className={cn(
              "state-layer relative z-10 inline-flex h-9 w-9 items-center justify-center rounded-full",
              active ? "text-primary-foreground" : "text-on-surface-muted hover:text-on-surface",
            )}

          >
            <Icon
              className={cn(
                "h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                active ? "scale-110 rotate-0" : "scale-100 -rotate-12 opacity-80",
              )}
              aria-hidden="true"
            />

          </button>
        );
      })}
    </div>
  );
}
