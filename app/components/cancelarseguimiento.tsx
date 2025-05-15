import PopUp from "./pop-up";
import { ref, update } from "firebase/database";
import { database, auth } from "../../firebaseConfig";

export default function CancelarSeguimiento({
  rhUID,
  candidateUID,
}: {
  rhUID: string;
  candidateUID: string;
}) {
  const handleCkick = async () => {
    alert(`Cancelando seguimiento de `);

    await update(ref(database, `usuarios/${candidateUID}`), {
      revisor: "sin_revisor",
    });
  };

  return (
    <div>
      <button onClick={handleCkick}>Dejar de seguir</button>
    </div>
  );
}
