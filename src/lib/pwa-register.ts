// Guarded service-worker registration wrapper.
// Never registers in dev or inside iframes. Visit ?sw=off to forcibly unregister.

const SW_URL = "/sw.js";

function inIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

async function unregisterMatching() {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    regs
      .filter((r) => r.active?.scriptURL?.endsWith(SW_URL))
      .map((r) => r.unregister()),
  );
}

export async function registerPWA(): Promise<void> {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  const off = new URL(window.location.href).searchParams.get("sw") === "off";
  const prod = import.meta.env.PROD;

  if (!prod || inIframe() || off) {
    await unregisterMatching();
    return;
  }

  try {
    await navigator.serviceWorker.register(SW_URL, { scope: "/" });
  } catch (err) {
    console.warn("[pwa] register failed", err);
  }
}
