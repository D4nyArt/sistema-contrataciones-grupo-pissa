/**
 * establecerContrasena.tsx
 *
 * Proporciona un formulario para establecer contraseñas por primera vez en cuentas nuevas.
 *
 * Este componente permite a usuarios con estado "previo" (credenciales recién creadas)
 * establecer su contraseña definitiva. Incluye validación en tiempo real de coincidencia
 * de contraseñas, verificación de estado de usuario y transición automática del estado
 * de cuenta de "previo" a "normal" una vez completado el proceso exitosamente.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ref, update, get } from "firebase/database";
import { updatePassword } from "firebase/auth";
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
 * Renderiza un formulario para establecer contraseñas en cuentas de primera vez.
 *
 * Este componente maneja el flujo completo de establecimiento de contraseña para usuarios
 * que tienen credenciales recién creadas (estado "previo"). Incluye validación automática
 * del estado del usuario, verificación en tiempo real de coincidencia de contraseñas,
 * actualización segura de la contraseña en Firebase Auth y transición del estado de
 * usuario en la base de datos.
 *
 * @returns El elemento JSX que renderiza el formulario de establecimiento de contraseña.
 *
 * @example
 * ```tsx
 * // Uso en página de configuración inicial
 * <EstablecerContrasena />
 *
 * // El componente automáticamente:
 * // 1. Verifica que el usuario esté autenticado
 * // 2. Valida que el estado sea "previo"
 * // 3. Permite establecer nueva contraseña
 * // 4. Actualiza el estado a "normal"
 * // 5. Redirige al login principal
 * ```
 *
 * @see {@link CampoContrasena} - Componente para entrada de contraseñas con visibilidad toggle
 * @see {@link Alerta} - Componente para mostrar mensajes de estado al usuario
 */
export default function EstablecerContrasena() {
  /** Estado que almacena la nueva contraseña ingresada. */
  const [nuevaContrasena, setNuevaContrasena] = useState("");

  /** Estado que almacena la confirmación de contraseña. */
  const [confirmarContrasena, setConfirmarContrasena] = useState("");

  /** Estado que indica si el token de usuario fue verificado correctamente. */
  const [tokenVerificado, setTokenVerificado] = useState(false);

  /** Estado que indica si hay procesos en curso (loading state). */
  const [cargando, setCargando] = useState(true);

  /** Estado que indica si hay error en la confirmación de contraseña. */
  const [errorConfirmacion, setErrorConfirmacion] = useState(false);

  /** Estado que almacena la alerta actual a mostrar al usuario. */
  const [alerta, setAlerta] = useState<AlertaData | null>(null);

  /** Hook de Next.js para navegación programática. */
  const router = useRouter();

  useEffect(() => {
    /**
     * Verifica el estado del usuario actual para determinar si puede establecer contraseña.
     *
     * Esta función valida que:
     * 1. El usuario esté autenticado en Firebase Auth
     * 2. Exista en la base de datos
     * 3. Su estado sea "previo" (credenciales recién creadas)
     *
     * Si alguna validación falla, muestra una alerta apropiada.
     */
    const verificarEstadoUsuario = async (): Promise<void> => {
      try {
        const usuarioActual = auth.currentUser;
        if (!usuarioActual) {
          setAlerta({
            type: "errorSist",
            mensaje:
              "No se inició sesión correctamente, ingrese desde la página principal",
          });
          setCargando(false);
          return;
        }

        const uid = usuarioActual.uid;
        const userRef = ref(database, `usuarios/${uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data.estadoUsuario === "previo") {
            setTokenVerificado(true);
          } else {
            setAlerta({
              type: "denegado",
              mensaje:
                "Usted ya cuenta con un usuario y contraseña válidos. Ingrese sesión desde la página principal.",
            });
          }
        } else {
          setAlerta({
            type: "errorSist",
            mensaje: "No se encontró información del usuario.",
          });
        }
      } catch (error) {
        console.error("Error al verificar el usuario:", error);
        setAlerta({
          type: "errorSist",
          mensaje: "Error al verificar la información del usuario.",
        });
      } finally {
        setCargando(false);
      }
    };

    verificarEstadoUsuario();
  }, []);

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
   * Maneja el envío del formulario de establecimiento de contraseña.
   *
   * Esta función ejecuta el proceso completo:
   * 1. Valida que las contraseñas coincidan
   * 2. Actualiza la contraseña en Firebase Auth
   * 3. Cambia el estado del usuario de "previo" a "normal"
   * 4. Muestra confirmación y redirige al login
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
      const usuarioActual = auth.currentUser;

      if (!usuarioActual) {
        throw new Error("Usuario no autenticado.");
      }

      // Actualizar contraseña en Firebase Auth
      await updatePassword(usuarioActual, nuevaContrasena);

      // Actualizar estado del usuario en la base de datos
      const uid = usuarioActual.uid;
      await update(ref(database, `usuarios/${uid}`), {
        estadoUsuario: "normal",
      });

      setAlerta({
        type: "aprobado",
        mensaje: "Tu contraseña ha sido actualizada correctamente",
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
        } else if (code === "auth/requires-recent-login") {
          mensajeError =
            "Por seguridad, vuelva a iniciar sesión para cambiar la contraseña";
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

  // Estado de error o acceso denegado
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
