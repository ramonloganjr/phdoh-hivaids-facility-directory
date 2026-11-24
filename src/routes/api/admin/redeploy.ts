import { createFileRoute } from "@tanstack/react-router";

/**
 * POST /api/admin/redeploy — admin-only Vercel redeploy for the mobile app's
 * dashboard. Requires `Authorization: Bearer <Supabase access token>` from an
 * account with the admin role; the deploy hook URL never leaves the server.
 */

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export const Route = createFileRoute("/api/admin/redeploy")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { assertAdminBearer, triggerDeployHook, DeployError } =
          await import("@/lib/deploy.server");
        try {
          await assertAdminBearer(request.headers.get("authorization"));
          return json(200, await triggerDeployHook());
        } catch (err) {
          if (err instanceof DeployError)
            return json(err.status, { ok: false, error: err.message });
          console.error("[api/admin/redeploy]", err);
          return json(500, { ok: false, error: "Couldn't trigger the deploy. Try again shortly." });
        }
      },
    },
  },
});
