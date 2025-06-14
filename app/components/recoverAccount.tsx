/**
 * recoverAccount.tsx
 *
 * Proporciona una interfaz para gestionar solicitudes de recuperación de contraseña de candidatos.
 *
 * Este componente permite al personal de RH revisar y procesar solicitudes de recuperación
 * de contraseña pendientes de candidatos. Incluye funcionalidad de búsqueda, ordenamiento
 * y acciones de aprobación/denegación con notificaciones automáticas por email y registro
 * de historial. Las acciones incluyen animaciones suaves de eliminación de la lista una
 * vez procesadas las solicitudes.
 */

"use client";

/* eslint @typescript-eslint/no-unused-vars: ["error", { "varsIgnorePattern": "^_" }] */

import { useEffect, useState } from "react";
import ProfilePicture from "./profile-picture";
import { handleBlock, handleUnblock } from "../components/block";
import { addHistoryEntry } from "../api/history/history";
import { getAuth } from "firebase/auth";
import sendEmailNotification from "../components/sendEmailNotification";

/**
 * Obtiene la instancia de autenticación y el ID del usuario RH actual.
 */
const auth = getAuth();
const rhID = auth.currentUser?.uid;

/**
 * Define la estructura de un usuario en el sistema.
 */
interface User {
  /** ID único del usuario. */
  id: string;

  /** Nombre del usuario (opcional). */
  nombre?: string;

  /** Apellidos del usuario (opcional). */
  apellidos?: string;

  /** Rol del usuario en el sistema (opcional). */
  rol?: string;

  /** Correo electrónico del usuario (opcional). */
  email?: string;

  /** Estado actual del usuario en el sistema. */
  estadoUsuario: string;
}

/**
 * Renderiza una interfaz de gestión de solicitudes de recuperación de contraseña.
 *
 * Este componente proporciona una tabla interactiva que muestra todos los candidatos
 * que tienen solicitudes pendientes de recuperación de contraseña (estado "cambiocontrasena").
 * Permite al personal de RH buscar, ordenar y procesar estas solicitudes mediante
 * botones de aprobación y denegación. Cada acción desencadena notificaciones automáticas
 * por email, registro en el historial del usuario y animaciones de eliminación de la lista.
 *
 * @returns El elemento JSX que renderiza la interfaz de gestión de recuperaciones.
 *
 * @example
 * ```tsx
 * // Uso en dashboard de RH para gestión de recuperaciones
 * <div className="recovery-management">
 *   <h1>Solicitudes de Recuperación</h1>
 *   <ListUsers />
 * </div>
 *
 * // El componente automáticamente:
 * // 1. Carga usuarios con estado "cambiocontrasena"
 * // 2. Filtra solo candidatos con solicitudes pendientes
 * // 3. Permite búsqueda y ordenamiento
 * // 4. Procesa aprobaciones/denegaciones
 * // 5. Envía notificaciones y registra historial
 * ```
 *
 * @see {@link ProfilePicture} - Componente de avatar para mostrar iniciales del usuario
 * @see {@link handleBlock} - Función para bloquear usuario tras denegación
 * @see {@link handleUnblock} - Función para desbloquear usuario tras aprobación
 * @see {@link addHistoryEntry} - Función para registrar acciones en el historial
 * @see {@link sendEmailNotification} - Función para enviar notificaciones por email
 */
