import { ref, get } from "firebase/database";
import { database } from "../../firebaseConfig";

export default async function CantProyectos() {
  const snapshot = await get(ref(database, "usuarios"));
  let usersInProyect = 0;

  if (snapshot.exists()) {
    const usuarios = snapshot.val();
    for (let key in usuarios) {
      if (usuarios[key].rol === "enProyecto") {
        usersInProyect++;
      }
    }
  }

  return (
    <div className="flex flex-col">
      <span className="text-xl text-gray-700">
        <strong className="text-3xl text-[#212529]">{usersInProyect}</strong>
      </span>
    </div>
  );
}
