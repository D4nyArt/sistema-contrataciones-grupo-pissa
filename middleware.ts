import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const userId = request.cookies.get("candidateId");

  if (!userId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Validate user
  const checkUserRes = await fetch(`${request.nextUrl.origin}/api/checkUser`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-UserId": userId.value,
    },
  });

  if (!checkUserRes.ok) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const { blocked, role } = await checkUserRes.json();

  if (blocked) {
    return NextResponse.redirect(new URL("/bloqueado", request.url));
  }

  // Redirect on /auth/redirector
  if (pathname === "/auth/redirector") {
    if (
      role === "candidato" ||
      role === "enCorporativo" ||
      role === "enProyecto"
    ) {
      return NextResponse.redirect(new URL("/candidato", request.url));
    }
    if (role === "rh") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.redirect(new URL("/", request.url));
  }

  // 🔄 Order matters: check /candidato FIRST
  if (
    pathname.startsWith("/candidato") &&
    role !== "candidato" &&
    role !== "enCorporativo" &&
    role !== "enProyecto"
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } else if (pathname.startsWith("/dashboard") && role !== "rh") {
    return NextResponse.redirect(new URL("/candidato", request.url));
  }

  return NextResponse.next();
}

// Protect these routes
export const config = {
  matcher: [
    "/auth/redirector",
    "/dashboard/:path*",
    "/dashboard/perfil",
    "/candidato/:path*",
  ],
};
