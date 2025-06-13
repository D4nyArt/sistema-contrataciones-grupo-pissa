/**
 * olvideContrasena.tsx
 *
 * Proporciona un formulario para solicitar recuperación de contraseña por correo electrónico.
 *
 * Este componente maneja el flujo completo de solicitud de recuperación de contraseña,
 * incluyendo validación de email, verificación del estado del usuario en la base de datos,
 * actualización automática de estados según las reglas de negocio y envío del correo
 * de recuperación. Implementa diferentes respuestas según el estado actual de la cuenta
 * del usuario (activo, bloqueado, inhabilitado, etc.).
 */

"use client";

import { useState } from "react";
import {
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
} from "firebase/auth";
import { get, ref, update } from "firebase/database";
import { auth, database } from "../../firebaseConfig";
import Link from "next/link";
import { Alerta } from "./alertaPantalla";

/**
 * Define los tipos de alerta disponibles en el formulario.
 */
type TipoAlerta = "aprobado" | "denegado" | "errorSist" | "info";

/**
 * Define la estructura de una alerta del sistema.
 */
interface AlertaData {
  /** El tipo de alerta que determina el estilo visual. */
  type: TipoAlerta;

  /** El mensaje a mostrar al usuario. */
  mensaje: string;
}

/**
 * Renderiza un formulario para solicitar recuperación de contraseña.
 *
 * Este componente gestiona el proceso completo de recuperación de contraseña:
 * 1. Valida el formato del email ingresado
 * 2. Verifica la existencia del usuario en Firebase Auth y Database
 * 3. Evalúa el estado actual del usuario según las reglas de negocio
 * 4. Actualiza el estado a "enProceso" para usuarios elegibles
 * 5. Envía el correo de recuperación con enlace personalizado
 * 6. Proporciona feedback específico según cada caso de estado
 *
 * Estados de usuario y respuestas:
 * - previo: Cuenta inactiva, contactar administrador
 * - normal/bloqueado: Procesa solicitud y envía correo
 * - enProceso/cambioContrasena: Ya hay solicitud en curso
 * - inhabilitado: Cuenta temporalmente inactiva
 * - baja: Cuenta permanentemente bloqueada
 *
 * @returns El elemento JSX que renderiza el formulario de recuperación de contraseña.
 *
 * @example
 * ```tsx
 * // Uso en página de recuperación de contraseña
 * <div className="recovery-page">
 *   <h1>Recuperar Contraseña</h1>
 *   <FormularioOlvide />
 * </div>
 *
 * // El componente automáticamente:
 * // 1. Valida el email ingresado
 * // 2. Verifica existencia en Auth y Database
 * // 3. Evalúa estado del usuario
 * // 4. Actualiza estado si es necesario
 * // 5. Envía correo de recuperación
 * // 6. Muestra feedback apropiado
 * ```
 *
 * @see {@link sendPasswordResetEmail} - Función de Firebase Auth para enviar correo de recuperación
 * @see {@link Alerta} - Componente para mostrar mensajes de estado al usuario
 */
