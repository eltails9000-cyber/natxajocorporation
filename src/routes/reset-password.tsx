import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Container, seo } from "@/components/site/blocks";
import { passwordProblem } from "./auth";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: seo("Nueva contraseña | NATXAJO CORPORATION", "Defina una nueva contraseña para su cuenta del portal NATXAJO.") }),
  component: Page,
});

const input = "w-full rounded-sm border border-input bg-card px-4 py-3 text-sm outline-none focus:border-brand";

function Page() {
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const p = String(fd.get("password") ?? "");
    const prob = passwordProblem(p);
    if (prob) return void toast.error(prob);
    if (p !== fd.get("password2")) return void toast.error("Las contraseñas no coinciden");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: p });
    setBusy(false);
    if (error) return void toast.error("El enlace expiró o la contraseña no es válida.");
    await supabase.auth.signOut({ scope: "global" });
    toast.success("Contraseña actualizada. Inicie sesión nuevamente.");
    nav({ to: "/auth" });
  };
  return (
    <section className="py-20 md:py-28">
      <Container className="max-w-md">
        <h1 className="text-3xl font-semibold">Nueva contraseña</h1>
        <form onSubmit={onSubmit} className="mt-8 grid gap-4 border bg-card p-8">
          <input name="password" type="password" placeholder="Nueva contraseña" autoComplete="new-password" className={input} />
          <input name="password2" type="password" placeholder="Repetir contraseña" autoComplete="new-password" className={input} />
          <button disabled={busy} className="rounded-sm bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-brand disabled:opacity-60">Guardar</button>
        </form>
      </Container>
    </section>
  );
}
