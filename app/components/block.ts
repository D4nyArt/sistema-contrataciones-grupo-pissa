/**
 * block.ts
 * 
 * Proporciona funciones utilitarias para gestionar el estado de usuarios (bloqueo, desbloqueo y baja).
 *
 * Este módulo incluye funciones para bloquear, desbloquear y dar de baja usuarios del sistema,
 * con validaciones de permisos basadas en roles. Implementa reglas de negocio específicas
 * que protegen cuentas administrativas y controlan el acceso según la jerarquía de roles.
 */

import { ref, set } from "firebase/database";
import { database } from "../../firebaseConfig";

/**
 * Bloquea un usuario del sistema después de validar permisos.
 *
 * Esta función verifica los permisos del usuario actual antes de proceder con el bloqueo.
 * Implementa reglas de negocio que protegen cuentas administrativas y requieren permisos
 * específicos para bloquear usuarios de RH. No permite bloquear usuarios ya dados de baja.
 *
 * @param userId - El ID del usuario a bloquear.
 * @param setStatus - Función callback para actualizar el estado del usuario en la UI.
 * @param role - El rol del usuario que se va a bloquear.
 * @param currentStatus - El estado actual del usuario (opcional).
 *
 * @example
 * ```ts
 * // Bloquear un candidato
 * await handleBlock("user123", setUserStatus, "candidato", "normal");
 * 
 * // Intentar bloquear un admin (será rechazado)
 * await handleBlock("admin456", setUserStatus, "admin", "normal");
 * ```
 */
export const handleBlock = async (userId: string, setStatus: (v: string) => void, role: string, currentStatus?: string) => {
  
  const res = await fetch("/api/getCurrentUser");
  const jason = await res.json();
  const isAdmin = jason.rol === "admin";

  if (role === "admin") {
    alert("No se puede bloquear al ADMIN");
    return;
  }

  if (!isAdmin && role === "rh") {
    alert("Solo el ADMIN puede bloquear usuarios de rh");
    return;
  }

  if (currentStatus !== "baja") {
    await set(ref(database, `usuarios/${userId}/estadoUsuario`), "bloqueado");
    setStatus("bloqueado");
  } else {
    alert("No se puede bloquear un usuario que ya está dado de baja");
  }
};

/**
 * Desbloquea un usuario y reinicia sus contadores de intentos de inicio de sesión.
 *
 * Esta función restablece el estado del usuario a "normal" y limpia todos los
 * contadores de intentos fallidos de inicio de sesión. Solo funciona con usuarios
 * que no estén dados de baja permanentemente.
 *
 * @param userId - El ID del usuario a desbloquear.
 * @param currentStatus - El estado actual del usuario.
 * @param setStatus - Función callback para actualizar el estado del usuario en la UI.
 * @param setAttempt - Función callback para actualizar el contador de intentos en la UI.
 * @param setTime - Función callback para actualizar el tiempo del último intento en la UI.
 *
 * @example
 * ```ts
 * // Desbloquear un usuario y reiniciar sus intentos
 * await handleUnblock(
 *   "user123", 
 *   "bloqueado", 
 *   setUserStatus, 
 *   setAttempts, 
 *   setLastAttempt
 * );
 * ```
 */
export const handleUnblock = async (
  userId: string,
  currentStatus: string,
  setStatus: (v: string) => void,
  setAttempt: (v: number) => void,
  setTime: (v: string) => void
) => {
  if (currentStatus !== "baja") {
    await set(ref(database, `usuarios/${userId}/estadoUsuario`), "normal");
    setStatus("normal");

    await set(ref(database, `usuarios/${userId}/intentos/total`), 0);
    setAttempt(0);

    await set(ref(database, `usuarios/${userId}/intentos/ultimo`), 0);
    setTime("-");
  } else {
    alert("No se puede desbloquear un usuario que ya está dado de baja");
  }
};

/**
 * Da de baja permanentemente a un usuario del sistema después de validar permisos.
 *
 * Esta función cambia el estado del usuario a "baja", efectivamente desactivando
 * la cuenta de manera permanente. Implementa validaciones estrictas de permisos
 * que protegen cuentas administrativas y requieren privilegios especiales para
 * dar de baja usuarios de RH.
 *
 * @param id - El ID del usuario a dar de baja.
 * @param setStatus - Función callback para actualizar el estado del usuario en la UI.
 * @param role - El rol del usuario que se va a dar de baja.
 *
 * @example
 * ```ts
 * // Dar de baja a un candidato
 * await handleRemoval("user123", setUserStatus, "candidato");
 * 
 * // Intentar dar de baja a un admin (será rechazado)
 * await handleRemoval("admin456", setUserStatus, "admin");
 * 
 * // RH dando de baja a otro RH (será rechazado, solo admin puede hacerlo)
 * await handleRemoval("rh789", setUserStatus, "rh");
 * ```
 */
export const handleRemoval = async (
  id: string,
  setStatus: (v: string) => void,
  role: string
) => {

  const res = await fetch("/api/getCurrentUser");
  const jason = await res.json();
  const isAdmin = jason.rol === "admin";

  if (role === "admin") {
    alert("No se puede dar de baja al ADMIN");
    return;
  }

  if (!isAdmin && role === "rh") {
    alert("Solo el ADMIN puede dar de baja a usuarios de RH");
    return;
  }

    await set(
      ref(database, `usuarios/${id}/estadoUsuario`),
      "baja"
    ).then(() => {
      setStatus("baja");
    });
  };