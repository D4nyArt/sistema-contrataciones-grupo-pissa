"use client";

import { useEffect, useState } from "react";
import UserCard from "../components/tarjetaUsuarios";
import UserMenu from "../components/menuUsuarios";
import UserTable from "../components/tablaUsuarios";

import type { User } from "@/app/types/user";

export default function ListUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [sortOption, setSortOption] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activo, setActivo] = useState<"grid" | "tabla">("grid");

  useEffect(() => {
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

  const filtrarUsuarios = users.filter((user) => {
    const buscar = searchTerm.toLowerCase();
    const esCandidato = user.rol?.toLowerCase() === "candidato";
    const nombreCompleto = `${user.nombre || ""} ${
      user.apellidos || ""
    }`.toLowerCase();

    return (
      esCandidato &&
      (user.id?.toLowerCase().includes(buscar) ||
        user.nombre?.toLowerCase().includes(buscar) ||
        user.apellidos?.toLowerCase().includes(buscar) ||
        user.email?.toLowerCase().includes(buscar) ||
        user.telefono?.includes(buscar) ||
        nombreCompleto.includes(buscar))
    );
  });

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
      <UserMenu
        searchTerm={searchTerm}
        sortOption={sortOption}
        activo={activo}
        setSearchTerm={setSearchTerm}
        setSortOption={setSortOption}
        setActivo={setActivo}
      />

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