export default function ListUsers() {
  /** Estado que almacena la lista de usuarios cargados desde la API. */
  const [users, setUsers] = useState<User[]>([]);

  /** Estado que indica si hay una carga en progreso. */
  const [loading, setLoading] = useState(true);

  /** Estado que almacena mensajes de error. */
  const [error, setError] = useState("");

  /** Estado que almacena la opción de ordenamiento seleccionada. */
  const [sortOption, setSortOption] = useState("");

  /** Estado que almacena el término de búsqueda. */
  const [searchTerm, setSearchTerm] = useState("");

  /** Estado que controla el modo de visualización (fijo en tabla). */
  const [activo, setActivo] = useState<"grid" | "tabla">("tabla");

  /** Estado para el estado del usuario (no utilizado actualmente). */
  const [_estadoUsuario, setStatus] = useState("");

  /** Estado para intentos (no utilizado actualmente). */
  const [_attempt, setAttempt] = useState(0);

  /** Estado para tiempo (no utilizado actualmente). */
  const [_time, setTime] = useState("");

  /** Estado que almacena el ID del usuario que se está eliminando para animación. */
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [userRol, setUserRol] = useState<string>("");

  useEffect(() => {
    /**
     * Obtiene la lista de usuarios desde la API del sistema.
     *
     * Esta función consulta el endpoint de usuarios para cargar todos los
     * datos disponibles y actualiza el estado local. Maneja errores de
     * conexión y proporciona feedback visual apropiado.
     */
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/users");
        if (!res.ok) {
          throw new Error(`Error HTTP: ${res.status}`);
        }
        const data = await res.json();
        setUsers(data);

        // Para Ponce: Esto es para gestionar los privilegios
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userData = data.find(
            (user: User) => user.id === currentUser.uid
          );
          if (userData) {
            setUserRol(userData.rol || "");
          }
        }
      } catch (err) {
        console.error("Error al cargar usuarios", err);
        setError("Error al cargar los usuarios. Intente nuevamente.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  /**
   * Lista filtrada de usuarios que contiene solo candidatos con solicitudes de recuperación pendientes.
   *
   * Esta función aplica múltiples filtros:
   * 1. Solo usuarios con rol "candidato"
   * 2. Solo usuarios con estado "cambiocontrasena"
   * 3. Búsqueda por ID, nombre, apellidos, email o nombre completo
   * 4. Comparaciones insensibles a mayúsculas/minúsculas
   */
  const filtrarUsuarios = users.filter((user) => {
    const buscar = searchTerm.toLowerCase();
    const esCandidato = user.rol?.toLowerCase() === "candidato";
    const enProceso = user.estadoUsuario?.toLowerCase() === "cambiocontrasena";
    const esAdmin = userRol.toLowerCase() === "admin";

    const nombreCompleto = `${user.nombre || ""} ${
      user.apellidos || ""
    }`.toLowerCase();

    if (esAdmin) {
      return (
        enProceso &&
        (user.id?.toLowerCase().includes(buscar) ||
          user.nombre?.toLowerCase().includes(buscar) ||
          user.apellidos?.toLowerCase().includes(buscar) ||
          user.email?.toLowerCase().includes(buscar) ||
          nombreCompleto.includes(buscar))
      );
    } else {
      return (
        esCandidato &&
        enProceso &&
        (user.id?.toLowerCase().includes(buscar) ||
          user.nombre?.toLowerCase().includes(buscar) ||
          user.apellidos?.toLowerCase().includes(buscar) ||
          user.email?.toLowerCase().includes(buscar) ||
          nombreCompleto.includes(buscar))
      );
    }
  });

  /**
   * Lista ordenada de usuarios según la opción de ordenamiento seleccionada.
   *
   * Esta función aplica ordenamiento alfabético basado en nombre o apellidos,
   * con soporte para orden ascendente (A-Z) y descendente (Z-A).
   */
  const sortedUsers = sortOption
    ? [...filtrarUsuarios].sort((a, b) => {
        let prop: keyof User = "nombre";
        if (sortOption.includes("apellido")) prop = "apellidos";

        const textA = (a[prop] || "").toLowerCase();
        const textB = (b[prop] || "").toLowerCase();

        return sortOption.includes("ZA")
          ? textB.localeCompare(textA)
          : textA.localeCompare(textB);
      })
    : filtrarUsuarios;

  if (loading) {
    return (
      <main className="flex-1 p-4 flex justify-center items-center">
        <div className="text-center">
          <p className="text-lg">Cargando usuarios...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 p-4 flex justify-center items-center">
        <div className="text-center text-red-500">
          <p className="text-lg">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4">
      {users.length === 0 && !loading && (
        <div className="text-center p-4 bg-white rounded-lg shadow">
          <p>No hay usuarios disponibles.</p>
        </div>
      )}

      <div>
        <table className="table-auto w-full border-separate border-spacing-y-2 animate-fade-in-up">
          <thead>
            <tr className="shadow-xs rounded-xl">
              <th className="px-4 py-4 text-start text-[#495057] font-normal bg-white rounded-l-xl">
                Nombre
              </th>
              <th className="px-4 py-4 text-start text-[#495057] font-normal bg-white">
                Rol
              </th>
              <th className="px-4 py-4 text-start text-[#495057] font-normal bg-white">
                Correo
              </th>
              <th className="px-4 py-4 text-center text-[#495057] font-normal bg-white rounded-r-xl">
                Recuperación
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.length === 0 ? (
              <tr>
                <td
                  className="border-b border-gray-300 px-4 py-4 text-center bg-white rounded-xl"
                  colSpan={6}
                >
                  No se encontraron candidatos en proceso de recuperación.
                </td>
              </tr>
            ) : (
              sortedUsers.map((user) => (
                <tr
                  key={user.id}
                  className={`transition-all duration-300 ease-in-out ${
                    removingUserId === user.id ? "opacity-0 -translate-y-2" : ""
                  }`}
                >
                  <td className="font-semibold px-4 py-4 bg-white rounded-l-xl flex flex-row items-center gap-2">
                    <ProfilePicture
                      nombre={`${user.nombre || ""}`}
                      width={"w-8"}
                      height={"h-8"}
                      textSize={"text-xl"}
                    />
                    {user.nombre || "N/A"} {user.apellidos || "N/A"}
                  </td>
                  <td className="px-4 py-4 bg-white">
                    <div className="bg-blue-100 text-blue-800 rounded-lg text-center">
                      {user.rol || "N/A"}
                    </div>
                  </td>
                  <td className="px-4 py-4 bg-white">{user.email || "N/A"}</td>
                  <td className="px-4 py-4 bg-white rounded-r-xl text-center">
                    <div className="flex justify-center gap-4">
                      <button
                        className="px-6 py-2 rounded bg-green-500 text-white transition-all duration-200 hover:bg-green-600 hover:shadow-lg hover:scale-105 focus:outline-none"
                        title="Aprobar"
                        onClick={async () => {
                          setRemovingUserId(user.id);
                          setTimeout(async () => {
                            handleUnblock(
                              user.id,
                              user.estadoUsuario || "",
                              setStatus,
                              setAttempt,
                              setTime
                            );
                            setUsers((prev) =>
                              prev.filter((u) => u.id !== user.id)
                            );
                            setRemovingUserId(null);
                            await addHistoryEntry(
                              user.id,
                              "contrasenas",
                              new Date().toISOString(),
                              rhID,
                              "Recuperación aprobada"
                            );
                            await sendEmailNotification(
                              user.id,
                              "Su recuperación de contraseña fue aprobada",
                              "Ahora puede acceder a su cuenta con sus nuevas credenciales"
                            );
                          }, 300);
                        }}
                      >
                        Aprobado
                      </button>
                      <button
                        className="px-6 py-2 rounded bg-red-500 text-white transition-all duration-200 hover:bg-red-600 hover:shadow-lg hover:scale-105 focus:outline-none"
                        title="Denegar"
                        onClick={async () => {
                          setRemovingUserId(user.id);
                          setTimeout(async () => {
                            handleBlock(user.id, setStatus, user.estadoUsuario);
                            setUsers((prev) =>
                              prev.filter((u) => u.id !== user.id)
                            );
                            setRemovingUserId(null);
                            await addHistoryEntry(
                              user.id,
                              "contrasenas",
                              new Date().toISOString(),
                              rhID,
                              "Recuperación denegada"
                            );
                            await sendEmailNotification(
                              user.id,
                              "Su recuperación de contraseña fue denegada",
                              "No se aprobó su cambio de contraseña, por favor, contacte al administrador."
                            );
                          }, 300);
                        }}
                      >
                        Denegado
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
