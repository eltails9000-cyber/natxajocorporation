import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { deleteMyAccount, logAccountEvent } from "@/lib/accounts.functions";

const input = "w-full rounded-sm border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-brand";
const btn = "justify-self-start rounded-sm bg-primary px-5 py-2.5 text-sm text-primary-foreground hover:bg-brand disabled:opacity-50";

/** TOTP two-step verification using the auth provider's standard MFA. */
export function MfaCard() {
  const log = useServerFn(logAccountEvent);
  const [factors, setFactors] = useState<{ id: string; status: string }[]>([]);
  const [enroll, setEnroll] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");

  const load = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors((data?.totp ?? []).map((f) => ({ id: f.id, status: f.status })));
  };
  useEffect(() => { load(); }, []);
  const active = factors.find((f) => f.status === "verified");

  const start = async () => {
    // Clean up abandoned unverified factors first.
    for (const f of factors.filter((f) => f.status !== "verified")) await supabase.auth.mfa.unenroll({ factorId: f.id });
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `NATXAJO ${Date.now()}` });
    if (error || !data) return void toast.error("No se pudo iniciar la configuración");
    setEnroll({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };
  const verify = async () => {
    if (!enroll) return;
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: enroll.id, code: code.trim() });
    if (error) { log({ data: { type: "failed_mfa" } }).catch(() => {}); return void toast.error("Código incorrecto"); }
    await log({ data: { type: "mfa_enabled" } }).catch(() => {});
    setEnroll(null); setCode(""); toast.success("Verificación en dos pasos activada"); load();
  };
  const disable = async () => {
    if (!active || !confirm("¿Desactivar la verificación en dos pasos?")) return;
    const { error } = await supabase.auth.mfa.unenroll({ factorId: active.id });
    if (error) return void toast.error("Debe verificar su código MFA en esta sesión para desactivarlo.");
    await log({ data: { type: "mfa_disabled" } }).catch(() => {});
    toast.success("MFA desactivado"); load();
  };

  return (
    <div className="grid gap-3 border bg-card p-6">
      <h2 className="font-semibold">Verificación en dos pasos (MFA)</h2>
      <p className="text-sm text-muted-foreground">Estado: {active ? "Activada" : "No activada"}. Use una app de autenticación (Google Authenticator, Microsoft Authenticator, 1Password…).</p>
      {!active && !enroll && <button onClick={start} className={btn}>Configurar MFA</button>}
      {enroll && (
        <div className="grid gap-3">
          <img src={enroll.qr} alt="Código QR para la app de autenticación" className="h-44 w-44 border bg-card" />
          <p className="break-all font-mono text-xs text-muted-foreground">Clave manual: {enroll.secret}</p>
          <input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" maxLength={6} placeholder="Código de 6 dígitos" className={input} />
          <button onClick={verify} disabled={code.trim().length !== 6} className={btn}>Verificar y activar</button>
        </div>
      )}
      {active && <button onClick={disable} className="justify-self-start rounded-sm border px-5 py-2.5 text-sm hover:bg-muted">Desactivar MFA</button>}
    </div>
  );
}

export function DeleteAccountCard() {
  const del = useServerFn(deleteMyAccount);
  const nav = useNavigate();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("confirm") !== "ELIMINAR") return void toast.error('Escriba "ELIMINAR" para confirmar');
    setBusy(true);
    try {
      const r = await del({ data: { password: String(fd.get("password") ?? ""), confirm: "ELIMINAR" } });
      if (!r.ok) return void toast.error(r.error);
      await supabase.auth.signOut({ scope: "local" });
      qc.clear();
      toast.success("Su cuenta fue eliminada.");
      nav({ to: "/", replace: true });
    } catch {
      toast.error("No se pudo eliminar la cuenta");
    } finally { setBusy(false); }
  };
  return (
    <form onSubmit={onSubmit} className="grid gap-3 border border-destructive/40 bg-card p-6">
      <h2 className="font-semibold text-destructive">Eliminar cuenta</h2>
      <p className="text-sm text-muted-foreground">Esta acción es permanente. Su perfil y acceso se eliminarán; las consultas enviadas se conservan sin sus datos personales (anonimizadas).</p>
      <input name="password" type="password" required placeholder="Contraseña actual" autoComplete="current-password" className={input} />
      <input name="confirm" required placeholder='Escriba "ELIMINAR"' className={input} />
      <button disabled={busy} className="justify-self-start rounded-sm bg-destructive px-5 py-2.5 text-sm text-destructive-foreground disabled:opacity-50">{busy ? "Eliminando…" : "Eliminar mi cuenta"}</button>
    </form>
  );
}
