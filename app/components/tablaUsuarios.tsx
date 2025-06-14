/**
 * tablaUsuarios.tsx
 *
 * Proporciona una tabla especializada para mostrar información completa de usuarios del sistema.
 *
 * Este componente renderiza una tabla estructurada que presenta datos de usuarios registrados
 * en el sistema de contrataciones. Incluye información esencial como avatar personalizado,
 * datos personales y de contacto, rol del usuario y estado actual con visualización mediante
 * etiquetas de color. Optimizada para interfaces administrativas y de gestión con diseño
 * responsivo que mantiene la legibilidad en diferentes tamaños de pantalla.
 */

"use client";

import EtiquetaEstado from "./etiquetaEstado";
import ProfilePicture from "./profile-picture";
import type { User } from "@/app/types/user";

/**
 * Renderiza una tabla completa de usuarios del sistema con información detallada.
 *
 * Este componente proporciona una interfaz tabular profesional para visualizar datos
 * de usuarios registrados en el sistema de contrataciones. Presenta información
 * organizada en columnas que incluyen nombre completo con avatar personalizado,
 * rol del usuario con estilo distintivo, datos de contacto y estado actual del
 * usuario mediante etiquetas visuales de color. Incluye manejo de estados vacíos
 * y diseño responsivo optimizado para diferentes dispositivos y resoluciones.
 *
 * @param props - Las propiedades del componente.
 * @param props.users - Array de usuarios del sistema a mostrar en la tabla.
 * @returns El elemento JSX que renderiza la tabla de usuarios completa.
 *
 * @example
 * ```tsx
 * // Uso en dashboard administrativo
 * const usuarios = [
 *   {
 *     id: "1",
 *     nombre: "Juan",
 *     apellidos: "Pérez",
 *     rol: "candidato",
 *     email: "juan@email.com",
 *     telefono: "+52 123 456 7890",
 *     estadoUsuario: "normal"
 *   }
 * ];
 *
 * <UserTable users={usuarios} />
 *
 * // En página de gestión de usuarios
 * <div className="user-management">
 *   <h1>Gestión de Usuarios</h1>
 *   <UserTable users={filteredUsers} />
 * </div>
 *
 * // Con datos filtrados por búsqueda
 * <UserTable users={searchResults} />
 *
 * // En contexto de lista vacía
 * <UserTable users={[]} />
 * // Mostrará: "No se encontraron usuarios."
 * ```
 *
 * @see {@link EtiquetaEstado} - Componente de etiqueta visual para estado del usuario
 * @see {@link ProfilePicture} - Componente de avatar con iniciales del usuario
 * @see {@link User} - Tipo TypeScript que define la estructura de datos del usuario
 */
export default function UserTable({ users }: { users: User[] }) {
  return (
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
            Teléfono
          </th>
          <th className="px-4 py-4 text-start text-[#495057] font-normal bg-white">
            Área
          </th>
          <th className="px-4 py-4 text-start text-[#495057] font-normal bg-white">
            Puesto
          </th>
          <th className="px-4 py-4 text-start text-[#495057] font-normal bg-white rounded-r-xl">
            Estado
          </th>
        </tr>
      </thead>
      <tbody>
        {users.length === 0 ? (
          <tr>
            <td
              colSpan={6}
              className="border-b border-gray-300 px-4 py-4 text-center bg-white rounded-xl"
            >
              No se encontraron usuarios.
            </td>
          </tr>
        ) : (
          users.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-4 bg-white rounded-l-xl flex flex-row items-center gap-2">
                <ProfilePicture
                  nombre={`${user.nombre || ""}`}
                  width="w-10"
                  height="h-10"
                  textSize="text-xl"
                />
                <div>
                  <p className="font-semibold">{user.nombre || "N/A"} {user.apellidos || "N/A"}</p>
                  <p className="text-xs text-[#495057]">{user.email_corporativo || "N/A"}</p>
                </div>
              </td>
              <td className="px-4 py-4 bg-white">
                <div className="bg-blue-100 text-blue-800 rounded-lg text-center capitalize">
                  {user.rol || "N/A"}
                </div>
              </td>
              <td className="px-4 py-4 bg-white">{user.telefono || "N/A"}</td>
              <td className="px-4 py-4 bg-white">{user.area || "N/A"}</td>
              <td className="px-4 py-4 bg-white">{user.puesto || "N/A"}</td>
              <td className="px-4 py-4 bg-white rounded-r-xl capitalize">
                {/* Cambiar esto si afecta con la lógica, cambiar "" a algún valor default */}
                <EtiquetaEstado status={user.estadoUsuario ?? ""} />
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
