import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { CONSULTATION_STATUSES, ROLES } from "./areas";

export const adminListConsultations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sec = await import("./security.server");
    await sec.requireStaff(context);
    const { data, error } = await context.supabase
      .from("consultations")
      .select("id, public_id, name, last_name, company, email, phone, country, area, subject, message, status, notification_status, created_at")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) throw new Error("No se pudieron cargar las consultas");
    return data ?? [];
  });

export const adminUpdateConsultation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(CONSULTATION_STATUSES).optional(), note: z.string().trim().max(2000).optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const sec = await import("./security.server");
    await sec.requireStaff(context);
    if (data.status) {
      const { error } = await context.supabase.from("consultations").update({ status: data.status }).eq("id", data.id);
      if (error) throw new Error("No se pudo actualizar el estado");
    }
    if (data.note) {
      const { error } = await context.supabase
        .from("consultation_notes")
        .insert({ consultation_id: data.id, author_user_id: context.userId, body: sec.cleanText(data.note) });
      if (error) throw new Error("No se pudo guardar la nota");
    }
    return { ok: true };
  });

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sec = await import("./security.server");
    const { db, isSuper } = await sec.requireStaff(context);
    const [{ data: list }, { data: profiles }, { data: roles }] = await Promise.all([
      db.auth.admin.listUsers({ perPage: 500 }),
      db.from("profiles").select("user_id, first_name, last_name, company, account_status"),
      db.from("user_roles").select("user_id, role"),
    ]);
    const users = (list?.users ?? []).map((u) => {
      const p = profiles?.find((x) => x.user_id === u.id);
      return {
        id: u.id,
        email: u.email ?? "",
        verified: !!u.email_confirmed_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
        created_at: u.created_at,
        name: [p?.first_name, p?.last_name].filter(Boolean).join(" "),
        company: p?.company ?? "",
        status: p?.account_status ?? "active",
        roles: (roles ?? []).filter((r) => r.user_id === u.id).map((r) => r.role),
      };
    });
    return { users, isSuper, me: context.userId };
  });

export const adminSetRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ userId: z.string().uuid(), role: z.enum(ROLES), grant: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const sec = await import("./security.server");
    const { db } = await sec.requireStaff(context, { superAdmin: true });
    if (data.userId === context.userId && data.role === "super_admin" && !data.grant) throw new Error("No puede quitarse su propio SUPER_ADMIN");
    const q = data.grant
      ? db.from("user_roles").upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id,role" })
      : db.from("user_roles").delete().eq("user_id", data.userId).eq("role", data.role);
    const { error } = await q;
    if (error) throw new Error("No se pudo cambiar el rol");
    await sec.logSecurityEvent({ userId: data.userId, actorUserId: context.userId, type: "role_changed", detail: `${data.grant ? "+" : "-"}${data.role}` });
    return { ok: true };
  });

export const adminSetStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ userId: z.string().uuid(), status: z.enum(["active", "suspended", "blocked"]) }).parse(d))
  .handler(async ({ data, context }) => {
    const sec = await import("./security.server");
    const { db, isSuper } = await sec.requireStaff(context);
    if (data.userId === context.userId) throw new Error("No puede cambiar su propio estado");
    const { data: target } = await db.from("user_roles").select("role").eq("user_id", data.userId);
    const targetStaff = (target ?? []).some((r) => r.role === "admin" || r.role === "super_admin");
    if (targetStaff && !isSuper) throw new Error("Solo SUPER_ADMIN puede modificar administradores");
    const { error } = await db.from("profiles").update({ account_status: data.status }).eq("user_id", data.userId);
    if (error) throw new Error("No se pudo cambiar el estado");
    // Blocked/suspended users lose sign-in ability at the auth layer too.
    await db.auth.admin.updateUserById(data.userId, { ban_duration: data.status === "active" ? "none" : "876000h" });
    const type = data.status === "active" ? "account_activated" : data.status === "blocked" ? "account_blocked" : "account_suspended";
    await sec.logSecurityEvent({ userId: data.userId, actorUserId: context.userId, type });
    return { ok: true };
  });

export const adminListEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sec = await import("./security.server");
    const { db } = await sec.requireStaff(context);
    const { data } = await db
      .from("security_events")
      .select("id, user_id, actor_user_id, event_type, detail, user_agent_summary, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    return data ?? [];
  });
