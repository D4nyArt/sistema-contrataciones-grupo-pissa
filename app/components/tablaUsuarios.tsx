"use client";

import EtiquetaEstado from "./etiquetaEstado";
import ProfilePicture from "./profile-picture";

import type { User } from "@/app/types/user";

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
            Correo
          </th>
          <th className="px-4 py-4 text-start text-[#495057] font-normal bg-white">
            Teléfono
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
              <td className="font-semibold px-4 py-4 bg-white rounded-l-xl flex flex-row items-center gap-2">
                <ProfilePicture
                  nombre={`${user.nombre || ""}`}
                  width="w-8"
                  height="h-8"
                  textSize="text-xl"
                />
                {user.nombre || "N/A"} {user.apellidos || "N/A"}
              </td>
              <td className="px-4 py-4 bg-white">
                <div className="bg-blue-100 text-blue-800 rounded-lg text-center capitalize">
                  {user.rol || "N/A"}
                </div>
              </td>
              <td className="px-4 py-4 bg-white">{user.email || "N/A"}</td>
              <td className="px-4 py-4 bg-white">{user.telefono || "N/A"}</td>
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
