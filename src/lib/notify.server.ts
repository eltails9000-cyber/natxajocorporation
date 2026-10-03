// Server-only notification dispatch for consultations.
// Sending app emails requires a verified sender domain. Until one is configured,
// notifications are recorded as "pending_domain" and remain visible in /admin.
// When the domain is ready, replace the body of `sendConsultationEmails` with
// calls to the managed email send helper (admin notification + client confirmation).
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

export async function sendConsultationEmails(c: ConsultationForEmail): Promise<"sent" | "pending_domain" | "failed"> {
  void ADMIN_NOTIFICATION_EMAIL;
  void c;
  return "pending_domain";
}
