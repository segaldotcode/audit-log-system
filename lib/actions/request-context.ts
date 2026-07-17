import { headers } from "next/headers";

export interface RequestContext {
  ip: string | null;
  userAgent: string | null;
}

export async function getRequestContext(): Promise<RequestContext> {
  const requestHeaders = await headers();

  return {
    ip: requestHeaders.get("x-forwarded-for") ?? "127.0.0.1",
    userAgent: requestHeaders.get("user-agent") ?? "unknown",
  };
}