export default function FormularioOlvide() {
  /** Estado que almacena el email ingresado por el usuario. */
  const [email, setEmail] = useState<string>("");

  /** Estado que indica si el formulario ha sido enviado. */
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);

  /** Estado que almacena la alerta actual a mostrar al usuario. */
  const [alertaRecuperar, setAlertaRecuperar] = useState<AlertaData | null>(
    null
  );

  /**
   * Maneja los cambios en el campo de email y limpia alertas.
   *
   * Esta función actualiza el estado del email y elimina cualquier alerta
   * de error cuando el usuario modifica el campo, proporcionando feedback
   * visual inmediato de que está corrigiendo el error.
   *
   * @param e - El evento de cambio del input de email.
   */
  const cambioEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (alertaRecuperar) {
      setAlertaRecuperar(null);
    }
  };

  /**
   * Maneja el envío del formulario y procesa la solicitud de recuperación.
   *
   * Esta función ejecuta el flujo completo de recuperación de contraseña:
   * 1. Valida el formato del email
   * 2. Verifica la existencia del usuario en Firebase Auth y Database
   * 3. Obtiene y evalúa el estado actual del usuario
   * 4. Aplica la lógica de negocio según el estado:
   *    - previo: Cuenta inactiva, requiere contacto con administrador
   *    - normal/bloqueado: Actualiza estado y envía correo de recuperación
   *    - enProceso/cambioContrasena: Ya hay solicitud activa
   *    - inhabilitado: Cuenta temporalmente inactiva
   *    - baja: Cuenta permanentemente bloqueada
   * 5. Proporciona feedback específico al usuario
   *
   * @param e - El evento de envío del formulario.
   */
  const solicitarLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormSubmitted(true);

    // Validación de email obligatorio
    if (!email.trim()) {
      setAlertaRecuperar({
        type: "denegado",
        mensaje: "Debe ingresar un correo electrónico",
      });
      return;
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAlertaRecuperar({
        type: "denegado",
        mensaje: "El formato del correo electrónico es inválido",
      });
      return;
    }

    // Reset de alertas previas
    setAlertaRecuperar(null);

    try {
      console.log("Verificando email:", email);

      // Paso 1: Verificación opcional en Firebase Authentication
      try {
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);
        if (signInMethods.length > 0) {
          console.log("Email encontrado en Authentication");
        } else {
          console.log("Email no encontrado en Authentication");
        }
      } catch (authError) {
        console.error("Error al verificar en Authentication:", authError);
        // Continuamos con la verificación en la base de datos de todos modos
      }

      // Paso 2: Búsqueda del usuario en la base de datos
      let uid: string | null = null;

      try {
        const usersRef = ref(database, "usuarios");
        const usersSnapshot = await get(usersRef);

        if (usersSnapshot.exists()) {
          const usersData = usersSnapshot.val();
          console.log(
            "Número de usuarios encontrados:",
            Object.keys(usersData).length
          );

          // Búsqueda case-insensitive del email
          const emailBuscado = email.toLowerCase();

          Object.keys(usersData).forEach((userId) => {
            const userEmail = usersData[userId].email;
            if (userEmail && userEmail.toLowerCase() === emailBuscado) {
              uid = userId;
              console.log("Usuario encontrado con UID:", uid);
            }
          });
        } else {
          console.log("No se encontraron usuarios en la base de datos");
        }
      } catch (dbError) {
        console.error("Error al consultar la base de datos:", dbError);
        throw new Error("Error al consultar la base de datos");
      }

      // Validación de existencia del usuario
      if (!uid) {
        console.log("Email no encontrado en la base de datos");
        setAlertaRecuperar({
          type: "errorSist",
          mensaje:
            "El correo electrónico no está dado de alta en el sitio. Contacte al administrador.",
        });
        return;
      }

      // Paso 3: Verificación del estado del usuario
      console.log("Verificando estado del usuario");
      const userStatusRef = ref(database, `usuarios/${uid}/estadoUsuario`);

      try {
        const snapshot = await get(userStatusRef);

        if (!snapshot.exists()) {
          console.log("Estado de usuario no encontrado");
          setAlertaRecuperar({
            type: "errorSist",
            mensaje: "No se encontró el estado del usuario en la base de datos",
          });
          return;
        }

        // Obtención del estado actual del usuario
        const estadoUsuario: string = snapshot.val();
        console.log("Estado del usuario:", estadoUsuario);

        // Paso 4: Procesamiento según el estado del usuario
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
            // Procesamiento para usuarios elegibles para recuperación
            try {
              // Actualización del estado del usuario a "enProceso"
              await update(ref(database, `usuarios/${uid}`), {
                estadoUsuario: "enProceso",
              });

              console.log("Estado de usuario actualizado a 'enProceso'");

              // Envío del correo de recuperación con URL específica del entorno
              await sendPasswordResetEmail(auth, email, {
                url:
                  process.env.NODE_ENV === "development"
                    ? "http://localhost:3000/olvidaste/link"
                    : "https://sistema-contrataciones-grupo-pissa-b8fo.vercel.app/olvidaste/link",
                handleCodeInApp: true,
              });
              console.log("Correo de recuperación enviado");

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

          case "cambioContrasena":
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

      // Manejo específico de errores de Firebase Auth
      let errorMessage = "Ocurrió un error. Intente de nuevo.";
      if ((error as { code: string }).code) {
        console.error("Código de error:", (error as { code: string }).code);

        if ((error as { code: string }).code === "auth/invalid-email") {
          errorMessage = "El formato del correo electrónico es inválido.";
        } else if (
          (error as { code: string }).code === "auth/too-many-requests"
        ) {
          errorMessage = "Demasiados intentos. Intente de nuevo más tarde.";
        } else {
          errorMessage = `Error: ${
            (error as { code: string }).code
          }. Intente de nuevo más tarde.`;
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

        {/* Botón de envío (oculto cuando la solicitud es exitosa) */}
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
