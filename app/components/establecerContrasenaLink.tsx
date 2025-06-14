/**
 * establecerContrasenaLink.tsx
 *
 * Proporciona un formulario para restablecer contraseñas mediante enlaces de recuperación.
 *
 * Este componente maneja el proceso completo de restablecimiento de contraseña usando códigos
 * de verificación enviados por email. Valida el código de restablecimiento, permite al usuario
 * establecer una nueva contraseña y actualiza automáticamente el estado de la cuenta en la
 * base de datos. Diseñado para usuarios que han solicitado recuperación de contraseña.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ref, update, get } from "firebase/database";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { auth, database } from "../../firebaseConfig";

import { CampoContrasena } from "./campoContrasena";
import { Alerta } from "./alertaPantalla";

/**
 * Define los tipos de alerta disponibles en el componente.
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
 * Renderiza un formulario para restablecer contraseña mediante enlace de recuperación.
 *
 * Este componente gestiona el flujo completo de restablecimiento de contraseña usando
 * códigos de verificación de Firebase Auth. Valida automáticamente el código de
 * restablecimiento desde los parámetros de URL, permite al usuario establecer una
 * nueva contraseña segura y actualiza el estado del usuario en la base de datos
 * para reflejar el cambio exitoso.
 *
 * @returns El elemento JSX que renderiza el formulario de restablecimiento de contraseña.
 *
 * @example
 * ```tsx
 * // Uso en página de restablecimiento (accedida desde email)
 * // URL típica: /restablecer-contrasena?oobCode=ABC123...
 * <EstablecerContrasenaLink />
 *
 * // El componente automáticamente:
 * // 1. Extrae y valida el código de restablecimiento de la URL
 * // 2. Verifica la validez del código con Firebase Auth
 * // 3. Permite establecer nueva contraseña
 * // 4. Actualiza el estado a "cambioContrasena"
 * // 5. Confirma el cambio y redirige al login
 * ```
 *
 * @see {@link CampoContrasena} - Componente para entrada de contraseñas con visibilidad toggle
 * @see {@link Alerta} - Componente para mostrar mensajes de estado al usuario
 */
