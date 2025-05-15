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
    <button onClick={handleClick} className="px-4 py-2 bg-gray-300 rounded">
      Dejar de seguir
    </button>
  );
}
