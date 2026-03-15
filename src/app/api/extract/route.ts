import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { validateApiKey } from "@/lib/api-keys";
import { extractBrandAssets } from "@/lib/extractor";

// Simple in-memory rate limiter: max 10 requests per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const MAX_ENTRIES = 10_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  // Evict expired entries periodically
  if (rateLimitMap.size > MAX_ENTRIES) {
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key);
    }
  }

  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

// Block private/reserved IP ranges to prevent SSRF
function isPrivateUrl(url: URL): boolean {
  const hostname = url.hostname.toLowerCase();

  // Block localhost and loopback
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "[::1]") {
    return true;
  }

  // Block private IPv4 ranges
  const parts = hostname.split(".");
  if (parts.length === 4 && parts.every((p) => /^\d+$/.test(p))) {
    const [a, b] = parts.map(Number);
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 169 && b === 254) return true; // 169.254.0.0/16 (link-local / AWS metadata)
    if (a === 0) return true; // 0.0.0.0/8
  }

  // Block cloud metadata endpoints
  if (hostname === "metadata.google.internal") return true;

  return false;
}

async function authenticateRequest(req: NextRequest): Promise<boolean> {
  // 1. Bearer token
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const key = authHeader.slice(7);
    const apiKey = await validateApiKey(key);
    return apiKey !== null;
  }

  // 2. Session cookie (logged-in user)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (token) return true;

  // 3. Same-origin request (homepage form) — verify via Referer + Origin
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  const referer = req.headers.get("referer");
  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      const refererHost = referer ? new URL(referer).host : null;
      if (originHost === host && (!referer || refererHost === host)) {
        return true;
      }
    } catch {
      // Invalid origin/referer URL
    }
  }

  return false;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Try again in a minute." },
        { status: 429 }
      );
    }

    const isAuthed = await authenticateRequest(req);
    if (!isAuthed) {
      return NextResponse.json(
        { error: "Unauthorized. Provide a Bearer token or sign in." },
        { status: 401 }
      );
    }

    let body: { url?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { url } = body;

    if (!url || typeof url !== "string" || url.length > 2048) {
      return NextResponse.json({ error: "Invalid or missing url field" }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Only allow http and https protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return NextResponse.json({ error: "Only HTTP(S) URLs are supported" }, { status: 400 });
    }

    // Block private/internal URLs (SSRF protection)
    if (isPrivateUrl(parsed)) {
      return NextResponse.json({ error: "Internal URLs are not allowed" }, { status: 400 });
    }

    const assets = await extractBrandAssets(parsed.href);
    return NextResponse.json(assets);
  } catch (err) {
    console.error("[extract] Error:", err);
    // Don't leak internal error details to the client
    const message = err instanceof Error && err.message.includes("blocked the request")
      ? err.message
      : "Extraction failed. The site may be unreachable or blocking requests.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
