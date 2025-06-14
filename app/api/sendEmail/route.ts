/**
 * sendEmail/route.ts
 *
 * Proporciona funcionalidad para envío de notificaciones por correo electrónico.
 *
 * Este módulo implementa un endpoint API que permite enviar emails transaccionales
 * utilizando el servicio de Mailgun. Se utiliza para notificaciones automáticas
 * del sistema como confirmaciones de cambios de estado, alertas y comunicaciones
 * importantes con candidatos y revisores RH.
 */

import { NextResponse } from "next/server";
import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js"; // mailgun.js v11.1.0

/**
 * Función auxiliar para enviar notificaciones por email utilizando Mailgun.
 *
 * Configura y ejecuta el envío de emails a través del servicio de Mailgun,
 * utilizando el dominio corporativo "grupo-pissa.space" como remitente.
 * La configuración incluye autenticación mediante API key y soporte para
 * dominios de la UE si es necesario.
 *
 * Configuración de Mailgun:
 * - Dominio: grupo-pissa.space
 * - Remitente: Notificaciones pissa <notificaciones@grupo-pissa.space>
 * - Autenticación: API key desde variables de entorno
 * - Formato: Texto plano
 *
 * @param addressee - Dirección de email del destinatario
 * @param subject - Asunto del correo electrónico
 * @param text - Contenido del mensaje en texto plano
 * @returns Promise con los datos de respuesta de Mailgun
 * @throws Error si falla la configuración o envío del email
 *
 * @example
 * ```ts
 * const result = await sendEmailNotification(
 *   "usuario@example.com",
 *   "Bienvenido al sistema",
 *   "Hola, tu cuenta ha sido creada exitosamente."
 * );
 * ```
 */
async function sendEmailNotification(
  addressee: string,
  subject: string,
  text: string
) {
  // Inicializa el cliente de Mailgun con FormData
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.NEXT_MAILGUN_API_KEY || "API_KEY",
    // Para dominios de la UE, especifica el endpoint: url: "https://api.eu.mailgun.net"
  });

  // Envía el email utilizando la API de Mailgun
  const data = await mg.messages.create("grupo-pissa.space", {
    from: "Notificaciones pissa <notificaciones@grupo-pissa.space>",
    to: [addressee], // Se usa el parámetro recibido
    subject: subject, // Se usa el parámetro recibido
    text: text, // Se usa el parámetro recibido
  });

  return data;
}

/**
 * Maneja las peticiones POST para enviar correos electrónicos.
 *
 * Endpoint público que permite enviar emails utilizando los parámetros
 * proporcionados en el body de la petición. Utiliza la función auxiliar
 * sendEmailNotification para realizar el envío real a través de Mailgun.
 *
 * Este endpoint es utilizado por otros servicios del sistema para enviar
 * notificaciones automáticas como:
 * - Confirmaciones de cambios de estado en documentos
 * - Alertas de revisión de expedientes
 * - Notificaciones de actualización de contratos
 * - Comunicaciones importantes del sistema
 *
 * @param request - El objeto Request con addressee, subject y text en el body
 * @returns Una respuesta NextResponse confirmando el envío del email
 * @throws Retorna error 500 si hay problemas durante el envío
 *
 * @example
 * ```ts
 * POST /api/sendEmail
 * Body: {
 *   "addressee": "candidato@example.com",
 *   "subject": "Documento aprobado",
 *   "text": "Tu documento INE ha sido aprobado. Revisa tu expediente para más detalles."
 * }
 *
 * // Respuesta exitosa:
 * {
 *   "message": "Email sent successfully",
 *   "data": { Respuesta de Mailgun }
 * }
 *
 * // Respuesta de error:
 * {
 *   "error": "Failed to send email"
 * }
 * ```
 *
 * @see {@link sendEmailNotification} Función auxiliar para el envío real de emails
 */
export async function POST(request: Request) {
  try {
    // Extrae los parámetros del cuerpo de la petición
    const { addressee, subject, text } = await request.json();

    // Envía el email utilizando la función auxiliar
    const data = await sendEmailNotification(addressee, subject, text);

    return NextResponse.json({ message: "Email sent successfully", data });
  } catch (error) {
    console.error("Error enviando email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
