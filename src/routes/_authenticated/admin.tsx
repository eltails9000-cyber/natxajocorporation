import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Container, seo } from "@/components/site/blocks";
import { adminGetSettings, adminRevokeSessions, adminSetSetting, adminListConsultations, adminListEvents, adminListUsers, adminSetRole, adminSetStatus, adminUpdateConsultation } from "@/lib/admin.functions";
import { CONSULTATION_STATUSES, ROLES, ROLE_LABELS, SECURITY_EVENT_LABELS, STATUS_LABELS, type ConsultationStatus } from "@/lib/areas";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [...seo("Panel administrativo | NATXAJO CORPORATION", "Gestión interna de consultas, usuarios y auditoría."), { name: "robots", content: "noindex" }] }),
  component: Admin,
});

const fmt = (d: string) => new Date(d).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" });
const sel = "rounded-sm border border-input bg-card px-2 py-1.5 text-xs";

function Admin() {
  const [tab, setTab] = useState<"consultas" | "usuarios" | "auditoria" | "config">("consultas");
  const listC = useServerFn(adminListConsultations);
  const cons = useQuery({ queryKey: ["admin-cons"], queryFn: () => listC(), retry: false });

  if (cons.isLoading) return <Container className="py-24 text-sm text-muted-foreground">Cargando…</Container>;
  if (cons.error)
    return (
      <Container className="py-24">
        <p className="text-sm text-destructive">Acceso denegado. Esta sección es solo para administradores.</p>
        <Link to="/portal" className="mt-4 inline-block text-sm text-brand underline">Volver al portal</Link>
      </Container>
    );

  return (
    <section className="py-14">
      <Container className="max-w-[90rem]">
        <p className="eyebrow text-brand">Administración</p>
        <h1 className="mt-2 text-3xl font-semibold">Panel administrativo</h1>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {(["NEW", "IN_REVIEW", "IN_PROGRESS", "CLOSED"] as const).map((s) => (
            <div key={s} className="border bg-card p-4"><p className="eyebrow text-muted-foreground">{STATUS_LABELS[s]}</p><p className="mt-2 text-2xl font-semibold">{(cons.data ?? []).filter((c) => c.status === s).length}</p></div>
          ))}
        </div>
        <div className="mt-6 flex gap-6 border-b text-sm">
          {([["consultas", "Consultas"], ["usuarios", "Usuarios"], ["auditoria", "Auditoría"], ["config", "Configuración"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`-mb-px border-b-2 pb-3 ${tab === k ? "border-brand" : "border-transparent text-muted-foreground"}`}>{l}</button>
          ))}
        </div>
        {tab === "consultas" && <Consultas rows={cons.data ?? []} refetch={() => cons.refetch()} />}
        {tab === "usuarios" && <Usuarios />}
        {tab === "auditoria" && <Auditoria />}
        {tab === "config" && <Config />}
      </Container>
    </section>
  );
}

type Row = Awaited<ReturnType<typeof adminListConsultations>>[number];

