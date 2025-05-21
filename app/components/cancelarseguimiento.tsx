"use client";
import { ref, update, remove } from "firebase/database";
import { database } from "../../firebaseConfig";

export default function CancelarSeguimiento({
  rhUID,
  candidateUID,
}: {
  rhUID: string;
  candidateUID: string;
}) {
  const handleClick = async () => {
    // 1) clear candidate’s `revisor`
    await update(ref(database, `usuarios/${candidateUID}`), {
      revisor: "sin_revisor",
    });

    // 2) remove the field entirely under RH’s revisando
    await remove(ref(database, `usuarios/${rhUID}/revisando/${candidateUID}`));

    alert(`Se ha dejado de seguir a ${candidateUID}`);
  };

  return (
    <button
      onClick={handleClick}
      className="bg-red-600 text-white rounded-lg cursor-pointer mr-2 py-2 px-4"
    >
      Dejar de seguir
    </button>
  );
}
