// Server-only notifications. Consultation alerts are delivered through the Gmail API
// (users.messages.send) via the managed Google OAuth connector; tokens never reach the browser.
// A status of "sent" is only returned when Gmail confirms the message with an id.
import { ADMIN_NOTIFICATION_EMAIL } from "./security.server";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";
export const GMAIL_SENDER = ADMIN_NOTIFICATION_EMAIL;

export type ConsultationForEmail = {
  id: string;
  public_id: string;
  name: string;
  last_name: string;
  company: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  area: string;
  subject: string;
  message: string;
  created_at: string;
  status?: string;
};

const STATUS_LABELS: Record<string, string> = {
  NEW: "Nueva", IN_REVIEW: "En revisión", IN_PROGRESS: "En curso", WAITING_CLIENT: "En espera del cliente",
  RESOLVED: "Resuelta", CLOSED: "Cerrada", SPAM: "Spam",
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const b64 = (s: string) => btoa(Array.from(new TextEncoder().encode(s), (b) => String.fromCharCode(b)).join(""));
const header = (v: string) => (/^[\x00-\x7F]*$/.test(v) ? v : `=?UTF-8?B?${b64(v)}?=`);
const oneLine = (v: string) => v.replace(/[\r\n]+/g, " ").slice(0, 150);

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "long", timeStyle: "short", timeZone: "America/Lima" }).format(new Date(iso)) + " (hora de Lima)";
}

export function buildConsultationEmail(c: ConsultationForEmail) {
  const status = STATUS_LABELS[c.status ?? "NEW"] ?? c.status ?? "Nueva";
  const rows: [string, string | null][] = [
    ["Número de consulta", c.public_id],
    ["Fecha y hora", formatDate(c.created_at)],
    ["Estado actual", status],
    ["Nombre", c.name],
    ["Apellido", c.last_name],
    ["Correo electrónico", c.email],
    ["Teléfono", c.phone],
    ["Empresa", c.company],
    ["País", c.country || "No indicado"],
    ["Área de interés", c.area],
    ["Asunto", c.subject],
  ];
  const visible = rows.filter(([, v]) => v) as [string, string][];
  const subject = `Nueva consulta ${c.public_id} | NATXAJO CORPORATION`;
  const text = [
    "NATXAJO CORPORATION",
    "Se ha recibido una nueva consulta desde el sitio web.",
    "",
    ...visible.map(([k, v]) => `${k}: ${v}`),
    "",
    "Mensaje:",
    c.message,
    "",
    "La consulta está registrada en el panel administrativo.",
  ].join("\n");
  const html = `<!doctype html><html lang="es"><body style="margin:0;background:#f2f3f5;font-family:Arial,Helvetica,sans-serif;color:#16181d">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f3f5;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#ffffff;border:1px solid #dde0e5">
<tr><td style="background:#111317;padding:24px 32px;border-bottom:3px solid #1f3a68">
<div style="color:#ffffff;font-size:18px;font-weight:bold;letter-spacing:2px">NATXAJO CORPORATION</div>
<div style="color:#a9b0bc;font-size:12px;letter-spacing:1px;margin-top:4px;text-transform:uppercase">Notificación administrativa</div></td></tr>
<tr><td style="padding:28px 32px 8px"><h1 style="margin:0;font-size:20px;color:#111317">Nueva consulta recibida desde el sitio web</h1>
<p style="margin:10px 0 0;font-size:14px;color:#545b66">Se ha registrado una nueva consulta a través del formulario de contacto. A continuación se detallan los datos proporcionados.</p></td></tr>
<tr><td style="padding:16px 32px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px">
${visible.map(([k, v]) => `<tr><td style="padding:9px 12px;border:1px solid #e3e6ea;background:#f7f8fa;width:38%;color:#545b66">${esc(k)}</td><td style="padding:9px 12px;border:1px solid #e3e6ea">${esc(v)}</td></tr>`).join("")}
</table></td></tr>
<tr><td style="padding:8px 32px 24px"><div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#545b66;margin-bottom:8px">Mensaje</div>
<div style="font-size:14px;line-height:1.6;border-left:3px solid #1f3a68;background:#f7f8fa;padding:14px 16px;white-space:pre-wrap">${esc(c.message)}</div></td></tr>
<tr><td style="padding:18px 32px;border-top:1px solid #e3e6ea;font-size:12px;color:#7a818c">La consulta se encuentra registrada en el panel administrativo de NATXAJO CORPORATION. Este mensaje fue generado automáticamente por el sitio web.</td></tr>
</table></td></tr></table></body></html>`;
  return { subject, text, html };
}

