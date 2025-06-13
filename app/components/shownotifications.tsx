/**
 * shownotifications.tsx
 *
 * Proporciona una interfaz completa de gestión y visualización de notificaciones para usuarios de RH.
 *
 * Este componente maneja el sistema de notificaciones del personal de Recursos Humanos, ofreciendo
 * funcionalidades avanzadas como filtrado por estado (leídas/no leídas/guardadas), paginación,
 * marcado de lectura automático, sistema de guardado/favoritos y navegación directa a páginas
 * relacionadas. Integra con la URL para mantener el estado de pestañas y paginación entre
 * navegaciones, proporcionando una experiencia de usuario completa y persistente.
 */

"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import { auth } from "@/firebaseConfig";
import {
  Dot,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Define la estructura de una notificación en el sistema.
 */
type Notification = {
  /** ID único de la notificación (timestamp). */
  id: string;

  /** Contenido del mensaje de la notificación. */
  message: string;

  /** Estado de lectura de la notificación. */
  read: boolean;

  /** Ruta de navegación asociada a la notificación. */
  path: string;

  /** Estado de guardado/favorito de la notificación. */
  pinned: boolean;
};

/** Número de notificaciones a mostrar por página en la paginación. */
const ITEMS_PER_PAGE = 10;

/**
 * Renderiza una interfaz completa de gestión de notificaciones para usuarios de RH.
 *
 * Este componente proporciona un sistema integral de notificaciones que permite al personal
 * de RH visualizar, filtrar y gestionar sus notificaciones de manera eficiente. Incluye:
 * - Autenticación automática y carga de notificaciones del usuario
 * - Sistema de pestañas para filtrar por estado (todas/no leídas/leídas/guardadas)
 * - Paginación para manejar grandes volúmenes de notificaciones
 * - Marcado automático de lectura al hacer clic en notificaciones
 * - Sistema de guardado/favoritos para notificaciones importantes
 * - Navegación directa a páginas relacionadas con cada notificación
 * - Timestamps relativos y absolutos para contexto temporal
 * - Diseño responsivo adaptado para móvil y escritorio
 *
 * @returns El elemento JSX que renderiza la interfaz completa de notificaciones.
 *
 * @example
 * ```tsx
 * // Uso en dashboard de RH
 * <div className="rh-dashboard">
 *   <h1>Panel de Control</h1>
 *   <ShowNotifications />
 * </div>
 *
 * // El componente automáticamente:
 * // 1. Detecta el usuario autenticado de RH
 * // 2. Carga sus notificaciones desde /api/getNotifications
 * // 3. Proporciona filtrado y paginación
 * // 4. Maneja navegación y marcado de lectura
 * // 5. Sincroniza estado con parámetros de URL
 * ```
 */
export default function ShowNotifications() {
  /** Estado que almacena el UID del usuario de RH autenticado. */
  const [rhUID, setRhUID] = useState<string | null>(null);

  /** Estado que almacena la lista de notificaciones del usuario. */
  const [notifications, setNotifications] = useState<Notification[]>([]);

  /** Estado que indica si hay una carga de datos en progreso. */
  const [loading, setLoading] = useState<boolean>(true);

  /** Estado que controla qué pestaña de filtro está activa. */
  const [activeTab, setActiveTab] = useState<
    "all" | "unread" | "read" | "saved"
  >("all");

  /** Hook de Next.js para navegación programática. */
  const router = useRouter();

  /** Hook de Next.js para acceder a parámetros de consulta de la URL. */
  const searchParams = useSearchParams();

  /** Hook de Next.js para obtener la ruta actual. */
  const pathname = usePathname();

  /** Parámetro de pestaña extraído de la URL. */
  const tabParam = searchParams.get("tab") as
    | "all"
    | "unread"
    | "read"
    | "saved"
    | null;

  /** Parámetro de página extraído de la URL, con valor por defecto de 1. */
  const pageParam = parseInt(searchParams.get("page") || "1", 10);

  /** Página actual de la paginación, validada para evitar valores inválidos. */
  const currentPage = isNaN(pageParam) ? 1 : pageParam;

  useEffect(() => {
    /**
     * Sincroniza el estado de la pestaña activa con los parámetros de URL.
     *
     * Este efecto actualiza la pestaña activa cuando cambian los parámetros
     * de URL, permitiendo navegación directa y persistencia del estado.
     */
    if (tabParam) setActiveTab(tabParam);
  }, [tabParam]);

  /**
   * Maneja el cambio de pestaña de filtrado y actualiza la URL.
   *
   * Esta función actualiza tanto el estado local como los parámetros de URL
   * cuando el usuario selecciona una pestaña diferente, restableciendo la
   * página a 1 para evitar inconsistencias en la paginación.
   *
   * @param tab - La nueva pestaña de filtrado a activar.
   */
  const handleTabChange = (tab: "all" | "unread" | "read" | "saved") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  /**
   * Maneja el cambio de página en la paginación y actualiza la URL.
   *
   * Esta función actualiza los parámetros de URL para reflejar la nueva
   * página seleccionada, manteniendo la sincronización entre la interfaz
   * y la navegación del navegador.
   *
   * @param newPage - El número de la nueva página a mostrar.
   */
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    /**
     * Establece un listener para cambios en el estado de autenticación.
     *
     * Este efecto monitorea los cambios en la autenticación de Firebase
     * para actualizar automáticamente el UID del usuario cuando inicia
     * o cierra sesión, garantizando que las notificaciones correspondan
     * al usuario correcto.
     */
    const unsub = onAuthStateChanged(auth, (user) => {
      setRhUID(user?.uid ?? null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    /**
     * Obtiene las notificaciones del usuario autenticado desde la API.
     *
     * Esta función consulta el endpoint de notificaciones para cargar
     * todas las notificaciones del usuario actual y actualiza el estado
     * local. Se ejecuta cada vez que cambia el UID del usuario.
     */
    async function fetchNotifications() {
      if (!rhUID) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const res = await fetch(`/api/getNotifications?uid=${rhUID}`);
      const data = await res.json();
      setNotifications(data);
      setLoading(false);
    }

    fetchNotifications();
  }, [rhUID]);

  /**
   * Marca una notificación como leída y actualiza el estado local.
   *
   * Esta función envía una petición a la API para marcar una notificación
   * específica como leída y actualiza inmediatamente el estado local para
   * proporcionar feedback visual instantáneo al usuario.
   *
   * @param id - El ID único de la notificación a marcar como leída.
   */
  async function updateReadStatus(id: string) {
    await fetch(`/api/markNotificationRead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: rhUID, id }),
    });

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  /**
   * Alterna el estado de guardado/favorito de una notificación.
   *
   * Esta función permite al usuario marcar o desmarcar notificaciones
   * como favoritas/guardadas para acceso rápido posterior. Actualiza
   * tanto el servidor como el estado local para mantener sincronización.
   *
   * @param id - El ID único de la notificación a modificar.
   * @param currentPinned - El estado actual de guardado de la notificación.
   */
  const handleToggleSave = async (id: string, currentPinned: boolean) => {
    const newPinned = !currentPinned;

    await fetch("/api/markNotificationPinned", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: rhUID, id, pinned: newPinned }),
    });

    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, pinned: newPinned } : notif
      )
    );
  };

  /**
   * Lista filtrada y ordenada de notificaciones según la pestaña activa.
   *
   * Esta función aplica filtrado por estado de lectura o guardado según
   * la pestaña seleccionada y ordena las notificaciones por ID (timestamp)
   * en orden descendente para mostrar las más recientes primero.
   */
  const filtered = [...notifications]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .filter((n) => {
      if (activeTab === "unread") return !n.read;
      if (activeTab === "read") return n.read;
      if (activeTab === "saved") return n.pinned;
      return true;
    });

  /** Número total de páginas necesarias para la paginación. */
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  /** Subset de notificaciones para la página actual. */
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /**
   * Convierte un timestamp numérico en una representación textual del tiempo transcurrido.
   *
   * Esta función proporciona timestamps relativos para notificaciones recientes
   * (minutos, horas, días) y timestamps absolutos para notificaciones más antiguas,
   * mejorando la comprensión temporal para el usuario.
   *
   * @param timestamp - El timestamp numérico de la notificación.
   * @returns Una cadena que representa el tiempo transcurrido o la fecha absoluta.
   */
  function tiempoNotificacion(timestamp: number): string {
    const ahora = Date.now();
    const diffMs = ahora - timestamp;

    const segundos = Math.floor(diffMs / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (minutos < 1) return "Hace unos segundos";
    if (minutos < 60)
      return `Hace ${minutos} minuto${minutos !== 1 ? "s" : ""}`;
    if (horas < 24) return `Hace ${horas} hora${horas !== 1 ? "s" : ""}`;
    if (dias < 7) return `Hace ${dias} día${dias !== 1 ? "s" : ""}`;
    const fecha = new Date(timestamp);
    return fecha.toLocaleString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  return (
    <div className="p-4">
      {/* Sistema de pestañas para filtrado (versión escritorio) */}
      <div className="md:flex space-x-4 mb-4 hidden">
        {["all", "unread", "read", "saved"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg cursor-pointer animate-fade-in-up ${
              activeTab === tab
                ? "bg-[#2d4583] text-white"
                : "bg-gray-200 hover:bg-[#08b177] hover:text-white"
            }`}
            onClick={() => handleTabChange(tab as typeof activeTab)}
          >
            {
              {
                all: "Todas",
                unread: "No leídas",
                read: "Leídas",
                saved: "Guardadas",
              }[tab]
            }
          </button>
        ))}
      </div>

      {/* Sistema de pestañas simplificado para móvil */}
      <div className="md:hidden space-x-4 mb-4 flex">
        {["all", "saved"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg cursor-pointer animate-fade-in-up ${
              activeTab === tab
                ? "bg-[#2d4583] text-white"
                : "bg-gray-200 hover:bg-[#08b177] hover:text-white"
            }`}
            onClick={() => handleTabChange(tab as typeof activeTab)}
          >
            {
              {
                all: "Todas",
                saved: "Guardadas",
              }[tab]
            }
          </button>
        ))}
      </div>

      {/* Encabezado con contador de notificaciones */}
      <div className="rounded-t-xl bg-gray-200 border-b border-gray-300 p-4 flex animate-fade-in-up">
        <h2 className="text-lg font-semibold text-[#495057]">
          {filtered.length} Notificaci
          {filtered.length === 1 ? "ón" : "ones"}
        </h2>
      </div>

      {/* Área principal de contenido */}
      <div className="rounded-b-xl bg-white animate-fade-in-up">
        {loading ? (
          /* Estado de carga con skeletons animados */
          <div className="p-4 space-y-4">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-4 animate-pulse"
              >
                <div className="w-8 h-8 bg-gray-300 rounded-full" />
                <div className="w-6 h-6 bg-gray-300 rounded" />
                <div className="flex-1 h-4 bg-gray-300 rounded" />
                <div className="w-24 h-4 bg-gray-300 rounded" />
              </div>
            ))}
          </div>
        ) : paginated.length === 0 ? (
          /* Estado vacío cuando no hay notificaciones */
          <div className="flex items-center justify-center bg-white p-4 h-full rounded-b-xl">
            <p className="text-gray-500">
              No tienes notificaciones{" "}
              {
                {
                  unread: "no leídas",
                  read: "leídas",
                  all: "registradas",
                  saved: "guardadas",
                }[activeTab]
              }
              .
            </p>
          </div>
        ) : (
          <>
            {/* Tabla de notificaciones */}
            <div className="overflow-x-auto h-102">
              <table className="w-full text-left table-auto">
                <tbody>
                  {paginated.map(({ id, message, read, path, pinned }) => (
                    <tr
                      key={id}
                      className="border-b border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      {/* Indicador de estado de lectura */}
                      <td>
                        <Dot
                          className={
                            read
                              ? "text-gray-400 size-10"
                              : "text-[#08b177] size-10"
                          }
                        />
                      </td>

                      {/* Botón de guardado/favorito */}
                      <td>
                        <div className="flex justify-center items-center">
                          <button onClick={() => handleToggleSave(id, pinned)}>
                            {pinned ? (
                              <BookmarkCheck className="text-[#2d4583] cursor-pointer" />
                            ) : (
                              <Bookmark className="cursor-pointer" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Mensaje de la notificación (clickeable para navegación) */}
                      <td
                        onClick={async () => {
                          await updateReadStatus(id);
                          router.push(
                            `/${path}&from=${encodeURIComponent(pathname)}`
                          );
                        }}
                        className="px-8"
                      >
                        {message}
                      </td>

                      {/* Timestamp relativo */}
                      <td className="text-sm text-gray-500">
                        {tiempoNotificacion(Number(id))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Controles de paginación */}
            <div className="flex justify-center space-x-2 p-6 border-t border-gray-200">
              <button
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className={`px-3 py-1 rounded cursor-pointer ${
                  currentPage <= 1
                    ? "bg-gray-300 text-gray-500"
                    : "bg-[#2d4583] text-white hover:bg-[#1b2e6a]"
                }`}
              >
                <ChevronLeft />
              </button>
              <span className="px-4 py-1 text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className={`px-3 py-1 rounded cursor-pointer ${
                  currentPage >= totalPages
                    ? "bg-gray-300 text-gray-500"
                    : "bg-[#2d4583] text-white hover:bg-[#1b2e6a]"
                }`}
              >
                <ChevronRight />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
