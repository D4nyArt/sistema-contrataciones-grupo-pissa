import PopUp from "./pop-up";
import { ref, update } from "firebase/database";
import { database, auth } from "../../firebaseConfig";

export default function RealizarSeguimiento({
  rhUID,
  candidateUID,
}: {
  rhUID: string;
  candidateUID: string;
}) {
  const handleCkick = async () => {
    alert(`Realizando seguimiento de `);

    await update(ref(database, `usuarios/${candidateUID}`), {
      revisor: rhUID,
    });

    await
  };

  return (
    <div>
      <button onClick={handleCkick}>Realizar seguimiento</button>
    </div>
  );
}
