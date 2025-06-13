/**
 * form-login.tsx
 *
 * Proporciona un formulario completo de inicio de sesión con validación y manejo de estados de usuario.
 *
 * Este componente gestiona el flujo completo de autenticación de usuarios, incluyendo validación
 * de credenciales, verificación de estados de cuenta, manejo de intentos fallidos de login,
 * bloqueo automático de cuentas por seguridad y redirección según el rol del usuario. Integra
 * Firebase Auth con lógica de negocio personalizada para el sistema de contrataciones.
 */

"use client";
/* eslint @typescript-eslint/no-unused-vars: ["error", { "argsIgnorePattern": "^_" }] */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { getDatabase, ref, get } from "firebase/database";
import { useEffect } from "react";
import { incrementLoginAttempt, resetAttempts } from "../api/attempts/attempts";
import { estilosClasificacion } from "./alertaEstilos";
import { Alerta } from "./alertaPantalla";
import { CampoContrasena } from "./campoContrasena";
import { initializeUserHistory } from "../api/history/history";

/**
 * Define la estructura básica de un usuario en la base de datos.
 */
interface Usuario {
  /** El correo electrónico del usuario registrado. */
  email: string;
}

/**
 * Define los tipos de alerta disponibles en el formulario.
 */
type clasifAlerta = "aprobado" | "denegado" | "errorSist" | "info";

/**
 * Renderiza un formulario completo de inicio de sesión con validación de estados de usuario.
 *
 * Este componente maneja todo el flujo de autenticación del sistema, incluyendo verificación
 * previa de estados de cuenta, validación de credenciales con Firebase Auth, manejo de
 * intentos fallidos con bloqueo automático, inicialización de historial de usuario y
 * redirección apropiada según el rol y estado del usuario autenticado.
 *
 * @returns El elemento JSX que renderiza el formulario de inicio de sesión completo.
 *
 * @example
 * ```tsx
 * // Uso en página de login
 * <div className="login-container">
 *   <h1>Iniciar Sesión</h1>
 *   <Formulario />
 * </div>
 *
 * // El componente automáticamente:
 * // 1. Limpia cookies de sesiones anteriores
 * // 2. Valida credenciales con Firebase Auth
 * // 3. Verifica estados de cuenta (bloqueado, activo, etc.)
 * // 4. Maneja intentos fallidos y bloqueos automáticos
 * // 5. Redirige según rol del usuario
 * ```
 *
 * @see {@link CampoContrasena} - Componente para entrada de contraseña con visibilidad toggle
 * @see {@link Alerta} - Componente para mostrar mensajes de estado al usuario
 * @see {@link incrementLoginAttempt} - Función para manejar intentos fallidos de login
 * @see {@link initializeUserHistory} - Función para inicializar historial de usuario
 */
