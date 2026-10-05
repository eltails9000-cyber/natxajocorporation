import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Creates the profile + base role on first access and returns the caller's account. */
export const ensureAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sec = await import("./security.server");
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const { data: u } = await db.auth.admin.getUserById(context.userId);
    const user = u.user;
    if (!user) throw new Error("UNAUTHORIZED");

    let { data: profile } = await db.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
    if (!profile) {
      const meta = (user.user_metadata ?? {}) as Record<string, string>;
      const ins = await db
        .from("profiles")
        .insert({ user_id: user.id, first_name: meta["first_name"]?.slice(0, 80) ?? null, last_name: meta["last_name"]?.slice(0, 80) ?? null })
        .select("*")
        .single();
      profile = ins.data;
      await db.from("user_roles").upsert({ user_id: user.id, role: "user" }, { onConflict: "user_id,role" });
      await sec.logSecurityEvent({ userId: user.id, type: "signup" });
    }
    // Bootstrap super admin only for the verified owner address.
    if (user.email_confirmed_at && user.email?.toLowerCase() === sec.DEFAULT_SUPER_ADMIN_EMAIL) {
      await db.from("user_roles").upsert({ user_id: user.id, role: "super_admin" }, { onConflict: "user_id,role" });
    }
    const { data: roles } = await db.from("user_roles").select("role").eq("user_id", user.id);
    return { email: user.email ?? "", profile, roles: (roles ?? []).map((r) => r.role) };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        first_name: z.string().trim().max(80),
        last_name: z.string().trim().max(80),
        company: z.string().trim().max(120),
        phone: z.string().trim().max(30).regex(/^[\d\s+()-]*$/, "Teléfono inválido"),
        country: z.string().trim().max(60),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const sec = await import("./security.server");
    if (!(await sec.rateLimit("account", context.userId))) throw new Error("Demasiadas solicitudes");
    const c = (v: string) => (v ? sec.cleanText(v) : null);
    const clean = { first_name: c(data.first_name), last_name: c(data.last_name), company: c(data.company), phone: c(data.phone), country: c(data.country) };
    const { error } = await context.supabase.from("profiles").update(clean).eq("user_id", context.userId);
    if (error) throw new Error("No se pudo actualizar el perfil");
    await sec.logSecurityEvent({ userId: context.userId, type: "profile_updated" });
    return { ok: true };
  });

export const logAccountEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ type: z.enum(["login", "logout", "password_changed", "mfa_enabled", "mfa_disabled", "failed_mfa"]) }).parse(d))
  .handler(async ({ data, context }) => {
    const sec = await import("./security.server");
    if (!(await sec.rateLimit("account", context.userId))) return { ok: false };
    await sec.logSecurityEvent({ userId: context.userId, type: data.type });
    return { ok: true };
  });

export const getMySecurityEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("security_events")
      .select("id, event_type, user_agent_summary, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(20);
    return data ?? [];
  });

/** Permanently deletes the caller's account after server-side password re-authentication.
 *  Consultations are kept (business record) but personal data is anonymized. */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ password: z.string().min(1).max(200), confirm: z.literal("ELIMINAR") }).parse(d))
  .handler(async ({ data, context }) => {
    const sec = await import("./security.server");
    if (!(await sec.rateLimit("login", `del:${context.userId}`))) return { ok: false as const, error: "Demasiados intentos. Inténtelo más tarde." };
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const { data: u } = await db.auth.admin.getUserById(context.userId);
    const email = u.user?.email;
    if (!email) return { ok: false as const, error: "Cuenta no encontrada" };
    const { data: roles } = await db.from("user_roles").select("role").eq("user_id", context.userId);
    if ((roles ?? []).some((r) => r.role === "super_admin")) return { ok: false as const, error: "Un SUPER_ADMIN no puede eliminar su cuenta desde el portal." };

    // Re-authenticate with an isolated, non-persistent client.
    const { createClient } = await import("@supabase/supabase-js");
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const probe = createClient(process.env["SUPABASE_URL"]!, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error: authErr } = await probe.auth.signInWithPassword({ email, password: data.password });
    if (authErr) {
      await sec.logSecurityEvent({ userId: context.userId, type: "account_delete_failed_reauth" });
      return { ok: false as const, error: "Contraseña incorrecta." };
    }
    await probe.auth.signOut().catch(() => {});

    await db.from("consultations").update({
      user_id: null, name: "Anonimizado", last_name: "Anonimizado", company: null,
      email: `anon-${context.userId.slice(0, 8)}@invalid.local`, phone: null, country: null, anonymized_at: new Date().toISOString(),
    }).eq("user_id", context.userId);
    await db.from("user_roles").delete().eq("user_id", context.userId);
    await db.from("profiles").delete().eq("user_id", context.userId);
    await sec.logSecurityEvent({ userId: null, actorUserId: null, type: "account_deleted", detail: `user ${context.userId.slice(0, 8)}…` });
    const { error } = await db.auth.admin.deleteUser(context.userId);
    if (error) return { ok: false as const, error: "No se pudo eliminar la cuenta." };
    return { ok: true as const };
  });
