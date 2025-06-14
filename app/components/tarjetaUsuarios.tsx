/**
 * tarjetaUsuarios.tsx
 *
 * Proporciona tarjetas de usuario interactivas para visualización en formato de grid.
 *
 * Este componente renderiza información de usuarios en un formato de tarjeta compacta
 * y visualmente atractiva. Incluye avatar personalizado, información de contacto con
 * iconografía, roles formateados y navegación directa al perfil completo del usuario.
 * Optimizado para interfaces de tipo grid con efectos de hover y transiciones suaves
 * que mejoran la experiencia de usuario en la gestión y visualización de personal.
 */

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProfilePicture from "./profile-picture";
import { Mail, Phone } from "lucide-react";
import { urbanist } from "./fonts";

import type { User } from "@/app/types/user";
import EtiquetaEstado from "./etiquetaEstado";

/**
 * Renderiza una tarjeta de usuario interactiva con información esencial y navegación.
 *
 * Este componente proporciona una representación visual compacta de la información
 * del usuario en formato de tarjeta. Incluye avatar personalizado con iniciales,
 * nombre completo, rol formateado con etiquetas legibles, y datos de contacto con
 * iconografía descriptiva. La tarjeta es completamente clickeable para navegación
 * directa al perfil detallado del usuario, preservando el contexto de navegación
 * mediante parámetros de URL. Incluye efectos visuales de hover y transformaciones
 * suaves que mejoran la interactividad y feedback visual.
 *
 * @param props - Las propiedades del componente.
 * @param props.user - Objeto de usuario con información completa a mostrar.
 * @returns El elemento JSX que renderiza la tarjeta de usuario interactiva.
 *
 * @example
 * ```tsx
 * // Uso en grid de usuarios
 * <div className="user-grid">
 *   {users.map(user => (
 *     <UserCard key={user.id} user={user} />
 *   ))}
 * </div>
 *
 * // En lista de candidatos
 * <div className="candidates-list">
 *   {candidates.map(candidate => (
 *     <UserCard key={candidate.id} user={candidate} />
 *   ))}
 * </div>
 *
 * // Con datos específicos
 * const userData = {
 *   id: "123",
 *   nombre: "Juan",
 *   apellidos: "Pérez",
 *   rol: "candidato",
 *   email: "juan@email.com",
 *   telefono: "+52 123 456 7890"
 * };
 *
 * <UserCard user={userData} />
 * ```
 * @see {@link User} - Tipo TypeScript que define la estructura de datos del usuario
 */
export default function UserCard({ user }: { user: User }) {
  /** Hook de Next.js para navegación programática. */
  const router = useRouter();

  /** Hook de Next.js para obtener la ruta actual. */
  const pathname = usePathname();

  /** Hook de Next.js para acceder a parámetros de consulta. */
  const searchParams = useSearchParams();

  /** Ruta completa actual incluyendo parámetros para preservar contexto. */
  const fullPath = `${pathname}?${searchParams.toString()}`;

  /**
   * Formatea el rol del usuario para una presentación más legible.
   *
   * Esta variable transforma los códigos de rol internos en etiquetas
   * amigables para el usuario, mejorando la comprensión y presentación
   * visual de los diferentes tipos de usuarios en el sistema.
   */
  let userRole = "N/A";
  if (user.rol === "enProyecto") {
    userRole = "En Proyecto";
  } else if (user.rol === "enCorporativo") {
    userRole = "En Corporativo";
  } else if (user.rol === "rh") {
    userRole = "RH";
  } else if (user.rol === "admin") {
    userRole = "ADMIN";
  } else if (user.rol === "candidato") {
    userRole = "Candidato";
  }

  return (
    <div
      onClick={() =>
        router.push(
          `/dashboard/${user.id}?from=${encodeURIComponent(fullPath)}`
        )
      }
      className="cursor-pointer p-4 bg-white rounded-xl shadow-md transition-transform transform hover:scale-105 flex flex-col animate-fade-in-up"
    >
      <div className="flex flex-col border-b border-gray-200 mb-4">
        <div className="flex items-center">
          <div className="flex-none">
            <ProfilePicture
              nombre={`${user.nombre || ""}`}
              width="w-11"
              height="h-11"
              textSize="text-2xl"
            />
          </div>
          <div className="ml-4">
            <p
              className={`${urbanist.className} text-lg font-semibold text-black flex-auto`}
            >
              {user.nombre || "N/A"} {user.apellidos || ""}
            </p>
            <p className="text-sm text-[#2975a0] capitalize">
              {userRole || "N/A"}
            </p>
          </div>
        </div>
        <div className="mt-4 mb-4 flex">
          <EtiquetaEstado status={user.estadoUsuario ?? ""} />
        </div>
      </div>
      <div className="">
        <div className="text-xs text-[#495057] flex items-center">
          <Mail className="pr-2 flex-none" />
          <p className="flex-auto">{user.email || "N/A"}</p>
        </div>
        <div className="text-xs text-[#495057] flex items-center">
          <Phone className="pr-2 flex-none" />
          <p className="flex-auto">{user.telefono || "N/A"}</p>
        </div>
      </div>
    </div>
  );
}
