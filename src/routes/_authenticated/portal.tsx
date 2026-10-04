import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Container, seo } from "@/components/site/blocks";
import { ensureAccount, getMySecurityEvents, logAccountEvent, updateProfile } from "@/lib/accounts.functions";
import { getMyConsultations } from "@/lib/consultations.functions";
import { ROLE_LABELS, SECURITY_EVENT_LABELS, STATUS_LABELS, type AppRole, type ConsultationStatus } from "@/lib/areas";
import { passwordProblem } from "../auth";

export const Route = createFileRoute("/_authenticated/portal")({
  head: () => ({ meta: seo("Mi cuenta | NATXAJO CORPORATION", "Portal corporativo: perfil, consultas y seguridad de su cuenta.") }),
  component: Portal,
});

const input = "w-full rounded-sm border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-brand";
const fmt = (d: string) => new Date(d).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" });

function Portal() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const ensure = useServerFn(ensureAccount);
  const save = useServerFn(updateProfile);
  const log = useServerFn(logAccountEvent);
  const fetchCons = useServerFn(getMyConsultations);
  const fetchEvents = useServerFn(getMySecurityEvents);
  const acc = useQuery({ queryKey: ["account"], queryFn: () => ensure() });
  const cons = useQuery({ queryKey: ["my-consultations"], queryFn: () => fetchCons() });
  const events = useQuery({ queryKey: ["my-events"], queryFn: () => fetchEvents() });
  const [tab, setTab] = useState<"consultas" | "perfil" | "seguridad">("consultas");

  if (acc.isLoading) return <Container className="py-24 text-sm text-muted-foreground">Cargando…</Container>;
  if (acc.error || !acc.data) return <Container className="py-24 text-sm text-destructive">No se pudo cargar su cuenta.</Container>;
  const { profile, roles, email } = acc.data;
  const isStaff = roles.includes("admin") || roles.includes("super_admin");

  const signOut = async (scope: "local" | "global") => {
    await log({ data: { type: "logout" } }).catch(() => {});
    await supabase.auth.signOut({ scope });
    qc.clear();
    nav({ to: "/auth" });
  };

  const onProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    try {
      await save({ data: { first_name: fd["first_name"] ?? "", last_name: fd["last_name"] ?? "", company: fd["company"] ?? "", phone: fd["phone"] ?? "", country: fd["country"] ?? "" } });
      toast.success("Perfil actualizado");
      acc.refetch();
    } catch {
      toast.error("No se pudo actualizar el perfil");
    }
  };

  const onPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const p = String(fd.get("password") ?? "");
    const prob = passwordProblem(p);
    if (prob) return void toast.error(prob);
    if (p !== fd.get("password2")) return void toast.error("Las contraseñas no coinciden");
    const { error } = await supabase.auth.updateUser({ password: p });
    if (error) return void toast.error("No se pudo cambiar la contraseña (puede requerir volver a iniciar sesión).");
    await log({ data: { type: "password_changed" } }).catch(() => {});
    form.reset();
    toast.success("Contraseña actualizada");
  };

  const tabs = [["consultas", "Mis consultas"], ["perfil", "Perfil"], ["seguridad", "Seguridad"]] as const;

  return (
    <section className="py-16 md:py-20">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-6">
          <div>
            <p className="eyebrow text-brand">Portal corporativo</p>
            <h1 className="mt-2 text-3xl font-semibold">{[profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || email}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{email} · {roles.map((r) => ROLE_LABELS[r as AppRole]).join(", ")}</p>
          </div>
          <div className="flex gap-2">
            {isStaff && <Link to="/admin" className="rounded-sm bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-brand">Panel admin</Link>}
            <button onClick={() => signOut("local")} className="rounded-sm border px-4 py-2 text-sm hover:bg-muted">Cerrar sesión</button>
          </div>
        </div>
        <div className="mt-6 flex gap-6 border-b text-sm">
          {tabs.map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`-mb-px border-b-2 pb-3 ${tab === k ? "border-brand text-foreground" : "border-transparent text-muted-foreground"}`}>{l}</button>
          ))}
        </div>

        {tab === "consultas" && (
          <div className="mt-8">
            <div className="mb-4 flex justify-between">
              <p className="text-sm text-muted-foreground">Consultas enviadas con su cuenta iniciada.</p>
              <Link to="/contacto" className="text-sm text-brand underline">Nueva consulta</Link>
            </div>
            {cons.data?.length ? (
              <div className="divide-y border bg-card">
                {cons.data.map((c) => (
                  <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                    <div><p className="font-mono text-xs text-muted-foreground">{c.public_id} · {fmt(c.created_at)}</p><p className="mt-1 font-medium">{c.subject}</p><p className="text-xs text-muted-foreground">{c.area}</p></div>
                    <span className="rounded-sm border px-2 py-1 text-xs">{STATUS_LABELS[c.status as ConsultationStatus]}</span>
                  </div>
                ))}
              </div>
            ) : <p className="border bg-card p-6 text-sm text-muted-foreground">Aún no tiene consultas.</p>}
          </div>
        )}

        {tab === "perfil" && (
          <form onSubmit={onProfile} className="mt-8 grid max-w-2xl gap-4 border bg-card p-6 md:grid-cols-2">
            {([["first_name", "Nombre"], ["last_name", "Apellido"], ["company", "Empresa"], ["phone", "Teléfono"], ["country", "País"]] as const).map(([k, l]) => (
              <label key={k} className="block text-sm"><span className="eyebrow mb-1.5 block text-muted-foreground">{l}</span><input name={k} defaultValue={profile?.[k] ?? ""} maxLength={120} className={input} /></label>
            ))}
            <button className="rounded-sm bg-primary px-5 py-2.5 text-sm text-primary-foreground hover:bg-brand md:col-span-2 md:justify-self-start">Guardar cambios</button>
          </form>
        )}

        {tab === "seguridad" && (
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <form onSubmit={onPassword} className="grid gap-3 border bg-card p-6">
              <h2 className="font-semibold">Cambiar contraseña</h2>
              <input name="password" type="password" placeholder="Nueva contraseña" autoComplete="new-password" className={input} />
              <input name="password2" type="password" placeholder="Repetir contraseña" autoComplete="new-password" className={input} />
              <button className="justify-self-start rounded-sm bg-primary px-5 py-2.5 text-sm text-primary-foreground hover:bg-brand">Actualizar</button>
              <hr className="my-2" />
              <button type="button" onClick={() => signOut("global")} className="justify-self-start rounded-sm border px-5 py-2.5 text-sm hover:bg-muted">Cerrar sesión en todos los dispositivos</button>
            </form>
            <div className="border bg-card p-6">
              <h2 className="font-semibold">Actividad reciente</h2>
              <ul className="mt-3 divide-y text-sm">
                {(events.data ?? []).map((ev) => (
                  <li key={ev.id} className="flex justify-between gap-3 py-2"><span>{SECURITY_EVENT_LABELS[ev.event_type] ?? ev.event_type}</span><span className="text-xs text-muted-foreground">{ev.user_agent_summary} · {fmt(ev.created_at)}</span></li>
                ))}
                {!events.data?.length && <li className="py-2 text-muted-foreground">Sin actividad registrada.</li>}
              </ul>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
