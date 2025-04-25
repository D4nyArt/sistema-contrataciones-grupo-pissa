import { ref, get } from "firebase/database";
import { database } from "../../firebaseConfig";

export default async function CantCorporativo() {
  const snapshot = await get(ref(database, "usuarios"));
  let usersInCorporate = 0;

  if (snapshot.exists()) {
    const usuarios = snapshot.val();
    for (let key in usuarios) {
      if (usuarios[key].rol === "enCorporativo") {
        usersInCorporate++;
      }
    }
  }

  return (
    <div className="flex flex-col">
      <span className="text-xl text-gray-700">
        <strong className="text-3xl text-[#212529]">{usersInCorporate}</strong>
      </span>
    </div>
  );
}
