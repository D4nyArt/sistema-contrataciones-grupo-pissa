/**
 * sendEmailNotification.ts
 * 
 * Proporciona funcionalidad para enviar notificaciones por correo electrónico a usuarios del sistema.
 *
 * Esta función utilitaria maneja el proceso completo de envío de correos electrónicos a usuarios
 * específicos del sistema. Obtiene automáticamente la dirección de correo del usuario desde
 * Firebase Realtime Database y utiliza la API interna de envío de emails para entregar
 * notificaciones personalizadas. Incluye manejo de errores robusto para garantizar la
 * confiabilidad del sistema de notificaciones.
 */

import { get, ref } from "firebase/database";
import { database } from "@/firebaseConfig";

/**
 * Envía una notificación por correo electrónico a un usuario específico del sistema.
 *
 * Esta función utilitaria automatiza el proceso completo de envío de correos electrónicos
 * a usuarios registrados en el sistema. Primero consulta Firebase Realtime Database para
 * obtener la dirección de correo del usuario objetivo, luego utiliza la API interna de
 * envío de emails para entregar la notificación con el asunto y mensaje especificados.
 * Proporciona manejo de errores integral para situaciones como usuarios inexistentes
 * o fallos en el servicio de correo.
 *
 * @param userId - El ID único del usuario destinatario de la notificación.
 * @param emailSubject - El asunto del correo electrónico a enviar.
 * @param emailText - El contenido/cuerpo del mensaje del correo electrónico.
 * @returns Una promesa que se resuelve cuando el proceso de envío se completa.
 *
 * @example
 * ```typescript
 * // Notificación de aprobación de solicitud
 * await sendEmailNotification(
 *   "user123",
 *   "Solicitud Aprobada",
 *   "Su solicitud de recuperación de contraseña ha sido aprobada."
 * );
 * 
 * // Notificación de cambio de estado
 * await sendEmailNotification(
 *   candidateId,
 *   "Estado de Cuenta Actualizado",
 *   "Su cuenta ha sido activada exitosamente."
 * );
 * 
 * // Notificación de denegación
 * await sendEmailNotification(
 *   userId,
 *   "Solicitud Denegada",
 *   "Su solicitud no pudo ser procesada. Contacte al administrador."
 * );
 * 
 * // En contexto de flujo de trabajo
 * try {
 *   await sendEmailNotification(
 *     targetUserId,
 *     "Bienvenido al Sistema",
 *     "Su cuenta ha sido creada. Puede acceder con sus credenciales."
 *   );
 *   console.log("Notificación enviada exitosamente");
 * } catch (error) {
 *   console.error("Fallo al enviar notificación:", error);
 * }
 * ```
 */
export default async function sendEmailNotification(
  userId: string,
  emailSubject: string,
  emailText: string
) {
  // Notificaciones por email
  try {
    /**
     * Obtiene la dirección de correo del usuario desde Firebase Database.
     *
     * Consulta el campo 'email' del usuario específico para obtener la
     * dirección de correo electrónico donde enviar la notificación.
     */
    const userRef = ref(database, `usuarios/${userId}/email`);
    const userSnap = await get(userRef);

    if (userSnap.exists()) {
      const userEmail = userSnap.val();

      /**
       * Envía el correo electrónico utilizando la API interna del sistema.
       *
       * Realiza una petición POST al endpoint de envío de emails con los
       * datos del destinatario, asunto y contenido del mensaje.
       */
      const emailResponse = await fetch("/api/sendEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          addressee: userEmail,
          subject: emailSubject,
          text: emailText,
        }),
      });

      if (!emailResponse.ok) {
        console.error("Error sending email notification");
      }
    }
  } catch (error) {
    console.error("Error sending email notification:", error);
  }
}