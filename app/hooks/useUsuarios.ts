"use client";

import { useEffect, useState } from "react";
import { database } from "../../firebaseConfig";
import { ref, get } from "firebase/database";

import type { User } from "@/app/types/user";

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarUsuarios = async () => {
    const almacenados = sessionStorage.getItem("usuarios");

    if (almacenados) {
      setUsuarios(JSON.parse(almacenados));
      setLoading(false);
      return;
    }

    try {
      const snapshot = await get(ref(database, "usuarios"));

      if (!snapshot.exists()) {
        setUsuarios([]);
        return;
      }

      const dataValue = snapshot.val();

      if (typeof dataValue !== "object" || dataValue === null) return;

      const usersArray: User[] = Object.entries(dataValue).map(([id, value]) => ({
        id,
        ...(value as Omit<User, "id">),
      }));

      setUsuarios(usersArray);
      sessionStorage.setItem("usuarios", JSON.stringify(usersArray));
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const limpiarCacheUsuarios = () => {
    sessionStorage.removeItem("usuarios");
    setUsuarios([]);
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  return { usuarios, loading, limpiarCacheUsuarios };
}