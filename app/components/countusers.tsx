import { ref, get } from "firebase/database";
import { database } from "../../firebaseConfig";

export default async function CantCorporativo() {
  const snapshot = await get(ref(database, "usuarios"));
  let totalUsers = 0;

  if (snapshot.exists()) {
    const usuarios = snapshot.val();
    for (const key in usuarios) {
      if (
        usuarios[key].rol === "rh" ||
        usuarios[key].rol === "enCorporativo" ||
        usuarios[key].rol === "enProyecto"
      ) {
        totalUsers++;
      }
    }
  }

  return (
    <div className="flex flex-col">
      {/*<p className="text-blue-900 text-7xl">{totalUsers}</p>*/}
      {/*<p className="text-blue-900 text-xl">Usuarios</p>*/}
      <span className="text-xl text-gray-700">
        <strong className="text-3xl text-[#212529]">{totalUsers}</strong>
      </span>
    </div>
  );
}
