import { SignJWT, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function signToken(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

export async function requireClinician(req: NextRequest) {
  const cookie = req.cookies.get("auth_token");
  const bearer = req.headers.get("authorization")?.replace("Bearer ", "");
  const token = cookie?.value ?? bearer;
  if (!token) return { ok: false as const, error: NextResponse.json({ error: "Authentication required" }, { status: 401 }) };
  try {
    const payload = await verifyToken(token);
    return { ok: true as const, clinician: payload as any };
  } catch {
    return { ok: false as const, error: NextResponse.json({ error: "Invalid or expired token" }, { status: 401 }) };
  }
}
