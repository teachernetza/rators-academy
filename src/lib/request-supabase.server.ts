// Builds a Supabase client for the *current* request using the bearer token the
// browser already attached (functionMiddleware -> auth-attacher). Every query
// therefore runs as the signed-in person, so database row-level security and
// the guarded database functions are the single source of truth for
// permissions. No service key, no privileged access, works on any host.
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export function userClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];

  if (!url || !key) {
    const missing = [
      ...(!url ? ["SUPABASE_URL"] : []),
      ...(!key ? ["SUPABASE_PUBLISHABLE_KEY"] : []),
    ];
    throw new Error(
      `Faltan variables de entorno de Supabase: ${missing.join(", ")}. Añádelas en el panel de hosting.`,
    );
  }

  const request = getRequest();
  const auth = request?.headers?.get("authorization") ?? "";

  if (!auth.startsWith("Bearer ")) {
    throw new Error("Debes iniciar sesion para continuar.");
  }

  return createClient<Database>(url, key, {
    global: { headers: { Authorization: auth } },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
