/**
 * After a new deploy, previously loaded pages (or a stale service-worker cache)
 * point at hashed chunk files that no longer exist, so navigation fails with
 * "Failed to fetch dynamically imported module".
 *
 * Recover by purging every cache + service worker and reloading once
 * (guarded by sessionStorage to avoid loops).
 */
const FLAG = "tn-chunk-reload";

function isChunkError(message: string) {
  return (
    /Failed to fetch dynamically imported module/i.test(message) ||
    /error loading dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message) ||
    /Unable to preload CSS/i.test(message) ||
    /Loading chunk \d+ failed/i.test(message)
  );
}

async function purge() {
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
  } catch {
    /* ignore */
  }
  try {
    if (typeof caches !== "undefined") {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch {
    /* ignore */
  }
}

async function recover(message: string) {
  if (!isChunkError(message)) return;
  try {
    if (sessionStorage.getItem(FLAG)) return;
    sessionStorage.setItem(FLAG, "1");
  } catch {
    /* ignore */
  }
  await purge();
  // Cache-bust the document itself so the browser can't serve stale HTML.
  const url = new URL(window.location.href);
  url.searchParams.set("v", Date.now().toString(36));
  window.location.replace(url.toString());
}

export function installChunkReload() {
  if (typeof window === "undefined") return;
  try {
    // Clear the guard on a successful load.
    window.addEventListener("load", () => {
      try {
        sessionStorage.removeItem(FLAG);
      } catch {
        /* ignore */
      }
    });
  } catch {
    /* ignore */
  }
  window.addEventListener("error", (e) => {
    void recover(String(e?.message ?? ""));
  });
  window.addEventListener("unhandledrejection", (e) => {
    const reason = (e as PromiseRejectionEvent).reason;
    void recover(String(reason?.message ?? reason ?? ""));
  });
}
