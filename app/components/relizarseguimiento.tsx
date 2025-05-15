"use client";
import { ref, update } from "firebase/database";
import { database } from "../../firebaseConfig";

export default function RealizarSeguimiento({
  rhUID,
  candidateUID,
}: {
  rhUID: string;
  candidateUID: string;
}) {
  const handleClick = async () => {
    // 1) set candidate’s `revisor`
    await update(ref(database, `usuarios/${candidateUID}`), {
      revisor: rhUID,
    });

    // 2) add under RH’s revisando keyed by candidate
    const now = Date.now();
    await update(ref(database, `usuarios/${rhUID}/revisando`), {
      [candidateUID]: now,
    });

    alert(`Siguiendo a ${candidateUID}`);
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      Realizar seguimiento
    </button>
  );
}
