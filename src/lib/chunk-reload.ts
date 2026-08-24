/**
 * After a new deploy, previously loaded pages point at hashed chunk files that
 * no longer exist, so navigation fails with
 * "Failed to fetch dynamically imported module".
 * Recover by reloading once (guarded by sessionStorage to avoid loops).
 */
const FLAG = "tn-chunk-reload";

function isChunkError(message: string) {
  return (
    /Failed to fetch dynamically imported module/i.test(message) ||
    /error loading dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message)
  );
}

function recover(message: string) {
  if (!isChunkError(message)) return;
  try {
    if (sessionStorage.getItem(FLAG)) return;
    sessionStorage.setItem(FLAG, "1");
  } catch {
    /* ignore */
  }
  window.location.reload();
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
  window.addEventListener("error", (e) => recover(String(e?.message ?? "")));
  window.addEventListener("unhandledrejection", (e) => {
    const reason = (e as PromiseRejectionEvent).reason;
    recover(String(reason?.message ?? reason ?? ""));
  });
}
