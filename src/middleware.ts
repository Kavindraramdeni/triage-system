import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("auth_token");
    return response;
  }
}

export const config = {
  // Protect clinician routes only — explicitly exclude /login and public routes
  matcher: [
    "/dashboard/:path*",
    "/patient/:path*",
    "/analytics/:path*",
  ],
};
