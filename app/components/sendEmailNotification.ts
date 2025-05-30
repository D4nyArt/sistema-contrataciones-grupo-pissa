import { get, ref } from "firebase/database";
import { database } from "@/firebaseConfig";

export default async function sendEmailNotification(
  userId: string,
  emailSubject: string,
  emailText: string
) {
  // Notificaciones por email
  try {
    const userRef = ref(database, `usuarios/${userId}/email`);
    const userSnap = await get(userRef);

    if (userSnap.exists()) {
      const userEmail = userSnap.val();

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
