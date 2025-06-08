/* Pantalla Inicial para recuperar la contraseña
            Parte 1: Ingresar el correo y solicitar la recuperación
                a) Verificar que el correo exista en Firebase Auth
                b) Verificar el estado del usuario (previo, baja, enProceso...)
                c) Ejecutar el caso correspondiente
                    - previo: "Su cuenta aún no está activa, por favor,
                                contacte al personal de RH"
                    - normal: "Su solicitud se generó correctamente"
                    - bloqueado: "Su solicitud se generó correctamente"
                    - enProceso: "Ya tiene una solicitud en proceso, por favor,
                                espere la respuesta del administrador"
                    - inhabilitado "Su cuenta no puede ser recuperada,
                                se encuentra inhabilitada. Contacte al personal de RH"
                    - baja: "Su cuenta fue bloqueada de forma permanente. Es imposible recuperarla"


                d) Solicitud generada correctamente: envío de correo electrónico
                 con el link de recuperación

*/
"use client";

import { useState } from "react";
// import { useRouter } from "next/navigation";
import {
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
} from "firebase/auth";
import { get, ref, update } from "firebase/database";
import { auth, database } from "../../firebaseConfig";
import Link from "next/link";
import { Alerta } from "./alertaPantalla";

export default function FormularioOlvide() {
  const [email, setEmail] = useState<string>("");
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [alertaRecuperar, setAlertaRecuperar] = useState<{
    type: "aprobado" | "denegado" | "errorSist" | "info";
    mensaje: string;
  } | null>(null);

  // const router = useRouter();

  const cambioEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (alertaRecuperar) {
      setAlertaRecuperar(null);
    }
  };

  /**************************************************************************************** */

  const solicitarLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormSubmitted(true);

    // Validar que se ingresó un email
    if (!email.trim()) {
      setAlertaRecuperar({
        type: "denegado",
        mensaje: "Debe ingresar un correo electrónico",
      });
      return;
    }

    // Validar formato de correo antes de enviar
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAlertaRecuperar({
        type: "denegado",
        mensaje: "El formato del correo electrónico es inválido",
      });
      return;
    }

    // Reset de error de formato
    setAlertaRecuperar(null);

    /***********************************************/

    /*Esto es para checar si el email existe en la base de datos, antes de hacer la solicitud 
            Primera verificación en el backend
      */
    try {

      // Paso 1: Intentar verificar en Firebase Authentication
      // let emailExisteEnAuth = false;

      try {
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);
        if (signInMethods.length > 0) {
          // emailExisteEnAuth = true;
        } else {
        }
      } catch (authError) {
        console.error("Error al verificar en Authentication:", authError);
        // Continuamos con la verificación en la base de datos de todos modos
      }

      // Paso 2: Buscar el usuario en la base de datos
      let uid: string | null = null;

      try {
        const usersRef = ref(database, "usuarios");
        const usersSnapshot = await get(usersRef);

        if (usersSnapshot.exists()) {
          const usersData = usersSnapshot.val();

          // Búsqueda case-insensitive
          const emailBuscado = email.toLowerCase();

          Object.keys(usersData).forEach((userId) => {
            const userEmail = usersData[userId].email;
            if (userEmail && userEmail.toLowerCase() === emailBuscado) {
              uid = userId;
            }
          });
        }
      } catch (dbError) {
        console.error("Error al consultar la base de datos:", dbError);
        throw new Error("Error al consultar la base de datos");
      }

      // Si no se encontró el usuario en la base de datos
      if (!uid) {
        setAlertaRecuperar({
          type: "errorSist",
          mensaje:
            "El correo electrónico no está dado de alta en el sitio. Contacte al administrador.",
        });
        return;
      }
      /***************************************************************/

      // Paso 3: Verificar el estado del usuario
      const userStatusRef = ref(database, `usuarios/${uid}/estadoUsuario`);

      try {
        const snapshot = await get(userStatusRef);

        if (!snapshot.exists()) {
          setAlertaRecuperar({
            type: "errorSist",
            mensaje: "No se encontró el estado del usuario en la base de datos",
          });
          return;
        }

        // Obtener el valor real del snapshot
        const estadoUsuario: string = snapshot.val();

        // Paso 4: Procesar según el estado del usuario
        switch (estadoUsuario) {
          case "previo":
            setAlertaRecuperar({
              type: "info",
              mensaje:
                "Su cuenta aún no está activa. Por favor, contacte al administrador.",
            });
            break;

          case "normal":
          case "bloqueado":
            // Actualizar el estado del usuario a "enProceso"
            try {
              // Primero actualizamos el estado en la base de datos
              await update(ref(database, `usuarios/${uid}`), {
                estadoUsuario: "enProceso",
              });

              // Luego enviamos el correo de recuperación
              await sendPasswordResetEmail(auth, email, {
                url: process.env.NODE_ENV === 'development'
                ? "http://localhost:3000/olvidaste/link"
                : "https://www.grupo-pissa.space/olvidaste/link",
                handleCodeInApp: true
              });

              setAlertaRecuperar({
                type: "aprobado",
                mensaje:
                  "Su solicitud se generó correctamente. Verifique su correo electrónico para continuar el proceso",
              });
            } catch (error) {
              console.error("Error al procesar la solicitud:", error);
              setAlertaRecuperar({
                type: "errorSist",
                mensaje:
                  "Error al procesar la solicitud. Intente nuevamente más tarde.",
              });
            }
            break;

          case "enProceso":
            setAlertaRecuperar({
              type: "info",
              mensaje:
                "Ya tiene una solicitud en curso. Espere al administrador",
            });
            break;

          case "inhabilitado":
            setAlertaRecuperar({
              type: "denegado",
              mensaje:
                "Su cuenta no puede ser recuperada, está inactiva temporalmente",
            });
            break;

          case "baja":
            setAlertaRecuperar({
              type: "denegado",
              mensaje:
                "Su cuenta fue bloqueada de forma permanente. Es imposible recuperarla",
            });
            break;

          default:
            setAlertaRecuperar({
              type: "info",
              mensaje: `Su cuenta tiene un estado desconocido (${estadoUsuario}). Contacte al administrador.`,
            });
        }
      } catch (stateError) {
        console.error("Error al obtener el estado del usuario:", stateError);
        setAlertaRecuperar({
          type: "errorSist",
          mensaje:
            "Error al obtener el estado del usuario. Intente de nuevo más tarde.",
        });
      }
    } catch (error: unknown) {
      console.error("Error general:", error);

      let errorMessage = "Ocurrió un error. Intente de nuevo.";
      if ((error as { code: string }).code) {
        console.error("Código de error:", (error as { code: string }).code);

        if ((error as { code: string }).code === "auth/invalid-email") {
          errorMessage = "El formato del correo electrónico es inválido.";
        } else if ((error as { code: string }).code === "auth/too-many-requests") {
          errorMessage = "Demasiados intentos. Intente de nuevo más tarde.";
        } else {
          errorMessage = `Error: ${(error as { code: string }).code}. Intente de nuevo más tarde.`;
        }
      }

      setAlertaRecuperar({
        type: "errorSist",
        mensaje: errorMessage,
      });
    }
  };

  return (
    <>
      <form onSubmit={solicitarLink}>
        {alertaRecuperar && (
          <Alerta
            tipo={alertaRecuperar.type}
            mensaje={alertaRecuperar.mensaje}
            funCerrar={() => setAlertaRecuperar(null)}
          />
        )}

        <div className="mb-4">
          <input
            type="email"
            className={`w-full p-2 border rounded-lg mt-1 bg-[#fafbfc] ${
              formSubmitted &&
              alertaRecuperar &&
              (alertaRecuperar.mensaje.includes("formato del correo") ||
                alertaRecuperar.mensaje.includes(
                  "correo electrónico no existe"
                ) ||
                alertaRecuperar.mensaje.includes("no está dado de alta"))
                ? "border-red-400 text-red-600 placeholder-red-400"
                : "border-gray-300 text-black"
            }`}
            placeholder="Correo electrónico"
            value={email}
            onChange={cambioEmail}
            required
          />
        </div>

        {/* Mostrar el botón solo cuando no hay una solicitud exitosa */}
        {(!alertaRecuperar || alertaRecuperar.type !== "aprobado") && (
          <div>
            <button
              type="submit"
              className="w-full bg-[#2d4583] text-white py-2 rounded-lg hover:bg-[#08b177] cursor-pointer transition"
            >
              Solicitar recuperación
            </button>
          </div>
        )}

        <div className="pt-6 flex items-center justify-center">
          <Link
            href="/"
            className="items-center flex hover:text-[#08b177] text-[#2975a0] group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-arrow-left transition-all group-hover:scale-x-125"
            >
              <path d="M6 8L2 12L6 16" />
              <path d="M2 12H22" />
            </svg>
            <span className="pl-2">Regresar</span>
          </Link>
        </div>
      </form>
    </>
  );
}
