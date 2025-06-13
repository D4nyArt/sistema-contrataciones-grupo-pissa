/**
 * usuario-phone.tsx
 *
 * Proporciona una interfaz de información de usuario optimizada para dispositivos móviles.
 *
 * Este componente renderiza la información básica del usuario en un formato compacto
 * diseñado específicamente para pantallas móviles. Incluye navegación de retroceso,
 * avatar grande centrado, nombre completo con indicadores visuales de estado y diseño
 * vertical optimizado para dispositivos táctiles. Carga automáticamente los datos del
 * usuario desde Firebase basándose en el ID extraído de la URL de navegación.
 */

"use client";
/* eslint @typescript-eslint/no-unused-vars: ["error", { "varsIgnorePattern": "^_" }] */

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { database } from "../../firebaseConfig";
import { ref, get } from "firebase/database";
import ProfilePicture from "./profile-picture";
import Link from "next/link";
import { CircleCheck, Ellipsis, MoveLeft, Lock } from "lucide-react";
import { urbanist } from "./fonts";

/**
 * Renderiza una interfaz de perfil de usuario optimizada para dispositivos móviles.
 *
 * Este componente proporciona una vista de perfil compacta y centrada diseñada
 * específicamente para pantallas móviles. Extrae automáticamente el ID del usuario
 * desde la URL de navegación y carga la información correspondiente desde Firebase
 * Realtime Database. Presenta el avatar del usuario en gran tamaño, nombre completo
 * con tipografía prominente, y indicadores visuales del estado de la cuenta mediante
 * iconografía de color. Incluye navegación de retroceso hacia la lista de personas
 * y diseño vertical optimizado para interacciones táctiles.
 *
 * @returns El elemento JSX que renderiza la interfaz móvil del perfil de usuario.
 *
 * @example
 * ```tsx
 * // Uso en layout móvil de perfil de usuario
 * <div className="mobile-profile">
 *   <PhoneUsuarios />
 * </div>
 *
 * // El componente automáticamente:
 * // 1. Extrae el ID del usuario desde /dashboard/[id]
 * // 2. Carga datos del usuario desde Firebase
 * // 3. Muestra avatar grande centrado
 * // 4. Presenta nombre con indicadores de estado
 * // 5. Proporciona navegación de retroceso
 *
 * // En contexto de navegación móvil
 * <div className="md:hidden">
 *   <PhoneUsuarios />
 * </div>
 *
 * // Como parte de vista de perfil responsiva
 * {isMobile ? (
 *   <PhoneUsuarios />
 * ) : (
 *   <DesktopUserProfile />
 * )}
 * ```
 *
 * @see {@link ProfilePicture} - Componente de avatar con iniciales del usuario
 */
export default function PhoneUsuarios() {
  // const router = useRouter();
  /** Hook de Next.js para obtener la ruta actual y extraer el ID del usuario. */
  const pathname = usePathname();
  // const searchparams = useSearchParams();

  /** Estado que almacena el nombre del usuario. */
  const [name, setName] = useState("");

  /** Estado que almacena los apellidos del usuario. */
  const [lastname, setLastname] = useState("");

  /** Estado que almacena el correo electrónico (no utilizado en la vista). */
  const [_mail, setMail] = useState("");

  /** Estado que almacena el teléfono (no utilizado en la vista). */
  const [_phone, setPhone] = useState("");

  /** Estado que almacena el rol del usuario (no utilizado en la vista). */
  const [_role, setRole] = useState("");

  /** Estado que almacena el estado actual del usuario para indicadores visuales. */
  const [status, setStatus] = useState("");

  /** ID del usuario extraído de la URL de navegación (/dashboard/[id]). */
  const id = pathname.split("/")[2];

  useEffect(() => {
    /**
     * Obtiene los datos completos del usuario desde Firebase Realtime Database.
     *
     * Esta función consulta toda la información del usuario especificado por el ID
     * extraído de la URL y actualiza los estados locales correspondientes. Maneja
     * errores de conexión y proporciona valores por defecto para campos faltantes.
     */
    const fetchUser = async () => {
      try {
        const userRef = ref(database, `usuarios/${id}`);
        const snapshot = await get(userRef);
        const data = snapshot.val() || {};
        setName(data.nombre || "");
        setLastname(data.apellidos || "");
        setMail(data.email || "");
        setPhone(data.telefono || "");
        setRole(data.rol || "");
        setStatus(data.estadoUsuario || "");
      } catch (e) {
        console.error(e);
      }
    };
    fetchUser();
  }, [id]);

  return (
    <div className="flex flex-col">
      {/* Barra de navegación superior con botón de retroceso */}
      <div className="flex flex-row justify-between">
        <Link href="/dashboard/personas">
          <MoveLeft />
        </Link>
        <h1 className={`${urbanist.className} text-2xl text-[#212529]`}>
          <strong>Perfil</strong>
        </h1>
        <Ellipsis />
      </div>

      {/* Área principal centrada con avatar y información del usuario */}
      <div className="flex flex-col items-center justify-center pt-10">
        {/* Avatar grande centrado */}
        <ProfilePicture
          nombre={`${name}`}
          width={"w-25"}
          height={"h-25"}
          textSize={"text-5xl"}
        />

        {/* Nombre completo con indicadores de estado */}
        <div className="flex flex-row items-center pt-8 pb-8">
          <h2 className={`${urbanist.className} text-3xl text-[#212529]`}>
            <strong>
              {name} {lastname}
            </strong>
          </h2>

          {/* Indicadores visuales del estado de la cuenta */}
          <div className="pl-2">
            <div className="flex flex-row items-center">
              {status === "normal" && (
                <CircleCheck className="size-4 text-green-800" />
              )}
              {status === "bloqueado" && (
                <Lock className="size-4 text-red-800" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