export default function Formulario() {
  /** Estado que almacena el correo electrónico ingresado. */
  const [email, setEmail] = useState("");

  /** Estado que almacena la contraseña ingresada. */
  const [password, setPassword] = useState("");

  /** Estado que almacena la alerta actual a mostrar al usuario. */
  const [alertaAcceso, setAlertaAcceso] = useState<{
    type: clasifAlerta;
    mensaje: string;
  } | null>(null);

  /** Hook de Next.js para navegación programática. */
  const router = useRouter();

  useEffect(() => {
    /**
     * Limpia las cookies de sesión al cargar el componente.
     *
     * Esta función elimina cualquier cookie de sesión existente para asegurar
     * un estado limpio antes del nuevo proceso de autenticación.
     */
    async function deleteCookie() {
      try {
        await fetch("/api/deleteCookie?name=candidateId", {
          method: "DELETE",
        }).then((resp) => {
          console.log(resp);
        });
      } catch {
        console.log("No se detecto un usario loggeado.");
      }
    }
    deleteCookie();
  }, []);

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
    if (alertaAcceso) {
      setAlertaAcceso(null);
    }
  };

  /**
   * Maneja los cambios en el campo de contraseña y limpia alertas.
   *
   * Esta función actualiza el estado de la contraseña y elimina cualquier
   * alerta de error cuando el usuario modifica el campo.
   *
   * @param e - El evento de cambio del input de contraseña.
   */
  const cambioContrasena = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (alertaAcceso) {
      setAlertaAcceso(null);
    }
  };

  /**
   * Maneja el proceso completo de inicio de sesión.
   *
   * Esta función ejecuta la secuencia completa de autenticación:
   * 1. Verifica el estado del usuario en la base de datos antes del login
   * 2. Valida que la cuenta no esté bloqueada o inhabilitada
   * 3. Intenta la autenticación con Firebase Auth
   * 4. Inicializa el historial del usuario
   * 5. Guarda la sesión en cookies
   * 6. Redirige según el estado y rol del usuario
   * 7. Maneja intentos fallidos y bloqueos automáticos
   *
   * @param e - El evento de envío del formulario.
   */
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // PRIMERO: Verificar el estado del usuario en la base de datos ANTES del login
      const db = getDatabase();
      const usuariosRef = ref(db, `usuarios`);
      const snapshot = await get(usuariosRef);

      let userData = null;

      if (snapshot.exists()) {
        const data = snapshot.val();
        // Buscar el usuario por email
        const userEntry = Object.entries(data).find(
          ([_uid, usuario]) => (usuario as Usuario).email === email
        );

        if (userEntry) {
          userData = userEntry[1] as any;
        }
      }

      // Si no existe el usuario
      if (!userData) {
        setAlertaAcceso({
          type: "denegado",
          mensaje: "El usuario o la contraseña son incorrectos.",
        });
        return;
      }

      // Verificar el estado del usuario ANTES de hacer login
      const estado = userData.estadoUsuario;

      switch (estado) {
        case "bloqueado":
          setAlertaAcceso({
            type: "denegado",
            mensaje:
              "Su cuenta fue bloqueada por múltiples intentos fallidos de inicio de sesión. Recupere su contraseña.",
          });
          return; // Salir sin intentar login

        case "inhabilitada":
          setAlertaAcceso({
            type: "denegado",
            mensaje:
              "Su cuenta fue inhabilitada de forma temporal. Contacte al administrador.",
          });
          return;

        case "baja":
          setAlertaAcceso({
            type: "denegado",
            mensaje: "Su cuenta fue inhabilitada de forma permanente.",
          });
          return;

        case "enProceso":
        case "cambioContrasena":
          setAlertaAcceso({
            type: "info",
            mensaje:
              "Su cuenta está en proceso de recuperación. Le llegará una notificación cuando esté lista.",
          });
          return;
      }

      // AHORA SÍ: Intentar el login con Firebase Auth
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredentials.user.uid;
      console.log("Logged in as:", userCredentials.user);

      // Inicializa el historial del usuario
      await initializeUserHistory(uid);

      const response = await fetch("/api/saveUIDCookie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid }),
      });

      if (!response.ok) {
        throw new Error("Error guardando la cookie");
      }

      if (response.ok) {
        console.log("El uid se ha guardado en una cookie :)");
      }

      // Verificar estado después del login exitoso
      if (estado === "previo") {
        console.log("Establezca su contraseña por primera vez");
        router.push("/olvidaste/reestablecer");
        return;
      }

      if (estado === "normal") {
        // Usuario activo: login permitido
        await resetAttempts(email);
        router.push("/auth/redirector");
      } else {
        setAlertaAcceso({
          type: "errorSist",
          mensaje:
            "Su cuenta tiene un estado desconocido. Contacte al administrador.",
        });
      }
    } catch (err: unknown) {
      console.error("Error during login:", err);

      // Manejar errores de contraseña incorrecta
      const db = getDatabase();
      const usuariosRef = ref(db, `usuarios`);
      const snapshot = await get(usuariosRef);

      let correoExiste = false;

      if (snapshot.exists()) {
        const data = snapshot.val();
        correoExiste = Object.values(data).some(
          (usuario) => (usuario as Usuario).email === email
        );
      }

      let msg = "El usuario o la contraseña son incorrectos.";

      if (correoExiste) {
        console.log("El correo existe, incrementando intentos...");
        const remainingAttempts = await incrementLoginAttempt(email);
        console.log("Intentos restantes:", remainingAttempts);

        if (remainingAttempts > 0 && remainingAttempts <= 3) {
          msg += ` Queda${
            remainingAttempts !== 1 ? "n " : " "
          } ${remainingAttempts} intento${
            remainingAttempts !== 1 ? "s" : ""
          } antes de que la cuenta sea bloqueada.`;
        }
      }

      setAlertaAcceso({
        type: "denegado",
        mensaje: msg,
      });
    }
  };

  return (
    <>
      <form onSubmit={handleLogin}>
        {alertaAcceso && (
          <Alerta
            tipo={alertaAcceso.type}
            mensaje={alertaAcceso.mensaje}
            funCerrar={() => setAlertaAcceso(null)}
          />
        )}

        <div className="mb-4">
          <input
            type="email"
            className={`w-full p-2 border rounded-lg mt-1 bg-[#fafbfc] ${
              alertaAcceso
                ? estilosClasificacion[alertaAcceso.type].input
                : "border-gray-300 text-black"
            }`}
            placeholder="Correo electrónico"
            value={email}
            onChange={cambioEmail}
            required
          />
        </div>

        <CampoContrasena
          value={password}
          onChange={cambioContrasena}
          error={!!alertaAcceso}
          className={
            alertaAcceso ? estilosClasificacion[alertaAcceso.type].input : ""
          }
        />
        <div>
          <button
            type="submit"
            className="cursor-pointer w-full bg-[#2d4583] text-white py-2 rounded-lg hover:bg-[#08b177] transition"
          >
            Iniciar Sesión
          </button>
        </div>
        <div className="mb-4 text-center py-4 pt-6">
          <a href="/olvidaste" className="text-[#2975a0] hover:text-[#08b177]">
            Recuperar mi contraseña
          </a>
        </div>
      </form>
    </>
  );
}
