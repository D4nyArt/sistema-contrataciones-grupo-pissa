/**
 * lista-general.tsx
 *
 * Proporciona una interfaz completa para listar y gestionar empleados activos del sistema.
 *
 * Este componente presenta una vista de administración que permite al personal de RH
 * visualizar todos los empleados activos (en proyecto y corporativos) con opciones de
 * búsqueda, filtrado y ordenamiento. Incluye dos modos de visualización (grid de tarjetas
 * y tabla) y funcionalidad de búsqueda en tiempo real por múltiples criterios como nombre,
 * email, teléfono e ID del usuario.
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import UserCard from "../components/tarjetaUsuarios";
import UserMenu from "../components/menuUsuarios";
import UserTable from "../components/tablaUsuarios";

import type { User } from "@/app/types/user";

/**
 * Renderiza una interfaz completa de listado y gestión de empleados activos.
 *
 * Este componente proporciona una experiencia de administración completa para el
 * personal de RH, permitiendo visualizar todos los empleados activos del sistema
 * (tanto en proyecto como corporativos) con funcionalidades avanzadas de búsqueda,
 * filtrado y ordenamiento. Incluye dos modos de visualización intercambiables
 * (grid de tarjetas para vista rápida y tabla para vista detallada) con búsqueda
 * en tiempo real por múltiples campos.
 *
 * @returns El elemento JSX que renderiza la interfaz completa de listado de empleados.
 *
 * @example
 * ```tsx
 * // Uso en dashboard de RH para gestión de empleados
 * <div className="employee-dashboard">
 *   <h1>Gestión de Empleados</h1>
 *   <ListUsers />
 * </div>
 *
 * // El componente automáticamente:
 * // 1. Carga todos los usuarios del sistema
 * // 2. Filtra solo empleados activos (enProyecto y enCorporativo)
 * // 3. Proporciona búsqueda en tiempo real
 * // 4. Permite ordenamiento por nombre/apellido
 * // 5. Ofrece vista en grid y tabla
 * ```
 *
 * @see {@link UserCard} - Componente de tarjeta individual para vista en grid
 * @see {@link UserMenu} - Componente de menú con controles de búsqueda y filtrado
 * @see {@link UserTable} - Componente de tabla para vista detallada de usuarios
 * @see {@link User} - Tipo TypeScript que define la estructura de datos del usuario
 */
export default function ListUsers() {
  /** Estado que almacena la lista completa de usuarios cargados desde la API. */
  const [users, setUsers] = useState<User[]>([]);

  /** Estado que almacena la opción de ordenamiento seleccionada. */
  const [sortOption, setSortOption] = useState("");

  /** Estado que almacena el término de búsqueda ingresado por el usuario. */
  const [searchTerm, setSearchTerm] = useState("");

  /** Estado que controla el modo de visualización activo (grid o tabla). */
  const [activo, setActivo] = useState<"grid" | "tabla">("grid");

  useEffect(() => {
    /**
     * Obtiene la lista completa de usuarios desde la API del sistema.
     *
     * Esta función consulta el endpoint de usuarios para cargar todos los
     * datos disponibles y actualiza el estado local. Maneja errores de
     * conexión y los registra en la consola para depuración.
     */
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Error al cargar usuarios", err);
      }
    };
    fetchUsers();
  }, []);

  /**
   * Callback memoizado para cambiar el modo de visualización.
   *
   * Esta función permite alternar entre los modos de vista "grid" y "tabla"
   * de manera optimizada para evitar re-renderizados innecesarios.
   *
   * @param mode - El modo de visualización a activar ("grid" o "tabla").
   */
  const setActivoCallback = useCallback((mode: "grid" | "tabla") => {
    setActivo(mode);
  }, []);

  /**
   * Lista filtrada de usuarios que contiene solo empleados activos y coincide con el término de búsqueda.
   *
   * Esta función de filtrado:
   * 1. Filtra solo usuarios con roles de empleado activo ("enProyecto" o "enCorporativo")
   * 2. Aplica búsqueda por ID, nombre, apellidos, email, teléfono y nombre completo
   * 3. Realiza comparaciones insensibles a mayúsculas/minúsculas
   * 4. Soporta búsqueda parcial en todos los campos
   */
  const filtrarUsuarios = users.filter((user) => {
    const buscar = searchTerm.toLowerCase();
    const esEmpleado =
      user.rol === "enProyecto" || user.rol === "enCorporativo";
    const nombreCompleto = `${user.nombre || ""} ${
      user.apellidos || ""
    }`.toLowerCase();

    return (
      esEmpleado &&
      (user.id?.toLowerCase().includes(buscar) ||
        user.nombre?.toLowerCase().includes(buscar) ||
        user.apellidos?.toLowerCase().includes(buscar) ||
        user.email?.toLowerCase().includes(buscar) ||
        user.telefono?.includes(buscar) ||
        nombreCompleto.includes(buscar))
    );
  });

  /**
   * Lista ordenada de usuarios empleados según la opción de ordenamiento seleccionada.
   *
   * Esta función aplica ordenamiento alfabético basado en nombre o apellidos,
   * con soporte para orden ascendente (A-Z) y descendente (Z-A). Si no hay
   * opción de ordenamiento seleccionada, retorna la lista filtrada sin modificar.
   */
  const sortedUsers = sortOption
    ? [...filtrarUsuarios].sort((a, b) => {
        const prop: keyof User = sortOption.includes("apellido")
          ? "apellidos"
          : "nombre";
        const textA = (a[prop] || "").toLowerCase();
        const textB = (b[prop] || "").toLowerCase();

        return sortOption.includes("ZA")
          ? textB.localeCompare(textA)
          : textA.localeCompare(textB);
      })
    : filtrarUsuarios;

  return (
    <main className="flex-1 p-4">
      {/* Menú de controles con búsqueda, ordenamiento y selector de vista */}
      <UserMenu
        searchTerm={searchTerm}
        sortOption={sortOption}
        activo={activo}
        setSearchTerm={setSearchTerm}
        setSortOption={setSortOption}
        setActivo={setActivoCallback}
      />

      {/* Renderizado condicional según el modo de visualización activo */}
      {activo === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 content-center">
          {sortedUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      ) : (
        <UserTable users={sortedUsers} />
      )}
    </main>
  );
}
