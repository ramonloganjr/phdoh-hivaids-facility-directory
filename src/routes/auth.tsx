import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldCheck } from "lucide-react";
const logoLight = { url: "/brand/logo-light.svg" };
const logoDark = { url: "/brand/logo-dark.svg" };

// Validate the optional ?redirect= param. Only allow same-site paths
// (must start with a single "/") to prevent open-redirect attacks.
const safePath = z
  .string()
  .max(512)
  .regex(/^\/(?!\/)/, "Must be a same-site path")
  .optional()
  .catch(undefined);

const AuthSearch = z.object({ redirect: safePath });

export const Route = createFileRoute("/auth")({
  validateSearch: (search) => AuthSearch.parse(search),
  head: () => ({
    meta: [
      { title: "Sign in — HIV Care Philippines" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Admin sign-in for HIV Care Philippines." },
    ],
  }),
  component: AuthPage,
});

async function userHasAdminRole(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const destination = redirect ?? "/admin/insights";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled || !data.user) return;
      try {
        if (await userHasAdminRole(data.user.id)) {
          if (!cancelled) navigate({ to: destination, replace: true });
        }
      } catch {
        /* stay on sign-in */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, destination]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signInError || !signInData.user) {
      setLoading(false);
      setError("That email and password don't match. Check the address, then try again.");
      return;
    }
    try {
      const isAdmin = await userHasAdminRole(signInData.user.id);
      if (!isAdmin) {
        await supabase.auth.signOut();
        setLoading(false);
        setError("This account doesn't have admin access. Contact the site owner if that's wrong.");
        return;
      }
    } catch (err) {
      console.error("Admin role check failed:", err);
      await supabase.auth.signOut();
      setLoading(false);
      setError("We couldn't verify your admin access. Try again in a moment.");
      return;
    }
    setLoading(false);
    navigate({ to: destination, replace: true });
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16 sm:py-24">
      <Link
        to="/"
        aria-label="HIV Care Philippines — home"
        className="state-layer inline-flex w-fit items-center gap-2 rounded-full px-2 py-1.5"
      >
        <img src={logoLight.url} alt="" className="block h-12 w-auto dark:hidden" draggable={false} />
        <img src={logoDark.url} alt="" className="hidden h-12 w-auto dark:block" draggable={false} />
        <span className="sr-only">HIV Care Philippines</span>
      </Link>
      <div className="flex items-center gap-2 text-primary">
        <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Admin sign-in</span>
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-on-surface">Sign in to continue</h1>
      <p className="text-sm text-on-surface-muted">
        This area is for the team that maintains the directory. Public pages stay open to everyone — no
        account needed.
      </p>
      <form onSubmit={onSubmit} className="space-y-4 rounded-3xl bg-surface-container p-6 elev-1" noValidate>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-on-surface">Email</span>
          <input
            type="email"
            required
            inputMode="email"
            autoComplete="email"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-full border border-outline-variant bg-surface px-4 text-sm text-on-surface focus:border-primary focus:outline-none"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-on-surface">Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 w-full rounded-full border border-outline-variant bg-surface px-4 text-sm text-on-surface focus:border-primary focus:outline-none"
          />
        </label>
        {error && (
          <p role="alert" className="rounded-2xl bg-primary-container px-4 py-3 text-sm text-on-primary-container">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !email || !password}
          className="state-layer press inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          Sign in
        </button>
      </form>
    </div>
  );
}
