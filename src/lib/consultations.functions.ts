import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { CONSULTATION_AREAS } from "./areas";

const phoneRe = /^[\d\s+()-]*$/;

export const consultationSchema = z.object({
  nombre: z.string().trim().min(1, "Ingrese su nombre").max(80),
  apellido: z.string().trim().min(1, "Ingrese su apellido").max(80),
  empresa: z.string().trim().max(120).optional().default(""),
  email: z.string().trim().email("Correo inválido").max(255),
  telefono: z.string().trim().max(30).regex(phoneRe, "Teléfono inválido").optional().default(""),
  pais: z.string().trim().max(60).optional().default(""),
  area: z.enum(CONSULTATION_AREAS, { message: "Seleccione un área" }),
  asunto: z.string().trim().min(3, "Ingrese un asunto").max(150),
  mensaje: z.string().trim().min(10, "El mensaje es muy corto").max(3000, "Máximo 3000 caracteres"),
  consentimiento: z.literal(true, { message: "Debe aceptar el tratamiento de datos" }),
});

const submitSchema = consultationSchema.extend({
  website: z.string().max(0).optional().default(""), // honeypot
  elapsedMs: z.number().int().min(0).max(86_400_000),
});

export const submitConsultation = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => submitSchema.parse(d))
  .handler(async ({ data }) => {
    const sec = await import("./security.server");
    // Silent drop for bots (honeypot or inhumanly fast submit)
    if (data.website || data.elapsedMs < 3000) return { ok: true as const, publicId: null };

    const ipHash = await sec.getIpHash();
    if (!(await sec.rateLimit("consultation", ipHash)) || !(await sec.rateLimit("consultation", `email:${data.email.toLowerCase()}`))) {
      return { ok: false as const, error: "Ha enviado demasiadas consultas. Inténtelo más tarde." };
    }

    const userId = await sec.getOptionalUserId();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const opt = (v: string) => (v ? sec.cleanText(v) : null);
    const { data: row, error } = await supabaseAdmin
      .from("consultations")
      .insert({
        public_id: "pending", // replaced by trigger
        user_id: userId,
        name: sec.cleanText(data.nombre),
        last_name: sec.cleanText(data.apellido),
        company: opt(data.empresa),
        email: data.email.toLowerCase(),
        phone: opt(data.telefono),
        country: opt(data.pais),
        area: data.area,
        subject: sec.cleanText(data.asunto),
        message: sec.cleanText(data.mensaje),
      })
      .select("id, public_id, name, last_name, company, email, phone, country, area, subject, message, status, created_at")
      .single();
    if (error || !row) {
      console.error("consultation insert failed", error?.message);
      return { ok: false as const, error: "No se pudo registrar la consulta. Inténtelo nuevamente." };
    }

    const { sendConsultationEmails } = await import("./notify.server");
    const status = await sendConsultationEmails(row).catch(() => "failed" as const);
    await supabaseAdmin.from("consultations").update({ notification_status: status }).eq("id", row.id);

    return { ok: true as const, publicId: row.public_id };
  });

export const getMyConsultations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // RLS restricts rows to the caller; explicit filter avoids staff seeing others here.
    const { data, error } = await context.supabase
      .from("consultations")
      .select("id, public_id, area, subject, status, created_at, updated_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error("No se pudieron cargar las consultas");
    return data ?? [];
  });
