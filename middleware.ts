/**
 * middleware.ts
 * 
 * Proporciona middleware de autenticación y autorización para el sistema de contrataciones.
 *
 * Este middleware intercepta todas las requests a rutas protegidas, valida la autenticación
 * del usuario mediante cookies, verifica el estado de la cuenta (bloqueada/activa) y redirige
 * a los usuarios según su rol específico. Implementa un sistema de protección de rutas que
 * asegura que solo usuarios autorizados accedan a las secciones correspondientes del sistema.
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware principal que maneja autenticación, autorización y redirecciones basadas en roles.
 *
 * Esta función intercepta todas las requests a rutas protegidas y ejecuta las siguientes
 * validaciones en orden:
 * 1. Verifica la existencia de cookies de autenticación
 * 2. Valida el usuario contra la API de verificación
 * 3. Verifica si la cuenta está bloqueada o activa
 * 4. Redirige según el rol del usuario y la ruta solicitada
 * 5. Protege rutas específicas según permisos de rol
 *
 * @param request - El objeto de request de Next.js que contiene información de la petición.
 * @returns Una respuesta de Next.js (redirect o next) basada en la validación.
 */
export async function middleware(request: NextRequest) {
  /** Ruta actual que está siendo solicitada. */
  const pathname = request.nextUrl.pathname;
  
  /** Cookie de identificación del usuario autenticado. */
  const userId = request.cookies.get("candidateId");

  // Validación de autenticación básica
  if (!userId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  /**
   * Valida al usuario contra la API del sistema.
   *
   * Esta validación consulta la API interna para verificar:
   * - Si el usuario existe en la base de datos
   * - Si la cuenta está activa o bloqueada
   * - El rol actual del usuario
   */
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

  /** Información del usuario obtenida de la API de validación. */
  const { blocked, role } = await checkUserRes.json();

  // Redirección para cuentas bloqueadas
  if (blocked) {
    return NextResponse.redirect(new URL("/bloqueado", request.url));
  }

  /**
   * Maneja redirecciones desde la ruta de autenticación inicial.
   *
   * Esta sección implementa la lógica de redirección post-autenticación,
   * dirigiendo a los usuarios a sus dashboards correspondientes según su rol.
   */
  if (pathname === "/auth/redirector") {
    // Redirección para candidatos y empleados activos
    if (
      role === "candidato" ||
      role === "enCorporativo" ||
      role === "enProyecto"
    ) {
      return NextResponse.redirect(new URL("/candidato", request.url));
    }
    
    // Redirección para personal de RH y administradores
    if (role === "rh" || role === "admin") {
      console.log("➡️ Redirecting RH to dashboard");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Redirección por defecto para roles no reconocidos
    return NextResponse.redirect(new URL("/", request.url));
  }

  /**
   * Protección de rutas específicas basada en roles.
   *
   * Esta sección implementa el control de acceso granular:
   * - /candidato/*: accesible solo para candidatos y empleados
   * - /dashboard/*: accesible solo para RH y administradores
   * 
   * El orden de validación es importante para evitar redirecciones circulares.
   */
  if (
    pathname.startsWith("/candidato") &&
    role !== "candidato" &&
    role !== "enCorporativo" &&
    role !== "enProyecto"
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } else if (
    pathname.startsWith("/dashboard") && 
    (role !== "rh" && role !== "admin")
  ) {
    return NextResponse.redirect(new URL("/candidato", request.url));
  }

  // Permite continuar con la request si todas las validaciones pasan
  return NextResponse.next();
}

/**
 * Configuración del middleware que especifica qué rutas deben ser protegidas.
 *
 * El matcher define los patrones de rutas donde el middleware debe ejecutarse:
 * - /auth/redirector: redirección post-autenticación
 * - /dashboard/*: todas las rutas del dashboard administrativo
 * - /dashboard/perfil: perfil específico (incluido explícitamente)
 * - /candidato/*: todas las rutas del área de candidatos
 *
 * @see {@link https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher}
 */
export const config = {
  matcher: [
    "/auth/redirector",
    "/dashboard/:path*",
    "/dashboard/perfil",
    "/candidato/:path*",
  ],
};