function buildRaw(to: string, replyTo: string, subject: string, text: string, html: string) {
  const boundary = `natxajo_${crypto.randomUUID()}`;
  const mime = [
    `From: ${header("NATXAJO CORPORATION")} <${GMAIL_SENDER}>`,
    `To: ${to}`,
    `Reply-To: ${replyTo}`,
    `Subject: ${header(oneLine(subject))}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    b64(text),
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    b64(html),
    `--${boundary}--`,
  ].join("\r\n");
  return b64(mime).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function gatewayHeaders() {
  const lovable = process.env["LOVABLE_API_KEY"];
  const gmail = process.env["GOOGLE_MAIL_API_KEY"];
  if (!lovable || !gmail) return null;
  return { Authorization: `Bearer ${lovable}`, "X-Connection-Api-Key": gmail, "Content-Type": "application/json" };
}

/** Verifies the authorized Gmail account is the expected corporate sender. */
async function senderMatches(h: Record<string, string>) {
  const r = await fetch(`${GATEWAY_URL}/users/me/profile`, { headers: h });
  if (!r.ok) {
    console.error(`Gmail profile check failed [${r.status}]: ${await r.text()}`);
    return false;
  }
  const p = (await r.json()) as { emailAddress?: string };
  if (p.emailAddress?.toLowerCase() !== GMAIL_SENDER) {
    console.error("Gmail connection is authorized with an unexpected account; sending refused.");
    return false;
  }
  return true;
}

/** Bounded retry (max 3 attempts) only for transient errors (429/5xx/network). */
async function sendRaw(h: Record<string, string>, raw: string) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const r = await fetch(`${GATEWAY_URL}/users/me/messages/send`, { method: "POST", headers: h, body: JSON.stringify({ raw }) });
      if (r.ok) {
        const body = (await r.json()) as { id?: string };
        return Boolean(body.id);
      }
      const err = await r.text();
      console.error(`Gmail send failed [${r.status}] attempt ${attempt}: ${err}`);
      if (r.status !== 429 && r.status < 500) return false;
    } catch (e) {
      console.error(`Gmail send network error attempt ${attempt}`, e instanceof Error ? e.message : e);
    }
    if (attempt < 3) await new Promise((res) => setTimeout(res, 500 * 2 ** (attempt - 1)));
  }
  return false;
}

export async function sendConsultationEmails(c: ConsultationForEmail): Promise<"sent" | "pending" | "failed"> {
  const h = gatewayHeaders();
  if (!h) {
    console.error("Gmail notification not configured (missing GOOGLE_MAIL_API_KEY or LOVABLE_API_KEY)");
    return "pending";
  }
  if (!(await senderMatches(h))) return "failed";
  const { subject, text, html } = buildConsultationEmail(c);
  const raw = buildRaw(ADMIN_NOTIFICATION_EMAIL, c.email, subject, text, html);
  return (await sendRaw(h, raw)) ? "sent" : "failed";
}

const administrativeSecurityEvents = new Set([
  "role_changed", "account_activated", "account_blocked", "account_suspended",
  "setting_changed", "sessions_revoked", "account_deleted", "password_changed",
  "mfa_enabled", "mfa_disabled",
]);

type SecurityNotificationEvent = { id: string; type: string; createdAt: string; userId: string | null };

export function prepareSecurityNotification(event: SecurityNotificationEvent) {
  if (!administrativeSecurityEvents.has(event.type)) return null;
  return {
    to: ADMIN_NOTIFICATION_EMAIL,
    idempotencyKey: `administrative-security-event:${event.id}`,
    templateData: { eventId: event.id, eventType: event.type, createdAt: event.createdAt, userId: event.userId },
  };
}

export async function notifySecurityEvent(event: SecurityNotificationEvent): Promise<"pending_domain" | "not_applicable"> {
  return prepareSecurityNotification(event) ? "pending_domain" : "not_applicable";
}
