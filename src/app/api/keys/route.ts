import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { generateApiKey, hashKey, getKeyPrefix } from "@/lib/api-keys";

async function getUser(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.email) return null;

  // Ensure user exists in DB (JWT strategy doesn't auto-create)
  let user = await prisma.user.findUnique({
    where: { email: token.email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: token.email,
        name: token.name ?? null,
        image: (token.picture as string) ?? null,
      },
    });
  }

  return user;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const keys = await prisma.apiKey.findMany({
      where: { userId: user.id, revoked: false },
      select: { id: true, name: true, keyPrefix: true, createdAt: true, lastUsed: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(keys);
  } catch (err) {
    console.error("[keys:GET]", err);
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: { name?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { name } = body;
    if (!name || typeof name !== "string" || name.trim().length === 0 || name.length > 100) {
      return NextResponse.json({ error: "Name is required (max 100 characters)" }, { status: 400 });
    }

    const rawKey = generateApiKey();

    await prisma.apiKey.create({
      data: {
        name: name.trim(),
        keyHash: hashKey(rawKey),
        keyPrefix: getKeyPrefix(rawKey),
        userId: user.id,
      },
    });

    return NextResponse.json({ key: rawKey });
  } catch (err) {
    console.error("[keys:POST]", err);
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: { id?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { id } = body;
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Key id required" }, { status: 400 });
    }

    await prisma.apiKey.updateMany({
      where: { id, userId: user.id },
      data: { revoked: true },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[keys:DELETE]", err);
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
