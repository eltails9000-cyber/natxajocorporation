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
        .insert({ user_id: user.id, first_name: meta.first_name?.slice(0, 80) ?? null, last_name: meta.last_name?.slice(0, 80) ?? null })
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
    const clean = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v ? sec.cleanText(v) : null]));
    const { error } = await context.supabase.from("profiles").update(clean).eq("user_id", context.userId);
    if (error) throw new Error("No se pudo actualizar el perfil");
    await sec.logSecurityEvent({ userId: context.userId, type: "profile_updated" });
    return { ok: true };
  });

export const logAccountEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ type: z.enum(["login", "logout", "password_changed"]) }).parse(d))
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
