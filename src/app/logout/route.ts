import { NextResponse } from "next/server";

/**
 * Plain sign-out endpoint. The sidebar posts an ordinary HTML form here, so it
 * keeps working even in a tab that was opened before the latest deploy (server
 * actions in such a tab can't be found on the new version and silently do nothing).
 */
function signOut(request: Request) {
  const res = NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  res.cookies.set("session", "", { expires: new Date(0), path: "/" });
  return res;
}

export async function POST(request: Request) {
  return signOut(request);
}

// Also allow visiting /logout directly.
export async function GET(request: Request) {
  return signOut(request);
}
