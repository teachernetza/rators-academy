import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { dashboardPathFor, type AppRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Crear contraseña nueva | Teacher Netza Varo" },
      {
        name: "description",
        content:
          "Define una contraseña nueva para tu cuenta en la plataforma de Teacher Netza Varo y vuelve a entrar.",
      },
      { property: "og:title", content: "Crear contraseña nueva | Teacher Netza Varo" },
      {
        property: "og:description",
        content: "Define una contraseña nueva para tu cuenta.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState<"checking" | "ok" | "invalid">("checking");
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let done = false;
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        done = true;
        setReady("ok");
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        done = true;
        setReady("ok");
      } else {
        setTimeout(() => {
          if (!done) setReady((s) => (s === "ok" ? s : "invalid"));
        }, 2500);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.length < 8) return toast.error("La contraseña debe tener al menos 8 caracteres");
    if (pwd !== confirm) return toast.error("Las contraseñas no coinciden");
    setSaving(true);
    const { data, error } = await supabase.auth.updateUser({ password: pwd });
    if (error) {
      setSaving(false);
      return toast.error(error.message);
    }
    toast.success("Contraseña actualizada");
    let role: AppRole | null = null;
    if (data.user) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();
      role = (prof?.role as AppRole) ?? null;
    }
    setSaving(false);
    navigate({ to: dashboardPathFor(role) as any });
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{ background: "var(--gradient-soft)" }}
    >
      <Card className="w-full max-w-md border-border/60 p-8 shadow-[var(--shadow-elegant)]">
        <h1 className="font-heading text-2xl font-bold">Crear contraseña nueva</h1>

        {ready === "checking" && (
          <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Validando tu enlace…
          </p>
        )}

        {ready === "invalid" && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Este enlace ya caducó o fue usado. Pide uno nuevo para continuar.
            </p>
            <Button asChild className="w-full">
              <Link to="/forgot-password">Pedir un enlace nuevo</Link>
            </Button>
          </div>
        )}

        {ready === "ok" && (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground">Usa al menos 8 caracteres.</p>
            <div className="space-y-2">
              <Label htmlFor="pwd">Nueva contraseña</Label>
              <Input
                id="pwd"
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmar contraseña</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar y entrar
            </Button>
          </form>
        )}

        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a iniciar sesión
        </Link>
      </Card>
    </div>
  );
}
