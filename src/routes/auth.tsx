import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Container, seo } from "@/components/site/blocks";

export const Route = createFileRoute("/auth")({
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
  const [mode, setMode] = useState<Mode>("login");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => data.session && nav({ to: "/portal" }));
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
        toast.success("Si el correo existe, recibirá un enlace de recuperación.");
        setMode("login");
      }
    } finally {
      setBusy(false);
    }
  };

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
