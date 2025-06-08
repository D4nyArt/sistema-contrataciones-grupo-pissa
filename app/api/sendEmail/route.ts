import { NextResponse } from 'next/server';
import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js"; // mailgun.js v11.1.0

async function sendEmailNotification(addressee: string, subject: string, text: string) {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.NEXT_MAILGUN_API_KEY || "API_KEY",
    // Para dominios de la UE, especifica el endpoint: url: "https://api.eu.mailgun.net"
  });

  const data = await mg.messages.create("www.grupo-pissa.space", {
    from: "Notificaciones pissa <notificaciones@www.grupo-pissa.space>",
    to: [addressee],       // Se usa el parámetro recibido
    subject: subject,      // Se usa el parámetro recibido
    text: text,            // Se usa el parámetro recibido
  });

  return data;
}

export async function POST(request: Request) {
    try {
      const { addressee, subject, text } = await request.json(); // Leer el cuerpo de la solicitud
  
      const data = await sendEmailNotification(addressee, subject, text);
      return NextResponse.json({ message: 'Email sent successfully', data });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }
  }