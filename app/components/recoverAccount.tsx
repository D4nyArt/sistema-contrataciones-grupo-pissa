"use client";

/* eslint @typescript-eslint/no-unused-vars: ["error", { "varsIgnorePattern": "^_" }] */

import { useEffect, useState } from "react";
import ProfilePicture from "./profile-picture";
import { Table2 } from "lucide-react";
import { handleBlock, handleUnblock } from "../components/block";
import { addHistoryEntry } from "../api/history/history";
import { getAuth } from "firebase/auth";
import sendEmailNotification from "../components/sendEmailNotification";
const auth = getAuth();
const rhID = auth.currentUser?.uid;


interface User {
  id: string;
  nombre?: string;
  apellidos?: string;
  rol?: string;
  email?: string;
  estadoUsuario: string;
}

export default  function ListUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activo, setActivo] = useState<"grid" | "tabla">("tabla");
  const [_estadoUsuario, setStatus] = useState("");
  const [_attempt, setAttempt] = useState(0);
  const [_time, setTime] = useState("");
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [userRol, setUserRol] = useState<string>("");

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
        
      // Para Ponce: Esto es para gestionar los privilegios 
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userData = data.find((user: User) => user.id === currentUser.uid);
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
        esCandidato && enProceso &&
        (user.id?.toLowerCase().includes(buscar) ||
          user.nombre?.toLowerCase().includes(buscar) ||
          user.apellidos?.toLowerCase().includes(buscar) ||
          user.email?.toLowerCase().includes(buscar) ||
          nombreCompleto.includes(buscar))
      );
    }
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
      <div className="mb-4 flex gap-6 text-black animate-fade-in-up">
        <input
          type="text"
          placeholder="Buscar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-400 rounded-lg w-full bg-white"
        />
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="cursor-pointer border p-1 pl-4 rounded-lg bg-[#2d4583] text-white hover:bg-[#08b177]"
        >
          <option value="">Ordenar por</option>
          <option value="nombreAZ">Nombre A → Z</option>
          <option value="nombreZA">Nombre Z → A</option>
          <option value="apellidoAZ">Apellido A → Z</option>
          <option value="apellidoZA">Apellido Z → A</option>
        </select>
        <div className="md:flex shadow-md bg-white rounded-l-lg rounded-r-lg hidden text-[#495057]">
          <button
            onClick={() => setActivo("tabla")}
            className={`cursor-pointer rounded-lg p-1 pl-2 pr-2 transition-colors border ${
              activo === "tabla"
                ? "border-[#2d4583] text-[#2d4583]"
                : "border-transparent hover:text-[#08b177]"
            }`}
          >
            <Table2 />
          </button>
        </div>
      </div>

      {users.length === 0 && !loading && (
        <div className="text-center p-4 bg-white rounded-lg shadow">
          <p>No hay usuarios disponibles.</p>
        </div>
      )}

      {activo === "tabla" && (
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
                    <td className="px-4 py-4 bg-white">
                      {user.email || "N/A"}
                    </td>
                    <td className="px-4 py-4 bg-white rounded-r-xl text-center">
                      <div className="flex justify-center gap-4">
                        <button
                          className="px-6 py-2 rounded bg-green-500 text-white transition-all duration-200 hover:bg-green-600 hover:shadow-lg hover:scale-105 focus:outline-none"
                          title="Aprobar"
                          onClick={async () => {
                            setRemovingUserId(user.id);
                            setTimeout(async () => {
                              handleUnblock(user.id, user.estadoUsuario || "", setStatus, setAttempt, setTime);
                              setUsers((prev) => prev.filter((u) => u.id !== user.id));
                              setRemovingUserId(null);
                              await addHistoryEntry(user.id, 'contrasenas', new Date().toISOString(), rhID, 'Recuperación aprobada');
                              await sendEmailNotification(user.id, 'Su recuperación de contraseña fue aprobada', 'Ahora puede acceder a su cuenta con sus nuevas credenciales');
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
                              setUsers((prev) => prev.filter((u) => u.id !== user.id));
                              setRemovingUserId(null);
                              await addHistoryEntry(user.id, 'contrasenas', new Date().toISOString(), rhID, 'Recuperación denegada');
                              await sendEmailNotification(user.id, 'Su recuperación de contraseña fue denegada', 'No se aprobó su cambio de contraseña, por favor, contacte al administrador.');
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
      )}
    </main>
  );
}