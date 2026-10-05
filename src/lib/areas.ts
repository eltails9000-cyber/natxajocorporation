// Client-safe shared constants for consultations and roles.
export const CONSULTATION_AREAS = [
  "NATXAJO TECHNOLOGY",
  "NATXAJO CYBERSECURITY",
  "NATXAJO ENGINEERING",
  "NATXAJO INFRASTRUCTURE",
  "NATXAJO CONSTRUCTION",
  "NATXAJO PROJECT MANAGEMENT",
  "NATXAJO INDUSTRIAL SERVICES",
  "NATXAJO ENERGY",
  "NATXAJO ENVIRONMENTAL",
  "NATXAJO LOGISTICS",
  "NATXAJO TRANSPORT",
  "NATXAJO SUPPLY",
  "NATXAJO COMMERCIAL",
  "NATXAJO BUSINESS SERVICES",
  "NATXAJO FACILITIES",
  "NATXAJO REAL ESTATE",
  "NATXAJO CAPITAL",
  "NATXAJO HOLDING",
  "Consulta general",
] as const;

export const CONSULTATION_STATUSES = ["NEW", "IN_REVIEW", "IN_PROGRESS", "WAITING_CLIENT", "RESOLVED", "CLOSED", "SPAM"] as const;
export type ConsultationStatus = (typeof CONSULTATION_STATUSES)[number];

export const STATUS_LABELS: Record<ConsultationStatus, string> = {
  NEW: "Nueva",
  IN_REVIEW: "En revisión",
  IN_PROGRESS: "En proceso",
  WAITING_CLIENT: "Esperando cliente",
  RESOLVED: "Resuelta",
  CLOSED: "Cerrada",
  SPAM: "Spam",
};

export const ROLES = ["user", "corporate_user", "admin", "super_admin"] as const;
export type AppRole = (typeof ROLES)[number];
export const ROLE_LABELS: Record<AppRole, string> = {
  user: "USER",
  corporate_user: "CORPORATE_USER",
  admin: "ADMIN",
  super_admin: "SUPER_ADMIN",
};

export const SECURITY_EVENT_LABELS: Record<string, string> = {
  login: "Inicio de sesión",
  logout: "Cierre de sesión",
  login_failed: "Intento fallido de inicio de sesión",
  signup: "Registro",
  password_reset_requested: "Recuperación solicitada",
  password_changed: "Contraseña cambiada",
  email_verified: "Correo verificado",
  mfa_enabled: "MFA activado",
  mfa_disabled: "MFA desactivado",
  sessions_revoked: "Sesiones cerradas",
  profile_updated: "Perfil actualizado",
  role_changed: "Rol cambiado",
  account_suspended: "Cuenta suspendida",
  account_blocked: "Cuenta bloqueada",
  account_activated: "Cuenta reactivada",
  email_force_verified: "Verificación forzada",
  account_deleted: "Cuenta eliminada",
  setting_changed: "Configuración cambiada",
  failed_mfa: "Código MFA incorrecto",
  account_delete_failed_reauth: "Eliminación rechazada (contraseña)",
};
