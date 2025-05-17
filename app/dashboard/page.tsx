import { cookies } from "next/headers";
import { ref, get } from "firebase/database";
import { database } from "../../firebaseConfig";
import { urbanist } from "@/app/components/fonts";
import Bento from "@/app/components/bento";

function obtenerSaludo(): string {
  const hora = new Date().getHours();
  if (hora >= 6 && hora < 12) return "Buenos días";
  if (hora >= 12 && hora < 19) return "Buenas tardes";
  return "Buenas noches";
}

export default async function Inicio() {
  // Get cookie from headers, not from a NextRequest param
  const candidateCookies = await cookies();
  const candidateCookie = candidateCookies.get("candidateId")?.value;
  let usuario = "Usuario";

  if (candidateCookie) {
    try {
      const snapshot = await get(ref(database, `usuarios/${candidateCookie}`));
      if (snapshot.exists()) {
        const data = snapshot.val();
        usuario = data.nombre ?? "Usuario";
      }
    } catch (error) {
      console.error("Error retrieving user data:", error);
    }
  }

  return (
    <div>
      <div className="animate-fade-in-up">
        <h2 className={`${urbanist.className} text-3xl pl-8 text-[#495057]`}>
          Hola {usuario}.
        </h2>
        <h1 className={`${urbanist.className} text-4xl text-[#212529] pl-8`}>
          <strong>{obtenerSaludo()}</strong>
        </h1>
      </div>
      <div className="flex h-full w-full p-8 animate-fade-in-up">
        <Bento />
      </div>
    </div>
  );
}
