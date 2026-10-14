import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Signed-out (or expired) visitors hitting a dashboard URL, e.g. from an email
 * link, go to login with `?next=` set so they land where they intended after
 * signing in. Pages still do their own full checks.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (!pathname.startsWith("/dashboard")) return NextResponse.next();

  const token = request.cookies.get("session")?.value;
  let valid = false;
  if (token && process.env.JWT_SECRET) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET), { algorithms: ["HS256"] });
      valid = true;
    } catch {
      valid = false;
    }
  }
  if (valid) return NextResponse.next();

  const login = new URL("/login", request.url);
  login.searchParams.set("next", pathname + search);
  const res = NextResponse.redirect(login);
  if (token) res.cookies.set("session", "", { expires: new Date(0), path: "/" }); // drop a stale cookie
  return res;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
