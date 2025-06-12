/**
 * candidatoBienvenida.tsx
 *
 * Proporciona una interfaz de bienvenida personalizada para candidatos en el proceso de contratación.
 *
 * Este componente renderiza una página de bienvenida que obtiene el nombre del candidato desde
 * las cookies de sesión y muestra un mensaje personalizado junto con los pasos del proceso.
 * Incluye tarjetas visuales informativas y un botón de navegación hacia el expediente del candidato.
 */

import { cookies } from "next/headers";
import { ref, get } from "firebase/database";
import { database } from "../../firebaseConfig";
import { ArrowUpRight } from "lucide-react";
import TarjetasColores from "./tarjetasColores";
import TarjetasColoresScroll from "./tarjetasColoresPhone";
import Link from "next/link";

/**
 * Renderiza la página de bienvenida personalizada para candidatos.
 *
 * Este componente asíncrono obtiene la información del candidato desde las cookies de sesión,
 * recupera su nombre desde la base de datos y presenta una interfaz de bienvenida adaptativa.
 * Incluye un diseño responsivo con diferentes componentes de tarjetas para desktop y móvil,
 * y un botón de navegación que dirige al candidato hacia su expediente.
 *
 * El componente automáticamente:
 * 1. Obtiene el ID del candidato desde las cookies
 * 2. Busca el nombre del usuario en la base de datos
 * 3. Personaliza el saludo con el nombre obtenido
 * 4. Muestra las tarjetas informativas del proceso
 *
 * @returns Una promesa que resuelve al elemento JSX que renderiza la página de bienvenida.
 *
 * @example
 * ```tsx
 * // Uso en una página de candidato
 * <Proceso />
 * ```
 */
export default async function Proceso() {
  /** Obtiene las cookies del candidato desde los headers del request. */
  const candidateCookies = await cookies();

  /** Extrae el ID del candidato desde la cookie de sesión. */
  const candidateCookie = candidateCookies.get("candidateId")?.value;

  /** Nombre del usuario que se mostrará en el saludo, con valor por defecto. */
  let usuario = "Usuario";

  if (candidateCookie) {
    try {
      /** Consulta la base de datos para obtener la información del candidato. */
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
    <>
      {/* Sección principal de bienvenida */}
      <div className="rounded-xl bg-[#0d324f] flex flex-row p-8 space-x-6">
        <div className="flex flex-col items-start justify-center space-y-2 animate-fade-in-up">
          <h2 className="text-gray-400">Hola {usuario}.</h2>
          <p className="text-white font-semibold text-2xl">
            Para continuar con tu proceso debes completar los siguientes pasos.
          </p>
          <Link href="candidato/expediente">
            <button className="bg-white text-[#0d324f] pt-2 pb-2 pl-4 pr-4 rounded-full mt-6 inline-flex gap-2 cursor-pointer hover:bg-[#08b177] hover:text-white">
              Iniciar
              <ArrowUpRight />
            </button>
          </Link>
        </div>

        {/* Tarjetas informativas para desktop */}
        <div className="hidden md:block ml-auto">
          <TarjetasColores />
        </div>
      </div>

      {/* Tarjetas informativas para móvil */}
      <div className="block md:hidden">
        <TarjetasColoresScroll />
      </div>
    </>
  );
}
