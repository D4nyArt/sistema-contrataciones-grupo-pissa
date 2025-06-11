/**
 * candidato/notificaciones/page.tsx
 *
 * Componente de página de notificaciones para candidatos.
 *
 * Esta página permite a los candidatos visualizar todas sus notificaciones
 * del sistema, incluyendo actualizaciones de estado de documentos, mensajes
 * de revisores, alertas importantes y comunicaciones relacionadas con su
 * proceso de contratación. Proporciona una interfaz centralizada para
 * gestionar y revisar todas las notificaciones pendientes y archivadas.
 */

import { urbanist } from "@/app/components/fonts";
import ShowNotifications from "@/app/components/shownotifications";

export default function CandidateNotifications() {
  return (
    <div className="flex flex-col space-y-2 p-4">
      <h1
        className={`${urbanist.className} text-4xl text-[#212529] pl-4 font-bold mb-4 animate-fade-in-up`}
      >
        Notificaciones
      </h1>
      <ShowNotifications />
    </div>
  );
}
