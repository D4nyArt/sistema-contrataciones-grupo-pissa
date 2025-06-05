import { cookies } from "next/headers";
import { ref, get } from "firebase/database";
import { database } from "../../firebaseConfig";
import { ArrowUpRight } from "lucide-react";
import TarjetasColores from "./tarjetasColores";
import TarjetasColoresScroll from "./tarjetasColoresPhone";
import Link from "next/link";

export default async function Proceso () {
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
    return(
        <>
            <div className="rounded-xl bg-[#0d324f] flex flex-row p-8 space-x-6">
                <div className="flex flex-col items-start justify-center space-y-2 animate-fade-in-up">
                    <h2 className="text-gray-400">Hola {usuario}.</h2>
                    <p className="text-white font-semibold text-2xl">Para continuar con tu proceso debes completar los siguientes pasos.</p>
                    <Link href="candidato/expediente">
                        <button
                            className="bg-white text-[#0d324f] pt-2 pb-2 pl-4 pr-4 rounded-full mt-6 inline-flex gap-2 cursor-pointer hover:bg-[#08b177] hover:text-white">
                            Iniciar
                            <ArrowUpRight/>
                        </button>
                    </Link>
                </div>
                <div className="hidden md:block ml-auto">
                    <TarjetasColores/>
                </div>            
            </div>
            <div className="block md:hidden">
                <TarjetasColoresScroll/>
            </div>
        </>
    )
}