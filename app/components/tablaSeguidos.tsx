/**
 * tablaSeguidos.tsx
 *
 * Proporciona una tabla especializada para mostrar candidatos bajo seguimiento del personal de RH.
 *
 * Este componente renderiza una tabla estructurada que muestra la lista de candidatos que están
 * siendo seguidos por el usuario de RH actual. Incluye información completa del candidato como
 * avatar, datos personales, timestamp de inicio de seguimiento, estado actual y navegación
 * directa al perfil. Optimizada para el flujo de trabajo de seguimiento personalizado del
 * personal de Recursos Humanos con diseño responsivo y acciones contextuales.
 */

"use client";

import React from "react";
import ProfilePicture from "./profile-picture";
import EtiquetaEstado from "./etiquetaEstado";
import { ArrowUpRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Define la estructura de un candidato bajo seguimiento.
 */
interface RevisandoEntry {
  /** ID único del candidato. */
  candidateUID: string;

  /** Timestamp ISO de cuándo se inició el seguimiento. */
  since: string;

  /** Nombre del candidato. */
  nombre: string;

  /** Apellidos del candidato. */
  apellidos: string;

  /** Estado actual del candidato en el sistema. */
  estadoUsuario: string;

  /** Correo electrónico del candidato. */
  email: string;
}

/**
 * Define las propiedades del componente TablaRevisando.
 */
interface TablaRevisandoProps {
  /** Array de candidatos bajo seguimiento a mostrar en la tabla. */
  datos: RevisandoEntry[];
}

/**
 * Renderiza una tabla detallada de candidatos bajo seguimiento del RH.
 *
 * Este componente proporciona una interfaz tabular especializada para que el personal
 * de RH visualice y gestione la lista de candidatos que están siguiendo activamente.
 * La tabla incluye avatares personalizados, información completa del candidato,
 * timestamps formateados de inicio de seguimiento, etiquetas de estado visuales y
 * navegación directa al perfil completo del candidato. Optimizada para flujos de
 * trabajo de seguimiento personalizado con diseño responsivo y acciones contextuales
 * que preservan el contexto de navegación.
 *
 * @param props - Las propiedades del componente.
 * @param props.datos - Array de candidatos bajo seguimiento con información completa.
 * @returns El elemento JSX que renderiza la tabla de candidatos seguidos.
 *
 * @example
 * ```tsx
 * // Uso en dashboard de seguimiento de RH
 * const candidatosSeguidos = [
 *   {
 *     candidateUID: "user123",
 *     since: "2024-01-15T10:30:00Z",
 *     nombre: "Juan",
 *     apellidos: "Pérez García",
 *     estadoUsuario: "normal",
 *     email: "juan.perez@email.com"
 *   }
 * ];
 *
 * <TablaRevisando datos={candidatosSeguidos} />
 *
 * // En sección de seguimiento personalizado
 * <div className="seguimiento-section">
 *   <h2>Candidatos bajo mi seguimiento</h2>
 *   <TablaRevisando datos={misCandidatos} />
 * </div>
 *
 * // Con datos obtenidos de API
 * {seguimientoData.length > 0 ? (
 *   <TablaRevisando datos={seguimientoData} />
 * ) : (
 *   <p>No tienes candidatos bajo seguimiento</p>
 * )}
 * ```
 *
 * @see {@link ProfilePicture} - Componente de avatar con iniciales del candidato
 * @see {@link EtiquetaEstado} - Componente de etiqueta visual para estado del usuario
 */
export default function TablaRevisando({ datos }: TablaRevisandoProps) {
  /** Hook de Next.js para navegación programática. */
  const router = useRouter();

  /** Hook de Next.js para obtener la ruta actual y preservar contexto. */
  const pathname = usePathname();

  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-full border-separate border-spacing-y-2 animate-fade-in-up">
        <thead>
          <tr>
            <th className="py-4"></th>
            <th className="px-4 py-4 text-start text-[#495057] font-normal text-sm">
              Nombre
            </th>
            <th className="px-4 py-4 text-start text-[#495057] font-normal text-sm">
              Email
            </th>
            <th className="px-4 py-4 text-start text-[#495057] font-normal text-sm">
              Desde
            </th>
            <th className="px-4 py-4 text-start text-[#495057] font-normal text-sm">
              Estado
            </th>
            <th className="px-4 py-4"></th>
          </tr>
        </thead>
        <tbody>
          {datos.map((entry) => (
            <tr key={entry.candidateUID}>
              {/* Avatar personalizado del candidato */}
              <td className=" py-2 border-b border-gray-300">
                <ProfilePicture
                  nombre={`${entry.nombre || ""}`}
                  width="w-8"
                  height="h-8"
                  textSize="text-xl"
                />
              </td>

              {/* Nombre completo del candidato */}
              <td className="px-4 py-4 border-b border-gray-300">
                {entry.nombre} {entry.apellidos}
              </td>

              {/* Correo electrónico del candidato */}
              <td className="px-4 py-4 border-b border-gray-300">
                {entry.email}
              </td>

              {/* Timestamp formateado de inicio de seguimiento */}
              <td className="px-4 py-4 border-b border-gray-300">
                {new Date(entry.since).toLocaleString("es-MX", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </td>

              {/* Etiqueta visual del estado actual */}
              <td className="px-4 py-4 border-b border-gray-300">
                <EtiquetaEstado status={entry.estadoUsuario} />
              </td>

              {/* Botón de navegación al perfil completo */}
              <td className="px-4 py-4 border-b border-gray-300">
                <button
                  onClick={() =>
                    router.push(
                      `/dashboard/${
                        entry.candidateUID
                      }?from=${encodeURIComponent(pathname)}`
                    )
                  }
                  className="cursor-pointer"
                >
                  <ArrowUpRight className="size-4.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
