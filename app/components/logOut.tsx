/**
 * logOut.tsx
 *
 * Proporciona funcionalidad de cierre de sesión para usuarios autenticados.
 *
 * Este componente renderiza un botón de logout que maneja el proceso completo
 * de cierre de sesión del usuario, incluyendo la eliminación de cookies de
 * autenticación y redirección a la página principal. Utiliza tanto navegación
 * programática como redirección forzada para asegurar una limpieza completa
 * del estado de sesión.
 */

"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

/**
 * Renderiza un botón de cierre de sesión con funcionalidad completa de logout.
 *
 * Este componente proporciona un botón minimalista con icono que ejecuta el
 * proceso completo de cierre de sesión del usuario. Elimina las cookies de
 * autenticación del servidor y redirige al usuario a la página principal,
 * utilizando tanto el router de Next.js como redirección forzada para
 * garantizar una limpieza completa del estado de sesión.
 *
 * @returns El elemento JSX que renderiza el botón de cierre de sesión.
 *
 * @example
 * ```tsx
 * // Uso en barra de navegación
 * <nav className="navbar">
 *   <NavigationItems />
 *   <ForLogOut />
 * </nav>
 *
 * // En menú de usuario
 * <div className="user-menu">
 *   <UserProfile />
 *   <ForLogOut />
 * </div>
 *
 * // En sidebar de administración
 * <aside className="admin-sidebar">
 *   <AdminMenuItems />
 *   <ForLogOut />
 * </aside>
 * ```
 */
export default function ForLogOut() {
  /** Hook de Next.js para navegación programática. */
  const router = useRouter();

  //localStorage.clear();
  //sessionStorage.clear();

  /**
   * Maneja el proceso completo de cierre de sesión del usuario.
   *
   * Esta función ejecuta la secuencia de logout:
   * 1. Elimina la cookie de autenticación del servidor
   * 2. Redirige usando el router de Next.js
   * 3. Fuerza una redirección adicional para limpiar completamente el estado
   *
   * El uso de tanto router.replace() como window.location.replace() asegura
   * que el cierre de sesión sea efectivo incluso si hay problemas con la
   * navegación programática.
   */
  const onLogout = async () => {
    await fetch("/api/deleteCookie?name=candidateId", {
      method: "DELETE",
    }).then((resp) => {
      console.log(resp);
    });
    router.replace("/");
    window.location.replace("/");
  };

  return (
    <button
      id="logout-button"
      onClick={onLogout}
      className="cursor-pointer"
      title="Cerrar sesión"
    >
      <LogOut className="w-6" />
    </button>
  );
}
