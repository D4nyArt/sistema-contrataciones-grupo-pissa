"use client";

import ProfilePicture from "./profile-picture";
import { useEffect, useState } from "react";
<<<<<<< HEAD
import UserSkeleton from "./userSkeleton";
=======
>>>>>>> 6df6a10 (UI Chamges: New component for a preview of the password changes requests)

interface User {
  id: string;
  nombre?: string;
  apellidos?: string;
  rol?: string;
  email?: string;
  estadoUsuario: string;
}

export default function PreviewRecover () {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm] = useState("");
    const [sortOption] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
          setLoading(true);
          try {
            const res = await fetch("/api/users");
            if (!res.ok) {
              throw new Error(`Error HTTP: ${res.status}`);
            }
            const data = await res.json();
            setUsers(data);
          } catch (err) {
            console.error("Error al cargar usuarios", err);
            setError("Error al cargar los usuarios. Intente nuevamente.");
          } finally {
            setLoading(false);
          }
        };
        fetchUsers();
      }, []);
    
      const filtrarUsuarios = users.filter((user) => {
        const buscar = searchTerm.toLowerCase();
        const esCandidato = user.rol?.toLowerCase() === "candidato";
        const enProceso = user.estadoUsuario?.toLowerCase() === "cambiocontrasena";
        
        const nombreCompleto = `${user.nombre || ""} ${
          user.apellidos || ""
        }`.toLowerCase();
    
    
        return (
          esCandidato && enProceso &&
          (user.id?.toLowerCase().includes(buscar) ||
            user.nombre?.toLowerCase().includes(buscar) ||
            user.apellidos?.toLowerCase().includes(buscar) ||
            user.email?.toLowerCase().includes(buscar) ||
            nombreCompleto.includes(buscar))
        );
      });
    
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
<<<<<<< HEAD
          <main className="flex-1 mt-4 p-2 flex items-center">
            <UserSkeleton/>
=======
          <main className="flex-1 p-4 flex justify-center items-center">
            <div className="text-center">
              <p className="text-lg">Cargando usuarios...</p>
            </div>
>>>>>>> 6df6a10 (UI Chamges: New component for a preview of the password changes requests)
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
  

    return(
        <main>
            {users.length === 0 && !loading && (
                <div className="text-center p-4">
                    <p>No hay usuarios disponibles.</p>
                </div>
            )}           
            <div>
                <table className="table-auto w-full border-separate border-spacing-y-2 animate-fade-in-up">
                    <tbody>
                        {sortedUsers.length === 0 ? (
                          <tr>
                            <td
                                className="flex fustify-center items-center text-center"
                                colSpan={6}
                            >
                                No se encontraron candidatos en proceso de recuperación.
                            </td>
                          </tr>
                        ) : (
                        sortedUsers.map((user) => (
                            <tr>
<<<<<<< HEAD
                              <td className="flex flex-row items-center justify-center md:justify-normal gap-2 py-4  bg-white md:bg-gray-100 rounded-xl md:p-2">
                                <ProfilePicture
                                  nombre={`${user.nombre || ""}`}
                                  width={"w-10"}
                                  height={"h-10"}
                                  textSize={"text-xl"}
                                />
                                <div className="flex flex-col">
                                  <p className="font-semibold">{user.nombre || "N/A"} {user.apellidos || "N/A"}</p>
                                  <p className="text-xs text-[#495057]">{user.email || "N/A"}</p>
                                </div>
=======
                              <td className="font-semibold px-4 py-4 rounded-l-xl flex-col items-center gap-2">
                                <div className="flex flex-row">
                                    <ProfilePicture
                                        nombre={`${user.nombre || ""}`}
                                        width={"w-8"}
                                        height={"h-8"}
                                        textSize={"text-xl"}
                                    />
                                    {user.nombre || "N/A"} {user.apellidos || "N/A"}
                                </div>
                                {user.email || "N/A"}
>>>>>>> 6df6a10 (UI Chamges: New component for a preview of the password changes requests)
                              </td>
                            </tr>
                          ))
                        )}
                    </tbody>
                </table>
            </div>
        </main>
    )
}