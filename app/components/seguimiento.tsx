"use client";
import { useEffect, useState } from "react";
import { ref, get, update, remove } from "firebase/database";
import { database } from "@/firebaseConfig";

interface Props {
  rhUID: string;
  candidateUID: string;
}

export default function SeguimientoToggle({ rhUID, candidateUID }: Props) {
  const [estaSiguiendo, setEstaSiguiendo] = useState<boolean | null>(null);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const verificarSeguimiento = async () => {
      const snapshot = await get(ref(database, `usuarios/${candidateUID}/revisor`));
      const revisor = snapshot.val();
      setEstaSiguiendo(revisor === rhUID);
    };
    verificarSeguimiento();
  }, [rhUID, candidateUID]);

  const realizarSeguimiento = async () => {
    await update(ref(database, `usuarios/${candidateUID}`), {
      revisor: rhUID,
    });

    const now = Date.now();
    await update(ref(database, `usuarios/${rhUID}/revisando`), {
      [candidateUID]: now,
    });

    setEstaSiguiendo(true);
  };

  const cancelarSeguimiento = async () => {
    await update(ref(database, `usuarios/${candidateUID}`), {
      revisor: "sin_revisor",
    });

    await remove(ref(database, `usuarios/${rhUID}/revisando/${candidateUID}`));

    setEstaSiguiendo(false);
  };

  if (estaSiguiendo === null) {
    return <p>Cargando...</p>;
  }

  if (estaSiguiendo) {
    return (
      <button
        onClick={cancelarSeguimiento}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className={`${
          hovering ? "text-red-700 bg-red-100 border-red-500" : "border-2 border-[#2d4583]"
        }  text-[#2d4583] rounded-lg cursor-pointer mr-2 py-2 px-4 transition-all duration-200 border-2 w-40`}
      >
        {hovering ? "Dejar de seguir" : "Siguiendo"}
      </button>
    );
  }

  return (
    <button
      onClick={realizarSeguimiento}
      className="border-2 border-gray-500 text-[#212529] rounded-lg cursor-pointer mr-2 py-2 px-4 w-40 hover:text-[#08b177] hover:border-[#08b177]"
    >
      Seguir
    </button>
  );
}
