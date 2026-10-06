// Server-only notification preparation. No sender domain is configured.
// There is deliberately no delivery implementation, queue, or email table.
// Consultations retain pending_domain; security events retain their existing audit.
// Future activation: scaffold managed templates after sender verification, then
// use sendTemplateEmail with these fixed recipients and event-derived keys.
import { ADMIN_NOTIFICATION_EMAIL } from "./security.server";

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
};

export function prepareConsultationNotifications(c: ConsultationForEmail) {
  return {
    administrative: {
      to: ADMIN_NOTIFICATION_EMAIL,
      template: "new-consultation" as const,
      idempotencyKey: `new-consultation:${c.id}`,
      templateData: { ...c, adminPath: "/admin" },
    },
    visitor: {
      to: c.email,
      template: "consultation-confirmation" as const,
      idempotencyKey: `consultation-confirmation:${c.id}`,
      templateData: { name: c.name, publicId: c.public_id, area: c.area, createdAt: c.created_at },
    },
  };
}

export async function sendConsultationEmails(c: ConsultationForEmail): Promise<"sent" | "pending_domain" | "failed"> {
  // Preparation is not sending. Do not report sent until the managed API succeeds.
  prepareConsultationNotifications(c);
  return "pending_domain";
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
    template: "administrative-security-event" as const,
    idempotencyKey: `administrative-security-event:${event.id}`,
    // No passwords, tokens, audit detail, raw IP, or user-submitted content.
    templateData: { eventId: event.id, eventType: event.type, createdAt: event.createdAt, userId: event.userId, adminPath: "/admin" },
  };
}

export async function notifySecurityEvent(event: SecurityNotificationEvent): Promise<"pending_domain" | "not_applicable"> {
  return prepareSecurityNotification(event) ? "pending_domain" : "not_applicable";
}
