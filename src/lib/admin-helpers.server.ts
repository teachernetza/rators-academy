// Server-only helpers for admin server functions.
// Kept in a separate .server.ts module so TanStack's server-fn splitter
// doesn't strip them from the worker bundle (which would 500 with
// "Server function info not found").
//
// Everything here runs as the signed-in administrator: the client is built
// from the caller's own session token, so row-level security decides what the
// admin may touch. No service key is involved.
import { userClient } from "@/lib/request-supabase.server";

export function getDb() {
  return userClient();
}

export async function assertAdmin(userId: string) {
  const { data } = await userClient()
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (!data || data.role !== "admin") throw new Error("Forbidden");
}

export async function getRole(userId: string) {
  const { data } = await userClient()
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  return data?.role as "admin" | "teacher" | "student" | undefined;
}
