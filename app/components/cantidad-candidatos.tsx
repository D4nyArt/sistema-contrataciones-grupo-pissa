import { ref, get } from "firebase/database";
import { database } from "../../firebaseConfig";

export default async function CantCandidatos() {
  const snapshot = await get(ref(database, "usuarios"));
  let candidatos = 0;

  if (snapshot.exists()) {
    const usuarios = snapshot.val();
    for (let key in usuarios) {
      if (usuarios[key].rol === "candidato") {
        candidatos++;
      }
    }
  }

  return (
    <div className="flex flex-col">
      <span className="text-xl text-gray-700">
        <strong className="text-3xl text-[#212529]">{candidatos}</strong>
      </span>
    </div>
  );
}
