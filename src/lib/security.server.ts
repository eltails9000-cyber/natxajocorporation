// Server-only security helpers: rate limiting, request fingerprinting, audit logging.
import { getRequestHeader } from "@tanstack/react-start/server";

/** Configurable limits: [max requests, window seconds]. Override per env if needed. */
export const RATE_LIMITS = {
  consultation: [5, 3600],
  login: [10, 900],
  signup: [5, 3600],
  password_reset: [5, 3600],
  failed_login_log: [30, 900],
  admin: [120, 60],
  account: [60, 300],
} as const satisfies Record<string, readonly [number, number]>;
export type RateLimitBucket = keyof typeof RATE_LIMITS;

export const ADMIN_NOTIFICATION_EMAIL = "natxajosupport@gmail.com";
export const DEFAULT_SUPER_ADMIN_EMAIL = "eltails9000@gmail.com";

async function sha256(input: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getRateLimitSalt() {
  const salt = process.env["RATE_LIMIT_SALT"];
  if (!salt) {
    if (process.env["NODE_ENV"] === "production") {
      throw new Error("RATE_LIMIT_SALT is required in production");
    }
    return "development-local-only";
  }
  return salt;
}

/** One-way, salted identifier for the client IP. The raw IP is never stored. */
export async function getIpHash() {
  const ip =
    getRequestHeader("cf-connecting-ip") ||
    getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ||
    getRequestHeader("x-real-ip") ||
    "unknown";
  const salt = getRateLimitSalt();
  return (await sha256(`${salt}:${ip}`)).slice(0, 32);
}

export function getUserAgentSummary() {
  const ua = getRequestHeader("user-agent") || "";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Otro";
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Otro";
  return `${browser} · ${os}`;
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** Returns true when allowed. Fails closed on DB errors. */
export async function rateLimit(bucket: RateLimitBucket, identifier: string) {
  const [max, windowSeconds] = RATE_LIMITS[bucket];
  const db = await admin();
  const { data, error } = await db.rpc("check_rate_limit", { _key: `${bucket}:${identifier}`, _max: max, _window_seconds: windowSeconds });
  if (error) {
    console.error("rate limit error", error.message);
    return false;
  }
  return data === true;
}

export async function logSecurityEvent(e: { userId?: string | null; actorUserId?: string | null; type: string; detail?: string }) {
  const db = await admin();
  const { data: event, error } = await db.from("security_events").insert({
    user_id: e.userId ?? null,
    actor_user_id: e.actorUserId ?? null,
    event_type: e.type,
    detail: e.detail?.slice(0, 300) ?? null,
    ip_hash: await getIpHash(),
    user_agent_summary: getUserAgentSummary(),
  }).select("id, created_at").single();
  if (error) console.error("security log error", error.message);
  if (!error && event) {
    const { notifySecurityEvent } = await import("./notify.server");
    await notifySecurityEvent({ id: event.id, type: e.type, createdAt: event.created_at, userId: e.userId ?? null }).catch(() => {
      console.error("Security notification unavailable");
    });
  }
}

/** Strip control characters (keeps newlines/tabs) and trim. Output is always rendered as text. */
export function cleanText(v: string) {
  // eslint-disable-next-line no-control-regex
  return v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
}

/** Resolve the caller from an optional bearer token without requiring auth. */
export async function getOptionalUserId() {
  const header = getRequestHeader("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  const db = await admin();
  const { data } = await db.auth.getUser(token);
  return data.user?.id ?? null;
}

export type StaffContext = { supabase: any; userId: string; claims: any };

/**
 * Server-side authorization for staff endpoints. Verifies role from the database,
 * account status, and (when enabled) MFA assurance level.
 */
export async function requireStaff(ctx: StaffContext, opts: { superAdmin?: boolean } = {}) {
  const db = await admin();
  const [{ data: roles }, { data: profile }, { data: setting }] = await Promise.all([
    db.from("user_roles").select("role").eq("user_id", ctx.userId),
    db.from("profiles").select("account_status").eq("user_id", ctx.userId).maybeSingle(),
    db.from("app_settings").select("value").eq("key", "require_admin_mfa").maybeSingle(),
  ]);
  const roleList = (roles ?? []).map((r) => r.role);
  const isSuper = roleList.includes("super_admin");
  const isStaff = isSuper || roleList.includes("admin");
  if (!isStaff || (opts.superAdmin && !isSuper)) throw new Error("FORBIDDEN");
  if (profile && profile.account_status !== "active") throw new Error("FORBIDDEN");
  if (setting?.value === true && ctx.claims?.aal !== "aal2") throw new Error("MFA_REQUIRED");
  if (!(await rateLimit("admin", ctx.userId))) throw new Error("RATE_LIMITED");
  return { db, isSuper, roles: roleList };
}
