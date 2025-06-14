/**
 * attempts.ts
 * 
 * Proporciona funciones utilitarias para gestionar intentos de inicio de sesión y bloqueo de cuentas.
 *
 * Este módulo rastrea intentos fallidos de inicio de sesión, bloquea automáticamente usuarios después
 * de exceder el máximo de intentos permitidos, y proporciona funcionalidad para reiniciar contadores
 * de intentos. El sistema incluye reinicio automático después de 24 horas e integración con el
 * sistema de gestión de estados de usuario.
 */

import { getDatabase, ref, query, orderByChild, equalTo, get, runTransaction, set, update } from "firebase/database";
import { addHistoryEntry } from "../history/history";

/** Número máximo de intentos de inicio de sesión permitidos antes de bloquear al usuario. */
const MAX_ATTEMPTS = 3;

/**
 * Incrementa el contador de intentos de inicio de sesión para un usuario y maneja el bloqueo automático.
 *
 * Esta función rastrea intentos fallidos de inicio de sesión por email, reinicia automáticamente
 * el contador si han pasado 24 horas desde el último intento, y bloquea la cuenta del usuario
 * si se exceden los intentos máximos.
 *
 * @param email - La dirección de email del usuario que intenta iniciar sesión.
 * @returns El número de intentos restantes antes de que la cuenta sea bloqueada.
 *
 * @example
 * ```ts
 * const intentosRestantes = await incrementLoginAttempt("usuario@ejemplo.com");
 * console.log(`${intentosRestantes} intentos restantes`);
 * ```
 */
export async function incrementLoginAttempt(email: string): Promise<number> {
  try {
    const db = getDatabase();
    const userQuery = query(ref(db, "usuarios"), orderByChild("email"), equalTo(email));
    const snapshot = await get(userQuery);

    if (!snapshot.exists()) return MAX_ATTEMPTS;

    const uid = Object.keys(snapshot.val())[0];
    const totalRef = ref(db, `usuarios/${uid}/intentos/total`);
    const lastRef = ref(db, `usuarios/${uid}/intentos/ultimo`);

    // Get the last attempt
    const lastSnap = await get(lastRef);
    const lastDateStr = lastSnap.exists() ? lastSnap.val() : null;

    const now = new Date();
    //let reset = false;

    if (lastDateStr) {
      const lastDate = new Date(lastDateStr);
      const diffMs = now.getTime() - lastDate.getTime();
      const hoursPassed = diffMs / (1000 * 60 * 60);

      if (hoursPassed >= 24) {
        // Reset the counter if it's been more than 24 hours 
        await set(totalRef, 0);
        //reset = true;
      }
    }

    await runTransaction(totalRef, (currentTotal) => (currentTotal || 0) + 1);
    await addHistoryEntry(uid, "contrasenas", new Date().toISOString(), undefined, "Intento fallido de inicio de sesión");
    await set(lastRef, now.toISOString());

    await checkAndBlockUser(uid);

    const finalSnap = await get(totalRef);
    const totalFinal = finalSnap.val() || 0;
    return MAX_ATTEMPTS - totalFinal;
  } catch {
    return MAX_ATTEMPTS;
  }
}

/**
 * Verifica si un usuario ha excedido los intentos máximos de inicio de sesión y bloquea su cuenta.
 *
 * Esta función interna es llamada después de cada intento fallido de inicio de sesión para determinar
 * si el usuario debe ser bloqueado. Actualiza el estado del usuario a "bloqueado" cuando se alcanza
 * el umbral de intentos máximos.
 *
 * @param uid - El ID único del usuario a verificar y potencialmente bloquear.
 *
 * @example
 * ```ts
 * await checkAndBlockUser("usuario123");
 * ```
 */
async function checkAndBlockUser(uid: string) {
  try {
    const db = getDatabase();
    const userRef = ref(db, `usuarios/${uid}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const userData = snapshot.val();
      const total = userData.intentos?.total;
      const status = userData.estadoUsuario;

      if (total >= MAX_ATTEMPTS && status !== "bloqueado") {
        await update(userRef, { estadoUsuario: "bloqueado" });
        await addHistoryEntry(uid, 'contrasenas', new Date().toISOString(), undefined, 'Bloqueo de cuenta por múltiples intentos fallidos de inicio de sesión');
        }
    }
  } catch {
    // Silent failure
  }
}

/**
 * Reinicia el contador de intentos de inicio de sesión para una cuenta de usuario.
 *
 * Esta función limpia tanto el conteo total de intentos como la marca de tiempo del último intento,
 * dando efectivamente al usuario un nuevo comienzo. Típicamente usada después de un inicio de sesión
 * exitoso o desbloqueo manual.
 *
 * @param email - La dirección de email del usuario cuyos intentos deben ser reiniciados.
 *
 * @example
 * ```ts
 * await resetAttempts("usuario@ejemplo.com");
 * console.log("Intentos de inicio de sesión reiniciados exitosamente");
 * ```
 */
export async function resetAttempts(email: string) {
  try {
    const db = getDatabase();
    const userQuery = query(ref(db, "usuarios"), orderByChild("email"), equalTo(email));
    const snapshot = await get(userQuery);

    if (!snapshot.exists()) return;

    const uid = Object.keys(snapshot.val())[0];
    const totalRef = ref(db, `usuarios/${uid}/intentos/total`);
    const lastRef = ref(db, `usuarios/${uid}/intentos/ultimo`);

    await set(totalRef, 0);
    await set(lastRef, "-");
  } catch {
    // Silent failure
  }
}