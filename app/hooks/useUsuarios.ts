/**
 * useUsuarios.ts
 * 
 * Proporciona un hook personalizado para gestión de usuarios con cache optimizado.
 *
 * Este hook de React maneja la carga, almacenamiento y gestión de datos de usuarios
 * del sistema con optimizaciones de rendimiento mediante cache de sesión. Implementa
 * estrategia de cache-first que prioriza datos almacenados localmente para reducir
 * consultas a Firebase, con funcionalidades de limpieza de cache y estados de carga
 * para proporcionar una experiencia de usuario fluida y eficiente en la gestión
 * de grandes volúmenes de datos de usuarios.
 */

"use client";

import { useEffect, useState } from "react";
import { database } from "../../firebaseConfig";
import { ref, get } from "firebase/database";

import type { User } from "@/app/types/user";

/**
 * Hook personalizado para gestión optimizada de usuarios con cache de sesión.
 *
 * Este hook proporciona una interfaz simplificada para cargar y gestionar datos de
 * usuarios del sistema con optimizaciones de rendimiento avanzadas. Implementa una
 * estrategia de cache-first que verifica primero el sessionStorage antes de realizar
 * consultas a Firebase Realtime Database, reduciendo significativamente el tiempo
 * de carga y uso de ancho de banda. Incluye transformación automática de datos desde
 * el formato objeto de Firebase al formato array requerido por la aplicación, manejo
 * robusto de errores, estados de carga para feedback visual y funcionalidad de
 * limpieza de cache para actualizaciones forzadas de datos.
 *
 * @returns Objeto con datos de usuarios, estado de carga y función de limpieza de cache.
 * @returns usuarios - Array de usuarios transformado y listo para uso en componentes.
 * @returns loading - Booleano que indica si hay una carga de datos en progreso.
 * @returns limpiarCacheUsuarios - Función para limpiar cache y forzar recarga de datos.
 *
 * @example
 * ```tsx
 * // Uso básico en componentes de lista de usuarios
 * function UserList() {
 *   const { usuarios, loading, limpiarCacheUsuarios } = useUsuarios();
 * 
 *   if (loading) return <div>Cargando usuarios...</div>;
 * 
 *   return (
 *     <div>
 *       {usuarios.map(user => (
 *         <UserCard key={user.id} user={user} />
 *       ))}
 *       <button onClick={limpiarCacheUsuarios}>
 *         Actualizar datos
 *       </button>
 *     </div>
 *   );
 * }
 * 
 * // En dashboards administrativos con filtrado
 * function AdminDashboard() {
 *   const { usuarios, loading } = useUsuarios();
 *   const [filteredUsers, setFilteredUsers] = useState([]);
 * 
 *   useEffect(() => {
 *     const filtered = usuarios.filter(user => user.rol === 'candidato');
 *     setFilteredUsers(filtered);
 *   }, [usuarios]);
 * 
 *   return (
 *     <div>
 *       <h1>Candidatos ({filteredUsers.length})</h1>
 *       <UserTable users={filteredUsers} loading={loading} />
 *     </div>
 *   );
 * }
 * 
 * // Con gestión de cache para actualizaciones
 * function UserManagement() {
 *   const { usuarios, loading, limpiarCacheUsuarios } = useUsuarios();
 * 
 *   const handleUserUpdate = async (userId) => {
 *     await updateUserInDatabase(userId);
 *     // Limpiar cache para obtener datos actualizados
 *     limpiarCacheUsuarios();
 *   };
 * 
 *   return (
 *     <UserList 
 *       users={usuarios} 
 *       loading={loading}
 *       onUserUpdate={handleUserUpdate}
 *     />
 *   );
 * }
 * ```
 *
 * @see {@link User} - Tipo TypeScript que define la estructura de datos del usuario
 */
export function useUsuarios() {
  /** Estado que almacena el array de usuarios cargados desde Firebase. */
  const [usuarios, setUsuarios] = useState<User[]>([]);
  
  /** Estado que indica si hay una operación de carga en progreso. */
  const [loading, setLoading] = useState(true);

  /**
   * Carga usuarios desde cache de sesión o Firebase Database con estrategia cache-first.
   *
   * Esta función implementa una estrategia de carga optimizada que prioriza los datos
   * almacenados en sessionStorage para mejorar el rendimiento. Si no encuentra datos
   * en cache, consulta Firebase Realtime Database y transforma los datos del formato
   * objeto al formato array requerido por la aplicación. Incluye manejo de errores
   * robusto y actualización automática del cache para consultas futuras.
   */
  const cargarUsuarios = async () => {
    // Verificar cache de sesión primero
    const almacenados = sessionStorage.getItem("usuarios");

    if (almacenados) {
      setUsuarios(JSON.parse(almacenados));
      setLoading(false);
      return;
    }

    try {
      // Consultar Firebase si no hay datos en cache
      const snapshot = await get(ref(database, "usuarios"));

      if (!snapshot.exists()) {
        setUsuarios([]);
        return;
      }

      const dataValue = snapshot.val();

      if (typeof dataValue !== "object" || dataValue === null) return;

      // Transformar datos de objeto a array con IDs
      const usersArray: User[] = Object.entries(dataValue).map(([id, value]) => ({
        id,
        ...(value as Omit<User, "id">),
      }));

      setUsuarios(usersArray);
      // Actualizar cache para consultas futuras
      sessionStorage.setItem("usuarios", JSON.stringify(usersArray));
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Limpia el cache de usuarios y resetea el estado para forzar recarga de datos.
   *
   * Esta función permite forzar la actualización de datos eliminando el cache
   * de sessionStorage y reseteando el estado local. Útil después de operaciones
   * que modifican datos de usuarios para garantizar que la interfaz muestre
   * información actualizada.
   */
  const limpiarCacheUsuarios = () => {
    sessionStorage.removeItem("usuarios");
    setUsuarios([]);
  };

  useEffect(() => {
    /**
     * Inicia la carga de usuarios al montar el componente.
     *
     * Este efecto se ejecuta una sola vez al montar el hook para inicializar
     * la carga de datos de usuarios desde cache o Firebase según disponibilidad.
     */
    cargarUsuarios();
  }, []);

  return { usuarios, loading, limpiarCacheUsuarios };
}