function Consultas({ rows, refetch }: { rows: Row[]; refetch: () => void }) {
  const update = useServerFn(adminUpdateConsultation);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const filtered = useMemo(
    () => rows.filter((r) => (!status || r.status === status) && (!q || `${r.public_id} ${r.name} ${r.last_name} ${r.email} ${r.subject} ${r.company ?? ""}`.toLowerCase().includes(q.toLowerCase()))),
    [rows, q, status],
  );
  const act = async (id: string, data: { status?: ConsultationStatus; note?: string }) => {
    try {
      await update({ data: { id, ...data } });
      toast.success("Guardado");
      setNote("");
      refetch();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };
  return (
    <div className="mt-6">
      <div className="mb-4 flex flex-wrap gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" className="w-64 rounded-sm border border-input bg-card px-3 py-2 text-sm" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={sel}>
          <option value="">Todos los estados</option>
          {CONSULTATION_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <span className="self-center text-xs text-muted-foreground">{filtered.length} resultados</span>
      </div>
      <div className="divide-y border bg-card">
        {filtered.map((r) => (
          <div key={r.id} className="p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button onClick={() => setOpen(open === r.id ? null : r.id)} className="text-left">
                <p className="font-mono text-xs text-muted-foreground">{r.public_id} · {fmt(r.created_at)} · {r.area}</p>
                <p className="mt-1 font-medium">{r.subject}</p>
                <p className="text-xs text-muted-foreground">{r.name} {r.last_name} · {r.email}</p>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase text-muted-foreground">correo: {r.notification_status === "sent" ? "enviado" : r.notification_status === "failed" ? "fallido" : "pendiente"}</span>
                <select value={r.status} onChange={(e) => act(r.id, { status: e.target.value as ConsultationStatus })} className={sel}>
                  {CONSULTATION_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
            </div>
            {open === r.id && (
              <div className="mt-4 grid gap-3 border-t pt-4">
                <p className="text-xs text-muted-foreground">Empresa: {r.company ?? "—"} · Teléfono: {r.phone ?? "—"} · País: {r.country ?? "—"}</p>
                <p className="whitespace-pre-wrap">{r.message}</p>
                <div className="flex gap-2">
                  <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} placeholder="Nota interna…" className="flex-1 rounded-sm border border-input bg-card px-3 py-2 text-sm" />
                  <button disabled={!note.trim()} onClick={() => act(r.id, { note })} className="rounded-sm bg-primary px-4 text-sm text-primary-foreground disabled:opacity-50">Añadir nota</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {!filtered.length && <p className="p-6 text-sm text-muted-foreground">Sin consultas.</p>}
      </div>
    </div>
  );
}

function Usuarios() {
  const list = useServerFn(adminListUsers);
  const setRole = useServerFn(adminSetRole);
  const setStatus = useServerFn(adminSetStatus);
  const revoke = useServerFn(adminRevokeSessions);
  const users = useQuery({ queryKey: ["admin-users"], queryFn: () => list() });
  const run = async (p: Promise<unknown>) => {
    try { await p; toast.success("Actualizado"); users.refetch(); } catch (e) { toast.error((e as Error).message); }
  };
  if (!users.data) return <p className="mt-6 text-sm text-muted-foreground">Cargando…</p>;
  const { isSuper, me } = users.data;
  return (
    <div className="mt-6 overflow-x-auto border bg-card">
      <table className="w-full text-sm">
        <thead className="border-b text-left text-xs text-muted-foreground"><tr><th className="p-3">Usuario</th><th>Verificado</th><th>Último acceso</th><th>Roles</th><th>Estado</th></tr></thead>
        <tbody className="divide-y">
          {users.data.users.map((u) => (
            <tr key={u.id}>
              <td className="p-3"><p className="font-medium">{u.name || "—"}</p><p className="text-xs text-muted-foreground">{u.email}</p></td>
              <td>{u.verified ? "Sí" : "No"}</td>
              <td className="text-xs">{u.last_sign_in_at ? fmt(u.last_sign_in_at) : "—"}</td>
              <td>
                <div className="flex flex-wrap gap-1">
                  {ROLES.map((r) => {
                    const has = u.roles.includes(r);
                    return (
                      <button key={r} disabled={!isSuper} onClick={() => run(setRole({ data: { userId: u.id, role: r, grant: !has } }))}
                        className={`rounded-sm border px-1.5 py-0.5 text-[10px] ${has ? "border-brand bg-brand/10" : "text-muted-foreground"} disabled:cursor-default`}>{ROLE_LABELS[r]}</button>
                    );
                  })}
                </div>
              </td>
              <td>
                <select value={u.status} disabled={u.id === me} onChange={(e) => run(setStatus({ data: { userId: u.id, status: e.target.value as "active" | "suspended" | "blocked" } }))} className={sel}>
                  <option value="active">Activa</option><option value="suspended">Suspendida</option><option value="blocked">Bloqueada</option>
                </select>
                {u.id !== me && <button onClick={() => run(revoke({ data: { userId: u.id } }))} className="ml-2 text-[10px] text-muted-foreground underline">Cerrar sesiones</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!isSuper && <p className="p-3 text-xs text-muted-foreground">Solo SUPER_ADMIN puede modificar roles.</p>}
    </div>
  );
}

function Auditoria() {
  const list = useServerFn(adminListEvents);
  const ev = useQuery({ queryKey: ["admin-events"], queryFn: () => list() });
  return (
    <ul className="mt-6 divide-y border bg-card text-sm">
      {(ev.data ?? []).map((e) => (
        <li key={e.id} className="flex flex-wrap justify-between gap-2 p-3">
          <span>{SECURITY_EVENT_LABELS[e.event_type] ?? e.event_type}{e.detail ? ` · ${e.detail}` : ""}</span>
          <span className="font-mono text-xs text-muted-foreground">{e.user_id?.slice(0, 8) ?? "—"} · {e.user_agent_summary} · {fmt(e.created_at)}</span>
        </li>
      ))}
      {!ev.data?.length && <li className="p-6 text-muted-foreground">Sin eventos.</li>}
    </ul>
  );
}

function Config() {
  const get = useServerFn(adminGetSettings);
  const set = useServerFn(adminSetSetting);
  const q = useQuery({ queryKey: ["admin-settings"], queryFn: () => get() });
  if (!q.data) return <p className="mt-6 text-sm text-muted-foreground">Cargando…</p>;
  const on = q.data.requireAdminMfa;
  return (
    <div className="mt-6 max-w-xl border bg-card p-6 text-sm">
      <h2 className="font-semibold">Exigir MFA a administradores</h2>
      <p className="mt-1 text-muted-foreground">Cuando está activo, el panel solo es accesible con verificación en dos pasos. Active primero su propio MFA en el portal.</p>
      <button disabled={!q.data.isSuper} onClick={async () => { try { await set({ data: { key: "require_admin_mfa", value: !on } }); toast.success("Guardado"); q.refetch(); } catch (e) { toast.error((e as Error).message); } }}
        className="mt-4 rounded-sm bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50">{on ? "Desactivar" : "Activar"}</button>
      {!q.data.isSuper && <p className="mt-2 text-xs text-muted-foreground">Solo SUPER_ADMIN puede cambiar esta configuración.</p>}
    </div>
  );
}
