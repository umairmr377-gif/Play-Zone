import { getServerClient } from "./supabaseServer";
import { getServerAuthSession } from "./auth";
import { NextRequest } from "next/server";

/**
 * Log an audit event
 */
export async function logAuditEvent(
  action: string,
  resource: string,
  resourceId: string,
  details?: Record<string, any>,
  request?: NextRequest
) {
  try {
    const session = await getServerAuthSession();
    const client = getServerClient();

    // Skip audit logging if Supabase is not configured
    if (!client) {
      return;
    }

    const ipAddress = request
      ? request.headers.get("x-forwarded-for")?.split(",")[0] ||
        request.headers.get("x-real-ip") ||
        "unknown"
      : "unknown";

    const userAgent = request?.headers.get("user-agent") || "unknown";

    await (client as any).from("audit_logs").insert({
      user_id: session.user?.id || null,
      action,
      resource,
      resource_id: resourceId,
      details: details || {},
      ip_address: ipAddress,
      user_agent: userAgent,
    } as any);
  } catch (error) {
    // Don't fail the main operation if audit logging fails
    console.error("Failed to log audit event:", error);
  }
}

/**
 * Log admin mutation
 */
export async function logAdminMutation(
  action: "create" | "update" | "delete" | "promote" | "demote" | "invite",
  resource: string,
  resourceId: string,
  details?: Record<string, any>,
  request?: NextRequest
) {
  await logAuditEvent(action, resource, resourceId, details, request);
}

