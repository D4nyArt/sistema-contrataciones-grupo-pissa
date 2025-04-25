import { ref, get } from "firebase/database";
import { database } from "../../firebaseConfig";

export default async function CountUsers() {
  var totalUsers = (await get(ref(database, "usuarios"))).size;

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