export default function EstablecerContrasenaLink() {
  /** Estado que almacena la nueva contraseña ingresada. */
  const [nuevaContrasena, setNuevaContrasena] = useState("");

  /** Estado que almacena la confirmación de contraseña. */
  const [confirmarContrasena, setConfirmarContrasena] = useState("");

  /** Estado que indica si el token de restablecimiento fue verificado correctamente. */
  const [tokenVerificado, setTokenVerificado] = useState(false);

  /** Estado que indica si hay procesos en curso (loading state). */
  const [cargando, setCargando] = useState(true);

  /** Estado que indica si hay error en la confirmación de contraseña. */
  const [errorConfirmacion, setErrorConfirmacion] = useState(false);

  /** Estado que almacena la alerta actual a mostrar al usuario. */
  const [alerta, setAlerta] = useState<AlertaData | null>(null);

  /** Hook de Next.js para navegación programática. */
  const router = useRouter();

  /** Hook de Next.js para acceder a parámetros de consulta de la URL. */
  const searchParams = useSearchParams();

  /** Código de verificación de restablecimiento extraído de la URL. */
  const oobCode = searchParams.get("oobCode");

  useEffect(() => {
    /**
     * Verifica la validez del código de restablecimiento de contraseña.
     *
     * Esta función valida que:
     * 1. Exista un código en los parámetros de URL
     * 2. El código sea válido y no haya expirado según Firebase Auth
     * 3. El código corresponda a una solicitud legítima de restablecimiento
     *
     * Si la validación falla, muestra una alerta apropiada.
     */
    const verificarCodigo = async (): Promise<void> => {
      if (!oobCode) {
        setAlerta({
          type: "errorSist",
          mensaje: "El link no corresponde al usuario",
        });
        setCargando(false);
        return;
      }

      try {
        await verifyPasswordResetCode(auth, oobCode);
        setTokenVerificado(true);
      } catch (error) {
        console.error("Error en verificación de código:", error);
        setAlerta({
          type: "errorSist",
          mensaje: "El Link desde el que se accedió ha caducado",
        });
      } finally {
        setCargando(false);
      }
    };

    verificarCodigo();
  }, [oobCode]);

  /**
   * Maneja los cambios en el campo de nueva contraseña.
   *
   * Actualiza el estado y valida en tiempo real si las contraseñas coinciden
   * cuando ya hay una confirmación ingresada.
   *
   * @param e - El evento de cambio del input.
   */
  const handleNuevaContrasenaChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const valor = e.target.value;
    setNuevaContrasena(valor);

    if (confirmarContrasena.length > 0) {
      setErrorConfirmacion(valor !== confirmarContrasena);
    }
  };

  /**
   * Maneja los cambios en el campo de confirmación de contraseña.
   *
   * Actualiza el estado y valida inmediatamente si coincide con la nueva contraseña.
   *
   * @param e - El evento de cambio del input.
   */
  const handleConfirmarContrasenaChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const valor = e.target.value;
    setConfirmarContrasena(valor);
    setErrorConfirmacion(nuevaContrasena !== valor && valor.length > 0);
  };

  /**
   * Maneja el envío del formulario de restablecimiento de contraseña.
   *
   * Esta función ejecuta el proceso completo:
   * 1. Valida que las contraseñas coincidan y el token sea válido
   * 2. Verifica nuevamente el código y obtiene el email del usuario
   * 3. Busca al usuario en la base de datos por email
   * 4. Confirma el restablecimiento en Firebase Auth
   * 5. Actualiza el estado del usuario a "cambioContrasena"
   * 6. Muestra confirmación y redirige al login
   *
   * @param e - El evento de envío del formulario.
   */
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!tokenVerificado) {
      setAlerta({
        type: "errorSist",
        mensaje: "No está permitido establecer una contraseña en este momento.",
      });
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setErrorConfirmacion(true);
      setAlerta({
        type: "denegado",
        mensaje: "Las contraseñas no coinciden",
      });
      return;
    }

    try {
      setCargando(true);

      try {
        // Verificar el código nuevamente y obtener el email del usuario
        const email = await verifyPasswordResetCode(auth, oobCode!);
        console.log("Email del usuario:", email);

        // Buscar el usuario por email en la base de datos
        const usuariosRef = ref(database, "usuarios");
        const snapshot = await get(usuariosRef);

        if (snapshot.exists()) {
          const usuarios = snapshot.val();
          const usuarioEncontrado = Object.entries(usuarios).find(
            ([_uid, userData]: [string, any]) => userData.email === email
          );

          if (usuarioEncontrado) {
            const [uid] = usuarioEncontrado;
            console.log("UID encontrado:", uid);

            // Verificar el estado actual del usuario
            const userStatusRef = ref(
              database,
              `usuarios/${uid}/estadoUsuario`
            );
            const statusSnapshot = await get(userStatusRef);

            if (!statusSnapshot.exists()) {
              console.log("Estado de usuario no encontrado");
              setAlerta({
                type: "errorSist",
                mensaje:
                  "No se encontró el estado del usuario en la base de datos",
              });
              return;
            }

            const estadoUsuario: string = statusSnapshot.val();
            console.log("Estado actual del usuario:", estadoUsuario);

            // Confirmar el restablecimiento de contraseña en Firebase Auth
            await confirmPasswordReset(auth, oobCode!, nuevaContrasena);

            // Actualizar el estado del usuario a cambioContrasena
            await update(ref(database, `usuarios/${uid}`), {
              estadoUsuario: "cambioContrasena",
            });

            console.log("Estado actualizado a cambioContrasena");
          } else {
            console.log("Usuario no encontrado en la base de datos");
            setAlerta({
              type: "errorSist",
              mensaje: "No se encontró el usuario en la base de datos",
            });
            return;
          }
        } else {
          console.log("No se encontraron usuarios en la base de datos");
          setAlerta({
            type: "errorSist",
            mensaje: "No se encontraron usuarios en la base de datos",
          });
          return;
        }
      } catch (dbError) {
        console.error("Error actualizando estado en base de datos:", dbError);
        setAlerta({
          type: "errorSist",
          mensaje:
            "Error al actualizar el estado del usuario en la base de datos",
        });
        return;
      }

      setAlerta({
        type: "aprobado",
        mensaje:
          "Tu contraseña ha sido actualizada correctamente y tu cuenta ha sido procesada",
      });

      // Redirigir después de 3 segundos
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (error: unknown) {
      let mensajeError = "Ocurrió un error al actualizar la contraseña";

      // Manejo específico de errores de Firebase Auth
      if (typeof error === "object" && error !== null && "code" in error) {
        const code = (error as { code: string }).code;
        if (code === "auth/weak-password") {
          mensajeError = "La contraseña es demasiado débil";
        } else if (code === "auth/expired-action-code") {
          mensajeError = "El código de restablecimiento ha expirado";
        } else if (code === "auth/invalid-action-code") {
          mensajeError = "El código de restablecimiento es inválido";
        } else if (code === "auth/user-disabled") {
          mensajeError = "Esta cuenta ha sido deshabilitada";
        }
      }

      console.error("Error al actualizar la contraseña:", error);

      setAlerta({
        type: "errorSist",
        mensaje: mensajeError,
      });
    } finally {
      setCargando(false);
    }
  };

  // Estado de carga inicial
  if (cargando) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d4583]"></div>
      </div>
    );
  }

  // Estado de error o token inválido
  if (!tokenVerificado && alerta) {
    return (
      <div className="py-8 px-4">
        <Alerta
          tipo={alerta.type}
          mensaje={alerta.mensaje}
          funCerrar={() => setAlerta(null)}
        />
        <div className="mt-6 flex justify-center">
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
            <span className="pl-2">Regresar al inicio</span>
          </Link>
        </div>
      </div>
    );
  }

  // Formulario principal
  return (
    <div className="py-8 px-4">
      <h2 className="text-2xl font-semibold text-[#2d4583] mb-6">
        Establece tu nueva contraseña
      </h2>

      {alerta && (
        <Alerta
          tipo={alerta.type}
          mensaje={alerta.mensaje}
          funCerrar={() => setAlerta(null)}
        />
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Nueva contraseña</label>
          <CampoContrasena
            value={nuevaContrasena}
            onChange={handleNuevaContrasenaChange}
            placeholder="Nueva contraseña"
            error={false}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-1">
            Confirmar contraseña
          </label>
          <CampoContrasena
            value={confirmarContrasena}
            onChange={handleConfirmarContrasenaChange}
            placeholder="Confirmar contraseña"
            error={errorConfirmacion}
          />
          {errorConfirmacion && (
            <p className="text-red-500 text-sm mt-1">
              Las contraseñas no coinciden
            </p>
          )}
        </div>

        <div className="mb-6">
          <button
            type="submit"
            disabled={cargando || alerta?.type === "aprobado"}
            className={`w-full py-2 rounded-lg transition ${
              cargando || alerta?.type === "aprobado"
                ? "bg-gray-400 text-gray-100 cursor-not-allowed"
                : "bg-[#2d4583] text-white hover:bg-[#08b177]"
            }`}
          >
            {cargando ? "Procesando..." : "Establecer contraseña"}
          </button>
        </div>

        <div className="flex items-center justify-center">
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
    </div>
  );
}
