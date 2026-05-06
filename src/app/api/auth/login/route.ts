import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const INVALID_MSG = "Invalid email or password";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: INVALID_MSG }, { status: 401 });
    }

    const clinician = await prisma.clinician.findUnique({
      where: { email: parsed.data.email },
    });

    // Guard: account not found
    if (!clinician || !clinician.isActive) {
      return NextResponse.json({ error: INVALID_MSG }, { status: 401 });
    }

    // Guard: wrong password
    const passwordValid = await verifyPassword(parsed.data.password, clinician.passwordHash);
    if (!passwordValid) {
      return NextResponse.json({ error: INVALID_MSG }, { status: 401 });
    }

    await prisma.clinician.update({
      where: { id: clinician.id },
      data: { lastLoginAt: new Date() },
    });

    const token = await signToken({
      sub: clinician.id,
      email: clinician.email,
      name: clinician.name,
      role: clinician.role,
    });

    const response = NextResponse.json({
      clinician: { id: clinician.id, name: clinician.name, email: clinician.email, role: clinician.role },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 12,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
