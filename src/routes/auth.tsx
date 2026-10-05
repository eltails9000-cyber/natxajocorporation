import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Container, seo } from "@/components/site/blocks";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { mode?: Mode } => (s["mode"] === "signup" || s["mode"] === "forgot" ? { mode: s["mode"] } : {}),
  head: () => ({ meta: seo("Acceso | NATXAJO CORPORATION", "Inicie sesión o cree su cuenta en el portal corporativo de NATXAJO CORPORATION.") }),
  component: AuthPage,
});

const input = "w-full rounded-sm border border-input bg-card px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-ring/20";
type Mode = "login" | "signup" | "forgot";

export function passwordProblem(p: string) {
  if (p.length < 10) return "Mínimo 10 caracteres";
  if (!/[a-z]/.test(p) || !/[A-Z]/.test(p) || !/\d/.test(p)) return "Debe incluir mayúsculas, minúsculas y números";
  return null;
}

function AuthPage() {
  const nav = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<Mode>(search.mode ?? "login");
  const [mfa, setMfa] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.mfa.getAuthenticatorAssuranceLevel().then(({ data }) => {
      if (data && data.currentLevel && (data.nextLevel !== "aal2" || data.currentLevel === "aal2")) supabase.auth.getSession().then(({ data: s }) => s.session && nav({ to: "/portal" }));
    });
  }, [nav]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim().toLowerCase();
    const password = String(fd.get("password") ?? "");
    if (!/^\S+@\S+\.\S+$/.test(email)) return void toast.error("Correo inválido");
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return void toast.error(error.message.includes("confirm") ? "Debe verificar su correo antes de ingresar." : "Credenciales inválidas.");
        const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
          const { data: f } = await supabase.auth.mfa.listFactors();
          const factor = f?.totp.find((x) => x.status === "verified");
          if (factor) return void setMfa(factor.id);
        }
        nav({ to: "/portal" });
      } else if (mode === "signup") {
        const prob = passwordProblem(password);
        if (prob) return void toast.error(prob);
        if (password !== fd.get("password2")) return void toast.error("Las contraseñas no coinciden");
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: { first_name: String(fd.get("first_name") ?? "").slice(0, 80), last_name: String(fd.get("last_name") ?? "").slice(0, 80) },
          },
        });
        if (error) return void toast.error(error.message.toLowerCase().includes("pwned") || error.message.toLowerCase().includes("weak") ? "Esa contraseña es demasiado común o filtrada. Elija otra." : "No se pudo crear la cuenta.");
        toast.success("Cuenta creada. Revise su correo para verificarla.");
        setMode("login");
      } else {
        await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        toast.success("Si existe una cuenta asociada a este correo, recibirás instrucciones.");
        setMode("login");
      }
    } finally {
      setBusy(false);
    }
  };

  const onMfa = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = String(new FormData(e.currentTarget).get("code") ?? "").trim();
    setBusy(true);
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: mfa!, code });
    setBusy(false);
    if (error) return void toast.error("Código incorrecto");
    nav({ to: "/portal" });
  };
  if (mfa)
    return (
      <section className="py-20 md:py-28">
        <Container className="max-w-md">
          <h1 className="text-3xl font-semibold">Verificación en dos pasos</h1>
          <form onSubmit={onMfa} className="mt-8 grid gap-4 border bg-card p-8">
            <input name="code" inputMode="numeric" maxLength={6} autoFocus placeholder="Código de 6 dígitos" className={input} />
            <button disabled={busy} className="rounded-sm bg-primary px-6 py-3 text-sm text-primary-foreground">Verificar</button>
            <button type="button" onClick={async () => { await supabase.auth.signOut(); setMfa(null); }} className="text-xs text-muted-foreground">Cancelar</button>
          </form>
        </Container>
      </section>
    );

  const titles = { login: "Iniciar sesión", signup: "Crear cuenta", forgot: "Recuperar contraseña" };
  return (
    <section className="py-20 md:py-28">
      <Container className="max-w-md">
        <p className="eyebrow text-brand">Portal corporativo</p>
        <h1 className="mt-3 text-3xl font-semibold">{titles[mode]}</h1>
        <form onSubmit={onSubmit} className="mt-8 grid gap-4 border bg-card p-8">
          {mode === "signup" && (
            <div className="grid grid-cols-2 gap-3">
              <input name="first_name" placeholder="Nombre" required maxLength={80} className={input} />
              <input name="last_name" placeholder="Apellido" required maxLength={80} className={input} />
            </div>
          )}
          {mode === "signup" && (
            <label className="flex items-start gap-2 text-xs text-muted-foreground">
              <input type="checkbox" name="terms" required className="mt-0.5" />
              <span>Acepto los <a href="/terminos" target="_blank" className="underline">Términos</a> y la <a href="/privacidad" target="_blank" className="underline">Política de privacidad</a>.</span>
            </label>
          )}
          <input name="email" type="email" placeholder="Correo electrónico" autoComplete="email" required className={input} />
          {mode !== "forgot" && <input name="password" type="password" placeholder="Contraseña" autoComplete={mode === "login" ? "current-password" : "new-password"} required className={input} />}
          {mode === "signup" && <input name="password2" type="password" placeholder="Repetir contraseña" autoComplete="new-password" required className={input} />}
          {mode === "signup" && <p className="text-xs text-muted-foreground">Mínimo 10 caracteres con mayúsculas, minúsculas y números.</p>}
          <button disabled={busy} className="rounded-sm bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-brand disabled:opacity-60">
            {busy ? "Procesando…" : titles[mode]}
          </button>
          <div className="flex justify-between text-xs text-muted-foreground">
            {mode === "login" ? (
              <>
                <button type="button" onClick={() => setMode("signup")} className="hover:text-foreground">Crear cuenta</button>
                <button type="button" onClick={() => setMode("forgot")} className="hover:text-foreground">¿Olvidó su contraseña?</button>
              </>
            ) : (
              <button type="button" onClick={() => setMode("login")} className="hover:text-foreground">Volver a iniciar sesión</button>
            )}
          </div>
        </form>
      </Container>
    </section>
  );
}
